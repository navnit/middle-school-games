import { expect, test } from '@playwright/test';

test('renders classroom board with nested molecule bins', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: 'Space Cargo Sorter' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Drop Helium into Atom' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Molecule' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Drop Helium into Element Molecule' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Drop Helium into Compound Molecule' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Drop Helium into Mixture' })).toBeVisible();
  await expect(page.locator('[data-cargo-state="active"][aria-label="Helium cargo"]')).toBeVisible();
  await expect(page.getByText('Homogeneous')).toHaveCount(0);
  await expect(page.getByText('Heterogeneous')).toHaveCount(0);
});

test('Practice Mode reveal flow works', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Drop Helium into Atom' }).click();
  await expect(page.getByRole('heading', { name: 'Class Check' })).toBeVisible();
  await expect(page.getByText('Ask the class to vote or justify before revealing.')).toBeVisible();

  await page.getByRole('button', { name: 'Reveal' }).click();
  await expect(
    page.getByRole('region', { name: 'Feedback and teacher panel' }).getByText(/Helium is an atom/i)
  ).toBeVisible();
  await expect(page.getByText('Correct bay: Atom')).toBeVisible();

  await page.getByRole('button', { name: 'Next Cargo' }).click();
  await expect(page.locator('[data-cargo-state="active"][aria-label="Neon cargo"]')).toBeVisible();
});

test('Practice Mode drag and drop flow works', async ({ page }) => {
  await page.goto('/');

  await page
    .locator('[data-cargo-state="active"][aria-label="Helium cargo"]')
    .dragTo(page.getByRole('button', { name: 'Drop Helium into Atom' }));

  await expect(page.getByRole('heading', { name: 'Class Check' })).toBeVisible();
  await expect(
    page.getByRole('region', { name: 'Feedback and teacher panel' }).getByText('Proposed bay: Atom')
  ).toBeVisible();
});

test.describe('in-app browser viewport', () => {
  test.use({ viewport: { width: 406, height: 912 } });

  test('keeps the full board on screen and mode selection usable', async ({ page }) => {
    await page.goto('/');

    const modeSelect = page.getByLabel('Mode');
    await expect(modeSelect).toBeInViewport({ ratio: 0.9 });

    const metrics = await page.evaluate(() => {
      const modeRect = document.querySelector('select')?.getBoundingClientRect();
      const activeCargoRect = document
        .querySelector('.cargo-panel > [data-cargo-state="active"]')
        ?.getBoundingClientRect();
      const queueRect = document.querySelector('.queue-panel')?.getBoundingClientRect();

      return {
        viewportWidth: window.innerWidth,
        viewportHeight: window.innerHeight,
        documentWidth: document.documentElement.scrollWidth,
        documentHeight: document.documentElement.scrollHeight,
        bodyHeight: document.body.scrollHeight,
        modeRect: modeRect
          ? {
              top: modeRect.top,
              bottom: modeRect.bottom
            }
          : null,
        cargoStack:
          activeCargoRect && queueRect
            ? {
                activeBottom: activeCargoRect.bottom,
                queueTop: queueRect.top
              }
            : null
      };
    });

    expect(metrics.modeRect).not.toBeNull();
    expect(metrics.cargoStack).not.toBeNull();
    expect(metrics.modeRect!.top).toBeGreaterThanOrEqual(0);
    expect(metrics.modeRect!.bottom).toBeLessThanOrEqual(metrics.viewportHeight);
    expect(metrics.cargoStack!.queueTop).toBeGreaterThanOrEqual(metrics.cargoStack!.activeBottom - 1);
    expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 2);
    expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.viewportHeight + 2);
    expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.viewportHeight + 2);

    await modeSelect.selectOption('rescue-rush');

    await expect(modeSelect).toHaveValue('rescue-rush');
    await expect(page.getByLabel('Round status').getByText('Rescue Rush')).toBeVisible();
  });

  test('keeps rescue bins compact with a prominent animated Cosmo coach', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Mode').selectOption('rescue-rush');

    const metrics = await page.evaluate(() => {
      const readBox = (selector: string) => {
        const element = document.querySelector(selector);
        if (!element) {
          throw new Error(`Missing ${selector}`);
        }
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height
        };
      };

      return {
        board: readBox('.sorting-board'),
        cosmo: readBox('.cosmo-coach'),
        boardCargo: readBox('.sorting-board__active-cargo'),
        atom: readBox('.drop-bin--atom'),
        molecule: readBox('.drop-bin--molecule'),
        mixture: readBox('.drop-bin--mixture')
      };
    });

    const maxBinHeight = metrics.board.height * 0.55;
    expect(metrics.cosmo.height).toBeGreaterThanOrEqual(92);
    expect(metrics.cosmo.width).toBeGreaterThanOrEqual(220);
    expect(metrics.boardCargo.top).toBeGreaterThanOrEqual(metrics.cosmo.bottom - 4);
    expect(metrics.atom.height).toBeLessThanOrEqual(maxBinHeight);
    expect(metrics.molecule.height).toBeLessThanOrEqual(maxBinHeight);
    expect(metrics.mixture.height).toBeLessThanOrEqual(maxBinHeight);
  });

  test('Cosmo warning animation does not shift board layout', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Mode').selectOption('rescue-rush');

    const before = await page.locator('.cosmo-coach').boundingBox();
    await page.getByRole('button', { name: 'Drop Helium into Mixture' }).click();
    await expect(page.getByRole('region', { name: 'Cosmo coach' })).toHaveText(/Cargo damaged/i);
    const after = await page.locator('.cosmo-coach').boundingBox();

    expect(before).not.toBeNull();
    expect(after).not.toBeNull();
    expect(Math.abs(after!.width - before!.width)).toBeLessThanOrEqual(2);
    expect(Math.abs(after!.height - before!.height)).toBeLessThanOrEqual(18);
  });

  test('Cosmo respects reduced motion preference', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/');
    await page.getByLabel('Mode').selectOption('rescue-rush');

    const animationName = await page
      .locator('.cosmo-coach__avatar')
      .evaluate((element) => getComputedStyle(element).animationName);

    expect(animationName).toBe('none');
  });
});

