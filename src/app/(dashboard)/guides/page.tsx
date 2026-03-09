import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen, Target, ArrowRight } from "lucide-react";

export default function GuidesPage() {
  const guides = [
    {
      title: "ブランドガイドライン",
      description: "PRismブランドの一貫性と品質を維持するための公式ガイドライン。ロゴ、カラー、タイポグラフィ、トーン＆ボイスなど。",
      href: "/guides/brand",
      icon: BookOpen,
      version: "v2.0",
    },
    {
      title: "ビジネス戦略",
      description: "市場分析、競合ポジショニング、ユニットエコノミクス、GTMロードマップなど経営・事業開発向けドキュメント。",
      href: "/guides/business",
      icon: Target,
      version: "v3.0",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">ガイドライン</h1>
        <p className="text-muted-foreground mt-2">
          PRismの公式ドキュメント一覧
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {guides.map((guide) => (
          <Link key={guide.href} href={guide.href}>
            <Card className="h-full transition-colors hover:bg-muted/50 cursor-pointer">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <guide.icon className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{guide.title}</CardTitle>
                      <span className="text-xs text-muted-foreground">{guide.version}</span>
                    </div>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm">
                  {guide.description}
                </CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
