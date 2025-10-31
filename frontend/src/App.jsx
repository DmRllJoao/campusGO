import React, { useState } from "react";
import LoginScreen from "./components/LoginScreen";
import MapView from "./components/MapView";

export default function App() {
  const [user, setUser] = useState(null); // {matricula, name}
  const [mode, setMode] = useState("visitor"); // visitor | student
  const [loading, setLoading] = useState(false);

  const handleLogin = (matricula, name) => {
    setLoading(true);
    // Simula pequena animação de carregamento
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

  return (
  <div className="app" style={{ backgroundColor: "#dcdcdc" }}>
    {!user ? (
      <LoginScreen
        onLogin={handleLogin}
        onVisitor={handleVisitor}
        loading={loading}
      />
    ) : (
      <div className="container">
        <main className="main">
          <MapView user={user} mode={mode} />
        </main>
      </div>
    )}
  </div>
);

}
