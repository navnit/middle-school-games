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
  await expect(page.getByText(/Helium is an atom/i)).toBeVisible();
  await expect(page.getByText('Correct bay: Atom')).toBeVisible();

  await page.getByRole('button', { name: 'Next Cargo' }).click();
  await expect(page.locator('[data-cargo-state="active"][aria-label="Neon cargo"]')).toBeVisible();
});

test('Rescue Rush damaged second try works', async ({ page }) => {
  await page.goto('/');

  await page.getByLabel('Mode').selectOption('rescue-rush');
  await page.getByRole('button', { name: 'Drop Helium into Mixture' }).click();
  await expect(page.getByRole('heading', { name: 'Damaged cargo' })).toBeVisible();
  await expect(page.locator('[data-cargo-state="damaged"][aria-label="Helium cargo"]')).toBeVisible();

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
