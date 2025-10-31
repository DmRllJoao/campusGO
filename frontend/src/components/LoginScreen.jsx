import React, { useState } from "react";
import "./LoginScreen.css";

export default function LoginScreen({ onLogin, onVisitor }) {
  const [matricula, setMatricula] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError("");
    if (!matricula) {
      setError("Digite sua matrícula ou entre como visitante.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula }),
      });
      const j = await res.json();
      if (res.ok) {
        onLogin(j.matricula, j.name);
      } else {
        setError(j.error || "Erro no login");
      }
    } catch (err) {
      setError("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  }

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo">
          <img src="/Logo-transparente.png" alt="CampusGO" />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Digite sua matrícula"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
          <button
            className={`btn-entrar ${loading ? "loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <div className="spinner"></div>
            ) : (
              "Entrar"
            )}
          </button>
        </div>

        {error && <div className="error">{error}</div>}

        <div className="row">
          <button className="btn-visitor" onClick={onVisitor}>
            Acessar como visitante
          </button>
        </div>

        <footer className="foot">Projeto de Extensão — UNIFAMETRO</footer>
      </div>
    </div>
  );
}
