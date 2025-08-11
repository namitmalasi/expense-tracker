// Expense data structure
export const createExpense = (data) => ({
  id: data.id || Date.now().toString(),
  amount: data.amount,
  merchant: data.merchant,
  category: data.category,
  date: data.date,
  items: data.items || [],
  receiptUrl: data.receiptUrl,
  notes: data.notes || "",
});

// Budget data structure
export const createBudget = (data) => ({
  id: data.id || Date.now().toString(),
  category: data.category,
  amount: data.amount,
  spent: data.spent || 0,
  period: data.period || "monthly",
});

// AI extraction result structure
export const createAIExtractionResult = (data) => ({
  merchant: data.merchant,
  amount: data.amount,
  date: data.date,
  items: data.items || [],
  suggestedCategory: data.suggestedCategory,
  confidence: data.confidence,
});
