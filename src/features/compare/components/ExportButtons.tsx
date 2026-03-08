"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Download, FileJson, FileText, FileDown } from "lucide-react";
import { toast } from "sonner";

export function ExportButtons() {
  const searchParams = useSearchParams();
  const [isExporting, setIsExporting] = useState(false);

  const selectedBrands = searchParams.get("brands");
  const brandIds = selectedBrands?.split(",").filter(Boolean) || [];

  const handleExport = async (format: "json" | "csv" | "pdf") => {
    if (brandIds.length < 2) {
      toast.error("2つ以上のブランドを選択してください");
      return;
    }

    setIsExporting(true);

    try {
      let url: string;
      let filename: string;

      if (format === "pdf") {
        url = `/api/export/pdf?brands=${brandIds.join(",")}`;
        filename = `prism-compare-report-${Date.now()}.pdf`;
      } else {
        url = `/api/export?format=${format}&type=all`;
        filename = `prism-export-${Date.now()}.${format}`;
      }

      const response = await fetch(url);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "エクスポートに失敗しました");
      }

      // Download the file
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      toast.success(`${format.toUpperCase()}ファイルをダウンロードしました`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "エクスポートに失敗しました"
      );
    } finally {
      setIsExporting(false);
    }
  };

  if (brandIds.length < 2) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={isExporting}
        className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md border border-input bg-background px-4 py-2 text-sm font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {isExporting ? "エクスポート中..." : "エクスポート"}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleExport("pdf")} className="gap-2">
          <FileDown className="h-4 w-4" />
          PDFレポート
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("json")} className="gap-2">
          <FileJson className="h-4 w-4" />
          JSON形式
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport("csv")} className="gap-2">
          <FileText className="h-4 w-4" />
          CSV形式
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
