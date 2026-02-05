import { test, expect } from '@playwright/test';

test.describe('認証フロー', () => {
  test('未認証ユーザーはログインページにリダイレクトされる', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page).toHaveURL('/login');
  });

  test('ログインページが正しく表示される', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('h1')).toContainText('ログイン');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });

  test('従業員としてログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'employee1@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('マイページ');
  });

  test('管理職としてログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'sales1-manager@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    // 管理職は部下一覧メニューが表示される
    await expect(page.locator('nav')).toContainText('部下一覧');
  });

  test('HRとしてログインできる', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'hr@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/dashboard');
    // HRは全従業員一覧メニューが表示される
    await expect(page.locator('nav')).toContainText('全従業員一覧');
  });

  test('無効な認証情報でログインできない', async ({ page }) => {
    await page.goto('/login');

    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // エラーメッセージが表示される
    await expect(page.locator('text=認証に失敗しました')).toBeVisible({ timeout: 10000 });
  });
});
