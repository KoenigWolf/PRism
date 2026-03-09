"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles } from "lucide-react";

interface InsightCardProps {
  content: string;
  createdAt?: Date;
  isLoading?: boolean;
}

export function InsightCard({
  content,
  createdAt,
  isLoading,
}: InsightCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="h-5 w-5 text-purple-500" />
          AIインサイト
        </CardTitle>
        {createdAt && (
          <p className="text-sm text-muted-foreground">
            生成日時: {new Date(createdAt).toLocaleString("ja-JP")}
          </p>
        )}
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-500 border-t-transparent" />
            <span className="text-muted-foreground">分析中...</span>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            {content.split("\n").map((line, index) => {
              // Handle markdown headers
              if (line.startsWith("### ")) {
                return (
                  <h3 key={index} className="text-base font-semibold mt-4 mb-2">
                    {line.replace("### ", "")}
                  </h3>
                );
              }
              if (line.startsWith("## ")) {
                return (
                  <h2 key={index} className="text-lg font-semibold mt-4 mb-2">
                    {line.replace("## ", "")}
                  </h2>
                );
              }
              if (line.startsWith("# ")) {
                return (
                  <h1 key={index} className="text-xl font-bold mt-4 mb-2">
                    {line.replace("# ", "")}
                  </h1>
                );
              }
              // Handle bold text
              if (line.startsWith("**") && line.endsWith("**")) {
                return (
                  <p key={index} className="font-semibold mt-3 mb-1">
                    {line.replace(/\*\*/g, "")}
                  </p>
                );
              }
              // Handle list items
              if (line.startsWith("- ") || line.startsWith("* ")) {
                return (
                  <li key={index} className="ml-4">
                    {line.slice(2)}
                  </li>
                );
              }
              if (line.match(/^\d+\. /)) {
                return (
                  <li key={index} className="ml-4 list-decimal">
                    {line.replace(/^\d+\. /, "")}
                  </li>
                );
              }
              // Empty lines
              if (line.trim() === "") {
                return <br key={index} />;
              }
              // Regular paragraphs
              return (
                <p key={index} className="mb-2">
                  {line}
                </p>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
