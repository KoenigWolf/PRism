import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft,
  Target,
  TrendingUp,
  Shield,
  DollarSign,
  Rocket,
  Calendar,
  AlertTriangle,
  BarChart3,
  Users,
  Zap
} from "lucide-react";

export default function BusinessStrategyPage() {
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
            <h1 className="text-3xl font-bold tracking-tight">PRism ビジネス戦略</h1>
            <Badge variant="secondary">v3.0</Badge>
          </div>
          <p className="text-xl text-muted-foreground">
            経営・事業開発・投資家向け：市場分析、競合ポジショニング、ユニットエコノミクス、GTMロードマップ
          </p>
        </div>
      </div>

      {/* Executive Summary */}
      <Card className="border-primary/50 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-primary" />
            エグゼクティブサマリー
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            PRismは、PR会社・広告代理店向けの<span className="font-bold">競合PR戦略分析ダッシュボード</span>である。
            既存ツールが「過去の露出量を報告するクリッピングツール」に留まる中、PRismは
            <span className="font-bold text-primary">「競合の勝ちパターンを因数分解し、次の打ち手を示唆する戦略立案ツール」</span>
            という未開拓ポジションを狙う。
          </p>
          <div className="p-4 bg-background rounded-lg border">
            <p className="font-medium mb-2">核心仮説</p>
            <p className="text-sm text-muted-foreground">
              中堅・中小PR会社は「次に何をすべきか」の示唆に飢えているが、既存ツールは高価で報告用途に偏っている。
              この<span className="font-medium text-foreground">インサイト・ギャップ</span>がPRismの市場機会である。
            </p>
          </div>
        </CardContent>
      </Card>

      {/* KGI */}
      <Card>
        <CardHeader>
          <CardTitle>KGI（12ヶ月目標）</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { label: "MRR", value: "¥1,000,000", desc: "月間定期収益" },
              { label: "有料顧客数", value: "25社", desc: "" },
              { label: "NRR", value: "110%+", desc: "売上継続率" },
              { label: "月次チャーン", value: "3%以下", desc: "" },
            ].map((item) => (
              <div key={item.label} className="p-4 border rounded-lg text-center">
                <p className="text-2xl font-bold text-primary">{item.value}</p>
                <p className="font-medium">{item.label}</p>
                {item.desc && <p className="text-xs text-muted-foreground">{item.desc}</p>}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table of Contents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">目次</CardTitle>
        </CardHeader>
        <CardContent>
          <nav className="grid gap-2 text-sm md:grid-cols-2">
            {[
              { id: "market", label: "1. 市場分析" },
              { id: "differentiation", label: "2. 差別化戦略" },
              { id: "business-model", label: "3. ビジネスモデル・価格戦略" },
              { id: "plg", label: "4. PLG戦略" },
              { id: "gtm", label: "5. Go-to-Marketロードマップ" },
              { id: "timeline", label: "6. タイムライン" },
              { id: "risk", label: "7. リスク分析" },
              { id: "kpi", label: "8. KPIダッシュボード" },
            ].map((item) => (
              <a key={item.id} href={`#${item.id}`} className="hover:text-primary">
                {item.label}
              </a>
            ))}
          </nav>
        </CardContent>
      </Card>

      <Separator />

      {/* 1. Market Analysis */}
      <section id="market" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          1. 市場分析
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>TAM / SAM / SOM</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="relative">
                <div className="p-6 bg-slate-100 dark:bg-slate-800 rounded-xl">
                  <div className="text-center mb-2">
                    <span className="text-sm text-muted-foreground">TAM</span>
                    <p className="text-2xl font-bold">~¥500億</p>
                    <p className="text-sm">日本のPR・コミュニケーション関連ソフトウェア市場全体</p>
                  </div>
                  <div className="p-4 bg-slate-200 dark:bg-slate-700 rounded-lg mt-4">
                    <div className="text-center mb-2">
                      <span className="text-sm text-muted-foreground">SAM</span>
                      <p className="text-xl font-bold">~¥80〜120億</p>
                      <p className="text-sm">PR効果測定・メディアモニタリングツール市場</p>
                    </div>
                    <div className="p-4 bg-primary/20 rounded-lg mt-4">
                      <div className="text-center">
                        <span className="text-sm text-muted-foreground">SOM</span>
                        <p className="text-lg font-bold text-primary">~¥1〜3億</p>
                        <p className="text-sm">中堅・中小PR会社向け戦略分析ツール</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>競合ポジショニングマップ</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-square max-w-md mx-auto p-8 border rounded-lg">
              {/* Axes */}
              <div className="absolute left-1/2 top-4 bottom-4 w-px bg-border" />
              <div className="absolute top-1/2 left-4 right-4 h-px bg-border" />

              {/* Labels */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">高価格</div>
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs text-muted-foreground">低価格</div>
              <div className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">報告用</div>
              <div className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">戦略用</div>

              {/* Competitors */}
              <div className="absolute top-[20%] left-[60%] text-xs">
                <div className="p-2 bg-muted rounded">Meltwater</div>
              </div>
              <div className="absolute top-[35%] left-[40%] text-xs">
                <div className="p-2 bg-muted rounded">PR Analyzer</div>
              </div>
              <div className="absolute top-[60%] left-[45%] text-xs">
                <div className="p-2 bg-muted rounded">Social Insight</div>
              </div>
              <div className="absolute top-[70%] right-[15%] text-xs">
                <div className="p-2 bg-primary text-white rounded font-bold">PRism</div>
              </div>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-4">
              狙うポジション: 右下象限「低価格 × 戦略立案特化」
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>競合詳細比較</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">項目</th>
                    <th className="text-left py-2 px-3">PR Analyzer</th>
                    <th className="text-left py-2 px-3">Meltwater</th>
                    <th className="text-left py-2 px-3 bg-primary/10 font-bold">PRism</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { item: "価格帯", pra: "月額数万〜数十万", melt: "年額$15K〜$100K+", prism: "¥29,800〜" },
                    { item: "主な顧客", pra: "大企業広報部", melt: "グローバル企業", prism: "中堅PR会社" },
                    { item: "コア価値", pra: "クリッピング＋AVE", melt: "メディア監視＋SoV", prism: "戦略示唆＋PESO" },
                    { item: "UI/UX", pra: "レガシー", melt: "多機能で複雑", prism: "モダン軽量SPA" },
                    { item: "AI活用", pra: "△ レポート補助", melt: "○ トレンド検出", prism: "◎ 打ち手提案" },
                    { item: "導入障壁", pra: "高（営業必須）", melt: "高（年契＋営業）", prism: "低（セルフサーブ）" },
                  ].map((row) => (
                    <tr key={row.item} className="border-b">
                      <td className="py-2 px-3 font-medium">{row.item}</td>
                      <td className="py-2 px-3 text-muted-foreground">{row.pra}</td>
                      <td className="py-2 px-3 text-muted-foreground">{row.melt}</td>
                      <td className="py-2 px-3 bg-primary/10 font-medium">{row.prism}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 2. Differentiation Strategy */}
      <section id="differentiation" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Target className="h-6 w-6 text-primary" />
          2. 差別化戦略
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>PRismのコアバリュー</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border rounded-lg">
                <Badge variant="outline" className="mb-2">既存ツール</Badge>
                <p className="font-medium">What happened?</p>
                <p className="text-sm text-muted-foreground mt-2">
                  「先月の露出量は1,200件、広告換算価値は3,000万円でした」
                </p>
              </div>
              <div className="p-4 border-2 border-primary rounded-lg bg-primary/5">
                <Badge className="mb-2">PRism</Badge>
                <p className="font-medium">Why it worked? → What&apos;s next?</p>
                <p className="text-sm text-muted-foreground mt-2">
                  「競合Aは"成分訴求×専門家コラボ"のPESOパターンでEarned露出が3倍に。御社も同パターンの横展開が有効です」
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4層のMoat（競争優位の壁）設計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { layer: 1, name: "価格の壁", content: "稟議不要の¥29,800〜。大手ツールが価格を下げにくい構造を利用", timing: "Day 1" },
                { layer: 2, name: "UXの壁", content: "Next.js + shadcn/uiによる軽快なSPA体験。「毎日開きたくなるUI」", timing: "Phase 1" },
                { layer: 3, name: "データの壁", content: "蓄積された競合PR分析データ。業界別ベンチマーク。スイッチングコスト上昇", timing: "Phase 2〜" },
                { layer: 4, name: "AIの壁", content: "蓄積データで訓練したPR戦略推論モデル。「PRismでしか出せない示唆」", timing: "Phase 3〜" },
              ].map((item) => (
                <div key={item.layer} className="flex gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0 w-10 h-10 bg-primary text-white rounded-full flex items-center justify-center font-bold">
                    {item.layer}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold">{item.name}</h4>
                      <Badge variant="outline">{item.timing}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.content}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 3. Business Model */}
      <section id="business-model" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <DollarSign className="h-6 w-6 text-primary" />
          3. ビジネスモデル・価格戦略
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>Value Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg">
              <span className="font-bold text-primary">「分析対象ブランド登録数」</span> を課金軸とする
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              PR会社はクライアント増加 = ブランド枠の必要数増加。事業成長とアップセルが自然に連動
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>価格プラン</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  name: "Starter",
                  price: "¥29,800",
                  brands: "5",
                  users: "3名",
                  data: "6ヶ月",
                  ai: "月3回",
                  target: "事業会社のインハウスPR",
                  highlight: false,
                },
                {
                  name: "Pro",
                  price: "¥49,800",
                  brands: "20",
                  users: "無制限",
                  data: "12ヶ月",
                  ai: "月20回",
                  target: "PR会社1チーム・中小代理店",
                  highlight: true,
                },
                {
                  name: "Agency",
                  price: "¥150,000〜",
                  brands: "無制限",
                  users: "無制限",
                  data: "無制限",
                  ai: "無制限＋自動生成",
                  target: "大手PR会社・総合代理店",
                  highlight: false,
                },
              ].map((plan) => (
                <div
                  key={plan.name}
                  className={`p-6 border rounded-lg ${
                    plan.highlight ? "border-primary border-2 bg-primary/5" : ""
                  }`}
                >
                  {plan.highlight && (
                    <Badge className="mb-2">おすすめ</Badge>
                  )}
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  <p className="text-3xl font-bold text-primary mt-2">{plan.price}</p>
                  <p className="text-sm text-muted-foreground">/ 月（税抜）</p>
                  <Separator className="my-4" />
                  <ul className="space-y-2 text-sm">
                    <li>ブランド数: <span className="font-medium">{plan.brands}</span></li>
                    <li>ユーザー数: <span className="font-medium">{plan.users}</span></li>
                    <li>データ保持: <span className="font-medium">{plan.data}</span></li>
                    <li>AI示唆レポート: <span className="font-medium">{plan.ai}</span></li>
                  </ul>
                  <p className="text-xs text-muted-foreground mt-4">{plan.target}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>ユニットエコノミクス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { label: "ARPU（月額）", value: "¥45,000", benchmark: "" },
                { label: "CAC", value: "¥50,000", benchmark: "業界: ¥80K〜170K" },
                { label: "月次チャーン", value: "3.0%", benchmark: "業界: 3.5%" },
                { label: "平均契約期間", value: "24ヶ月", benchmark: "" },
                { label: "LTV", value: "¥1,080,000", benchmark: "" },
                { label: "LTV / CAC", value: "21.6x", benchmark: "健全: 3〜5x" },
              ].map((item) => (
                <div key={item.label} className="p-4 border rounded-lg">
                  <p className="text-sm text-muted-foreground">{item.label}</p>
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                  {item.benchmark && (
                    <p className="text-xs text-muted-foreground">{item.benchmark}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 4. PLG Strategy */}
      <section id="plg" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Rocket className="h-6 w-6 text-primary" />
          4. PLG（Product-Led Growth）戦略
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>PLGファネル設計</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { stage: "認知", desc: "note記事 / X発信 / SEO / ウェビナー", goal: "月間1,000 UU" },
                { stage: "トライアル開始", desc: "14日間無料・クレカ不要", goal: "転換率 5%（50件/月）" },
                { stage: "アクティベーション", desc: "初回ブランド登録→PESO分析画面を見る", goal: "転換率 40%、TTV: 5分以内" },
                { stage: "PQL化", desc: "3社以上のブランド登録＋週2回以上ログイン", goal: "転換率 50%" },
                { stage: "有料転換", desc: "トライアル期限到達時に課金案内", goal: "転換率 25%" },
                { stage: "拡張", desc: "ブランド枠追加・プランアップグレード", goal: "NRR 110%+" },
                { stage: "紹介", desc: "同僚にPRismを紹介→1ヶ月無料", goal: "有料顧客の20%が紹介" },
              ].map((item, index) => (
                <div key={item.stage} className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary/20 text-primary rounded-full flex items-center justify-center font-bold text-sm">
                    {index + 1}
                  </div>
                  <div className="flex-1 p-3 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <h4 className="font-medium">{item.stage}</h4>
                      <Badge variant="outline">{item.goal}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>North Star Metric</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-6 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">週次アクティブブランド分析数</p>
              <p className="text-3xl font-bold text-primary">WAB</p>
              <p className="text-sm mt-2">Weekly Active Brand Analyses</p>
            </div>
            <div className="grid gap-4 md:grid-cols-3 mt-4">
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">6ヶ月目</p>
                <p className="text-xl font-bold">50</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">12ヶ月目</p>
                <p className="text-xl font-bold">200</p>
                <p className="text-xs text-muted-foreground">PMFの証拠</p>
              </div>
              <div className="p-3 border rounded-lg text-center">
                <p className="text-sm text-muted-foreground">24ヶ月目</p>
                <p className="text-xl font-bold">1,000</p>
                <p className="text-xs text-muted-foreground">スケールフェーズ</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 5. GTM Roadmap */}
      <section id="gtm" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          5. Go-to-Marketロードマップ
        </h2>

        <div className="grid gap-4">
          {[
            {
              phase: "Phase 1",
              title: "「0→1」デザインパートナー獲得",
              period: "Month 1〜3",
              goal: "熱狂的な初期ユーザー3〜5社を獲得し、PMFの手応えを掴む",
              strategy: "コンシェルジュ・オンボーディング",
              kpi: "デザインパートナー3社獲得",
              exit: "3社以上が「このツールなしでは仕事に戻れない」と発言",
            },
            {
              phase: "Phase 2",
              title: "「1→10」PMF達成",
              period: "Month 4〜8",
              goal: "再現可能な獲得チャネルを見つけ、MRR ¥200,000到達",
              strategy: "Data-Led Content Marketing",
              kpi: "MRR ¥200K、有料顧客6社、NPS 40+",
              exit: "月間新規トライアル20件以上、PQL→有料転換率20%以上",
            },
            {
              phase: "Phase 3",
              title: "「10→100」スケールアップ",
              period: "Month 9〜18",
              goal: "PLGエンジンの本格稼働、MRR ¥1,000,000到達",
              strategy: "PLG × パートナーシップ",
              kpi: "MRR ¥1M、有料顧客25社、月次チャーン3%以下",
              exit: "",
            },
            {
              phase: "Phase 4",
              title: "「100→」エンタープライズ攻略",
              period: "Month 18〜",
              goal: "大手PR会社・総合代理店のリプレイスを狙い、ARPUの大幅向上",
              strategy: "エンタープライズ要件対応＋コンサル型営業",
              kpi: "MRR ¥3M+、Agency顧客5社以上、NRR 120%+",
              exit: "",
            },
          ].map((item) => (
            <Card key={item.phase}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">{item.phase}</Badge>
                    <CardTitle>{item.title}</CardTitle>
                  </div>
                  <span className="text-sm text-muted-foreground">{item.period}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4">{item.goal}</p>
                <div className="grid gap-2 md:grid-cols-2 text-sm">
                  <div className="p-2 bg-muted rounded">
                    <span className="text-muted-foreground">戦略:</span> {item.strategy}
                  </div>
                  <div className="p-2 bg-muted rounded">
                    <span className="text-muted-foreground">KPI:</span> {item.kpi}
                  </div>
                </div>
                {item.exit && (
                  <div className="mt-3 p-2 border-l-4 border-primary bg-primary/5 text-sm">
                    <span className="font-medium">Exit Criteria:</span> {item.exit}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <Separator />

      {/* 6. Timeline */}
      <section id="timeline" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar className="h-6 w-6 text-primary" />
          6. タイムライン（月次計画）
        </h2>

        <Card>
          <CardContent className="pt-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-3">月</th>
                    <th className="text-left py-2 px-3">開発トラック</th>
                    <th className="text-left py-2 px-3">事業トラック</th>
                    <th className="text-left py-2 px-3">マイルストーン</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { month: "M1", dev: "MVP開発", biz: "ターゲットリスト作成、DM送付開始", milestone: "プロトタイプ完成" },
                    { month: "M3", dev: "フィードバック反映", biz: "コンシェルジュOB開始", milestone: "デザインパートナー3社獲得" },
                    { month: "M5", dev: "AI示唆v1（ルールベース）", biz: "SEO記事量産、LP公開", milestone: "初の自然流入リード" },
                    { month: "M6", dev: "比較分析機能強化", biz: "ウェビナー初回開催", milestone: "MRR ¥200K達成" },
                    { month: "M9", dev: "AI示唆v2（LLM統合）", biz: "パートナーメディア提携", milestone: "MRR ¥500K達成" },
                    { month: "M12", dev: "ホワイトラベル対応", biz: "年次振り返り・戦略更新", milestone: "MRR ¥1M達成" },
                  ].map((row) => (
                    <tr key={row.month} className="border-b">
                      <td className="py-2 px-3 font-bold">{row.month}</td>
                      <td className="py-2 px-3">{row.dev}</td>
                      <td className="py-2 px-3">{row.biz}</td>
                      <td className="py-2 px-3">
                        <Badge variant="outline">{row.milestone}</Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 7. Risk Analysis */}
      <section id="risk" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-primary" />
          7. リスク分析
        </h2>

        <Card>
          <CardHeader>
            <CardTitle>リスクマトリクス</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { risk: "データ収集の法的リスク", prob: "中", impact: "高", level: "high", action: "robots.txt遵守、利用規約の弁護士レビュー、公開データのみ使用" },
                { risk: "PMF未達（需要なし）", prob: "中", impact: "高", level: "high", action: "Phase 1のコンシェルジュで仮説検証。3ヶ月でPivot判断" },
                { risk: "既存大手の価格引き下げ", prob: "低", impact: "高", level: "medium", action: "「戦略示唆」という価値軸で勝負。価格だけの競争に巻き込まれない" },
                { risk: "個人開発の開発速度限界", prob: "高", impact: "中", level: "medium", action: "MVP→コア機能に絞る。AI示唆は後回しにし、まずPESOダッシュボードの価値を検証" },
                { risk: "顧客チャーンの高止まり", prob: "中", impact: "中", level: "medium", action: "週次のCSタッチ、オンボーディング最適化、解約理由の即時ヒアリング" },
              ].map((item) => (
                <div key={item.risk} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`w-3 h-3 rounded-full ${
                      item.level === "high" ? "bg-destructive" : "bg-yellow-500"
                    }`} />
                    <h4 className="font-medium">{item.risk}</h4>
                    <div className="flex gap-1 ml-auto">
                      <Badge variant="outline">発生: {item.prob}</Badge>
                      <Badge variant="outline">影響: {item.impact}</Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground">対策: {item.action}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pivot判断基準（3ヶ月目）</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="p-4 border-2 border-green-500 rounded-lg bg-green-500/5">
                <h4 className="font-medium text-green-600 mb-2">継続ライン</h4>
                <ul className="space-y-1 text-sm">
                  <li>デザインパートナー 3社以上</li>
                  <li>週次MTG継続率 80%以上</li>
                  <li>「なくなったら困る」発言 2社以上</li>
                  <li>有料転換意思の表明 1社以上</li>
                </ul>
              </div>
              <div className="p-4 border-2 border-destructive rounded-lg bg-destructive/5">
                <h4 className="font-medium text-destructive mb-2">Pivot検討ライン</h4>
                <ul className="space-y-1 text-sm">
                  <li>デザインパートナー 1社以下</li>
                  <li>週次MTG継続率 50%以下</li>
                  <li>「なくなったら困る」発言 0社</li>
                  <li>有料転換意思の表明 0社</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      <Separator />

      {/* 8. KPI Dashboard */}
      <section id="kpi" className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          8. KPIダッシュボード
        </h2>

        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge>Tier 1</Badge>
                事業健全性（週次確認）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "MRR", target: "月次10%成長", alert: "2ヶ月連続で成長率5%未満" },
                  { label: "月次チャーン", target: "3%以下", alert: "5%超え" },
                  { label: "WAB", target: "前週比+5%", alert: "2週連続で減少" },
                ].map((item) => (
                  <div key={item.label} className="p-4 border rounded-lg">
                    <h4 className="font-medium">{item.label}</h4>
                    <p className="text-sm text-green-600">目標: {item.target}</p>
                    <p className="text-sm text-destructive">アラート: {item.alert}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="outline">Tier 2</Badge>
                成長エンジン（月次確認）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-5">
                {[
                  { label: "トライアル開始数", target: "50件/月" },
                  { label: "アクティベーション率", target: "40%" },
                  { label: "PQL→有料転換率", target: "25%" },
                  { label: "NRR", target: "110%+" },
                  { label: "NPS", target: "40+" },
                ].map((item) => (
                  <div key={item.label} className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-bold text-primary">{item.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge variant="secondary">Tier 3</Badge>
                効率性（四半期確認）
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                {[
                  { label: "CAC", target: "¥50,000以下" },
                  { label: "LTV / CAC", target: "5.0x以上" },
                  { label: "CAC回収期間", target: "2ヶ月以内" },
                  { label: "粗利率", target: "85%以上" },
                ].map((item) => (
                  <div key={item.label} className="p-3 border rounded-lg text-center">
                    <p className="text-sm text-muted-foreground">{item.label}</p>
                    <p className="font-bold">{item.target}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Glossary */}
      <Card>
        <CardHeader>
          <CardTitle>用語集</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 md:grid-cols-2 text-sm">
            {[
              { term: "PESO", def: "Paid（広告）、Earned（パブリシティ）、Shared（SNS）、Owned（自社メディア）の4分類" },
              { term: "AVE", def: "Advertising Value Equivalency（広告換算価値）。メディア露出を広告費に換算する旧来指標" },
              { term: "PLG", def: "Product-Led Growth。プロダクト体験を通じて顧客獲得・拡大する成長戦略" },
              { term: "PQL", def: "Product-Qualified Lead。プロダクト内の行動データから購買意欲が高いと判定されたリード" },
              { term: "NRR", def: "Net Revenue Retention。既存顧客ベースからの収益維持率" },
              { term: "WAB", def: "Weekly Active Brand Analyses。PRism固有のNorth Star Metric" },
              { term: "MRR", def: "Monthly Recurring Revenue。月間定期収益" },
              { term: "TTV", def: "Time to Value。ユーザーが価値を実感するまでの時間" },
            ].map((item) => (
              <div key={item.term} className="p-2 border rounded">
                <span className="font-mono font-bold">{item.term}</span>
                <span className="text-muted-foreground ml-2">{item.def}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="text-center py-8 text-sm text-muted-foreground">
        PRism Business Strategy v3.0 — 2026年3月
      </div>
    </div>
  );
}
