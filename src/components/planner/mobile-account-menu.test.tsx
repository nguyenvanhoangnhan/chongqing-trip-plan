import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { expect, test } from "vitest";

import { PEOPLE } from "@/domain/people";
import { MobileAccountMenu } from "@/components/planner/mobile-account-menu";

test("opens the mobile account drawer and closes it with Escape", async () => {
  const user = userEvent.setup();
  render(<MobileAccountMenu currentPerson={PEOPLE[1]} showCurrency />);

  const trigger = screen.getByRole("button", { name: "Mở menu tài khoản" });
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

  await user.click(trigger);

  expect(trigger).toHaveAttribute("aria-expanded", "true");
  const drawer = screen.getByRole("dialog", { name: "Tài khoản" });
  expect(drawer).toBeInTheDocument();
  expect(screen.getByText("Nhân")).toBeInTheDocument();
  expect(screen.getByRole("button", { name: "Đăng xuất" })).toBeInTheDocument();
  expect(screen.getByRole("radiogroup", { name: "Đơn vị tiền" })).toBeInTheDocument();
  expect(
    within(drawer).getByRole("button", { name: "Đóng menu tài khoản" }),
  ).toHaveFocus();

  await user.keyboard("{Escape}");

  expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  expect(trigger).toHaveAttribute("aria-expanded", "false");
  expect(trigger).toHaveFocus();
});
