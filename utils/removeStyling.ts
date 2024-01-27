// Find a better way to do this please
export const removeStyling = (backSpaceStyling = false, letterIndex = null, wordIndex = null) => {
  const container = document.querySelector<HTMLElement>("#given-paragraph");
    
  if (backSpaceStyling && letterIndex != null && wordIndex != null) {
      const activeWordEl = container.querySelectorAll<HTMLElement>("#word-element")[wordIndex]
      const activeLetterEl = activeWordEl.querySelectorAll<HTMLElement>("#letter-element #letter")[letterIndex]
      activeLetterEl.classList.remove(
        "text-red-700",
      )
    }
    else {
      container
        .querySelectorAll<HTMLElement>("#word-element")
        .forEach((element) => {  
          element.classList.remove("line-through")
          element.querySelectorAll("#letter-element #letter")
            .forEach((letterElement) => {
              letterElement
                .classList.remove(
                  "bg-yellow-300",
                  "text-red-700",
                  "text-slate-700",
                  "text-white",
                );
            });
  
          element.querySelectorAll("#letter-element #cursor").forEach((cursorElement) => {
            cursorElement.classList.add(
              "hidden"
            );
          });

        element.querySelectorAll("#letter-element #cursor").forEach((cursorElement) => {
          cursorElement.classList.add(
            "hidden"
          );
        });
      }
    );
  }
}
