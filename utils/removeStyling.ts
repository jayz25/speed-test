// Find a better way to do this please
export const removeStyling = () => {
    const container = document.querySelector<HTMLElement>("#given-paragraph");
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
      }
    );
  };
