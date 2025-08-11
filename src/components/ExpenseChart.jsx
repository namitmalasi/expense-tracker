import React from "react";
import { formatCurrency } from "../utils/dateHelpers.js";

const ExpenseChart = ({ expenses, title, type }) => {
  if (type === "pie") {
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryName = expense.category.name;
      acc[categoryName] = {
        amount: (acc[categoryName]?.amount || 0) + expense.amount,
        color: expense.category.color,
        icon: expense.category.icon,
      };
      return acc;
    }, {});

    const sortedCategories = Object.entries(categoryTotals).sort(
      ([, a], [, b]) => b.amount - a.amount
    );

    const total = sortedCategories.reduce(
      (sum, [, data]) => sum + data.amount,
      0
    );

    return (
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

        {sortedCategories.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-gray-500">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p>No expenses to display</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedCategories.map(([category, data], index) => {
              const percentage = (data.amount / total) * 100;
              return (
                <div
                  key={category}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center flex-1">
                    <span className="text-2xl mr-3">{data.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">
                          {category}
                        </span>
                        <span className="text-sm font-bold text-gray-900">
                          {formatCurrency(data.amount)}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="h-2 rounded-full"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: data.color,
                          }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Line chart for spending trend
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date;
  });

  const dailySpending = last7Days.map((date) => {
    const dayExpenses = expenses.filter(
      (expense) => expense.date.toDateString() === date.toDateString()
    );
    return dayExpenses.reduce((sum, expense) => sum + expense.amount, 0);
  });

  const maxSpending = Math.max(...dailySpending, 1);

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>

      <div className="h-64 flex items-end justify-between space-x-2">
        {dailySpending.map((amount, index) => {
          const height = (amount / maxSpending) * 100;
          const date = last7Days[index];

          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-blue-500 rounded-t min-h-[4px] mb-2 relative group cursor-pointer"
                style={{ height: `${height}%` }}
              >
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {formatCurrency(amount)}
                </div>
              </div>
              <span className="text-xs text-gray-600">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm text-gray-600">
          Total:{" "}
          {formatCurrency(
            dailySpending.reduce((sum, amount) => sum + amount, 0)
          )}
        </p>
      </div>
    </div>
  );
};

export default ExpenseChart;
