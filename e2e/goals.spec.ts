import { test, expect } from '@playwright/test';

test.describe('目標設定フロー', () => {
  test.beforeEach(async ({ page }) => {
    // 従業員としてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'employee1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');
  });

  test('ダッシュボードに評価シートが表示される', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('現在のシート');
    // シートへのリンクがある
    await expect(page.locator('a[href*="/sheet/"]')).toBeVisible();
  });

  test('評価シートページに遷移できる', async ({ page }) => {
    await page.click('a[href*="/sheet/"]');
    await expect(page).toHaveURL(/\/sheet\/.+/);
    await expect(page.locator('h1')).toContainText('評価シート');
  });

  test('目標一覧が表示される', async ({ page }) => {
    await page.click('a[href*="/sheet/"]');
    await expect(page).toHaveURL(/\/sheet\/.+/);

    // 目標カードが存在することを確認
    const goalCards = page.locator('[data-testid="goal-card"]');
    // 既存のシードデータには目標がある想定
    await expect(goalCards.first()).toBeVisible({ timeout: 10000 });
  });
});

test.describe('目標編集', () => {
  test.beforeEach(async ({ page }) => {
    // 従業員としてログイン
    await page.goto('/login');
    await page.fill('input[type="email"]', 'employee1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL('/dashboard');

    // 評価シートに遷移
    await page.click('a[href*="/sheet/"]');
    await expect(page).toHaveURL(/\/sheet\/.+/);
  });

  test('目標の概要が表示される', async ({ page }) => {
    const goalCard = page.locator('[data-testid="goal-card"]').first();
    await expect(goalCard).toBeVisible({ timeout: 10000 });

    // 目標タイトルが表示される
    await expect(goalCard.locator('.ab-text-heading-s')).toBeVisible();
  });
});
