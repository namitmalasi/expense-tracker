export const EXPENSE_CATEGORIES = [
  { id: "food", name: "Food & Dining", color: "#EF4444", icon: "🍽️" },
  { id: "transport", name: "Transportation", color: "#3B82F6", icon: "🚗" },
  { id: "shopping", name: "Shopping", color: "#8B5CF6", icon: "🛍️" },
  { id: "entertainment", name: "Entertainment", color: "#F59E0B", icon: "🎬" },
  { id: "health", name: "Healthcare", color: "#10B981", icon: "⚕️" },
  { id: "bills", name: "Bills & Utilities", color: "#6B7280", icon: "📄" },
  { id: "groceries", name: "Groceries", color: "#84CC16", icon: "🛒" },
  { id: "education", name: "Education", color: "#06B6D4", icon: "📚" },
  { id: "travel", name: "Travel", color: "#EC4899", icon: "✈️" },
  { id: "other", name: "Other", color: "#64748B", icon: "📋" },
];

export const getCategoryById = (id) => {
  return (
    EXPENSE_CATEGORIES.find((cat) => cat.id === id) ||
    EXPENSE_CATEGORIES[EXPENSE_CATEGORIES.length - 1]
  );
};
