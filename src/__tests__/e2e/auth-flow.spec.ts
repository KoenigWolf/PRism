import { test, expect } from "@playwright/test";

test.describe("認証フロー", () => {
  test("ログインページが表示されること", async ({ page }) => {
    await page.goto("/login");

    // ログインページの要素を確認
    await expect(page.getByRole("heading", { name: /PRism/i })).toBeVisible();
    await expect(page.getByLabel(/メールアドレス/i)).toBeVisible();
    await expect(page.getByLabel(/パスワード/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /ログイン/i })).toBeVisible();
  });

  test("正しいクレデンシャルでログイン→ダッシュボードに遷移すること", async ({
    page,
  }) => {
    await page.goto("/login");

    // ログイン情報を入力
    await page.getByLabel(/メールアドレス/i).fill("demo@prism.example.com");
    await page.getByLabel(/パスワード/i).fill("password123");

    // ログインボタンをクリック
    await page.getByRole("button", { name: /ログイン/i }).click();

    // ダッシュボードにリダイレクトされることを確認
    await expect(page).toHaveURL("/");
    await expect(page.getByText(/ダッシュボード/i)).toBeVisible();
  });

  test("間違ったパスワードでエラーが表示されること", async ({ page }) => {
    await page.goto("/login");

    // 間違ったログイン情報を入力
    await page.getByLabel(/メールアドレス/i).fill("demo@prism.example.com");
    await page.getByLabel(/パスワード/i).fill("wrongpassword");

    // ログインボタンをクリック
    await page.getByRole("button", { name: /ログイン/i }).click();

    // エラーメッセージが表示されることを確認
    await expect(
      page.getByText(/認証に失敗しました|パスワードが正しくありません/i)
    ).toBeVisible();
  });

  test("未認証状態で保護ルートにアクセスするとログインにリダイレクトされること", async ({
    page,
  }) => {
    // 保護されたルートにアクセス
    await page.goto("/brands");

    // ログインページにリダイレクトされることを確認
    await expect(page).toHaveURL(/\/login/);
  });
});
