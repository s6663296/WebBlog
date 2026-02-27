"use client";

import { useFormStatus } from "react-dom";

type AdminSubmitButtonProps = {
  idleLabel: string;
  loadingLabel?: string;
  className?: string;
};

export function AdminSubmitButton({
  idleLabel,
  loadingLabel = "Saving...",
  className,
}: AdminSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={`cursor-pointer rounded-xl bg-cyan-300 px-4 py-2 text-sm font-semibold text-slate-950 transition-colors duration-200 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-60 ${className ?? ""}`}
    >
      {pending ? loadingLabel : idleLabel}
    </button>
  );
}
