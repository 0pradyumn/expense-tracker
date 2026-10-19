import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from "recharts";
import api from "../api";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const COLORS = ["#2680c2", "#0f9d58", "#d93025", "#f0b429", "#9c36b5", "#e67700", "#0b7285", "#c2255c", "#364fc7"];

export default function Dashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [monthly, setMonthly] = useState(null);
  const [yearly, setYearly] = useState(null);

  useEffect(() => {
    api.get(`/summary/monthly?year=${year}&month=${month}`).then((r) => setMonthly(r.data));
    api.get(`/summary/yearly?year=${year}`).then((r) => setYearly(r.data));
  }, [year, month]);

  if (!monthly || !yearly) return <p>Loading…</p>;

  const expenseByCategory = monthly.byCategory.filter((c) => c.type === "expense");
  const dailySeries = Array.from({ length: 31 }, (_, i) => {
    const day = i + 1;
    const income = monthly.daily.find((d) => d.day === day && d.type === "income")?.total || 0;
    const expense = monthly.daily.find((d) => d.day === day && d.type === "expense")?.total || 0;
    return { day, income, expense };
  });

  return (
    <>
      <div className="row" style={{ margin: "1rem 0" }}>
        <label>Year
          <input type="number" value={year} onChange={(e) => setYear(+e.target.value)} style={{ width: 100 }} />
        </label>
        <label>Month
          <select value={month} onChange={(e) => setMonth(+e.target.value)}>
            {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
          </select>
        </label>
      </div>

      <div className="cards">
        <div className="card"><div className="muted">Income ({MONTHS[month - 1]})</div><div className="stat income">₹{monthly.income.toFixed(2)}</div></div>
        <div className="card"><div className="muted">Expenses ({MONTHS[month - 1]})</div><div className="stat expense">₹{monthly.expense.toFixed(2)}</div></div>
        <div className="card"><div className="muted">Balance</div><div className="stat">₹{monthly.balance.toFixed(2)}</div></div>
        <div className="card"><div className="muted">Year balance</div><div className="stat">₹{yearly.totals.balance.toFixed(2)}</div></div>
      </div>

      <div className="card">
        <h3>Year {year} — monthly income vs expense</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={yearly.series.map((s) => ({ name: MONTHS[s.month - 1], Income: s.income, Expense: s.expense }))}>
            <XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="Income" fill="#0f9d58" /><Bar dataKey="Expense" fill="#d93025" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="card">
        <h3>Daily activity — {MONTHS[month - 1]} {year}</h3>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={dailySeries}>
            <XAxis dataKey="day" /><YAxis /><Tooltip /><Legend />
            <Bar dataKey="income" name="Income" fill="#0f9d58" /><Bar dataKey="expense" name="Expense" fill="#d93025" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {expenseByCategory.length > 0 && (
        <div className="card">
          <h3>Expenses by category — {MONTHS[month - 1]} {year}</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie data={expenseByCategory} dataKey="total" nameKey="category" outerRadius={110} label>
                {expenseByCategory.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}
    </>
  );
}
