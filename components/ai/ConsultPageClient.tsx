"use client";

import { useState } from "react";
import { ConsultationForm } from "@/components/ai/ConsultationForm";
import { ConsultationResult, ConsultationHistory } from "@/components/ai/ConsultationResult";
import type { AiConsultation, ConsultResponse } from "@/lib/types";

interface ConsultPageClientProps {
  remaining: number;
  consultations: AiConsultation[];
}

export function ConsultPageClient({ remaining, consultations }: ConsultPageClientProps) {
  const [result, setResult] = useState<string | null>(null);
  const [remainingCount, setRemainingCount] = useState(remaining);

  const handleResult = (data: ConsultResponse) => {
    setResult(data.response);
    setRemainingCount(data.remaining);
  };

  return (
    <div>
      <ConsultationForm remaining={remainingCount} onResult={handleResult} />
      {result && (
        <div className="mt-6">
          <ConsultationResult response={result} />
        </div>
      )}
      <ConsultationHistory consultations={consultations} />
    </div>
  );
}
