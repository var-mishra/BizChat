import { useState } from "react";
import { socket } from "../services/socket";

function Login({ setMyUserId }) {
  const [isLogin, setIsLogin] = useState(true); // ✅ toggle

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async () => {
    try {
      const url = isLogin
        ? `${import.meta.env.VITE_API_URL}/api/auth/login`
        : `${import.meta.env.VITE_API_URL}/api/auth/register`;

      const body = isLogin
        ? { email, password }
        : { username, email, password };

      console.log("🚀 Sending request:", body);

      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      console.log("✅ RESPONSE:", data); // 🔥 CHECK THIS

      if (!res.ok) {
        alert(data.message);
        return;
      }

      // ✅ REGISTER FLOW
      if (!isLogin) {
        alert("Registered successfully! Please login.");
        setIsLogin(true);
        return;
      }

      // ✅ LOGIN FLOW
      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.username);

      socket.auth = {
        token: data.token,
      };

      socket.connect();

      console.log("✅ Setting userId:", data.user.username);

      setMyUserId(data.user.username);
    } catch (err) {
      console.error("❌ ERROR:", err);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.card}>
        <h2 style={styles.title}>{isLogin ? "Welcome Back" : "Create Account"}</h2>
        <p style={styles.subtitle}>
          {isLogin ? "Please sign in to continue" : "Sign up to start chatting"}
        </p>

        {/* ✅ USERNAME (ONLY FOR REGISTER) */}
        {!isLogin && (
          <input
            style={styles.input}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        )}

        {/* ✅ EMAIL */}
        <input
          style={styles.input}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* ✅ PASSWORD */}
        <input
          type="password"
          style={styles.input}
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button style={styles.button} onClick={handleSubmit}>
          {isLogin ? "Login" : "Register"}
        </button>

        {/* ✅ TOGGLE BUTTON */}
        <div style={styles.toggleContainer}>
          <span style={styles.toggleText} onClick={() => setIsLogin(!isLogin)}>
            {isLogin
              ? "Don't have an account? Register"
              : "Already have an account? Login"}
          </span>
        </div>
      </div>
    </div>
  );
}

// Modern, minimalist UI styling matching your green/clean theme palette
const styles = {
  pageContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily: "system-ui, -apple-system, sans-serif",
  },
  card: {
    backgroundColor: "#ffffff",
    padding: "40px 32px",
    borderRadius: "16px",
    boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
    width: "100%",
    maxWidth: "360px",
    boxSizing: "border-box",
    display: "flex",
    flexDirection: "column",
  },
  title: {
    margin: "0 0 6px 0",
    fontSize: "24px",
    fontWeight: "700",
    color: "#2d3748",
    textAlign: "center",
  },
  subtitle: {
    margin: "0 0 24px 0",
    fontSize: "14px",
    color: "#718096",
    textAlign: "center",
  },
  input: {
    width: "100%",
    padding: "12px 16px",
    margin: "0 0 16px 0",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
    backgroundColor: "#f8fafc",
    outline: "none",
    boxSizing: "border-box",
    transition: "border-color 0.2s",
  },
  button: {
    width: "100%",
    padding: "12px",
    borderRadius: "8px",
    border: "none",
    backgroundColor: "#22c55e", // Using the vibrant green from your "+ New Chat" button
    color: "#ffffff",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "8px",
    boxSizing: "border-box",
    transition: "background-color 0.2s",
  },
  toggleContainer: {
    textAlign: "center",
    marginTop: "20px",
  },
  toggleText: {
    cursor: "pointer",
    color: "#3b82f6",
    fontSize: "13px",
    fontWeight: "500",
    textDecoration: "none",
  },
};

export default Login;