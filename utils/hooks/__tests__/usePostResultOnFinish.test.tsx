import { renderHook } from "@testing-library/react";
import { Provider } from "react-redux";
import type { ReactNode } from "react";

const addStatCall = vi.fn((payload: unknown) => ({ type: "test/add", payload }));
vi.mock("../../../redux/stat", () => ({ addStatCall: (p: unknown) => addStatCall(p), isStatsApiEnabled: true }));

import { usePostResultOnFinish } from "../usePostResultOnFinish";

const fakeStore = {
  getState: () => ({}),
  subscribe: () => () => {},
  dispatch: (a: unknown) => a,
};
const wrapper = ({ children }: { children: ReactNode }) => (
  <Provider store={fakeStore as never}>{children}</Provider>
);

const base = { isFinished: true, isValid: true, roundId: 1, wpm: 50, cpm: 250, accuracy: 90, user: "Ann" };

describe("usePostResultOnFinish", () => {
  beforeEach(() => addStatCall.mockClear());

  it("posts once with the payload user, even across re-renders", () => {
    const { rerender } = renderHook((p) => usePostResultOnFinish(p), { wrapper, initialProps: base });
    rerender({ ...base });
    rerender({ ...base, user: "Bob" });
    expect(addStatCall).toHaveBeenCalledTimes(1);
    expect(addStatCall).toHaveBeenCalledWith({ words: 50, chars: 250, accuracy: 90, user: "Ann" });
  });

  it("does not post while unfinished", () => {
    renderHook(() => usePostResultOnFinish({ ...base, isFinished: false }), { wrapper });
    expect(addStatCall).not.toHaveBeenCalled();
  });

  it("skips invalid results (too short or too fast)", () => {
    renderHook(() => usePostResultOnFinish({ ...base, isValid: false }), { wrapper });
    expect(addStatCall).not.toHaveBeenCalled();
  });

  it("posts again for a repeated test (same words, new round)", () => {
    const { rerender } = renderHook((p) => usePostResultOnFinish(p), { wrapper, initialProps: base });
    rerender({ ...base, isFinished: false });
    rerender({ ...base, roundId: base.roundId + 1 });
    expect(addStatCall).toHaveBeenCalledTimes(2);
  });

  it("posts again for a new round", () => {
    const { rerender } = renderHook((p) => usePostResultOnFinish(p), { wrapper, initialProps: base });
    rerender({ ...base, isFinished: false });
    rerender({ ...base, roundId: 2 });
    expect(addStatCall).toHaveBeenCalledTimes(2);
  });
});
