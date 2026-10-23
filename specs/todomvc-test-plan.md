# TodoMVC Test Plan

## Scope

Verify adding todo items, changing their completion state, and filtering the list
to show all, active, or completed items on
[`https://demo.playwright.dev/todomvc`](https://demo.playwright.dev/todomvc).

## Interactive elements observed

- **New todo textbox** — accessible name: `What needs to be done?`; submit an
  item with Enter.
- **Per-item completion checkbox** — accessible name: `Toggle Todo`.
- **Mark-all checkbox** — accessible name: `❯Mark all as complete`.
- **Filters** — links named `All`, `Active`, and `Completed`; their routes are
  `#/`, `#/active`, and `#/completed`.
- **Items remaining count** — singular `item left` or plural `items left`,
  counting active items.
- **Clear completed button** — appears when completed items exist; outside the
  core scope, but useful for restoring a clean test state.

## Test data and setup

Use unique item labels for each run, for example:

- `Plan groceries`
- `Submit report`

Start each test with an empty list. If the app retains prior items, clear
completed items and remove any remaining active items before proceeding. Reload
or navigate to `#/` to begin from the All view.

## Test cases

### TC-ADD-01 — Add a single todo

**Preconditions:** Empty list; All filter selected.

**Steps:**

1. Enter `Plan groceries` in the new todo textbox.
2. Press Enter.

**Expected results:**

- The item appears in the list with the exact entered text.
- Its completion checkbox is unchecked.
- The remaining count is `1 item left`.
- The new todo textbox is available for another entry.

### TC-ADD-02 — Add multiple todos

**Preconditions:** Empty list; All filter selected.

**Steps:**

1. Add `Plan groceries` and submit with Enter.
2. Add `Submit report` and submit with Enter.

**Expected results:**

- Both items appear once in the list.
- Both completion checkboxes are unchecked.
- The remaining count is `2 items left`.

### TC-ADD-03 — Do not add an empty item

**Preconditions:** Empty list.

**Steps:**

1. Leave the new todo textbox empty.
2. Press Enter.

**Expected results:**

- No blank todo is added.
- The list remains empty and no item count is shown.

### TC-COMPLETE-01 — Complete an active todo

**Preconditions:** Add `Plan groceries` and `Submit report`; All filter selected.

**Steps:**

1. Check the `Toggle Todo` checkbox for `Plan groceries`.

**Expected results:**

- `Plan groceries` is marked completed.
- `Submit report` remains active.
- The remaining count decreases from `2 items left` to `1 item left`.
- A `Clear completed` button is available.

### TC-COMPLETE-02 — Reopen a completed todo

**Preconditions:** `Plan groceries` is completed and visible in All.

**Steps:**

1. Uncheck the `Toggle Todo` checkbox for `Plan groceries`.

**Expected results:**

- `Plan groceries` becomes active again.
- The remaining count increases by one.
- The completed-item cleanup control is no longer shown if there are no other
  completed items.

### TC-COMPLETE-03 — Toggle all todos

**Preconditions:** At least two active todos exist.

**Steps:**

1. Check the mark-all checkbox.
2. Uncheck the mark-all checkbox.

**Expected results:**

- After step 1, all todos are completed and the active count is zero.
- After step 2, all todos are active and the active count equals the total
  number of todos.

### TC-FILTER-01 — Show active todos only

**Preconditions:** `Plan groceries` is completed and `Submit report` is active.

**Steps:**

1. Select the `Active` filter.

**Expected results:**

- The URL fragment is `#/active`.
- `Submit report` is visible.
- `Plan groceries` is not visible.
- The active count remains `1 item left`.

### TC-FILTER-02 — Show completed todos only

**Preconditions:** `Plan groceries` is completed and `Submit report` is active.

**Steps:**

1. Select the `Completed` filter.

**Expected results:**

- The URL fragment is `#/completed`.
- `Plan groceries` is visible with its checkbox checked.
- `Submit report` is not visible.
- The active count remains `1 item left`.

### TC-FILTER-03 — Return to all todos

**Preconditions:** One completed and one active todo exist; either non-default
filter is selected.

**Steps:**

1. Select the `All` filter.

**Expected results:**

- The URL fragment is `#/`.
- Both active and completed todos are visible.
- Their completion checkbox states are unchanged.
- The active count remains `1 item left`.

### TC-FILTER-04 — Empty filter result

**Preconditions:** At least one todo exists and none are completed.

**Steps:**

1. Select the `Completed` filter.

**Expected results:**

- No todo rows are shown.
- The current filter is `Completed` and the URL fragment is `#/completed`.
- Todos remain in the list when returning to All; filtering does not change
  their completion state.

## Execution notes

- Identify rows by their todo text and operate their associated checkbox to
  avoid toggling the wrong item.
- Check both visible list contents and checkbox state; a filtered-out item
  should remain in the underlying list.
- Run filter cases with a mixed active/completed list so each filter is
  verified against both types of item.
