import { render } from "@testing-library/react";
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
    const { container } = render(
      <Word word="the" typed="thexy" isActive isWrong={false} activeLetterIndex={5} />,
    );
    expect(container.querySelector("#active-character")).not.toBeNull();
  });
});
