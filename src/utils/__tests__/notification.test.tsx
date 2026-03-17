import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Notification from "../notification";

describe("utils/notification", () => {
  it("renders the success variant by default", () => {
    const setNotification = vi.fn();
    const { container } = render(
      <Notification
        notification={{ text: "Saved", show: true, variant: "success" }}
        setNotification={setNotification}
      />
    );
    const toast = container.querySelector(".toast");

    expect(screen.getByText("Saved")).toBeTruthy();
    expect(toast).not.toBeNull();
    expect(toast?.className.includes("bg-success")).toBe(true);
  });

  it("renders the danger variant", () => {
    const setNotification = vi.fn();
    const { container } = render(
      <Notification
        notification={{ text: "Failed", show: true, variant: "danger" }}
        setNotification={setNotification}
      />
    );
    const toast = container.querySelector(".toast");

    expect(screen.getByText("Failed")).toBeTruthy();
    expect(toast).not.toBeNull();
    expect(toast?.className.includes("bg-danger")).toBe(true);
  });
});
