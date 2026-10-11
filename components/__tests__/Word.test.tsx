import { render } from "@testing-library/react";
import { createRef } from "react";
import Word from "../Word";

describe("Word", () => {
  it("renders extra typed characters in the extra style", () => {
    const { container } = render(
      <Word word="the" typed="thexy" isActive isWrong={false} activeLetterIndex={5} />,
    );
    const spans = Array.from(container.querySelectorAll("span"));
    expect(spans).toHaveLength(5);
    expect(spans[3].textContent).toBe("x");
    expect(spans[3].className).toContain("text-error-extra");
    expect(spans[4].textContent).toBe("y");
  });

  it("always has a caret target, even when over-typed", () => {
    const caretRef = createRef<HTMLSpanElement>();
    render(
      <Word word="the" typed="thexy" isActive isWrong={false} activeLetterIndex={5} caretRef={caretRef} />,
    );
    expect(caretRef.current?.textContent).toBe("y");
  });

  it("attaches caretRef to the active letter", () => {
    const caretRef = createRef<HTMLSpanElement>();
    render(<Word word="the" typed="t" isActive isWrong={false} activeLetterIndex={1} caretRef={caretRef} />);
    expect(caretRef.current?.textContent).toBe("h");
  });

  it("draws the caret before the next letter only when shown", () => {
    const { container, rerender } = render(
      <Word word="the" typed="t" isActive isWrong={false} activeLetterIndex={1} showCaret />,
    );
    expect(container.querySelectorAll(".shadow-caret-before")).toHaveLength(1);
    expect(container.querySelector(".shadow-caret-before")?.textContent).toBe("h");
    rerender(<Word word="the" typed="t" isActive isWrong={false} activeLetterIndex={1} />);
    expect(container.querySelector(".shadow-caret-before")).toBeNull();
  });

  it("draws the caret after the last letter when the word is fully typed", () => {
    const { container } = render(
      <Word word="the" typed="the" isActive isWrong={false} activeLetterIndex={3} showCaret />,
    );
    expect(container.querySelector(".shadow-caret-after")?.textContent).toBe("e");
  });

  it("underlines wrong words", () => {
    const { container } = render(<Word word="the" typed="tha" isActive={false} isWrong activeLetterIndex={-1} />);
    expect(container.firstElementChild?.className).toContain("decoration-error");
  });
});
