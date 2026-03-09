import Link from "next/link";
import { buttonVariants } from "@/components/ui/button-variants";
import { FileQuestion } from "lucide-react";

export default function DashboardNotFound() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-20">
      <FileQuestion className="h-12 w-12 text-muted-foreground" />
      <h2 className="text-xl font-semibold">ページが見つかりません</h2>
      <p className="text-sm text-muted-foreground">
        お探しのページは存在しないか、移動した可能性があります。
      </p>
      <Link href="/" className={buttonVariants({ variant: "outline" })}>
        ダッシュボードに戻る
      </Link>
    </div>
  );
}
