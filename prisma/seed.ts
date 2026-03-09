import { PrismaClient, MediaType, Role } from "@prisma/client";
import { hash } from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clean up existing data
  await prisma.insight.deleteMany();
  await prisma.prItemTag.deleteMany();
  await prisma.note.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.prItem.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.company.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.user.deleteMany();
  await prisma.tenant.deleteMany();

  // Create Tenant A: "デモPR株式会社" (Professional plan)
  const tenantA = await prisma.tenant.create({
    data: {
      name: "デモPR株式会社",
      slug: "demo-pr",
      plan: "professional",
    },
  });

  // Create User for Tenant A
  const hashedPassword = await hash("password123", 12);
  await prisma.user.create({
    data: {
      email: "demo@prism.example.com",
      hashedPassword,
      name: "デモユーザー",
      role: Role.OWNER,
      tenantId: tenantA.id,
    },
  });

  // Create Company for Tenant A
  const company = await prisma.company.create({
    data: {
      name: "株式会社I-ne",
      industry: "コスメ・美容",
      tenantId: tenantA.id,
    },
  });

  // Create Brands
  const clayge = await prisma.brand.create({
    data: {
      name: "CLAYGE（クレージュ）",
      category: "ヘアケア・スキンケア",
      tenantId: tenantA.id,
      companyId: company.id,
    },
  });

  const botanist = await prisma.brand.create({
    data: {
      name: "BOTANIST（ボタニスト）",
      category: "ヘアケア",
      tenantId: tenantA.id,
      companyId: company.id,
    },
  });

  // Helper function to get date N days ago
  const daysAgo = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
  };

  // Create PrItems for CLAYGE
  const claygeItems = [
    {
      sourceType: "Instagram",
      mediaType: MediaType.EARNED,
      channel: "美容系インフルエンサーA（フォロワー10万）",
      title: "春の新作シャンプー、ガチレビュー！",
      summary: "泥パック成分配合で頭皮スッキリ。香りがデパコス級と高評価。",
      engagementCount: 4500,
      publishedAt: daysAgo(2),
    },
    {
      sourceType: "PR TIMES",
      mediaType: MediaType.OWNED,
      channel: "公式",
      title: "シリーズ累計2000万個突破！春の限定パッケージ発売",
      summary: "ロフト・プラザで先行発売開始。SNSキャンペーンも同時開催。",
      engagementCount: 120,
      publishedAt: daysAgo(5),
    },
    {
      sourceType: "Web Media",
      mediaType: MediaType.PAID,
      channel: "WWD JAPAN",
      title: "なぜCLAYGEは若年層にウケるのか？ヒットの裏側",
      summary: "成分へのこだわりとSNSを起点としたUGC創出の戦略を解剖。",
      engagementCount: 850,
      publishedAt: daysAgo(10),
    },
    {
      sourceType: "X (Twitter)",
      mediaType: MediaType.SHARED,
      channel: "一般ユーザーの口コミ",
      title: "CLAYGEのシャンプー使ったけど神すぎ",
      summary: "香りが続く、泡立ちが良いと高評価ツイートが拡散。",
      engagementCount: 2200,
      publishedAt: daysAgo(3),
    },
    {
      sourceType: "TikTok",
      mediaType: MediaType.EARNED,
      channel: "美容系TikToker B（フォロワー50万）",
      title: "ドラコスなのにサロン級!? CLAYGEレビュー",
      summary: "動画再生数100万回超。コメント欄で購入報告多数。",
      engagementCount: 12000,
      publishedAt: daysAgo(7),
    },
  ];

  for (const item of claygeItems) {
    await prisma.prItem.create({
      data: {
        ...item,
        tenantId: tenantA.id,
        brandId: clayge.id,
      },
    });
  }

  // Create PrItems for BOTANIST
  const botanistItems = [
    {
      sourceType: "PR TIMES",
      mediaType: MediaType.OWNED,
      channel: "公式",
      title: "BOTANISTリブランディング発表",
      summary: "サステナブル路線を強化。パッケージを100%再生プラに変更。",
      engagementCount: 350,
      publishedAt: daysAgo(4),
    },
    {
      sourceType: "Instagram",
      mediaType: MediaType.PAID,
      channel: "ライフスタイル系メディアC",
      title: "【PR】春のヘアケアルーティンにBOTANIST",
      summary: "タイアップ投稿。ナチュラルなライフスタイルとの親和性を訴求。",
      engagementCount: 1800,
      publishedAt: daysAgo(6),
    },
    {
      sourceType: "Web Media",
      mediaType: MediaType.EARNED,
      channel: "コスメ情報サイトD",
      title: "2025年春のシャンプーランキング1位はBOTANIST",
      summary: "編集部が選ぶベストコスメ。成分と香りの評価が高い。",
      engagementCount: 3200,
      publishedAt: daysAgo(8),
    },
    {
      sourceType: "X (Twitter)",
      mediaType: MediaType.SHARED,
      channel: "一般ユーザーの口コミ",
      title: "BOTANISTの新しいパッケージおしゃれすぎる",
      summary:
        "リブランディング後のパッケージデザインが好評。写真付き投稿が拡散。",
      engagementCount: 950,
      publishedAt: daysAgo(1),
    },
    {
      sourceType: "YouTube",
      mediaType: MediaType.EARNED,
      channel: "美容系YouTuber E（登録者30万）",
      title: "BOTANISTvsクレージュ ガチ比較レビュー",
      summary: "泡立ち・香り・仕上がりを5項目で比較。甲乙つけがたいとの結論。",
      engagementCount: 8500,
      publishedAt: daysAgo(12),
    },
  ];

  for (const item of botanistItems) {
    await prisma.prItem.create({
      data: {
        ...item,
        tenantId: tenantA.id,
        brandId: botanist.id,
      },
    });
  }

  // Create sample Insights
  await prisma.insight.create({
    data: {
      content: `## 競合分析サマリー

### CLAYGEの強み
- SNSでのUGC（ユーザー生成コンテンツ）が活発
- 美容系インフルエンサーからの高評価が継続
- TikTokでの動画バイラルが若年層へのリーチに貢献

### BOTANISTの強み
- サステナブルブランディングが時代にマッチ
- リブランディングによる話題性の創出
- 美容メディアでの高評価ランキング入り

### 推奨アクション
1. CLAYGEはTikTok施策を継続強化
2. BOTANISTはサステナビリティストーリーを深掘り
3. 両ブランドともYouTubeでの比較レビュー対策を検討`,
      brandIds: [clayge.id, botanist.id],
      tenantId: tenantA.id,
    },
  });

  // Create Tenant B: "B社マーケティング" (Starter plan for testing)
  const tenantB = await prisma.tenant.create({
    data: {
      name: "B社マーケティング",
      slug: "b-marketing",
      plan: "starter",
    },
  });

  await prisma.user.create({
    data: {
      email: "test@prism.example.com",
      hashedPassword,
      name: "テストユーザー",
      role: Role.OWNER,
      tenantId: tenantB.id,
    },
  });

  // Create Tenant C: "エンタープライズ株式会社" (Enterprise plan)
  const tenantC = await prisma.tenant.create({
    data: {
      name: "エンタープライズ株式会社",
      slug: "enterprise-corp",
      plan: "enterprise",
      ssoEnabled: true,
      ssoProvider: "saml",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@enterprise.example.com",
      hashedPassword,
      name: "管理者",
      role: Role.OWNER,
      tenantId: tenantC.id,
    },
  });

  console.log("Seeding completed!");
  console.log("");
  console.log("Login credentials:");
  console.log("  Tenant A (Professional): demo@prism.example.com / password123");
  console.log("  Tenant B (Starter):      test@prism.example.com / password123");
  console.log("  Tenant C (Enterprise):   admin@enterprise.example.com / password123");
  console.log("");
  console.log("SSO URLs:");
  console.log("  Tenant C SAML: /api/auth/sso/enterprise-corp");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
