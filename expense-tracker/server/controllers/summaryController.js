const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

/**
 * GET /api/summary/monthly?year=2026&month=10
 * Aggregation pipeline: totals + category breakdown + daily series.
 */
exports.getMonthlySummary = async (req, res, next) => {
  try {
    const now = new Date();
    const year = Number(req.query.year) || now.getFullYear();
    const month = Number(req.query.month) || now.getMonth() + 1;

    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 1);

    const pipeline = [
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start, $lt: end } } },
      {
        $facet: {
          totals: [
            { $group: { _id: "$type", total: { $sum: "$amount" } } },
          ],
          byCategory: [
            { $group: { _id: { type: "$type", category: "$category" }, total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
          ],
          daily: [
            { $group: { _id: { d: { $dayOfMonth: "$date" }, type: "$type" }, total: { $sum: "$amount" } } },
            { $sort: { "_id.d": 1 } },
          ],
          count: [{ $count: "n" }],
        },
      },
    ];

    const [result] = await Transaction.aggregate(pipeline);
    const totals = { income: 0, expense: 0, ...(result.totals || []).reduce((a, t) => ((a[t._id] = t.total), a), {}) };
    res.json({
      year, month,
      income: totals.income,
      expense: totals.expense,
      balance: totals.income - totals.expense,
      transactionCount: result.count[0]?.n || 0,
      byCategory: (result.byCategory || []).map((c) => ({ type: c._id.type, category: c._id.category, total: c.total })),
      daily: (result.daily || []).map((d) => ({ day: d._id.d, type: d._id.type, total: d.total })),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/summary/yearly?year=2026
 * Aggregation pipeline: per-month income/expense for the whole year.
 */
exports.getYearlySummary = async (req, res, next) => {
  try {
    const year = Number(req.query.year) || new Date().getFullYear();
    const start = new Date(year, 0, 1);
    const end = new Date(year + 1, 0, 1);

    const months = await Transaction.aggregate([
      { $match: { user: new mongoose.Types.ObjectId(req.user.id), date: { $gte: start, $lt: end } } },
      {
        $group: {
          _id: { m: { $month: "$date" }, type: "$type" },
          total: { $sum: "$amount" },
        },
      },
      { $sort: { "_id.m": 1 } },
    ]);

    // Shape into a 12-row series with zeros for missing months
    const series = Array.from({ length: 12 }, (_, i) => ({ month: i + 1, income: 0, expense: 0 }));
    for (const row of months) {
      series[row._id.m - 1][row._id.type] = row.total;
    }
    res.json({
      year,
      series: series.map((s) => ({ ...s, balance: s.income - s.expense })),
      totals: series.reduce(
        (acc, s) => ({
          income: acc.income + s.income,
          expense: acc.expense + s.expense,
          balance: acc.balance + (s.income - s.expense),
        }),
        { income: 0, expense: 0, balance: 0 }
      ),
    });
  } catch (err) {
    next(err);
  }
};
