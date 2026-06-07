import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDateTime, formatPrice } from "@/lib/utils";
import type { BookingStatus } from "@/lib/types";

interface BookingCardProps {
  id: string;
  scheduledAt: string;
  status: BookingStatus;
  serviceName: string;
  priceCents: number;
  barberName?: string;
  clientName?: string;
  showBarber?: boolean;
}

const statusVariant: Record<BookingStatus, "default" | "secondary" | "destructive" | "success" | "warning"> = {
  pending: "warning",
  confirmed: "success",
  cancelled: "destructive",
  completed: "secondary",
};

export function BookingCard({
  scheduledAt,
  status,
  serviceName,
  priceCents,
  barberName,
  clientName,
  showBarber = true,
}: BookingCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-base font-medium">{serviceName}</CardTitle>
        <Badge variant={statusVariant[status]}>{status}</Badge>
      </CardHeader>
      <CardContent className="space-y-1 text-sm text-muted-foreground">
        <p>{formatDateTime(scheduledAt)}</p>
        <p>{formatPrice(priceCents)}</p>
        {showBarber && barberName && <p>Barber: {barberName}</p>}
        {!showBarber && clientName && <p>Client: {clientName}</p>}
      </CardContent>
    </Card>
  );
}
