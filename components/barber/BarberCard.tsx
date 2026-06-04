import Link from "next/link";
import { MapPin } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { BarberWithProfile } from "@/lib/types";

interface BarberCardProps {
  barber: BarberWithProfile;
  showBookButton?: boolean;
}

export function BarberCard({ barber, showBookButton = true }: BarberCardProps) {
  const name = barber.profiles?.full_name ?? barber.shop_name;
  const initials = name.slice(0, 2).toUpperCase();
  const isPro = barber.profiles?.plan === "pro";

  return (
    <Card className="flex flex-col">
      <CardHeader className="flex flex-row items-center gap-4">
        <Avatar className="h-14 w-14">
          <AvatarImage src={barber.avatar_url ?? barber.profiles?.avatar_url ?? undefined} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg">{barber.shop_name}</CardTitle>
            {isPro && <Badge variant="secondary">Pro</Badge>}
          </div>
          {barber.location && (
            <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
              <MapPin className="h-3 w-3" />
              {barber.location}
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {barber.bio ?? "Professional barber ready to give you a great cut."}
        </p>
        {barber.services.length > 0 && (
          <p className="text-sm mt-2">
            From ${(Math.min(...barber.services.map((s) => s.price_cents)) / 100).toFixed(0)}
          </p>
        )}
      </CardContent>
      {showBookButton && (
        <CardFooter>
          <Button asChild className="w-full">
            <Link href={`/dashboard/client/book/${barber.id}`}>Book now</Link>
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
