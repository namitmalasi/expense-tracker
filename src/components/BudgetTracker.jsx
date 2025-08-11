import React, { useState } from "react";
import {
  Plus,
  Target,
  TrendingUp,
  AlertTriangle,
  Edit,
  Trash2,
} from "lucide-react";
import { EXPENSE_CATEGORIES } from "../data/categories.js";
import { formatCurrency, isCurrentMonth } from "../utils/dateHelpers.js";

const BudgetTracker = ({
  budgets,
  expenses,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}) => {
  const [showForm, setShowForm] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: EXPENSE_CATEGORIES[0],
    amount: "",
    period: "monthly",
  });

  // Calculate spent amounts for each budget
  const budgetsWithSpent = budgets.map((budget) => {
    const currentMonthExpenses = expenses.filter(
      (expense) =>
        isCurrentMonth(expense.date) &&
        expense.category.id === budget.category.id
    );
    const spent = currentMonthExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0
    );

    return { ...budget, spent };
  });

  const totalBudget = budgetsWithSpent.reduce(
    (sum, budget) => sum + budget.amount,
    0
  );
  const totalSpent = budgetsWithSpent.reduce(
    (sum, budget) => sum + budget.spent,
    0
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);

    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    if (editingBudget) {
      onUpdateBudget(editingBudget.id, {
        category: formData.category,
        amount,
        period: formData.period,
      });
      setEditingBudget(null);
    } else {
      onAddBudget({
        category: formData.category,
        amount,
        period: formData.period,
      });
    }

    setFormData({
      category: EXPENSE_CATEGORIES[0],
      amount: "",
      period: "monthly",
    });
    setShowForm(false);
  };

  const startEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period,
    });
    setShowForm(true);
  };

  const cancelEdit = () => {
    setEditingBudget(null);
    setFormData({
      category: EXPENSE_CATEGORIES[0],
      amount: "",
      period: "monthly",
    });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Budget Tracker</h2>
          <p className="text-gray-600 mt-1">
            Monitor your spending against your budgets
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Budget
        </button>
      </div>

      {/* Overall Budget Summary */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Monthly Overview
          </h3>
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm text-gray-600">Spent</p>
              <p className="text-xl font-bold text-gray-900">
                {formatCurrency(totalSpent)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-600">Budget</p>
              <p className="text-xl font-bold text-green-600">
                {formatCurrency(totalBudget)}
              </p>
            </div>
          </div>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-3">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              totalSpent > totalBudget
                ? "bg-red-500"
                : totalSpent > totalBudget * 0.8
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{
              width: `${Math.min((totalSpent / totalBudget) * 100, 100)}%`,
            }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-2">
          <span className="text-sm text-gray-600">
            {totalBudget > 0
              ? `${((totalSpent / totalBudget) * 100).toFixed(1)}% used`
              : "0% used"}
          </span>
          <span className="text-sm text-gray-600">
            {totalBudget > totalSpent
              ? `${formatCurrency(totalBudget - totalSpent)} remaining`
              : `${formatCurrency(totalSpent - totalBudget)} over budget`}
          </span>
        </div>
      </div>

      {/* Budget Form */}
      {showForm && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingBudget ? "Edit Budget" : "Add New Budget"}
          </h3>

          <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Category
              </label>
              <select
                value={formData.category.id}
                onChange={(e) => {
                  const category = EXPENSE_CATEGORIES.find(
                    (cat) => cat.id === e.target.value
                  );
                  if (category) setFormData({ ...formData, category });
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {EXPENSE_CATEGORIES.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Budget Amount
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-gray-500">$</span>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Period
              </label>
              <select
                value={formData.period}
                onChange={(e) =>
                  setFormData({ ...formData, period: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>
            </div>

            <div className="md:col-span-3 flex space-x-3">
              <button
                type="submit"
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                {editingBudget ? "Update Budget" : "Add Budget"}
              </button>
              <button
                type="button"
                onClick={cancelEdit}
                className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Budget List */}
      {budgetsWithSpent.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <Target className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Budgets Set
          </h3>
          <p className="text-gray-600 mb-6">
            Create your first budget to start tracking your spending goals
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition-colors duration-200"
          >
            Create Budget
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {budgetsWithSpent.map((budget) => {
            const percentage = (budget.spent / budget.amount) * 100;
            const isOverBudget = budget.spent > budget.amount;
            const isNearLimit = percentage > 80;

            return (
              <div
                key={budget.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">
                      {budget.category.icon}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {budget.category.name}
                      </h3>
                      <p className="text-sm text-gray-600 capitalize">
                        {budget.period}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isOverBudget && (
                      <AlertTriangle className="w-5 h-5 text-red-500" />
                    )}
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatCurrency(budget.spent)} /{" "}
                        {formatCurrency(budget.amount)}
                      </p>
                      <p
                        className={`text-sm ${
                          isOverBudget ? "text-red-600" : "text-gray-600"
                        }`}
                      >
                        {percentage.toFixed(1)}% used
                      </p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => startEdit(budget)}
                        className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteBudget(budget.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-300 ${
                      isOverBudget
                        ? "bg-red-500"
                        : isNearLimit
                        ? "bg-yellow-500"
                        : "bg-green-500"
                    }`}
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between mt-2">
                  <span
                    className={`text-sm font-medium ${
                      isOverBudget
                        ? "text-red-600"
                        : isNearLimit
                        ? "text-yellow-600"
                        : "text-green-600"
                    }`}
                  >
                    {isOverBudget
                      ? `${formatCurrency(
                          budget.spent - budget.amount
                        )} over budget`
                      : `${formatCurrency(
                          budget.amount - budget.spent
                        )} remaining`}
                  </span>
                  {isNearLimit && !isOverBudget && (
                    <span className="text-sm text-yellow-600 font-medium flex items-center">
                      <AlertTriangle className="w-4 h-4 mr-1" />
                      Near limit
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BudgetTracker;
