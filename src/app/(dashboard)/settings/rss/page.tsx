import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { RssSourceForm, RssSourceList } from "@/features/rss-sources";
import { getRssSources } from "@/features/rss-sources/queries";
import { getBrands } from "@/features/brands/queries";
import { Rss } from "lucide-react";

export default async function RssSettingsPage() {
  const [rssSources, brandsData] = await Promise.all([
    getRssSources(),
    getBrands(),
  ]);

  // RssSourceForm に必要なプロパティのみを抽出
  const brands = brandsData.map((b) => ({
    id: b.id,
    name: b.name,
    company: { name: b.company.name },
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Rss className="h-6 w-6" />
          RSS自動収集
        </h1>
        <p className="text-muted-foreground mt-1">
          競合のプレスリリースやニュースを自動で収集・分類します
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>RSSソースを追加</CardTitle>
        </CardHeader>
        <CardContent>
          <RssSourceForm brands={brands} />
        </CardContent>
      </Card>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>登録済みRSSソース</CardTitle>
        </CardHeader>
        <CardContent>
          <RssSourceList sources={rssSources} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>よく使われるRSSフィード</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm">
            <p className="font-medium">PR TIMES（企業別）</p>
            <code className="block bg-muted p-2 rounded text-xs">
              https://prtimes.jp/companyrdf.php?company_id=企業ID
            </code>
            <p className="text-muted-foreground">
              企業IDはPR TIMESの企業ページURLから取得できます
            </p>

            <p className="font-medium mt-4">PR TIMES（業界別）</p>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                美容:
                https://prtimes.jp/industryrdf.php?industry_id=6
              </li>
              <li>
                ファッション:
                https://prtimes.jp/industryrdf.php?industry_id=7
              </li>
              <li>
                食品:
                https://prtimes.jp/industryrdf.php?industry_id=8
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
