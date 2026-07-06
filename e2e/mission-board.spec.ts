import { expect, test, type Page } from '@playwright/test';

type LayoutBox = {
  top: number;
  bottom: number;
  left: number;
  right: number;
  width: number;
  height: number;
  clientWidth: number;
  clientHeight: number;
  scrollWidth: number;
  scrollHeight: number;
};

type RescueLayoutMetrics = {
  viewportWidth: number;
  viewportHeight: number;
  documentWidth: number;
  documentHeight: number;
  bodyHeight: number;
  board: LayoutBox;
  cosmo: LayoutBox;
  boardCargo: LayoutBox;
  atom: LayoutBox;
  molecule: LayoutBox;
  mixture: LayoutBox;
};

type RescueLayoutKey = keyof Pick<
  RescueLayoutMetrics,
  'board' | 'cosmo' | 'boardCargo' | 'atom' | 'molecule' | 'mixture'
>;

const rescueLayoutKeys: RescueLayoutKey[] = ['board', 'cosmo', 'boardCargo', 'atom', 'molecule', 'mixture'];

type PracticeLayoutMetrics = Omit<RescueLayoutMetrics, 'boardCargo'> & {
  activeCargo: LayoutBox;
};

const practiceLayoutKeys: (keyof Pick<
  PracticeLayoutMetrics,
  'board' | 'cosmo' | 'activeCargo' | 'atom' | 'molecule' | 'mixture'
>)[] = ['board', 'cosmo', 'activeCargo', 'atom', 'molecule', 'mixture'];

async function readRescueLayoutMetrics(page: Page): Promise<RescueLayoutMetrics> {
  return page.evaluate(() => {
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
        height: rect.height,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight
      };
    };

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      board: readBox('.sorting-board'),
      cosmo: readBox('.cosmo-coach'),
      boardCargo: readBox('.sorting-board__active-cargo'),
      atom: readBox('.drop-bin--atom'),
      molecule: readBox('.drop-bin--molecule'),
      mixture: readBox('.drop-bin--mixture')
    };
  });
}

async function readPracticeLayoutMetrics(page: Page): Promise<PracticeLayoutMetrics> {
  return page.evaluate(() => {
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
        height: rect.height,
        clientWidth: element.clientWidth,
        clientHeight: element.clientHeight,
        scrollWidth: element.scrollWidth,
        scrollHeight: element.scrollHeight
      };
    };

    return {
      viewportWidth: window.innerWidth,
      viewportHeight: window.innerHeight,
      documentWidth: document.documentElement.scrollWidth,
      documentHeight: document.documentElement.scrollHeight,
      bodyHeight: document.body.scrollHeight,
      board: readBox('.sorting-board'),
      cosmo: readBox('.cosmo-coach'),
      activeCargo: readBox('.cargo-panel > [data-cargo-state="active"]'),
      atom: readBox('.drop-bin--atom'),
      molecule: readBox('.drop-bin--molecule'),
      mixture: readBox('.drop-bin--mixture')
    };
  });
}

function expectNoPageScroll(metrics: Pick<RescueLayoutMetrics, 'viewportWidth' | 'viewportHeight' | 'documentWidth' | 'documentHeight' | 'bodyHeight'>) {
  expect(metrics.documentWidth).toBeLessThanOrEqual(metrics.viewportWidth + 2);
  expect(metrics.documentHeight).toBeLessThanOrEqual(metrics.viewportHeight + 2);
  expect(metrics.bodyHeight).toBeLessThanOrEqual(metrics.viewportHeight + 2);
}

function firstRescueBinTop(metrics: RescueLayoutMetrics) {
  return Math.min(metrics.atom.top, metrics.molecule.top, metrics.mixture.top);
}

function expectActiveCargoAboveBins(metrics: RescueLayoutMetrics, gap = 4) {
  expect(metrics.boardCargo.bottom).toBeLessThanOrEqual(firstRescueBinTop(metrics) - gap);
}

