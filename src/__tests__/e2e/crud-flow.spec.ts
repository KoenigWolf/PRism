import { test, expect } from "@playwright/test";

test.describe("ブランドCRUDフロー", () => {
  // 各テスト前にログインする
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel(/メールアドレス/i).fill("demo@prism.example.com");
    await page.getByLabel(/パスワード/i).fill("password123");
    await page.getByRole("button", { name: /ログイン/i }).click();
    await expect(page).toHaveURL("/");
  });

  test("ブランド一覧が表示されること", async ({ page }) => {
    await page.goto("/brands");

    // ブランド一覧ページの要素を確認
    await expect(page.getByRole("heading", { name: /ブランド管理/i })).toBeVisible();
    await expect(page.getByRole("button", { name: /新規作成/i })).toBeVisible();
  });

  test("ブランド新規作成フォームが表示されること", async ({ page }) => {
    await page.goto("/brands/new");

    // 新規作成フォームの要素を確認
    await expect(page.getByLabel(/ブランド名/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /作成|登録/i })).toBeVisible();
  });

  test("ブランドを作成→一覧に表示されること", async ({ page }) => {
    const testBrandName = `テストブランド_${Date.now()}`;

    // 新規作成ページに遷移
    await page.goto("/brands/new");

    // フォームに入力
    await page.getByLabel(/ブランド名/i).fill(testBrandName);

    // 企業を選択（Selectコンポーネント）
    const companySelect = page.getByRole("combobox", { name: /企業/i });
    if (await companySelect.isVisible()) {
      await companySelect.click();
      await page.getByRole("option").first().click();
    }

    // 作成ボタンをクリック
    await page.getByRole("button", { name: /作成|登録/i }).click();

    // ブランド一覧に遷移し、作成したブランドが表示されることを確認
    await page.goto("/brands");
    await expect(page.getByText(testBrandName)).toBeVisible();
  });

  test("ブランド詳細ページが表示されること", async ({ page }) => {
    await page.goto("/brands");

    // 最初のブランドをクリック
    const firstBrand = page.getByRole("row").nth(1);
    if (await firstBrand.isVisible()) {
      await firstBrand.click();

      // 詳細ページの要素を確認
      await expect(page.getByRole("heading")).toBeVisible();
      await expect(page.getByRole("button", { name: /編集/i })).toBeVisible();
    }
  });

  test("ダッシュボードにKPIカードが表示されること", async ({ page }) => {
    await page.goto("/");

    // ダッシュボードのKPIカードを確認
    await expect(page.getByText(/ブランド数|ブランド/i)).toBeVisible();
    await expect(page.getByText(/PRデータ|PR施策/i)).toBeVisible();
  });

  test("PRデータ一覧が表示されること", async ({ page }) => {
    await page.goto("/pr-items");

    // PRデータ一覧ページの要素を確認
    await expect(page.getByRole("heading", { name: /PRデータ/i })).toBeVisible();
  });

  test("比較分析ページが表示されること", async ({ page }) => {
    await page.goto("/compare");

    // 比較分析ページの要素を確認
    await expect(page.getByRole("heading", { name: /比較分析/i })).toBeVisible();
    await expect(page.getByText(/ブランド選択/i)).toBeVisible();
  });
});
