const Transaction = require("../models/Transaction");

function buildFilter(userId, query) {
  const filter = { user: userId };
  if (query.type) filter.type = query.type;
  if (query.category) filter.category = query.category;
  if (query.month) {
    // month format: YYYY-MM
    const [y, m] = query.month.split("-").map(Number);
    filter.date = { $gte: new Date(y, m - 1, 1), $lt: new Date(y, m, 1) };
  }
  return filter;
}

exports.getTransactions = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);

    const [items, total] = await Promise.all([
      Transaction.find(buildFilter(req.user.id, req.query))
        .sort({ date: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Transaction.countDocuments(buildFilter(req.user.id, req.query)),
    ]);
    res.json({ items, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    next(err);
  }
};

exports.createTransaction = async (req, res, next) => {
  try {
    const { type, amount, category, date, description } = req.body;
    if (!type || !amount || !category || !date)
      return res.status(400).json({ message: "type, amount, category and date are required" });

    const tx = await Transaction.create({
      user: req.user.id, type, amount: Number(amount), category,
      date: new Date(date), description,
    });
    res.status(201).json(tx);
  } catch (err) {
    next(err);
  }
};

exports.updateTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id }, // ownership enforced
      req.body,
      { new: true, runValidators: true }
    );
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.json(tx);
  } catch (err) {
    next(err);
  }
};

exports.deleteTransaction = async (req, res, next) => {
  try {
    const tx = await Transaction.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!tx) return res.status(404).json({ message: "Transaction not found" });
    res.json({ success: true });
  } catch (err) {
    next(err);
  }
};
