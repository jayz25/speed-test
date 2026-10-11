import { MousePointerIcon } from "./icons";

/** Centered prompt over the (blurred) words while the input is not focused. */
const FocusOverlay = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center">
    <span className="flex items-center gap-2.5 rounded-full bg-ink px-5 py-3 text-[15px] font-semibold text-white">
      <MousePointerIcon />
      Click here to start typing
    </span>
  </div>
);

export default FocusOverlay;
