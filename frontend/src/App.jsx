import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import MapView from "./components/MapView";
import AdminPage from "./pages/AdminPage"; // Painel admin comum
import MasterAdminPage from "./pages/MasterAdminPage"; // Painel admin master

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("visitor");
  const [loading, setLoading] = useState(false);

  // 🔁 Recupera sessão anterior
  useEffect(() => {
    const savedUser = localStorage.getItem("campusgo_user");
    const savedMode = localStorage.getItem("campusgo_mode");
    if (savedUser && savedMode) {
      setUser(JSON.parse(savedUser));
      setMode(savedMode);
      setShowSplash(false);
    }
  }, []);

  // 💾 Salva sessão
  useEffect(() => {
    if (user) {
      localStorage.setItem("campusgo_user", JSON.stringify(user));
      localStorage.setItem("campusgo_mode", mode);
    } else {
      localStorage.removeItem("campusgo_user");
      localStorage.removeItem("campusgo_mode");
    }
  }, [user, mode]);

  // 🔹 Login — redireciona conforme o papel (role)
  const handleLogin = (matricula, name, role = "student") => {
    setLoading(true);
    setTimeout(() => {
      if (role === "master") {
        // 👑 Admin Master
        setUser({ matricula, name });
        setMode("admin-master");
        window.location.href = "/admin-master";
      } else if (role === "admin") {
        // 👨‍💼 Admin comum
        setUser({ matricula, name });
        setMode("admin");
        window.location.href = "/admin";
      } else {
        // 👩‍🎓 Estudante
        setUser({ matricula, name });
        setMode("student");
      }
      setLoading(false);
    }, 1000);
  };

  // 🔹 Visitante
  const handleVisitor = () => {
    setLoading(true);
    setTimeout(() => {
      setUser({ name: "Visitante" });
      setMode("visitor");
      setLoading(false);
    }, 1000);
  };

  // 🔹 Logout
  const handleLogout = () => {
    setUser(null);
    setMode("visitor");
    setShowSplash(true);
    localStorage.clear();
    window.location.href = "/";
  };

  // 🕓 Splash inicial
  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  // ⏳ Carregando
  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          height: "100vh",
          alignItems: "center",
          justifyContent: "center",
          background: "#f0f4ff",
          fontSize: "20px",
          color: "#1e3a8a",
        }}
      >
        ⏳ Carregando...
      </div>
    );
  }

  // ==============================
  // ROTAS PRINCIPAIS
  // ==============================
  return (
    <Router>
      <Routes>
        {/* 🏠 Login / Tela inicial */}
        <Route
          path="/"
          element={
            !user ? (
              <LoginScreen
                onLogin={handleLogin}
                onVisitor={handleVisitor}
                loading={loading}
              />
            ) : mode === "student" || mode === "visitor" ? (
              <div className="container">
                <main className="main">
                  <MapView user={user} mode={mode} onLogout={handleLogout} />
                </main>
              </div>
            ) : mode === "admin" ? (
              <Navigate to="/admin" />
            ) : (
              <Navigate to="/admin-master" />
            )
          }
        />

        {/* 👨‍💼 Painel Admin Comum */}
        <Route
          path="/admin"
          element={
            mode === "admin" && user ? (
              <AdminPage onLogout={handleLogout} user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* 👑 Painel Master Exclusivo */}
        <Route
          path="/admin-master"
          element={
            mode === "admin-master" && user ? (
              <MasterAdminPage onLogout={handleLogout} user={user} />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Rota padrão (fallback) */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}
