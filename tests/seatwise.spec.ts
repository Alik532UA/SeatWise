import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_PATH ?? '/SeatWise';

test.describe('SeatWise E2E Tests (ACCESSIBILITY-v10 & UI-UX-v10)', () => {
	test('loads home page with title, header and skin controls', async ({ page }) => {
		await page.goto(`${BASE}/`);

		// Check header and branding
		const header = page.locator('header.main-header');
		await expect(header).toBeVisible();

		const heading = page.locator('header h1');
		await expect(heading).toBeVisible();

		// Check skin selector
		const skinSelect = page.locator('#skin-select');
		await expect(skinSelect).toBeVisible();
		await expect(skinSelect).toHaveValue('professional');

		// Check theme toggle button
		const themeToggle = page.locator('button.theme-toggle');
		await expect(themeToggle).toBeVisible();
	});

	test('toggles theme and updates data-theme attribute', async ({ page }) => {
		await page.goto(`${BASE}/`);

		const html = page.locator('html');
		const themeToggle = page.locator('button.theme-toggle');

		const initialTheme = await html.getAttribute('data-theme');
		await themeToggle.click();

		const nextTheme = await html.getAttribute('data-theme');
		expect(nextTheme).not.toBe(initialTheme);
	});

	test('switches UI skins (professional -> compact -> visual)', async ({ page }) => {
		await page.goto(`${BASE}/`);

		const skinSelect = page.locator('#skin-select');

		// Switch to Compact
		await skinSelect.selectOption('compact');
		await page.waitForTimeout(100);
		await expect(page.locator('.compact-skin, .skin-container')).toBeVisible();

		// Switch to Visual
		await skinSelect.selectOption('visual');
		await page.waitForTimeout(100);
		await expect(page.locator('.visual-skin, .skin-container')).toBeVisible();

		// Switch back to Professional
		await skinSelect.selectOption('professional');
		await page.waitForTimeout(100);
		await expect(page.locator('.professional-skin, .skin-container')).toBeVisible();
	});
});

