import { test, expect } from '@playwright/test';

test.describe('管理職フロー', () => {
  test.beforeEach(async ({ page }) => {
    // 管理職としてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'sales1-manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('部下一覧ページに遷移できる', async ({ page }) => {
    await page.click('a[href="/team"]');
    await expect(page).toHaveURL('/team');
    await expect(page.locator('h1')).toContainText('部下一覧');
  });

  test('部下一覧に部下が表示される', async ({ page }) => {
    await page.goto('/team');

    // 部下の情報が表示される
    await expect(page.locator('text=山田 太郎')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=田中 花子')).toBeVisible();
  });

  test('部下のシートに遷移できる', async ({ page }) => {
    await page.goto('/team');

    // 部下のシートへのリンクをクリック
    await page.locator('a[href*="/sheet/"]').first().click();
    await expect(page).toHaveURL(/\/sheet\/.+/);
  });

  test('自分のシートにもアクセスできる', async ({ page }) => {
    // ダッシュボードから自分のシートへ
    await page.click('a[href*="/sheet/"]');
    await expect(page).toHaveURL(/\/sheet\/.+/);
    await expect(page.locator('h1')).toContainText('評価シート');
  });
});
