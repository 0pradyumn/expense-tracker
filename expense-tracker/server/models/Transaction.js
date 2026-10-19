const mongoose = require("mongoose");

const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investments", "Other"];
const EXPENSE_CATEGORIES = ["Food", "Rent", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Education", "Other"];
const CATEGORIES = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];

const transactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    type: { type: String, enum: ["income", "expense"], required: true },
    amount: { type: Number, required: true, min: 0.01 },
    category: { type: String, enum: CATEGORIES, required: true },
    date: { type: Date, required: true },
    description: { type: String, trim: true, maxlength: 300, default: "" },
  },
  { timestamps: true }
);

// Compound index for the common query pattern: user's transactions in a date range
transactionSchema.index({ user: 1, date: -1 });

// Validate category against type
transactionSchema.pre("validate", function (next) {
  const allowed = this.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
  if (!allowed.includes(this.category)) {
    this.invalidate("category", `"${this.category}" is not a valid ${this.type} category`);
  }
  next();
});

module.exports = mongoose.model("Transaction", transactionSchema);
module.exports.INCOME_CATEGORIES = INCOME_CATEGORIES;
module.exports.EXPENSE_CATEGORIES = EXPENSE_CATEGORIES;
