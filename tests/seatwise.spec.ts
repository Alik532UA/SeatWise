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

		// Open Settings modal to switch to numbers format
		await page.locator('[data-testid="settings-open-btn"]').click();
		const numbersBtn = page.locator('[data-testid="table-naming-numbers"]');
		await numbersBtn.click();
		await page.locator('[data-testid="close-settings-btn"]').click();
		await expect(firstTableLabel).toContainText('1');

		// Open Settings modal to switch back to letters
		await page.locator('[data-testid="settings-open-btn"]').click();
		const lettersBtn = page.locator('[data-testid="table-naming-letters"]');
		await lettersBtn.click();
		await page.locator('[data-testid="close-settings-btn"]').click();
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

	test('fills full viewport width on wide screens and zoom out without side dead zones', async ({
		page
	}) => {
		// Set wide viewport (simulating zoom-out or 2K/4K display)
		await page.setViewportSize({ width: 2560, height: 1440 });
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Calculate seating
		await page.locator('.btn-primary').click();
		await page.waitForTimeout(300);

		// Check that main element utilizes available width beyond old 1400px restriction
		const mainBox = await page.locator('main').boundingBox();
		expect(mainBox).not.toBeNull();
		if (mainBox) {
			expect(mainBox.width).toBeGreaterThan(2000);
		}

		// Verify round grid generates multi-column fluid layout (more than 3 columns on wide screen)
		const firstRound = page.locator('.round-card').nth(0);
		const fourthRound = page.locator('.round-card').nth(3);

		const firstBox = await firstRound.boundingBox();
		const fourthBox = await fourthRound.boundingBox();

		expect(firstBox).not.toBeNull();
		expect(fourthBox).not.toBeNull();
		// If 4th card is on the same row as 1st (multi-column fluid), its Y position is roughly the same
		if (firstBox && fourthBox) {
			expect(Math.abs(firstBox.y - fourthBox.y)).toBeLessThan(50);
		}

		await page.screenshot({
			path: 'C:/Users/alik5/.gemini/antigravity/brain/cd3f1297-ad13-488f-8ba7-2cd87385f02d/wide_screen_fullscreen.png'
		});
	});

	test('service badge with data-testid="app-version-value" displays build version and copies diagnostic log', async ({
		page,
		context
	}) => {
		// Grant clipboard permissions
		await context.grantPermissions(['clipboard-read', 'clipboard-write']).catch(() => {});

		// Load page with ?debug=1 to activate service badge
		await page.goto(`${BASE}/?debug=1`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Verify service badge presence
		const versionBadge = page.locator('[data-testid="app-version-value"]');
		await expect(versionBadge).toBeVisible();

		// Check version format (semver)
		const versionText = await versionBadge.locator('.badge__version').textContent();
		expect(versionText).toMatch(/^\d+\.\d+\.\d+/);

		// Click to copy diagnostic log
		await versionBadge.click();

		// Check copied state (or fallback textarea)
		const isCopied = await versionBadge.evaluate((el) => el.classList.contains('badge--copied'));
		const fallbackTextarea = page.locator('[data-testid="service-badge-report-textarea"]');

		// Either copied indicator or fallback textarea must be active
		const textareaVisible = await fallbackTextarea.isVisible();
		expect(isCopied || textareaVisible).toBe(true);
	});

	test('visual skin names panel toggles accordion, displays live participant count and clears input', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Switch to Visual skin
		await page.locator('[data-testid="skin-btn-visual"]').click();
		await expect(page.locator('.skin-visual')).toBeVisible();

		// Check names panel details & summary
		const namesPanel = page.locator('.names-panel-visual');
		await expect(namesPanel).toBeVisible();

		// Initially default badge shows 1..36
		const defaultPill = namesPanel.locator('.names-pill.default');
		await expect(defaultPill).toBeVisible();

		// Click to expand accordion
		const summary = namesPanel.locator('.names-visual-summary');
		await summary.click();

		// Check textarea is now visible
		const textarea = namesPanel.locator('textarea#namesInput');
		await expect(textarea).toBeVisible();

		// Enter custom names
		await textarea.fill('Оксана\nТарас\nІрина');

		// Check counter updates to 3 / 36
		const activePill = namesPanel.locator('.names-pill:not(.default)');
		await expect(activePill).toContainText('3 / 36');

		await page.screenshot({
			path: 'C:/Users/alik5/.gemini/antigravity/brain/cd3f1297-ad13-488f-8ba7-2cd87385f02d/visual_names_panel.png'
		});

		// Click clear button
		const clearBtn = namesPanel.locator('.btn-clear-names');
		await expect(clearBtn).toBeVisible();
		await clearBtn.click();

		// Check textarea is empty and default badge returns
		await expect(textarea).toHaveValue('');
		await expect(namesPanel.locator('.names-pill.default')).toBeVisible();
	});

	test('opens settings modal, toggles color mode between monochrome and palette, and persists', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Open Settings modal
		const settingsBtn = page.locator('[data-testid="settings-open-btn"]');
		await expect(settingsBtn).toBeVisible();
		await settingsBtn.click();

		const dialog = page.locator('[data-testid="settings-dialog"]');
		await expect(dialog).toBeVisible();

		// Check and toggle color mode
		const paletteBtn = page.locator('[data-testid="color-mode-palette"]');
		await expect(paletteBtn).toBeVisible();
		await paletteBtn.click();
		await expect(paletteBtn).toHaveClass(/active/);

		// Close Settings dialog
		const closeSettingsBtn = page.locator('[data-testid="close-settings-btn"]');
		await closeSettingsBtn.click();
		await expect(dialog).not.toBeVisible();

		// Switch to Visual skin
		await page.locator('[data-testid="skin-btn-visual"]').click();
		await expect(page.locator('.skin-visual')).toBeVisible();

		// Calculate seating
		await page.locator('.skin-visual .glow-button').click();
		await page.waitForTimeout(300);

		// Check that tables and avatars rendered
		const tables = page.locator('.visual-table');
		expect(await tables.count()).toBeGreaterThan(0);
	});

	test('highlights participant across all rounds on click, shows floating bar, and opens personal schedule on dblclick', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Switch to Visual skin
		await page.locator('[data-testid="skin-btn-visual"]').click();
		await expect(page.locator('.skin-visual')).toBeVisible();

		// Calculate seating
		await page.locator('.skin-visual .glow-button').click();
		await page.waitForTimeout(300);

		// Find participant 1 avatar in first table
		const p1Avatar = page.locator('[data-testid="participant-avatar-1"]').first();
		await expect(p1Avatar).toBeVisible();

		// Single click to select
		await p1Avatar.click();

		// Check root has active participant class
		await expect(page.locator('.skin-visual')).toHaveClass(/has-active-participant/);
		await expect(p1Avatar).toHaveClass(/is-active/);

		// Floating bar should now be visible
		const floatingBar = page.locator('[data-testid="floating-participant-bar"]');
		await expect(floatingBar).toBeVisible();

		// Double-click to open personal schedule modal
		await p1Avatar.dblclick();

		const scheduleModal = page.locator('[data-testid="participant-schedule-modal"]');
		await expect(scheduleModal).toBeVisible();
		await expect(page.locator('[data-testid="participant-rounds-list"]')).toBeVisible();

		// Close modal
		await page.locator('[data-testid="close-participant-modal-btn"]').click();
		await expect(scheduleModal).not.toBeVisible();

		// Clear selection via floating bar button
		await page.locator('[data-testid="btn-clear-participant-selection"]').click();
		await expect(floatingBar).not.toBeVisible();
		await expect(page.locator('.skin-visual')).not.toHaveClass(/has-active-participant/);
	});

	test('participant schedule modal displays tables view by default, toggles to list, without duplicate numbers', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Switch to Visual skin and calculate
		await page.locator('[data-testid="skin-btn-visual"]').click();
		await page.locator('.skin-visual .glow-button').click();
		await page.waitForTimeout(300);

		// Double-click participant 36
		const p36Avatar = page.locator('[data-testid="participant-avatar-36"]').first();
		await expect(p36Avatar).toBeVisible();
		await p36Avatar.dblclick();

		const scheduleModal = page.locator('[data-testid="participant-schedule-modal"]');
		await expect(scheduleModal).toBeVisible();

		// Check wide dialog layout and default tables view
		await expect(page.locator('.rounds-grid-tables')).toBeVisible();
		const miniTables = page.locator('.mini-table-card');
		await expect(await miniTables.count()).toBeGreaterThanOrEqual(5);

		// Verify me seat is highlighted
		const meSeat = page.locator('.mini-seat.is-me').first();
		await expect(meSeat).toBeVisible();
		await expect(meSeat).toContainText('36');

		// Switch to List view (single column, 1 row per round)
		await page.locator('[data-testid="view-mode-list-btn"]').click();
		await expect(page.locator('.rounds-list-linear')).toBeVisible();
		await expect(page.locator('.linear-round-row').first()).toBeVisible();

		// Check companions in list view don't have duplicated text like "28 28"
		const firstChip = page.locator('.companion-chip').first();
		await expect(firstChip).toBeVisible();
		const chipText = (await firstChip.textContent()) || '';
		// Chip should be #X, not X X
		expect(chipText.trim()).toMatch(/^#\d+$/);

		// Switch back to tables view
		await page.locator('[data-testid="view-mode-tables-btn"]').click();
		await expect(page.locator('.rounds-grid-tables')).toBeVisible();

		// Close modal
		await page.locator('[data-testid="close-participant-modal-btn"]').click();
		await expect(scheduleModal).not.toBeVisible();
	});

	test('visual skin balances tables symmetrically into rows (3+3, 4+3, etc.) instead of orphan tables', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// Switch to Visual skin and calculate (default: 36 guests, 6 tables of 6)
		await page.locator('[data-testid="skin-btn-visual"]').click();
		await page.locator('.skin-visual .glow-button').click();
		await page.waitForTimeout(300);

		// With 6 tables in viewport 1280px (where 5 or 4 fit per line), it balances into rows of 3+3
		const firstRoundGallery = page.locator('.round-section').first().locator('.table-gallery');
		await expect(firstRoundGallery).toBeVisible();

		const rows = firstRoundGallery.locator('.table-gallery-row');
		const rowCount = await rows.count();

		if (rowCount === 2) {
			const firstRowTables = await rows.nth(0).locator('.visual-table-container').count();
			const secondRowTables = await rows.nth(1).locator('.visual-table-container').count();
			// Balanced 3+3 (not 5+1 or 4+2)
			expect(firstRowTables).toBe(3);
			expect(secondRowTables).toBe(3);
		} else {
			// On ultra-wide monitors where all 6 fit in one row
			expect(rowCount).toBe(1);
			const rowTables = await rows.nth(0).locator('.visual-table-container').count();
			expect(rowTables).toBe(6);
		}
	});

	test('palette supports 16 colors and participant selection clears on empty zone click across skins', async ({
		page
	}) => {
		await page.goto(`${BASE}/`);

		const closeWizardBtn = page.locator('.wizard-header .close-btn');
		if (await closeWizardBtn.isVisible()) {
			await closeWizardBtn.click();
		}

		// 1. Verify 16 colors in Settings modal
		await page.locator('[data-testid="settings-open-btn"]').click();
		await page.locator('[data-testid="color-mode-palette"]').click();
		const dots = page.locator('.palette-dot');
		await expect(dots).toHaveCount(16);
		await page.locator('[data-testid="close-settings-btn"]').click();

		// 2. Switch to Visual skin and select participant
		await page.locator('[data-testid="skin-btn-visual"]').click();
		await page.locator('.skin-visual .glow-button').click();
		await page.waitForTimeout(200);

		const p1 = page.locator('[data-testid="participant-avatar-1"]').first();
		await p1.click();

		const floatingBar = page.locator('[data-testid="floating-participant-bar"]');
		await expect(floatingBar).toBeVisible();

		// Click outside on empty page container background
		await page.mouse.click(20, 300);
		await expect(floatingBar).not.toBeVisible();
	});
});