function expectRescueBinsInsideBoardAndViewport(metrics: RescueLayoutMetrics) {
  for (const key of ['atom', 'molecule', 'mixture'] as const) {
    const box = metrics[key];
    expect(box.top, `${key} top should stay inside board`).toBeGreaterThanOrEqual(metrics.board.top - 1);
    expect(box.bottom, `${key} bottom should stay inside board`).toBeLessThanOrEqual(metrics.board.bottom + 1);
    expect(box.left, `${key} left should stay inside viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.right, `${key} right should stay inside viewport`).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(box.top, `${key} top should stay inside viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.bottom, `${key} bottom should stay inside viewport`).toBeLessThanOrEqual(metrics.viewportHeight + 1);
  }
}

function expectPracticeBinsInsideBoardAndViewport(metrics: PracticeLayoutMetrics) {
  for (const key of ['atom', 'molecule', 'mixture'] as const) {
    const box = metrics[key];
    expect(box.top, `${key} top should stay inside board`).toBeGreaterThanOrEqual(metrics.board.top - 1);
    expect(box.bottom, `${key} bottom should stay inside board`).toBeLessThanOrEqual(metrics.board.bottom + 1);
    expect(box.left, `${key} left should stay inside viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.right, `${key} right should stay inside viewport`).toBeLessThanOrEqual(metrics.viewportWidth + 1);
    expect(box.top, `${key} top should stay inside viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.bottom, `${key} bottom should stay inside viewport`).toBeLessThanOrEqual(metrics.viewportHeight + 1);
  }
}

function expectLayoutStable(before: RescueLayoutMetrics, after: RescueLayoutMetrics) {
  for (const key of rescueLayoutKeys) {
    const beforeBox = before[key];
    const afterBox = after[key];
    const sizeTolerance = key === 'cosmo' || key === 'boardCargo' ? 18 : 8;
    expect(Math.abs(afterBox.left - beforeBox.left), `${key} left shift`).toBeLessThanOrEqual(8);
    expect(Math.abs(afterBox.top - beforeBox.top), `${key} top shift`).toBeLessThanOrEqual(8);
    expect(Math.abs(afterBox.width - beforeBox.width), `${key} width shift`).toBeLessThanOrEqual(sizeTolerance);
    expect(Math.abs(afterBox.height - beforeBox.height), `${key} height shift`).toBeLessThanOrEqual(sizeTolerance);
  }
}

async function expectVisibleTouchTargetsAtLeast(page: Page, minSize = 44) {
  const smallTargets = await page.evaluate((minimum) => {
    return Array.from(document.querySelectorAll<HTMLElement>('button, select'))
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        const style = getComputedStyle(element);
        return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
      })
      .filter((element) => {
        const rect = element.getBoundingClientRect();
        return rect.width < minimum || rect.height < minimum;
      })
      .map((element) => {
        const rect = element.getBoundingClientRect();
        return {
          label: element.getAttribute('aria-label') ?? element.textContent?.trim(),
          width: rect.width,
          height: rect.height
        };
      });
  }, minSize);

  expect(smallTargets).toEqual([]);
}

async function expectNoVisibleOverflow(page: Page, selectors: string[]) {
  const overflowing = await page.evaluate((targetSelectors) => {
    return targetSelectors.flatMap((selector) =>
      Array.from(document.querySelectorAll<HTMLElement>(selector))
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none';
        })
        .filter(
          (element) =>
            element.scrollHeight > element.clientHeight + 1 || element.scrollWidth > element.clientWidth + 1
        )
        .map((element) => ({
          selector,
          text: element.textContent?.trim(),
          clientWidth: element.clientWidth,
          scrollWidth: element.scrollWidth,
          clientHeight: element.clientHeight,
          scrollHeight: element.scrollHeight
        }))
    );
  }, selectors);

  expect(overflowing).toEqual([]);
}

