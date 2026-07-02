interface RescueMascotProps {
  message: string;
  tone: 'ready' | 'warning' | 'complete' | 'practice' | 'paused';
}

export function RescueMascot({ message, tone }: RescueMascotProps) {
  return (
    <section className={`rescue-mascot rescue-mascot--${tone}`} aria-label="Rescue mascot">
      <svg
        className="rescue-mascot__sprite"
        aria-hidden="true"
        viewBox="0 0 96 80"
      >
        <path
          className="rescue-mascot__tail"
          d="M24 44 C10 42 8 22 24 20 C39 18 39 38 27 39"
        />
        <ellipse className="rescue-mascot__body" cx="50" cy="43" rx="28" ry="24" />
        <circle className="rescue-mascot__helmet" cx="50" cy="38" r="21" />
        <circle className="rescue-mascot__face" cx="50" cy="38" r="16" />
        <circle className="rescue-mascot__eye" cx="43" cy="36" r="2.8" />
        <circle className="rescue-mascot__eye" cx="57" cy="36" r="2.8" />
        <path className="rescue-mascot__smile" d="M43 45 Q50 50 57 45" />
        <path className="rescue-mascot__antenna" d="M50 17 V7" />
        <circle className="rescue-mascot__beacon" cx="50" cy="5" r="4" />
        <path className="rescue-mascot__fin" d="M22 48 L9 60 L28 62 Z" />
        <path className="rescue-mascot__fin" d="M74 48 L87 60 L68 62 Z" />
      </svg>
      <p>{message}</p>
    </section>
  );
}
