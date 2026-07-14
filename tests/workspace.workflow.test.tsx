import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DemoWorkspace } from "@/src/components/demo-workspace";

describe("public deterministic demo workflow", () => {
  beforeEach(() => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(URL.createObjectURL).mockClear();
  });

  it("loads a fictional precomputed result, marks edits, resets, and exports locally", async () => {
    const user = userEvent.setup();
    render(<DemoWorkspace />);

    expect(screen.getByText("Simulated AI workflow")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /load simulated analysis/i }));
    expect(await screen.findByRole("heading", { name: "Review workspace" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: /crm record/i }));
    const account = screen.getByLabelText("Account name");
    await user.clear(account);
    await user.type(account, "Edited Fictional Market");
    expect(screen.getAllByText("Edited").length).toBeGreaterThan(0);

    await user.click(screen.getByRole("button", { name: /^reset$/i }));
    await waitFor(() => expect(screen.getByLabelText("Account name")).toHaveValue("Thistle & Byte Markets"));

    await user.click(screen.getByRole("button", { name: /complete json/i }));
    expect(URL.createObjectURL).toHaveBeenCalledTimes(1);
  });

  it("navigates from evidence to the exact fictional source turn", async () => {
    const user = userEvent.setup();
    render(<DemoWorkspace />);
    await user.click(screen.getByRole("button", { name: /load simulated analysis/i }));
    await screen.findByRole("heading", { name: "Review workspace" });
    await user.click(screen.getByRole("tab", { name: /evidence/i }));
    await user.click(screen.getByRole("button", { name: /urgent items can sit unnoticed/i }));
    expect(document.getElementById("turn-d-03")).toHaveClass("is-active");
  });

  it("exposes named controls and no free-text transcript submission control", () => {
    render(<DemoWorkspace />);
    expect(screen.getByRole("radiogroup", { name: /fictional call scenarios/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/paste/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /analyze transcript/i })).not.toBeInTheDocument();
  });
});

