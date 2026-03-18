import { test, expect } from '@playwright/test';

test.describe('Project tracker critical journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('create a project', async ({ page }) => {
    await page.getByLabel('Project name').fill('Apollo Revamp');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await expect(page.getByTestId('project-name')).toHaveText('Apollo Revamp');
  });

  test('add phases to a project', async ({ page }) => {
    await page.getByLabel('Project name').fill('Apollo Revamp');
    await page.getByRole('button', { name: 'Create Project' }).click();

    for (const phase of ['Discovery', 'Build', 'Launch']) {
      await page.getByLabel('Phase name').fill(phase);
      await page.getByRole('button', { name: 'Add Phase' }).click();
    }

    await expect(page.locator('[data-testid="phase-item"]')).toHaveCount(3);
  });

  test('log decision for project', async ({ page }) => {
    await page.getByLabel('Project name').fill('Apollo Revamp');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await page.getByLabel('Decision note').fill('Use Playwright for E2E coverage');
    await page.getByRole('button', { name: 'Log Decision' }).click();

    await expect(page.locator('[data-testid="decision-item"]')).toContainText('Use Playwright for E2E coverage');
  });

  test('report problem for project', async ({ page }) => {
    await page.getByLabel('Project name').fill('Apollo Revamp');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await page.getByLabel('Problem report').fill('Intermittent login timeout');
    await page.getByRole('button', { name: 'Report Problem' }).click();

    await expect(page.locator('[data-testid="problem-item"]')).toContainText('Intermittent login timeout');
  });

  test('add resolution linked to problem', async ({ page }) => {
    await page.getByLabel('Project name').fill('Apollo Revamp');
    await page.getByRole('button', { name: 'Create Project' }).click();

    await page.getByLabel('Problem report').fill('Intermittent login timeout');
    await page.getByRole('button', { name: 'Report Problem' }).click();

    await page.getByLabel('Resolution details').fill('Increase upstream timeout and add retry');
    await page.getByRole('button', { name: 'Add Resolution' }).click();

    await expect(page.locator('[data-testid="resolution-item"]')).toContainText('Increase upstream timeout and add retry');
    await expect(page.locator('[data-testid="resolution-problem"]')).toContainText('Intermittent login timeout');
  });
});
