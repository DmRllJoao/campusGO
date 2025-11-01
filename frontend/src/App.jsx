import React, { useState } from "react";
import SplashScreen from "./components/SplashScreen";
import LoginScreen from "./components/LoginScreen";
import MapView from "./components/MapView";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [user, setUser] = useState(null);
  const [mode, setMode] = useState("visitor");
  const [loading, setLoading] = useState(false);

  const handleLogin = (matricula, name) => {
    setLoading(true);
    setTimeout(() => {
      setUser({ matricula, name });
      setMode("student");
      setLoading(false);
    }, 1200);
  };

  const handleVisitor = () => {
    setLoading(true);
    setTimeout(() => {
      setMode("visitor");
      setUser({ name: "Visitante" });
      setLoading(false);
    }, 1000);
  };

  // 🧩 Função de Logout
  const handleLogout = () => {
    setUser(null);         // remove usuário atual
    setMode("visitor");    // volta para modo visitante
    setShowSplash(true);   // retorna à tela inicial
  };

  // Splash inicial
  if (showSplash) {
    return <SplashScreen onEnter={() => setShowSplash(false)} />;
  }

  return (
    <div className="app">
      {!user ? (
        <LoginScreen
          onLogin={handleLogin}
          onVisitor={handleVisitor}
          loading={loading}
        />
      ) : (
        <div className="container">
          <main className="main">
            {/* 🔹 Passamos o handleLogout para o MapView */}
            <MapView user={user} mode={mode} onLogout={handleLogout} />
          </main>
        </div>
      )}
    </div>
  );
}
