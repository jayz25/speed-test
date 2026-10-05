import { render } from "@testing-library/react";
import { createRef } from "react";
import Word from "../Word";

describe("Word", () => {
  it("renders extra typed characters in the extra style", () => {
    const { container } = render(
      <Word word="the" typed="thexy" isActive isWrong={false} activeLetterIndex={5} />,
    );
    const spans = Array.from(container.querySelectorAll("span"));
    // 3 target letters + 2 extra + trailing spacer
    expect(spans).toHaveLength(6);
    expect(spans[3].textContent).toBe("x");
    expect(spans[3].className).toContain("text-red-400/70");
    expect(spans[4].textContent).toBe("y");
  });

  it("always has a caret target, even when over-typed", () => {
    const caretRef = createRef<HTMLSpanElement>();
    render(
      <Word word="the" typed="thexy" isActive isWrong={false} activeLetterIndex={5} caretRef={caretRef} />,
    );
    expect(caretRef.current).not.toBeNull();
  });

  it("attaches caretRef to the active letter", () => {
    const caretRef = createRef<HTMLSpanElement>();
    render(<Word word="the" typed="t" isActive isWrong={false} activeLetterIndex={1} caretRef={caretRef} />);
    expect(caretRef.current?.textContent).toBe("h");
  });
});
