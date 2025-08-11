const STORAGE_KEYS = {
  EXPENSES: "smart-expense-tracker-expenses",
  BUDGETS: "smart-expense-tracker-budgets",
};

export const saveExpenses = (expenses) => {
  localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
};

export const loadExpenses = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.EXPENSES);
  if (!stored) return [];

  try {
    const expenses = JSON.parse(stored);
    return expenses.map((expense) => ({
      ...expense,
      date: new Date(expense.date),
    }));
  } catch (error) {
    console.error("Error loading expenses:", error);
    return [];
  }
};

export const saveBudgets = (budgets) => {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const loadBudgets = () => {
  const stored = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error loading budgets:", error);
    return [];
  }
};