async function expectShortMobileRescueRushLayout(page: Page) {
  await page.goto('/');
  await page.getByLabel('Mode').selectOption('rescue-rush');

  const metrics = await readRescueLayoutMetrics(page);

  for (const key of rescueLayoutKeys) {
    const box = metrics[key];
    expect(box.top, `${key} top should stay in viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.bottom, `${key} bottom should stay in viewport`).toBeLessThanOrEqual(metrics.viewportHeight + 1);
  }

  expectActiveCargoAboveBins(metrics);
  expectNoPageScroll(metrics);
  await expectNoVisibleOverflow(page, [
    '.sorting-board',
    '.sorting-board__active-cargo',
    '.sorting-board__active-cargo .cargo-card',
    '.drop-bin--atom',
    '.drop-bin--molecule',
    '.drop-bin--mixture'
  ]);
  await expectVisibleTouchTargetsAtLeast(page);
}

async function expectShortMobilePracticeLayout(page: Page) {
  await page.goto('/');

  const metrics = await readPracticeLayoutMetrics(page);

  for (const key of practiceLayoutKeys) {
    const box = metrics[key];
    expect(box.top, `${key} top should stay in viewport`).toBeGreaterThanOrEqual(-1);
    expect(box.bottom, `${key} bottom should stay in viewport`).toBeLessThanOrEqual(metrics.viewportHeight + 1);
  }

  expectPracticeBinsInsideBoardAndViewport(metrics);
  expectNoPageScroll(metrics);
  await expectNoVisibleOverflow(page, [
    '.sorting-board',
    '.drop-bin--atom',
    '.drop-bin--molecule',
    '.drop-bin--mixture',
    '.cargo-panel > [data-cargo-state="active"]'
  ]);
  await expectVisibleTouchTargetsAtLeast(page);
}

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

test('Cosmo Rescue Rush layout keeps active cargo separated from bins', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Mode').selectOption('rescue-rush');

  const metrics = await readRescueLayoutMetrics(page);

  expectActiveCargoAboveBins(metrics);
  expectRescueBinsInsideBoardAndViewport(metrics);
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

    const metrics = await readRescueLayoutMetrics(page);

    const maxBinHeight = metrics.board.height * 0.55;
    expect(metrics.cosmo.height).toBeGreaterThanOrEqual(92);
    expect(metrics.cosmo.width).toBeGreaterThanOrEqual(220);
    expect(metrics.boardCargo.top).toBeGreaterThanOrEqual(metrics.cosmo.bottom - 4);
    expectActiveCargoAboveBins(metrics);
    expect(metrics.atom.height).toBeLessThanOrEqual(maxBinHeight);
    expect(metrics.molecule.height).toBeLessThanOrEqual(maxBinHeight);
    expect(metrics.mixture.height).toBeLessThanOrEqual(maxBinHeight);
  });

  test('Cosmo warning animation does not shift board layout', async ({ page }) => {
    await page.goto('/');
    await page.getByLabel('Mode').selectOption('rescue-rush');

    const before = await readRescueLayoutMetrics(page);
    expectActiveCargoAboveBins(before);
    expectRescueBinsInsideBoardAndViewport(before);

    await page.getByRole('button', { name: 'Drop Helium into Mixture' }).click();
    await expect(page.getByRole('region', { name: 'Cosmo coach' })).toHaveText(/Cargo damaged/i);
    const after = await readRescueLayoutMetrics(page);

    expectActiveCargoAboveBins(after);
    expectRescueBinsInsideBoardAndViewport(after);
    expectLayoutStable(before, after);
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

test.describe('short mobile Rescue Rush viewport', () => {
  test.use({ viewport: { width: 360, height: 640 } });

  test('short mobile keeps Practice board usable without page scroll', async ({ page }) => {
    await expectShortMobilePracticeLayout(page);
  });

  test('short mobile keeps Cosmo, active cargo, and rescue bins in view without page scroll', async ({ page }) => {
    await expectShortMobileRescueRushLayout(page);
  });
});

test.describe('extra short mobile Rescue Rush viewport', () => {
  test.use({ viewport: { width: 320, height: 568 } });

  test('short mobile 320x568 keeps Practice board usable without page scroll', async ({ page }) => {
    await expectShortMobilePracticeLayout(page);
  });

  test('short mobile 320x568 keeps Rescue Rush board usable without page scroll', async ({ page }) => {
    await expectShortMobileRescueRushLayout(page);
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
