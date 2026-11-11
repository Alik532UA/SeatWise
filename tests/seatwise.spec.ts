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

		// Check skin selector buttons
		const skinGroup = page.locator('[data-testid="skin-select-group"]');
		await expect(skinGroup).toBeVisible();
		const classicBtn = page.locator('[data-testid="skin-btn-classic"]');
		await expect(classicBtn).toBeVisible();
		await expect(classicBtn).toHaveClass(/active/);

		// Check theme toggle button
		const themeToggle = page.locator('button.theme-toggle');
		await expect(themeToggle).toBeVisible();
	});

	test('toggles theme and updates data-theme attribute', async ({ page }) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		const html = page.locator('html');
		const themeToggle = page.locator('button.theme-toggle');

		const initialTheme = await html.getAttribute('data-theme');
		await themeToggle.click();

		const nextTheme = await html.getAttribute('data-theme');
		expect(nextTheme).not.toBe(initialTheme);
	});

	test('switches UI skins using segmented buttons (classic -> compact -> visual)', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		// Dismiss wizard if open so skins can be interacted with directly
		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		const compactBtn = page.locator('[data-testid="skin-btn-compact"]');
		const visualBtn = page.locator('[data-testid="skin-btn-visual"]');
		const classicBtn = page.locator('[data-testid="skin-btn-classic"]');

		// Switch to Compact
		await compactBtn.click();
		await page.waitForTimeout(100);
		await expect(page.locator('.skin-compact')).toBeVisible();

		// Switch to Visual
		await visualBtn.click();
		await page.waitForTimeout(100);
		await expect(page.locator('.skin-visual')).toBeVisible();

		// Switch back to Classic
		await classicBtn.click();
		await page.waitForTimeout(100);
		await expect(page.locator('.skin-classic')).toBeVisible();
	});

	test('displays order website / app / game button linking to DigitalWorkshop in header only', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const orderBtn = page.locator('[data-testid="order-cta-btn"]');
		await expect(orderBtn).toBeVisible();
		await expect(orderBtn).toHaveAttribute('href', 'https://alik532ua.github.io/DigitalWorkshop/');
		await expect(orderBtn).toHaveAttribute('target', '_blank');

		// Footer should be removed
		const footer = page.locator('footer.main-footer');
		await expect(footer).toHaveCount(0);
	});

	test('has favicon link pointing to favicon.svg and is accessible', async ({ page }) => {
		await page.goto(`${BASE}/`);

		const favicon = page.locator('link[rel="icon"]');
		await expect(favicon).toHaveAttribute('href', new RegExp(`${BASE}/favicon\\.svg$`));
		await expect(favicon).toHaveAttribute('type', 'image/svg+xml');

		const response = await page.request.get(`${BASE}/favicon.svg`);
		expect(response.status()).toBe(200);
	});

	test('onboarding wizard guides new user through 3 steps and calculates seating', async ({
		page
	}) => {
		// Clear localStorage to simulate brand new user
		await page.goto(`${BASE}/`);
		await page.evaluate(() => localStorage.clear());
		await page.reload();

		// Wizard should be visible
		const wizard = page.locator('[role="dialog"]');
		await expect(wizard).toBeVisible();
		await expect(page.locator('#wizard-title')).toContainText('людей');

		// Click Next to step 2 (Tables)
		await page.locator('.btn-next').click();
		await expect(page.locator('#wizard-title')).toContainText('столів');

		// Click Next to step 3 (Capacity)
		await page.locator('.btn-next').click();
		await expect(page.locator('#wizard-title')).toContainText('місць');

		// Finish wizard
		await page.locator('.btn-next').click();
		await expect(wizard).not.toBeVisible();

		// Results and full menu should now be visible
		await expect(page.locator('.results-header')).toBeVisible();
	});

	test('number stepper increases and decreases values with + and - buttons', async ({ page }) => {
		await page.goto(`${BASE}/`);

		// Dismiss wizard if open
		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		const totalPeopleInput = page.locator('#totalPeople');
		const initialVal = parseInt((await totalPeopleInput.inputValue()) || '36', 10);

		// Click + on totalPeople stepper
		const plusBtn = page.locator('.input-group:has(#totalPeople) .btn-plus');
		await plusBtn.click();
		expect(parseInt(await totalPeopleInput.inputValue(), 10)).toBe(initialVal + 1);

		// Click - on totalPeople stepper
		const minusBtn = page.locator('.input-group:has(#totalPeople) .btn-minus');
		await minusBtn.click();
		expect(parseInt(await totalPeopleInput.inputValue(), 10)).toBe(initialVal);
	});

	test('toggles table naming between letters and numbers', async ({ page }) => {
		await page.goto(`${BASE}/`);

		// Dismiss wizard if open
		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Calculate seating
		await page.locator('.btn-primary').click();
		await page.waitForTimeout(200);

		// By default, tables are labeled with letters (Стіл A)
		const firstTableLabel = page.locator('.table-label').first();
		await expect(firstTableLabel).toContainText('A');

		// Switch to numbers format
		const numbersBtn = page.locator('[data-testid="table-naming-numbers"]');
		await numbersBtn.click();
		await expect(firstTableLabel).toContainText('1');

		// Switch back to letters
		const lettersBtn = page.locator('[data-testid="table-naming-letters"]');
		await lettersBtn.click();
		await expect(firstTableLabel).toContainText('A');
	});

	test('compact skin renders empty state, expands participant names, calculates and copies results', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);
		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Switch to Compact
		const compactBtn = page.locator('[data-testid="skin-btn-compact"]');
		await compactBtn.click();
		await page.waitForTimeout(200);

		// Before calculation, empty state is displayed instead of a blank screen
		await expect(page.locator('.skin-compact .empty-state')).toBeVisible();

		// Participant names accordion is present
		const namesSummary = page.locator('.skin-compact .names-summary');
		await expect(namesSummary).toBeVisible();

		// Calculate seating
		const calcBtn = page.locator('.skin-compact .config-bar button.primary');
		await calcBtn.click();
		await page.waitForTimeout(400);

		// Results toolbar and round cards are displayed
		await expect(page.locator('.skin-compact .results-toolbar')).toBeVisible();
		const roundsCount = await page.locator('.skin-compact .mini-round').count();
		expect(roundsCount).toBeGreaterThan(0);

		// Copy button is functional and visible
		const copyBtn = page.locator('.skin-compact .copy-btn');
		await expect(copyBtn).toBeVisible();
	});

	test('preserves seating results and configuration when switching language (UK <-> EN)', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		// Dismiss wizard if open
		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Calculate seating
		await page.locator('.btn-primary').click();
		await page.waitForTimeout(200);

		// Verify results are visible
		await expect(page.locator('.results-header')).toBeVisible();
		const initialRoundsCount = await page.locator('.round-card').count();
		expect(initialRoundsCount).toBeGreaterThan(0);

		// Switch language to EN
		const enBtn = page.locator('[data-testid="lang-btn-en"]');
		await enBtn.click();
		await page.waitForTimeout(500);

		// Results MUST still be visible!
		await expect(page.locator('.results-header')).toBeVisible();
		const enRoundsCount = await page.locator('.round-card').count();
		expect(enRoundsCount).toBe(initialRoundsCount);

		// Switch language back to UK
		const ukBtn = page.locator('[data-testid="lang-btn-uk"]');
		await ukBtn.click();
		await page.waitForTimeout(500);

		// Results MUST still be visible!
		await expect(page.locator('.results-header')).toBeVisible();
		const ukRoundsCount = await page.locator('.round-card').count();
		expect(ukRoundsCount).toBe(initialRoundsCount);
	});
});
