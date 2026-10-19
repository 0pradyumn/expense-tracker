import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="nav">
      <strong>💸 Expense Tracker</strong>
      <div>
        {user ? (
          <>
            <Link to="/">Dashboard</Link>
            <Link to="/transactions">Transactions</Link>
            <button onClick={() => { logout(); navigate("/login"); }}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
