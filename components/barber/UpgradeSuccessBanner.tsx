"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

interface UpgradeSuccessBannerProps {
  show: boolean;
}

export function UpgradeSuccessBanner({ show }: UpgradeSuccessBannerProps) {
  const router = useRouter();

  useEffect(() => {
    if (show) {
      router.refresh();
    }
  }, [show, router]);

  if (!show) return null;

  return (
    <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg p-4">
      Welcome to Pro! Your account has been upgraded.
    </div>
  );
}
