import { test, expect } from '@playwright/test';

test.describe('HR管理フロー', () => {
  test.beforeEach(async ({ page }) => {
    // HRとしてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hr@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('全従業員一覧ページに遷移できる', async ({ page }) => {
    await page.click('a[href="/employees"]');
    await expect(page).toHaveURL('/employees');
    await expect(page.locator('h1')).toContainText('全従業員一覧');
  });

  test('全従業員が表示される', async ({ page }) => {
    await page.goto('/employees');

    // 複数の従業員が表示される
    await expect(page.locator('text=山田 太郎')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=田中 花子')).toBeVisible();
  });

  test('評価期間管理ページに遷移できる', async ({ page }) => {
    await page.click('a[href="/periods"]');
    await expect(page).toHaveURL('/periods');
    await expect(page.locator('h1')).toContainText('評価期間管理');
  });

  test('評価期間一覧が表示される', async ({ page }) => {
    await page.goto('/periods');

    // 期間一覧が表示される
    await expect(page.locator('text=評価期間一覧')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=2026年度上期')).toBeVisible();
  });

  test('追加閲覧者管理ページに遷移できる', async ({ page }) => {
    await page.click('a[href="/viewers"]');
    await expect(page).toHaveURL('/viewers');
    await expect(page.locator('h1')).toContainText('追加閲覧者管理');
  });
});

test.describe('HR - 従業員検索', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'hr@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.goto('/employees');
  });

  test('名前で従業員を検索できる', async ({ page }) => {
    await page.fill('input[placeholder*="検索"]', '山田');
    await page.click('button:has-text("検索")');

    // 検索結果に山田が表示される
    await expect(page.locator('text=山田 太郎')).toBeVisible({ timeout: 10000 });
    // 他の従業員は表示されない（もしくは少なくなる）
  });
});
