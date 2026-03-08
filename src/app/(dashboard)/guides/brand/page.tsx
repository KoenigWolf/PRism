import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Palette, Type, ImageIcon, Sparkles, MessageSquare, Layout, CheckSquare } from "lucide-react";

export default function BrandGuidePage() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="space-y-4">
        <Link
          href="/guides"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          ガイドライン一覧に戻る
        </Link>

        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl font-bold tracking-tight">PRism Brand Guidelines</h1>
            <Badge variant="secondary">v2.0</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            PR × Prism — 競合のPR戦略を&quot;分光&quot;し、勝ちパターンを可視化する
          </p>
        </div>
      </div>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">目次</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid gap-2 text-sm">
            {[
              { id: "story", label: "1. ブランドストーリー" },
              { id: "naming", label: "2. 表記ルール" },
              { id: "tagline", label: "3. タグライン" },
              { id: "logo", label: "4. ロゴシステム" },
              { id: "color", label: "5. カラーシステム" },
              { id: "typography", label: "6. タイポグラフィ" },
              { id: "icon", label: "7. アイコノグラフィ" },
              { id: "voice", label: "8. トーン＆ボイス" },
              { id: "ui", label: "9. UIコンポーネント指針" },
              { id: "principles", label: "10. ブランドの10原則" },
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} className="hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>
        </CardContent>
      </Card>

      {/* 1. Brand Story */}
      <section id="story" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          1. ブランドストーリー
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>ブランドの起源</CardTitle>
          </CardHeader>
          <CardContent className="prose prose-slate dark:prose-invert max-w-none">
            <p>
              光がプリズムを通過すると、目に見えなかった波長が虹として分離される。
              PRismは、PR業界に同じ体験を提供する。複雑に混在する競合のPR活動を、
              データとフレームワークの力で美しく&quot;分光&quot;し、隠れていた勝ちパターンを可視化する。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ネーミングの構造</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="font-mono text-center text-lg mb-4 p-4 bg-muted rounded-lg">
              PR + ism + Prism = <span className="font-bold text-primary">PRism</span>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { layer: "機能", element: "PR", meaning: "ドメイン領域", contribution: "一目で「PR関連のツール」と認知される" },
                { layer: "比喩", element: "Prism", meaning: "光の分離", contribution: "複雑なPR情報をPESO区分で分光するメタファー" },
                { layer: "哲学", element: "-ism", meaning: "方法論", contribution: "データドリブンPRという「新しい流儀」の提唱" },
              ].map((item) => (
                <div key={item.element} className="p-4 border rounded-lg">
                  <Badge variant="outline" className="mb-2">{item.layer}</Badge>
                  <h4 className="font-bold">{item.element}</h4>
                  <p className="text-sm text-muted-foreground mt-1">{item.meaning}</p>
                  <p className="text-sm mt-2">{item.contribution}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>ミッション</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic">
                PR戦略の&quot;なぜ&quot;を可視化し、すべてのPRパーソンに「次の一手」を届ける。
              </blockquote>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>ビジョン</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="border-l-4 border-primary pl-4 italic">
                PR業界のインテリジェンス基盤となり、データで意思決定する文化を標準にする。
              </blockquote>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>ブランドバリュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { value: "Insight First", definition: "分析で終わらず、示唆を提供する", action: "「だから何？」に常に答える" },
                { value: "Clarity", definition: "複雑な情報を美しく構造化する", action: "情報を足すのではなく、ノイズを削る" },
                { value: "Confidence", definition: "データに裏打ちされた自信で語る", action: "「〜かもしれない」ではなく「〜です」" },
                { value: "Accessibility", definition: "誰でも使える価格とUI", action: "専門家だけのツールにしない" },
              ].map((item) => (
                <div key={item.value} className="p-4 border rounded-lg">
                  <h4 className="font-bold text-primary">{item.value}</h4>
                  <p className="text-sm mt-1">{item.definition}</p>
                  <p className="text-sm text-muted-foreground mt-2">→ {item.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 2. Naming Rules */}
      <section id="naming" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Type className="h-6 w-6 text-primary" />
          2. 表記ルール
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>正式表記</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-4">用途</th>
                    <th className="text-left py-2 px-4">表記</th>
                    <th className="text-left py-2 px-4">備考</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">正式名称</td>
                    <td className="py-2 px-4"><span className="font-bold text-primary">PRism</span></td>
                    <td className="py-2 px-4 text-muted-foreground">先頭2文字「PR」のみ大文字</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">日本語併記</td>
                    <td className="py-2 px-4">PRism（プリズム）</td>
                    <td className="py-2 px-4 text-muted-foreground">初出時のみカタカナを添える</td>
                  </tr>
                  <tr className="border-b">
                    <td className="py-2 px-4 font-medium">URL / SNS</td>
                    <td className="py-2 px-4 font-mono">@prism_pr / prism-pr</td>
                    <td className="py-2 px-4 text-muted-foreground">小文字統一＋「_pr」で領域明示</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-4 font-medium">コード・API</td>
                    <td className="py-2 px-4 font-mono">prism / prism-pr</td>
                    <td className="py-2 px-4 text-muted-foreground">小文字ケバブケース</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader>
            <CardTitle className="text-destructive">NG表記（厳守）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 md:grid-cols-2">
              {[
                { ng: "PRISM", reason: "NSAの監視プログラムを連想。絶対禁止" },
                { ng: "Prism", reason: "PRの2文字が埋没し、ブランド認知が薄れる" },
                { ng: "prism", reason: "固有名詞としての存在感がなくなる" },
                { ng: "PR ism", reason: "スペースで分断すると意味が壊れる" },
              ].map((item) => (
                <div key={item.ng} className="flex items-start gap-2 p-2">
                  <span className="font-mono line-through text-destructive">{item.ng}</span>
                  <span className="text-sm text-muted-foreground">— {item.reason}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 3. Tagline */}
      <section id="tagline" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          3. タグライン
        </h2>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              <div className="p-6 bg-primary/10 rounded-lg text-center">
                <Badge className="mb-2">コア</Badge>
                <p className="text-2xl font-bold">「競合のPR、分光する。」</p>
                <p className="text-sm text-muted-foreground mt-2">ロゴ直下、名刺、LP Hero</p>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 border rounded-lg text-center">
                  <Badge variant="outline" className="mb-2">機能訴求</Badge>
                  <p className="font-medium">「勝ちパターンを、データで解く。」</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Badge variant="outline" className="mb-2">差別化</Badge>
                  <p className="font-medium">「PR戦略の&quot;なぜ&quot;を、可視化する。」</p>
                </div>
                <div className="p-4 border rounded-lg text-center">
                  <Badge variant="outline" className="mb-2">English</Badge>
                  <p className="font-medium">&quot;Decompose. Compare. Outsmart.&quot;</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 4. Logo System */}
      <section id="logo" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ImageIcon className="h-6 w-6 text-primary" />
          4. ロゴシステム
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>ロゴ構成</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 border rounded-lg text-center">
                <div className="text-4xl mb-2">◇</div>
                <h4 className="font-bold">シンボルマーク</h4>
                <p className="text-sm text-muted-foreground">プリズム多面体から虹色の光線が分散するモチーフ</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-2xl font-bold mb-2"><span className="font-black">PR</span><span className="font-light">ism</span></div>
                <h4 className="font-bold">ワードマーク</h4>
                <p className="text-sm text-muted-foreground">Inter フォント。PR = Bold 700、ism = Light 300</p>
              </div>
              <div className="p-4 border rounded-lg text-center">
                <div className="text-xl mb-2">◇ <span className="font-bold">PR</span><span className="font-light">ism</span></div>
                <h4 className="font-bold">ロックアップ</h4>
                <p className="text-sm text-muted-foreground">シンボル＋ワードマークの一体型</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ロゴバリエーション</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {[
                { name: "フルカラー（Primary）", use: "LP、資料、名刺", bg: "白背景・明るい背景" },
                { name: "フルカラー（Reversed）", use: "ダークモードUI、暗い写真上", bg: "暗い背景" },
                { name: "モノクロ（Black）", use: "白黒印刷、FAX", bg: "白背景" },
                { name: "シンボルのみ", use: "ファビコン、アプリアイコン", bg: "正方形必須の場面" },
              ].map((item) => (
                <div key={item.name} className="p-3 border rounded-lg">
                  <h4 className="font-medium">{item.name}</h4>
                  <p className="text-sm text-muted-foreground">{item.use}</p>
                  <Badge variant="outline" className="mt-2">{item.bg}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 5. Color System */}
      <section id="color" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Palette className="h-6 w-6 text-primary" />
          5. カラーシステム
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>ブランドカラー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {[
                { name: "Primary", color: "#4F46E5", desc: "Deep Indigo" },
                { name: "Primary Dark", color: "#4338CA", desc: "Indigo 700" },
                { name: "Primary Light", color: "#E0E7FF", desc: "Indigo 100" },
                { name: "Accent", color: "#8B5CF6", desc: "Prism Violet" },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <div
                    className="h-20 rounded-lg border"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                    <code className="text-xs">{item.color}</code>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>PESO区分カラー（固定）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { peso: "Paid", color: "#F59E0B", name: "Amber", meaning: "広告。「投資」を連想させる暖色" },
                { peso: "Earned", color: "#3B82F6", name: "Blue", meaning: "パブリシティ。「信頼・権威」の青" },
                { peso: "Shared", color: "#10B981", name: "Emerald", meaning: "SNS。「拡散・成長」の緑" },
                { peso: "Owned", color: "#8B5CF6", name: "Violet", meaning: "自社メディア。「独自性」の紫" },
              ].map((item) => (
                <div key={item.peso} className="space-y-2">
                  <div
                    className="h-16 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: item.color }}
                  >
                    {item.peso}
                  </div>
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.meaning}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>セマンティックカラー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              {[
                { name: "Success", color: "#10B981", use: "成功通知、ポジティブ指標" },
                { name: "Warning", color: "#F59E0B", use: "警告、注意喚起" },
                { name: "Error", color: "#F43F5E", use: "エラー、破壊的アクション" },
                { name: "Info", color: "#0EA5E9", use: "情報通知、ヘルプ" },
              ].map((item) => (
                <div key={item.name} className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.use}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 6. Typography */}
      <section id="typography" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Type className="h-6 w-6 text-primary" />
          6. タイポグラフィ
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>フォントスタック</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              {[
                { use: "ロゴ・見出し", font: "Inter", weight: "Bold 700 / Light 300" },
                { use: "本文（英数）", font: "Inter", weight: "Regular 400 / Medium 500" },
                { use: "本文（日本語）", font: "Noto Sans JP", weight: "Regular 400 / Medium 500 / Bold 700" },
                { use: "コード・数値", font: "JetBrains Mono", weight: "Regular 400" },
              ].map((item) => (
                <div key={item.use} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="text-muted-foreground">{item.use}</span>
                  <div className="text-right">
                    <span className="font-medium">{item.font}</span>
                    <span className="text-sm text-muted-foreground ml-2">{item.weight}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>タイプスケール</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-5xl font-bold">Display — 48px</div>
              <div className="text-4xl font-bold">H1 — 36px</div>
              <div className="text-3xl font-bold">H2 — 28px</div>
              <div className="text-xl font-medium">H3 — 22px</div>
              <div className="text-lg font-medium">H4 — 18px</div>
              <div className="text-base">Body — 16px</div>
              <div className="text-sm">Small — 14px</div>
              <div className="text-xs font-medium">Caption — 12px</div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 7. Icons */}
      <section id="icon" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />
          7. アイコノグラフィ
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>アイコンスタイル</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h4 className="font-medium mb-2">仕様</h4>
                <ul className="space-y-2 text-sm">
                  <li>ライブラリ: <span className="font-medium">Lucide Icons</span></li>
                  <li>スタイル: ストローク（Outline）</li>
                  <li>ストローク幅: 1.5px</li>
                  <li>サイズ: 16px / 20px / 24px</li>
                  <li>角丸: Round join, Round cap</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium mb-2">PESO専用アイコン</h4>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <span style={{ color: "#F59E0B" }}>📢</span> Paid: Megaphone
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <span style={{ color: "#3B82F6" }}>📰</span> Earned: Newspaper
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <span style={{ color: "#10B981" }}>🔗</span> Shared: Share2
                  </div>
                  <div className="flex items-center gap-2 p-2 border rounded">
                    <span style={{ color: "#8B5CF6" }}>✏️</span> Owned: PenTool
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 8. Tone & Voice */}
      <section id="voice" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <MessageSquare className="h-6 w-6 text-primary" />
          8. トーン＆ボイス
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>ブランドパーソナリティ</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-4">
              PRismは<span className="font-bold text-primary">「知的で頼れる参謀」</span>として振る舞う。
              クライアントの隣に座り、データを指差しながら「次はこうしましょう」と提案する存在。
            </p>
            <div className="grid gap-3">
              {[
                { label: "知的", left: "知的", right: "カジュアル", value: 30 },
                { label: "自信", left: "自信", right: "控えめ", value: 35 },
                { label: "実用的", left: "実用的", right: "理論的", value: 25 },
                { label: "簡潔", left: "簡潔", right: "饒舌", value: 20 },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-4">
                  <span className="w-16 text-sm text-right">{item.left}</span>
                  <div className="flex-1 h-2 bg-muted rounded-full relative">
                    <div
                      className="absolute h-4 w-4 bg-primary rounded-full top-1/2 -translate-y-1/2"
                      style={{ left: `${item.value}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm">{item.right}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-green-500/50 bg-green-500/5">
            <CardHeader>
              <CardTitle className="text-green-600">良い例（PRismらしい）</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm italic">
                CLAYGEのInstagram施策を分析しました。Earned比率が競合平均より23%高く、
                UGC起点の拡散が成功要因です。インフルエンサーとの共創コンテンツを強化することを推奨します。
              </blockquote>
            </CardContent>
          </Card>
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader>
              <CardTitle className="text-destructive">悪い例（PRismらしくない）</CardTitle>
            </CardHeader>
            <CardContent>
              <blockquote className="text-sm italic">
                データを見ると、CLAYGEさんはインスタグラムが結構強いみたいですね！
                他社さんよりいいねが多い感じなので、頑張ってみてはいかがでしょうか？
              </blockquote>
            </CardContent>
          </Card>
        </div>
      </section>

      <Separator />

      {/* 9. UI Components */}
      <section id="ui" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Layout className="h-6 w-6 text-primary" />
          9. UIコンポーネント指針
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>ボタン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium">
                Primary
              </button>
              <button className="px-4 py-2 border border-slate-300 rounded-lg font-medium">
                Secondary
              </button>
              <button className="px-4 py-2 text-primary font-medium">
                Ghost
              </button>
              <button className="px-4 py-2 bg-rose-500 text-white rounded-lg font-medium">
                Danger
              </button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>カード</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>角丸: 12px</li>
              <li>影: <code>0 1px 3px rgba(0,0,0,0.1), 0 1px 2px rgba(0,0,0,0.06)</code></li>
              <li>パディング: 24px</li>
              <li>ダークモード: 背景 #1E293B、ボーダー #334155</li>
            </ul>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 10. Principles */}
      <section id="principles" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CheckSquare className="h-6 w-6 text-primary" />
          10. ブランドの10原則
        </h2>

        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4">
              {[
                { num: 1, principle: "名前がコンセプトを語る", desc: "「PRを分光する」という価値が名前に内包されている" },
                { num: 2, principle: "PRの2文字で領域を即伝達", desc: "誰が見ても「PR関連のツール」と認知できる" },
                { num: 3, principle: "全大文字は絶対に使わない", desc: "「PRISM」はNSA連想。常に「PRism」表記を死守" },
                { num: 4, principle: "データに裏打ちされた自信で語る", desc: "「かもしれない」ではなく「です」のトーン" },
                { num: 5, principle: "分析で終わらず、次の一手を示す", desc: "示唆を提供することがツールの存在意義" },
                { num: 6, principle: "モダンで軽い体験を追求する", desc: "重厚なエンタープライズUIの対極に立つ" },
                { num: 7, principle: "アクセシビリティを妥協しない", desc: "WCAG AA準拠、色覚多様性対応" },
                { num: 8, principle: "一貫性が信頼を生む", desc: "全タッチポイントで同じ色・同じ声・同じ体験" },
                { num: 9, principle: "PESOカラーはブランドの一部", desc: "4色のPESO区分はPRismの視覚的シグネチャー" },
                { num: 10, principle: "ブランドは進化する", desc: "年1回のガイドライン見直しで時代に適応する" },
              ].map((item) => (
                <div key={item.num} className="flex gap-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {item.num}
                  </div>
                  <div>
                    <h4 className="font-bold">{item.principle}</h4>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-muted-foreground">
        PRism Brand Guidelines v2.0 — 2026年3月
      </div>
    </div>
  );
}
