"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { InsightCard } from "./InsightCard";
import { saveInsight } from "../actions";
import { Sparkles, Save } from "lucide-react";
import { toast } from "sonner";

interface InsightGeneratorProps {
  brandIds: string[];
  brandNames?: string[];
}

export function InsightGenerator({
  brandIds,
  brandNames,
}: InsightGeneratorProps) {
  const [content, setContent] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const generateInsight = useCallback(async () => {
    if (brandIds.length === 0) {
      toast.error("ブランドを選択してください");
      return;
    }

    setIsGenerating(true);
    setContent("");

    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ brandIds }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "インサイト生成に失敗しました");
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("ストリーミングがサポートされていません");
      }

      const decoder = new TextDecoder();
      let accumulatedContent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        accumulatedContent += chunk;
        setContent(accumulatedContent);
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "エラーが発生しました"
      );
    } finally {
      setIsGenerating(false);
    }
  }, [brandIds]);

  const handleSave = useCallback(async () => {
    if (!content) {
      toast.error("保存するインサイトがありません");
      return;
    }

    setIsSaving(true);
    try {
      const result = await saveInsight(content, brandIds);
      if (result.success) {
        toast.success("インサイトを保存しました");
      } else {
        toast.error(result.error || "保存に失敗しました");
      }
    } catch {
      toast.error("保存中にエラーが発生しました");
    } finally {
      setIsSaving(false);
    }
  }, [content, brandIds]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Button
          onClick={generateInsight}
          disabled={isGenerating || brandIds.length === 0}
          className="gap-2"
        >
          <Sparkles className="h-4 w-4" />
          {isGenerating ? "分析中..." : "AIインサイトを生成"}
        </Button>
        {content && !isGenerating && (
          <Button
            variant="outline"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? "保存中..." : "保存"}
          </Button>
        )}
      </div>

      {brandNames && brandNames.length > 0 && (
        <p className="text-sm text-muted-foreground">
          対象ブランド: {brandNames.join(", ")}
        </p>
      )}

      {(content || isGenerating) && (
        <InsightCard content={content} isLoading={isGenerating && !content} />
      )}
    </div>
  );
}
