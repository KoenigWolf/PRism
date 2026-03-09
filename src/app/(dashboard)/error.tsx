"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <AlertCircle className="h-12 w-12 text-destructive" />
      <h2 className="text-xl font-semibold">エラーが発生しました</h2>
      <p className="text-sm text-muted-foreground">
        予期しないエラーが発生しました。再試行してください。
      </p>
      <Button onClick={reset} variant="outline">
        再試行
      </Button>
    </div>
  );
}
