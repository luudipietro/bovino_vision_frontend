interface StepperProps {
  step: number;
  total: number;
}

/** "Paso 1 de 3" with segmented bars on the right. */
export default function Stepper({ step, total }: StepperProps) {
  return (
    <div className="flex items-center justify-between gap-4">
      <p className="text-xs text-neutral-500">
        Paso <span className="font-bold text-neutral-800">{step}</span> de{" "}
        <span className="font-bold text-neutral-800">{total}</span>
      </p>
      <div className="flex gap-1.5" aria-hidden="true">
        {Array.from({ length: total }, (_, index) => (
          // oxlint-disable-next-line react/no-array-index-key -- segments are positional
          <span
            key={index}
            className={`h-1 w-8 rounded-full transition-colors duration-200 ${index < step ? "bg-green-500" : "bg-neutral-200"}`}
          />
        ))}
      </div>
    </div>
  );
}
