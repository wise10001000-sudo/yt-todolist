import { test, expect } from '@playwright/test';

// Integration test based on user scenarios from docs/4-user-scenarios.md
test.describe('yt-todolist Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set base URL to local development server
    await page.goto('http://localhost:5173');
  });

  test('Scenario 1: First user - registration to adding first todo', async ({ page }) => {
    // Step 1: Navigate to registration page
    await page.locator('a:has-text("계정이 없으신가요?")').click();

    // Step 2: Fill registration form
    await page.locator('input[name="email"]').fill('minsu.kim@student.ac.kr');
    await page.locator('input[name="password"]').fill('Student123!');
    await page.locator('input[name="username"]').fill('김민수');

    // Step 3: Submit registration
    await page.locator('button[type="submit"]').click();
    
    // Step 4: Verify successful registration and redirect to login
    await expect(page).toHaveURL(/.*login/);
    
    // Step 5: Login with registered credentials
    await page.locator('input[name="email"]').fill('minsu.kim@student.ac.kr');
    await page.locator('input[name="password"]').fill('Student123!');
    await page.locator('button[type="submit"]').click();
    
    // Step 6: Verify navigation to dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    await expect(page.getByText('아직 할일이 없습니다.')).toBeVisible();
    
    // Step 7: Add first todo
    await page.locator('[aria-label="할일 추가"]').click();

    // Wait for modal to appear
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.locator('input[name="title"]').fill('데이터베이스 과제 제출');
    await page.locator('textarea[name="content"]').fill('ERD 설계 및 SQL 쿼리 작성');

    // Fill date fields
    await page.locator('input[name="startDate"]').fill('2025-11-25T09:00');
    await page.locator('input[name="endDate"]').fill('2025-11-30T23:59');

    // Step 8: Save the todo
    await page.locator('button[type="submit"]').click();
    
    // Step 9: Verify todo was added
    await expect(page.getByText('데이터베이스 과제 제출')).toBeVisible();
    await expect(page.getByText('ERD 설계 및 SQL 쿼리 작성')).toBeVisible();
  });

  test('Scenario 2: Daily usage - todo management', async ({ page }) => {
    // First login as an existing user
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="email"]').fill('minsu.kim@student.ac.kr');
    await page.locator('input[name="password"]').fill('Student123!');
    await page.locator('button[type="submit"]').click();
    
    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard/);
    
    // Add a todo for today: "Monthly marketing report"
    await page.locator('[aria-label="할일 추가"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.locator('input[name="title"]').fill('월간 마케팅 보고서 작성');
    await page.locator('textarea[name="content"]').fill('A사, B사 최근 캠페인 분석');
    await page.locator('input[name="endDate"]').fill('2025-11-25T18:00');

    await page.locator('button[type="submit"]').click();
    
    // Verify the todo was added
    await expect(page.getByText('월간 마케팅 보고서 작성')).toBeVisible();
    
    // Add another todo: "Meeting preparation"
    await page.locator('[aria-label="할일 추가"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.locator('input[name="title"]').fill('팀 회의 준비');
    await page.locator('input[name="endDate"]').fill('2025-11-25T14:00');

    await page.locator('button[type="submit"]').click();
    
    // Verify both todos are visible
    await expect(page.getByText('월간 마케팅 보고서 작성')).toBeVisible();
    await expect(page.getByText('팀 회의 준비')).toBeVisible();
    
    // Delete the "팀 회의 준비" todo (mark as completed)
    const deleteButton = page.locator('.MuiCard-root').filter({ hasText: '팀 회의 준비' }).locator('button[aria-label="삭제"]');
    await deleteButton.click();

    // Verify it's removed from the list
    await expect(page.getByText('팀 회의 준비')).not.toBeVisible();
  });

  test('Scenario 3: Trash usage - mistake recovery', async ({ page }) => {
    // Login as the student user
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="email"]').fill('minsu.kim@student.ac.kr');
    await page.locator('input[name="password"]').fill('Student123!');
    await page.locator('button[type="submit"]').click();
    
    // Add a todo that will be mistakenly deleted
    await page.locator('[aria-label="할일 추가"]').click();
    await expect(page.locator('[role="dialog"]')).toBeVisible();

    await page.locator('input[name="title"]').fill('알고리즘 과제 제출');
    await page.locator('input[name="endDate"]').fill('2025-12-05T23:59');

    await page.locator('button[type="submit"]').click();
    
    // Verify it exists
    await expect(page.getByText('알고리즘 과제 제출')).toBeVisible();
    
    // Mistakenly delete the important todo
    const deleteButton = page.locator('.MuiCard-root').filter({ hasText: '알고리즘 과제 제출' }).locator('button[aria-label="삭제"]');
    await deleteButton.click();

    // Verify it's no longer on the main list
    await expect(page.getByText('알고리즘 과제 제출')).not.toBeVisible();

    // Go to trash
    await page.locator('a[href="/trash"]').click();
    
    // Verify the deleted todo is in trash
    await expect(page.getByText('알고리즘 과제 제출')).toBeVisible();
    
    // Restore the todo
    const restoreButton = page.locator('.MuiCard-root').filter({ hasText: '알고리즘 과제 제출' }).locator('button[aria-label="복원"]');
    await restoreButton.click();

    // Verify it's no longer in trash
    await expect(page.getByText('알고리즘 과제 제출')).not.toBeVisible();

    // Go back to dashboard to verify it's restored
    await page.locator('a[href="/dashboard"]').click();
    await expect(page.getByText('알고리즘 과제 제출')).toBeVisible();
  });

  test('Scenario 4: Trash cleanup - permanent deletion', async ({ page }) => {
    // Login as user
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="email"]').fill('minsu.kim@student.ac.kr');
    await page.locator('input[name="password"]').fill('Student123!');
    await page.locator('button[type="submit"]').click();

    // Go to trash
    await page.locator('a[href="/trash"]').click();
    
    // If there are items in trash, perform permanent deletion
    const trashItems = await page.locator('.MuiCard-root').count();
    if (trashItems > 0) {
      // Find the first trash item to permanently delete
      const deleteForeverButton = page.locator('.MuiCard-root').first().locator('button[aria-label="영구 삭제"]');
      await deleteForeverButton.click();

      // Check for confirmation dialog and confirm
      const confirmDialog = page.locator('[role="dialog"]').filter({ hasText: '정말로 이 할일을 영구 삭제하시겠습니까?' });
      if (await confirmDialog.isVisible()) {
        await confirmDialog.locator('button[type="submit"]').click();
      }

      // Verify the item is gone
      await expect(page.locator('.MuiCard-root')).toHaveCount(trashItems - 1);
    }
  });

  test('Test logout functionality', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.locator('input[name="email"]').fill('minsu.kim@student.ac.kr');
    await page.locator('input[name="password"]').fill('Student123!');
    await page.locator('button[type="submit"]').click();

    // Verify we're on dashboard
    await expect(page).toHaveURL(/.*dashboard/);

    // Click logout button
    await page.locator('button[aria-label="로그아웃"]').click();

    // Verify redirect to login page
    await expect(page).toHaveURL(/.*login/);
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });
});