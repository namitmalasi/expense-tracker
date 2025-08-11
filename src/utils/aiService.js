import OpenAI from "openai";
import { getCategoryById, EXPENSE_CATEGORIES } from "../data/categories.js";
import { createAIExtractionResult } from "../types/index.js";

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

// Convert image file to base64
const fileToBase64 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });
};

// Extract text from receipt using OpenAI Vision
const extractReceiptText = async (imageFile) => {
  try {
    const base64Image = await fileToBase64(imageFile);

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this receipt image and extract the following information in JSON format:
              {
                "merchant": "merchant name",
                "amount": "total amount as number",
                "date": "date in YYYY-MM-DD format",
                "items": ["list of items purchased"],
                "rawText": "all visible text on receipt"
              }
              
              If any information is unclear or missing, make reasonable assumptions or leave empty arrays/strings.`,
            },
            {
              type: "image_url",
              image_url: {
                url: base64Image,
              },
            },
          ],
        },
      ],
      max_tokens: 1000,
    });

    const content = response.choices[0].message.content;

    // Try to parse JSON from the response
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (parseError) {
      console.warn("Failed to parse JSON from OpenAI response:", parseError);
    }

    // Fallback: extract information using regex patterns
    return extractWithFallback(content);
  } catch (error) {
    console.error("OpenAI Vision API error:", error);
    throw new Error("Failed to extract text from receipt");
  }
};

// Fallback extraction method
const extractWithFallback = (text) => {
  const merchantMatch = text.match(/merchant[:\s]+([^\n,]+)/i);
  const amountMatch = text.match(/(?:total|amount)[:\s]*\$?(\d+\.?\d*)/i);
  const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}|\d{1,2}\/\d{1,2}\/\d{4})/);

  return {
    merchant: merchantMatch ? merchantMatch[1].trim() : "Unknown Merchant",
    amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
    date: dateMatch ? dateMatch[1] : new Date().toISOString().split("T")[0],
    items: [],
    rawText: text,
  };
};

// Categorize expense using AI
const categorizeExpense = async (merchant, items, amount) => {
  try {
    const categoriesText = EXPENSE_CATEGORIES.map(
      (cat) => `${cat.id}: ${cat.name} (${cat.icon})`
    ).join("\n");

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an expense categorization expert. Given a merchant name, items, and amount, determine the most appropriate category from this list:

${categoriesText}

Respond with only the category ID (e.g., "food", "transport", etc.) and a confidence score from 0.0 to 1.0, separated by a comma.
Example: "food,0.95"`,
        },
        {
          role: "user",
          content: `Merchant: ${merchant}
Items: ${items.join(", ") || "None specified"}
Amount: $${amount}

What category best fits this expense?`,
        },
      ],
      max_tokens: 50,
      temperature: 0.1,
    });

    const content = response.choices[0].message.content.trim();
    const [categoryId, confidenceStr] = content.split(",");

    const category = getCategoryById(categoryId?.trim());
    const confidence = parseFloat(confidenceStr?.trim()) || 0.8;

    return { category, confidence };
  } catch (error) {
    console.error("OpenAI categorization error:", error);
    // Fallback to rule-based categorization
    return categorizeMerchantFallback(merchant);
  }
};

// Fallback categorization method
const categorizeMerchantFallback = (merchant) => {
  const merchantLower = merchant.toLowerCase();

  if (
    merchantLower.includes("restaurant") ||
    merchantLower.includes("cafe") ||
    merchantLower.includes("food") ||
    merchantLower.includes("starbucks") ||
    merchantLower.includes("mcdonald") ||
    merchantLower.includes("pizza")
  ) {
    return { category: getCategoryById("food"), confidence: 0.7 };
  }

  if (
    merchantLower.includes("uber") ||
    merchantLower.includes("lyft") ||
    merchantLower.includes("gas") ||
    merchantLower.includes("shell") ||
    merchantLower.includes("chevron")
  ) {
    return { category: getCategoryById("transport"), confidence: 0.7 };
  }

  if (
    merchantLower.includes("amazon") ||
    merchantLower.includes("target") ||
    merchantLower.includes("walmart") ||
    merchantLower.includes("store")
  ) {
    return { category: getCategoryById("shopping"), confidence: 0.7 };
  }

  return { category: getCategoryById("other"), confidence: 0.5 };
};

// Main AI extraction function
export const extractReceiptWithAI = async (imageFile) => {
  try {
    // Step 1: Extract text and basic info using Vision API
    const extractedData = await extractReceiptText(imageFile);

    // Step 2: Categorize the expense using AI
    const { category, confidence } = await categorizeExpense(
      extractedData.merchant,
      extractedData.items,
      extractedData.amount
    );

    // Step 3: Parse and format the date
    let parsedDate = new Date();
    if (extractedData.date) {
      const dateStr = extractedData.date;
      if (dateStr.includes("-")) {
        parsedDate = new Date(dateStr);
      } else if (dateStr.includes("/")) {
        parsedDate = new Date(dateStr);
      }
    }

    // Step 4: Return structured result
    return createAIExtractionResult({
      merchant: extractedData.merchant || "Unknown Merchant",
      amount: extractedData.amount || 0,
      date: parsedDate,
      items: extractedData.items || [],
      suggestedCategory: category,
      confidence: Math.min(confidence, 0.95), // Cap confidence at 95%
    });
  } catch (error) {
    console.error("AI extraction failed:", error);

    // Return a basic result with error indication
    return createAIExtractionResult({
      merchant: "Processing Failed",
      amount: 0,
      date: new Date(),
      items: ["Please enter details manually"],
      suggestedCategory: getCategoryById("other"),
      confidence: 0.1,
    });
  }
};

// Check if AI services are configured
export const isAIConfigured = () => {
  return !!import.meta.env.VITE_OPENAI_API_KEY;
};
