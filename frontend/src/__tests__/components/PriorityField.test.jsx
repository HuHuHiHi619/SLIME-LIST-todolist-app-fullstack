import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import PriorityField from "../../components/pages/ui/PriorityField";

describe("PriorityField", () => {
  it("renders the three priority options", () => {
    render(<PriorityField value="low" handleInputChange={() => {}} />);
    const opts = screen.getAllByRole("option").map((o) => o.value);
    expect(opts).toEqual(["low", "medium", "high"]);
  });

  it("reflects the current value", () => {
    render(<PriorityField value="high" handleInputChange={() => {}} />);
    expect(screen.getByRole("combobox").value).toBe("high");
  });

  it("emits a name/value change event the parent handlers consume", () => {
    // Capture synchronously: the <select> is controlled, so after the handler
    // returns React reverts the DOM node's value to the `value` prop.
    let captured;
    const handleInputChange = vi.fn((e) => {
      captured = { name: e.target.name, value: e.target.value };
    });
    render(
      <PriorityField
        name="priority"
        value="low"
        handleInputChange={handleInputChange}
      />
    );
    fireEvent.change(screen.getByRole("combobox"), {
      target: { value: "medium" },
    });
    expect(handleInputChange).toHaveBeenCalledTimes(1);
    expect(captured).toEqual({ name: "priority", value: "medium" });
  });
});
