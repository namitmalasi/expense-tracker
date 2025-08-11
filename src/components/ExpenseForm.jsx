import React, { useState } from "react";
import { Check, X, Edit3, Sparkles } from "lucide-react";
import { EXPENSE_CATEGORIES } from "../data/categories.js";
import { formatCurrency } from "../utils/dateHelpers.js";

const ExpenseForm = ({ aiResult, receiptImage, onSave, onCancel }) => {
  const [merchant, setMerchant] = useState(aiResult.merchant);
  const [amount, setAmount] = useState(aiResult.amount.toString());
  const [category, setCategory] = useState(aiResult.suggestedCategory);
  const [date, setDate] = useState(aiResult.date.toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");
  const [receiptUrl, setReceiptUrl] = useState("");

  React.useEffect(() => {
    // Create a URL for the receipt image preview
    const url = URL.createObjectURL(receiptImage);
    setReceiptUrl(url);

    return () => URL.revokeObjectURL(url);
  }, [receiptImage]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Please enter a valid amount");
      return;
    }

    onSave({
      merchant: merchant.trim(),
      amount: parsedAmount,
      category,
      date: new Date(date),
      items: aiResult.items,
      notes: notes.trim(),
    });
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 0.8) return "text-green-700 bg-green-100";
    if (confidence >= 0.6) return "text-yellow-700 bg-yellow-100";
    return "text-red-700 bg-red-100";
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <Sparkles className="w-6 h-6 text-blue-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">
            AI-Extracted Expense
          </h2>
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <span
            className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(
              aiResult.confidence
            )}`}
          >
            {Math.round(aiResult.confidence * 100)}% confident
          </span>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Receipt Preview */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">
            Receipt Preview
          </label>
          <div className="relative">
            <img
              src={receiptUrl}
              alt="Receipt"
              className="w-full h-64 object-cover rounded-lg border border-gray-200"
            />
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
              AI Processed
            </div>
          </div>

          {aiResult.items.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                AI-Detected Items
              </label>
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                {aiResult.items.map((item, index) => (
                  <div key={index} className="flex items-center text-gray-700">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          )}

          {aiResult.confidence < 0.7 && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <div className="flex items-center">
                <Edit3 className="w-4 h-4 text-yellow-600 mr-2" />
                <span className="text-sm text-yellow-800 font-medium">
                  Low Confidence Detection
                </span>
              </div>
              <p className="text-xs text-yellow-700 mt-1">
                Please review and correct the extracted information before
                saving.
              </p>
            </div>
          )}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Merchant
            </label>
            <div className="relative">
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
              <Edit3 className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-gray-500">$</span>
              <input
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
              <span className="text-xs text-blue-600 ml-1">(AI Suggested)</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              {EXPENSE_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`p-2 rounded-lg border text-left transition-all duration-200 ${
                    category.id === cat.id
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center">
                    <span className="mr-2">{cat.icon}</span>
                    <span className="text-sm font-medium">{cat.name}</span>
                    {cat.id === aiResult.suggestedCategory.id && (
                      <Sparkles className="w-3 h-3 text-blue-500 ml-auto" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add any additional notes..."
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors duration-200 flex items-center justify-center"
            >
              <Check className="w-4 h-4 mr-2" />
              Save Expense
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center"
            >
              <X className="w-4 h-4 mr-2" />
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExpenseForm;
