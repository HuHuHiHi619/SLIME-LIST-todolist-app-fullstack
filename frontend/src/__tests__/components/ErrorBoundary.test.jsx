import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";

import ErrorBoundary from "../../components/ErrorBoundary";

// Regression for P8 / the #21 crash: a throw in render must surface the fallback,
// not unmount the whole tree (white screen).
const Boom = () => {
  throw new Error("render boom");
};

describe("ErrorBoundary", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders children when they don't throw", () => {
    render(
      <ErrorBoundary>
        <p>healthy child</p>
      </ErrorBoundary>
    );
    expect(screen.getByText("healthy child")).toBeInTheDocument();
  });

  it("renders the fallback instead of crashing when a child throws", () => {
    // React logs the caught error to console.error; silence the expected noise.
    vi.spyOn(console, "error").mockImplementation(() => {});

    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>
    );

    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Reload" })).toBeInTheDocument();
  });
});
