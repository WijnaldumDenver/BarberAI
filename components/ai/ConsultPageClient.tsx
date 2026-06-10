"use client";

import { useEffect, useState } from "react";
import { ConsultationForm } from "@/components/ai/ConsultationForm";
import { ConsultationResult, ConsultationHistory } from "@/components/ai/ConsultationResult";
import type { AiConsultation, ConsultResponse } from "@/lib/types";

interface ConsultPageClientProps {
  remaining: number;
  consultations: AiConsultation[];
}

export function ConsultPageClient({ remaining, consultations }: ConsultPageClientProps) {
  const [result, setResult] = useState<ConsultResponse | null>(null);
  const [remainingCount, setRemainingCount] = useState(remaining);
  const [history, setHistory] = useState(consultations);

  useEffect(() => {
    setHistory(consultations);
  }, [consultations]);

  const handleResult = (data: ConsultResponse) => {
    setResult(data);
    setRemainingCount(data.remaining);

    const entry: AiConsultation = {
      id: data.id,
      user_id: "",
      prompt: data.prompt ?? "",
      response: data.response,
      created_at: data.createdAt ?? new Date().toISOString(),
    };
    setHistory((prev) => [entry, ...prev]);
  };

  return (
    <div>
      <ConsultationForm remaining={remainingCount} onResult={handleResult} />
      {result && (
        <div className="mt-6">
          <ConsultationResult
            response={result.response}
            recommendedBarberId={result.recommendedBarberId}
            recommendedBarberName={result.recommendedBarberName}
          />
        </div>
      )}
      <ConsultationHistory consultations={history} />
    </div>
  );
}
