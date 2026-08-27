"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { PersonId } from "@/domain/people";
import type { SelectionEntry } from "@/domain/selections";
import { messages } from "@/i18n";
import {
  saveSelection,
  SelectionApiError,
} from "@/lib/selections-client";
import type { StoredSelection } from "@/server/selections/service";

const MAX_CONFLICT_RETRIES = 2;

type SelectionAutosaveOptions = {
  personId: PersonId;
  onStored: (stored: StoredSelection, hasPendingChanges: boolean) => void;
  onConflict: () => Promise<StoredSelection>;
};

type SaveQueue = {
  etag: string | null;
  entries: readonly SelectionEntry[];
  requestedVersion: number;
  savedVersion: number;
  running: boolean;
};

export function useSelectionAutosave({
  personId,
  onStored,
  onConflict,
}: SelectionAutosaveOptions) {
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const mountedRef = useRef(true);
  const onStoredRef = useRef(onStored);
  const onConflictRef = useRef(onConflict);
  const queueRef = useRef<SaveQueue>({
    etag: null,
    entries: [],
    requestedVersion: 0,
    savedVersion: 0,
    running: false,
  });

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    onStoredRef.current = onStored;
    onConflictRef.current = onConflict;
  }, [onConflict, onStored]);

  /**
   * Counts the changes the traveler has asked to save. A snapshot taken before
   * this number moved is older than the traveler's own edits.
   */
  const changeRevision = useCallback(() => queueRef.current.requestedVersion, []);

  const reset = useCallback((stored: StoredSelection) => {
    const queue = queueRef.current;
    queue.etag = stored.etag;

    // A change queued while the snapshot was in flight is newer than the
    // snapshot, so it keeps its place in the queue and only the etag moves on.
    if (queue.requestedVersion > queue.savedVersion) return;
    queue.entries = stored.selection.entries;
    queue.requestedVersion = 0;
    queue.savedVersion = 0;
    setStatusMessage(null);
    setIsSaving(false);
  }, []);

  const flush = useCallback(async () => {
    const queue = queueRef.current;

    if (queue.running) return;

    queue.running = true;
    setIsSaving(true);
    let conflictRetries = 0;

    try {
      while (queue.savedVersion < queue.requestedVersion) {
        const requestedVersion = queue.requestedVersion;
        const entries = queue.entries;

        try {
          const stored = await saveSelection(personId, entries, queue.etag);

          if (!mountedRef.current) return;

          queue.etag = stored.etag;
          queue.savedVersion = requestedVersion;
          onStoredRef.current(
            stored,
            queue.requestedVersion > requestedVersion,
          );
        } catch (error) {
          if (!mountedRef.current) return;

          console.error("Failed to autosave selection", error);

          if (error instanceof SelectionApiError && error.status === 409) {
            if (conflictRetries >= MAX_CONFLICT_RETRIES) {
              setStatusMessage(messages.storage.saveError);
              return;
            }

            conflictRetries += 1;
            setStatusMessage(messages.storage.conflict);

            try {
              // Take the newer etag but keep what the traveler just did, then
              // let the loop send it again on top of the refreshed copy.
              const stored = await onConflictRef.current();
              queue.etag = stored.etag;
              continue;
            } catch (loadError) {
              console.error("Failed to reload selection after conflict", loadError);
              setStatusMessage(messages.storage.saveError);
              return;
            }
          }

          setStatusMessage(messages.storage.saveError);
          return;
        }
      }

      setStatusMessage(messages.storage.savedAt(new Date()));
    } finally {
      queue.running = false;

      if (mountedRef.current) setIsSaving(false);
    }
  }, [personId]);

  const save = useCallback(
    (entries: readonly SelectionEntry[]) => {
      const queue = queueRef.current;
      queue.entries = [...entries];
      queue.requestedVersion += 1;
      setStatusMessage(messages.planner.saving);
      setIsSaving(true);
      void flush();
    },
    [flush],
  );

  return { reset, save, statusMessage, isSaving, changeRevision };
}
