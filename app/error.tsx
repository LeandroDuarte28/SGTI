"use client";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}): React.JSX.Element {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-xl font-semibold">Algo deu errado.</h2>
      <p className="text-sm text-muted-foreground">{error.message}</p>
      <button
        className="rounded bg-primary px-4 py-2 text-sm text-primary-foreground"
        onClick={() => reset()}
      >
        Tentar novamente
      </button>
    </div>
  );
}
