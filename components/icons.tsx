import type { ReactNode } from "react";

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const RotateCcwIcon = () => (
  <Icon>
    <path d="M3 12a9 9 0 1 0 3-6.7" />
    <path d="M3 4v5h5" />
  </Icon>
);

export const ArrowRightIcon = () => (
  <Icon>
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </Icon>
);

export const MousePointerIcon = () => (
  <Icon>
    <path d="M9 9l5 12 1.8-5.2L21 14z" />
    <path d="M7.2 2.2 8 5.1" />
    <path d="m5.1 8-2.9-.8" />
    <path d="M14 4.1 12 6" />
    <path d="m6 12-1.9 2" />
  </Icon>
);
