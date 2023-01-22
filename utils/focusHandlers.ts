import React from "react";


export const handleBlurContainer = () => {
  document.querySelector("#click-me")?.classList.remove("hidden");
};

export const handleClickMeFocus = (textInput: React.MutableRefObject<HTMLInputElement>) => {
  document.querySelector("#click-me")?.classList.add("hidden");
  setInputFocus(textInput);
};

export const setInputFocus = (textInput: React.MutableRefObject<HTMLInputElement>) => {
    document.querySelector("#click-me")?.classList.add("hidden");
    textInput.current.focus();
};
