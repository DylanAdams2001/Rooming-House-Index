export function StepHeader({
  step,
  totalSteps,
  title,
  subtitle,
}: {
  step: number;
  totalSteps: number;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="mb-8">
      <p className="text-xs uppercase tracking-wide text-muted">
        Step {step} of {totalSteps}
      </p>
      <div className="mt-2 flex gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full ${i < step ? "bg-ink" : "bg-line"}`}
          />
        ))}
      </div>
      <h1 className="mt-6 font-display text-2xl text-ink">{title}</h1>
      <p className="mt-1 text-sm text-muted">{subtitle}</p>
    </div>
  );
}
