"use client";

import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface ConsultationResultProps {
  response: string;
  loading?: boolean;
}

export function ConsultationResult({ response, loading }: ConsultationResultProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your style recommendation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </CardContent>
      </Card>
    );
  }

  if (!response) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your style recommendation</CardTitle>
      </CardHeader>
      <CardContent className="prose prose-sm max-w-none dark:prose-invert">
        <ReactMarkdown>{response}</ReactMarkdown>
      </CardContent>
    </Card>
  );
}

interface ConsultationHistoryProps {
  consultations: Array<{ id: string; prompt: string; response: string; created_at: string }>;
}

export function ConsultationHistory({ consultations }: ConsultationHistoryProps) {
  if (consultations.length === 0) return null;

  return (
    <div className="space-y-4 mt-8">
      <h2 className="text-xl font-semibold">Past consultations</h2>
      {consultations.map((c) => (
        <Card key={c.id}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {new Date(c.created_at).toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-medium mb-2">{c.prompt}</p>
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <ReactMarkdown>{c.response}</ReactMarkdown>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
