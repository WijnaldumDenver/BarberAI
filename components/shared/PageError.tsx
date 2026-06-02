"use client";

import { Button } from "@/components/ui/button";

interface PageErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export function PageError({ error, reset }: PageErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-xl font-semibold">Something went wrong</h2>
      <p className="text-muted-foreground">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}