test('Rescue Rush damaged second try works', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Mode').selectOption('rescue-rush');
  await expect(page.getByLabel('Mission clock')).toHaveText('01:30');
  await expect(page.getByRole('region', { name: 'Cosmo coach' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Cargo belt' })).toBeVisible();
  await expect(page.locator('.sorting-board__active-cargo')).toBeVisible();
  await expect(page.getByText('Saved 0/20')).toBeVisible();

  await page.getByRole('button', { name: 'Drop Helium into Mixture' }).click();
  await expect(page.getByRole('heading', { name: 'Damaged cargo' })).toBeVisible();
  await expect(page.getByRole('region', { name: 'Cosmo coach' })).toHaveText(/Cargo damaged/i);
  await expect(page.getByRole('region', { name: 'Cosmo coach' })).toHaveAttribute('data-cosmo-tone', 'warning');
  await expect(page.locator('[data-cargo-state="damaged"][aria-label="Helium cargo"]')).toBeVisible();
  await expect(page.getByText('Damaged 1')).toBeVisible();

  await page.getByRole('button', { name: 'Drop Helium into Atom' }).click();
  await expect(page.getByText('Score: 50')).toBeVisible();
  await expect(page.locator('[data-cargo-state="active"][aria-label="Neon cargo"]')).toBeVisible();
});

test('Repair Dock can mark cargo repaired after two Rescue Rush mistakes', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Mode').selectOption('rescue-rush');
  await page.getByRole('button', { name: 'Drop Helium into Mixture' }).click();
  await page.getByRole('button', { name: 'Drop Helium into Compound Molecule' }).click();

  const repairDock = page.getByRole('region', { name: 'Repair Dock' });
  await expect(repairDock).toBeVisible();
  await expect(repairDock.getByText('Helium')).toBeVisible();

  await repairDock.getByRole('button', { name: 'Mark Helium repaired' }).click();
  await expect(repairDock).toHaveCount(0);
});

test('primary classroom touch targets stay large enough', async ({ page }) => {
  await page.goto('/');

  const targetNames = [
    'Drop Helium into Atom',
    'Drop Helium into Element Molecule',
    'Drop Helium into Compound Molecule',
    'Drop Helium into Mixture',
    'Hint',
    'Reveal',
    'Next Cargo',
    'Undo',
    'Pause'
  ];

  for (const name of targetNames) {
    const box = await page.getByRole('button', { name }).boundingBox();
    expect(box, `${name} should be visible`).not.toBeNull();
    expect(box!.width, `${name} should be at least 44px wide`).toBeGreaterThanOrEqual(44);
    expect(box!.height, `${name} should be at least 44px tall`).toBeGreaterThanOrEqual(44);
  }
});

test('sorting board does not overlap the teacher panel', async ({ page }) => {
  await page.goto('/');

  const boxes = await page.evaluate(() => {
    const readBox = (selector: string) => {
      const element = document.querySelector(selector);
      if (!element) {
        throw new Error(`Missing ${selector}`);
      }
      const rect = element.getBoundingClientRect();
      return {
        left: rect.left,
        right: rect.right,
        top: rect.top,
        bottom: rect.bottom
      };
    };

    return {
      sorting: readBox('.sorting-board'),
      feedback: readBox('.feedback-panel'),
      atom: readBox('.drop-bin--atom'),
      molecule: readBox('.drop-bin--molecule'),
      mixture: readBox('.drop-bin--mixture')
    };
  });

  expect(boxes.atom.left).toBeGreaterThanOrEqual(boxes.sorting.left);
  expect(boxes.mixture.right).toBeLessThanOrEqual(boxes.sorting.right);

  if (boxes.sorting.bottom > boxes.feedback.top && boxes.feedback.bottom > boxes.sorting.top) {
    expect(boxes.mixture.right).toBeLessThanOrEqual(boxes.feedback.left);
  }
});

test('key labels fit inside their controls', async ({ page }) => {
  await page.goto('/');

  const overflowingLabels = await page.evaluate(() => {
    const selectors = [
      '.drop-bin h2',
      '.drop-bin strong',
      '.nested-bin strong',
      '.teacher-controls__buttons button'
    ];

    return selectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter((element) => element.scrollWidth > element.clientWidth + 1)
        .map((element) => ({
          selector,
          text: element.textContent?.trim(),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth
        }))
    );
  });

  expect(overflowingLabels).toEqual([]);
});
