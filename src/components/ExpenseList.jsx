import React, { useState } from "react";
import { Calendar, Filter, Search, Trash2 } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../data/categories.js";
import { formatCurrency, formatDate } from "../utils/dateHelpers.js";

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState("desc");

  const filteredExpenses = expenses
    .filter((expense) => {
      const matchesSearch =
        expense.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        expense.notes?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory =
        selectedCategory === "all" || expense.category.id === selectedCategory;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "date":
          comparison = a.date.getTime() - b.date.getTime();
          break;
        case "amount":
          comparison = a.amount - b.amount;
          break;
        case "merchant":
          comparison = a.merchant.localeCompare(b.merchant);
          break;
      }

      return sortOrder === "desc" ? -comparison : comparison;
    });

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">All Expenses</h2>
        <p className="text-gray-600 mt-1">
          View and manage your expense history
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search expenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {EXPENSE_CATEGORIES.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => toggleSort("date")}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                sortBy === "date"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Date {sortBy === "date" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
            <button
              onClick={() => toggleSort("amount")}
              className={`flex-1 px-3 py-2 text-sm rounded-lg border transition-colors ${
                sortBy === "amount"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              Amount {sortBy === "amount" && (sortOrder === "desc" ? "↓" : "↑")}
            </button>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>
          Showing {filteredExpenses.length} of {expenses.length} expenses
        </span>
        <span>
          Total:{" "}
          {formatCurrency(
            filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0)
          )}
        </span>
      </div>

      {/* Expense List */}
      {filteredExpenses.length === 0 ? (
        <div className="bg-white rounded-xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-6xl mb-4">📄</div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No Expenses Found
          </h3>
          <p className="text-gray-600">
            {expenses.length === 0
              ? "Upload your first receipt to get started"
              : "Try adjusting your filters or search terms"}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredExpenses.map((expense) => (
            <div
              key={expense.id}
              className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <span className="text-2xl mr-4">{expense.category.icon}</span>

                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">
                        {expense.merchant}
                      </h3>
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(expense.amount)}
                      </span>
                    </div>

                    <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {formatDate(expense.date)}
                      </span>
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{ backgroundColor: expense.category.color }}
                      >
                        {expense.category.name}
                      </span>
                    </div>

                    {expense.notes && (
                      <p className="text-sm text-gray-600 mt-2">
                        {expense.notes}
                      </p>
                    )}

                    {expense.items && expense.items.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 mb-1">Items:</p>
                        <div className="flex flex-wrap gap-1">
                          {expense.items.slice(0, 3).map((item, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600"
                            >
                              {item}
                            </span>
                          ))}
                          {expense.items.length > 3 && (
                            <span className="px-2 py-1 bg-gray-100 text-xs rounded-full text-gray-600">
                              +{expense.items.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => onDeleteExpense(expense.id)}
                  className="ml-4 p-2 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ExpenseList;
