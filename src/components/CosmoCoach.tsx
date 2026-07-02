import type { CosmoFeedback } from '../domain/cosmoFeedback';

interface CosmoCoachProps {
  feedback: CosmoFeedback;
}

export function CosmoCoach({ feedback }: CosmoCoachProps) {
  return (
    <section
      className={`cosmo-coach cosmo-coach--${feedback.tone} cosmo-coach--${feedback.animation}`}
      data-cosmo-tone={feedback.tone}
      aria-label="Cosmo coach"
      aria-live="polite"
    >
      <svg className="cosmo-coach__avatar" aria-hidden="true" viewBox="0 0 128 112">
        <path className="cosmo-coach__tail" d="M31 62 C8 60 8 29 31 27 C51 25 51 55 34 56" />
        <ellipse className="cosmo-coach__body" cx="68" cy="63" rx="39" ry="33" />
        <circle className="cosmo-coach__helmet" cx="68" cy="55" r="31" />
        <circle className="cosmo-coach__face" cx="68" cy="55" r="23" />
        <circle className="cosmo-coach__eye cosmo-coach__eye--left" cx="58" cy="52" r="4" />
        <circle className="cosmo-coach__eye cosmo-coach__eye--right" cx="78" cy="52" r="4" />
        <path className="cosmo-coach__smile" d="M58 66 Q68 74 78 66" />
        <path className="cosmo-coach__antenna" d="M68 24 V9" />
        <circle className="cosmo-coach__beacon" cx="68" cy="7" r="6" />
        <path className="cosmo-coach__fin" d="M28 72 L9 91 L36 94 Z" />
        <path className="cosmo-coach__fin" d="M108 72 L127 91 L100 94 Z" />
      </svg>
      <div className="cosmo-coach__message">
        <strong>{feedback.headline}</strong>
        <span>{feedback.detail}</span>
      </div>
    </section>
  );
}
