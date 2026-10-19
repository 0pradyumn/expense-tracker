import { useEffect, useState } from "react";
import api from "../api";

const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investments", "Other"];
const EXPENSE_CATEGORIES = ["Food", "Rent", "Transport", "Utilities", "Entertainment", "Health", "Shopping", "Education", "Other"];

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [type, setType] = useState("expense");
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState("");

  const load = () => api.get("/transactions?limit=100").then((r) => setTransactions(r.data.items));
  useEffect(() => { load(); }, []);

  const categories = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    const fd = new FormData(e.target);
    const payload = {
      type: fd.get("type"),
      amount: Number(fd.get("amount")),
      category: fd.get("category"),
      date: fd.get("date"),
      description: fd.get("description") || "",
    };
    try {
      if (editing) {
        await api.put(`/transactions/${editing._id}`, payload);
        setEditing(null);
      } else {
        await api.post("/transactions", payload);
      }
      e.target.reset();
      setType("expense");
      load();
    } catch (err) {
      setError(err.response?.data?.message || "Save failed");
    }
  }

  async function handleDelete(id) {
    await api.delete(`/transactions/${id}`);
    load();
  }

  function startEdit(tx) {
    setEditing(tx);
    setType(tx.type);
  }

  return (
    <>
      <div className="card">
        <h3>{editing ? "Edit transaction" : "Add transaction"}</h3>
        <form className="stack" onSubmit={handleSubmit}>
          <div className="row">
            <select
              name="type" value={type}
              onChange={(e) => setType(e.target.value)}
              disabled={!!editing}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <input name="amount" type="number" step="0.01" min="0.01" placeholder="Amount (₹)" required />
            <select name="category" defaultValue={editing?.category}>
              {categories.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input name="date" type="date" defaultValue={editing?.date?.slice(0, 10)} required />
          </div>
          <input name="description" placeholder="Description (optional)" maxLength={300} defaultValue={editing?.description} />
          {error && <p className="error">{error}</p>}
          <div className="row">
            <button className="primary">{editing ? "Update" : "Add"}</button>
            {editing && (
              <button type="button" onClick={() => { setEditing(null); setType("expense"); }}>
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        <h3>History</h3>
        {transactions.length === 0 ? (
          <p className="muted">No transactions yet.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Date</th><th>Type</th><th>Category</th><th>Description</th><th style={{ textAlign: "right" }}>Amount</th><th></th></tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx._id}>
                  <td>{new Date(tx.date).toLocaleDateString()}</td>
                  <td className={tx.type}>{tx.type}</td>
                  <td>{tx.category}</td>
                  <td>{tx.description}</td>
                  <td style={{ textAlign: "right" }} className={tx.type}>
                    {tx.type === "expense" ? "-" : "+"}₹{tx.amount.toFixed(2)}
                  </td>
                  <td>
                    <button onClick={() => startEdit(tx)}>✏️</button>{" "}
                    <button onClick={() => handleDelete(tx._id)}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
