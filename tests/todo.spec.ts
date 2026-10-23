import { expect, test, type Locator, type Page } from '@playwright/test';

const appUrl = 'https://demo.playwright.dev/todomvc/#/';
const newTodoInputName = 'What needs to be done?';

function todoItem(page: Page, title: string): Locator {
  return page
    .getByTestId('todo-item')
    .filter({ has: page.getByText(title, { exact: true }) });
}

async function addTodo(page: Page, title: string): Promise<void> {
  const input = page.getByRole('textbox', { name: newTodoInputName });
  await input.fill(title);
  await input.press('Enter');
}

async function addMixedTodos(page: Page): Promise<void> {
  await addTodo(page, 'Plan groceries');
  await addTodo(page, 'Submit report');
  await todoItem(page, 'Plan groceries')
    .getByRole('checkbox', { name: 'Toggle Todo' })
    .check();
    
}

test.beforeEach(async ({ page }) => {
  await page.goto(appUrl);

  const items = page.getByTestId('todo-item');
  while ((await items.count()) > 0) {
    const firstItem = items.first();
    await firstItem.hover();
    await firstItem.getByRole('button', { name: 'Delete' }).click();
  }
});

test.afterEach(async ({ page }) => {
  await page.waitForTimeout(1000); // Keep the browser open for 3 seconds
});

test('TC-ADD-01: adds a single todo', async ({ page }) => {
  await addTodo(page, 'Plan groceries');

  const item = todoItem(page, 'Plan groceries');
  await expect(item).toHaveCount(1);
  await expect(
    item.getByRole('checkbox', { name: 'Toggle Todo' }),
  ).not.toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  await expect(
    page.getByRole('textbox', { name: newTodoInputName }),
  ).toBeVisible();
});

test('TC-ADD-02: adds multiple todos', async ({ page }) => {
  await addTodo(page, 'Plan groceries');
  await addTodo(page, 'Submit report');

  await expect(todoItem(page, 'Plan groceries')).toHaveCount(1);
  await expect(todoItem(page, 'Submit report')).toHaveCount(1);
  await expect(
    page.getByRole('checkbox', { name: 'Toggle Todo' }),
  ).toHaveCount(2);
  await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
});

test('TC-ADD-03: does not add an empty todo', async ({ page }) => {
  await page
    .getByRole('textbox', { name: newTodoInputName })
    .press('Enter');

  await expect(page.getByTestId('todo-item')).toHaveCount(0);
  await expect(page.getByTestId('todo-count')).toHaveCount(0);
});

test('TC-COMPLETE-01: completes an active todo', async ({ page }) => {
  await addTodo(page, 'Plan groceries');
  await addTodo(page, 'Submit report');

  await todoItem(page, 'Plan groceries')
    .getByRole('checkbox', { name: 'Toggle Todo' })
    .check();

  await expect(
    todoItem(page, 'Plan groceries').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).toBeChecked();
  await expect(
    todoItem(page, 'Submit report').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).not.toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  await expect(
    page.getByRole('button', { name: 'Clear completed' }),
  ).toBeVisible();
});

test('TC-COMPLETE-02: reopens a completed todo', async ({ page }) => {
  await addTodo(page, 'Plan groceries');
  const checkbox = todoItem(page, 'Plan groceries').getByRole('checkbox', {
    name: 'Toggle Todo',
  });
  await checkbox.check();
  await checkbox.uncheck();

  await expect(checkbox).not.toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
  await expect(
    page.getByRole('button', { name: 'Clear completed' }),
  ).toHaveCount(0);
});

test('TC-COMPLETE-03: toggles all todos', async ({ page }) => {
  await addTodo(page, 'Plan groceries');
  await addTodo(page, 'Submit report');
  const markAll = page.getByRole('checkbox', {
    name: /Mark all as complete/,
  });

  await markAll.check();
  await expect(
    todoItem(page, 'Plan groceries').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).toBeChecked();
  await expect(
    todoItem(page, 'Submit report').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('0 items left');

  await markAll.uncheck();
  await expect(
    todoItem(page, 'Plan groceries').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).not.toBeChecked();
  await expect(
    todoItem(page, 'Submit report').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).not.toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('2 items left');
});

test('TC-FILTER-01: shows active todos only', async ({ page }) => {
  await addMixedTodos(page);
  await page.getByRole('link', { name: 'Active', exact: true }).click();

  await expect(page).toHaveURL(/#\/active$/);
  await expect(todoItem(page, 'Submit report')).toHaveCount(1);
  await expect(todoItem(page, 'Plan groceries')).toHaveCount(0);
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
});

test('TC-FILTER-02: shows completed todos only', async ({ page }) => {
  await addMixedTodos(page);
  await page.getByRole('link', { name: 'Completed', exact: true }).click();

  await expect(page).toHaveURL(/#\/completed$/);
  await expect(
    todoItem(page, 'Plan groceries').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).toBeChecked();
  await expect(todoItem(page, 'Submit report')).toHaveCount(0);
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
});

test('TC-FILTER-03: returns to all todos without changing their states', async ({
  page,
}) => {
  await addMixedTodos(page);
  await page.getByRole('link', { name: 'Active', exact: true }).click();
  await page.getByRole('link', { name: 'All', exact: true }).click();

  await expect(page).toHaveURL(/#\/$/);
  await expect(todoItem(page, 'Plan groceries')).toHaveCount(1);
  await expect(todoItem(page, 'Submit report')).toHaveCount(1);
  await expect(
    todoItem(page, 'Plan groceries').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).toBeChecked();
  await expect(
    todoItem(page, 'Submit report').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).not.toBeChecked();
  await expect(page.getByTestId('todo-count')).toHaveText('1 item left');
});

test('TC-FILTER-04: keeps active todos when the completed filter is empty', async ({
  page,
}) => {
  await addTodo(page, 'Submit report');
  await page.getByRole('link', { name: 'Completed', exact: true }).click();

  await expect(page).toHaveURL(/#\/completed$/);
  await expect(page.getByTestId('todo-item')).toHaveCount(0);

  await page.getByRole('link', { name: 'All', exact: true }).click();
  await expect(todoItem(page, 'Submit report')).toHaveCount(1);
  await expect(
    todoItem(page, 'Submit report').getByRole('checkbox', {
      name: 'Toggle Todo',
    }),
  ).not.toBeChecked();
});
