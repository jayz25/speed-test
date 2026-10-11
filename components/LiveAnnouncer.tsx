interface LiveAnnouncerProps {
  message: string;
}

/** Visually hidden polite live region for screen-reader announcements. */
const LiveAnnouncer = ({ message }: LiveAnnouncerProps) => (
  <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
    {message}
  </div>
);

export default LiveAnnouncer;
