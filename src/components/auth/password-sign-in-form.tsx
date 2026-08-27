import { ArrowRight, KeyRound } from "lucide-react";

import { PEOPLE } from "@/domain/people";
import { messages } from "@/i18n";

type PasswordSignInFormProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function PasswordSignInForm({ action }: PasswordSignInFormProps) {
  return (
    <form className="password-login-form" action={action}>
      <fieldset className="traveler-choice">
        <legend>{messages.login.selectPerson}</legend>
        <div className="traveler-choice__options">
          {PEOPLE.map((person) => (
            <label key={person.id} data-accent={person.accent}>
              <input
                type="radio"
                name="personId"
                value={person.id}
                required
              />
              <span>
                <i aria-hidden="true">{person.displayName.charAt(0)}</i>
                {person.displayName}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <label className="password-field">
        <span>{messages.login.password}</span>
        <input
          type="password"
          name="password"
          autoComplete="current-password"
          minLength={16}
          maxLength={128}
          required
        />
      </label>

      <button type="submit" className="password-button">
        <KeyRound size={18} aria-hidden="true" />
        {messages.login.passwordButton}
        <ArrowRight size={18} aria-hidden="true" />
      </button>
    </form>
  );
}
