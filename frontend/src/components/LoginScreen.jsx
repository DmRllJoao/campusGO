import React, { useState, useEffect } from "react";
import "./LoginScreen.css";

/*
  Tela de Login do CampusGO:
  - Permite login de alunos, visitantes e administradores.
  - Administradores digitam usuário -> popup pede senha.
  - Envia role (admin, master, student) ao App.jsx.
*/

export default function LoginScreen({ onLogin, onVisitor }) {
  const [matricula, setMatricula] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [isAdminMaster, setIsAdminMaster] = useState(false);

  // 🔍 Verifica se o usuário é admin e abre o popup se for
  async function handleLogin() {
    setError("");
    if (!matricula.trim()) {
      setError("Digite sua matrícula ou entre como visitante.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `http://127.0.0.1:5000/admins/check?username=${matricula}`
      );
      if (res.ok) {
        const data = await res.json();
        if (data.valid) {
          setIsAdminMaster(matricula.toLowerCase() === "admin");
          setShowPasswordModal(true);
          setLoading(false);
          return;
        }
      }
    } catch (err) {
      console.warn("Falha ao verificar admin:", err);
    }

    // Se não for admin, tenta login como aluno
    await loginRequest({ matricula });
  }

  // 🔹 Faz o login no backend (Flask)
  async function loginRequest({ matricula, senha = "" }) {
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ matricula, senha }),
      });

      const j = await res.json();

      if (res.ok) {
        onLogin(j.matricula, j.name, j.role || "student"); // envia role
      } else {
        setError(j.error || "Erro no login");
      }
    } catch (err) {
      console.error("Erro de conexão:", err);
      setError("Erro ao conectar com o servidor.");
    }
    setLoading(false);
  }

  // 🔐 Quando o admin confirma a senha no popup
  const handleAdminAuth = async () => {
    if (!adminPassword.trim()) {
      setError("Digite a senha.");
      return;
    }

    setShowPasswordModal(false);
    await loginRequest({
      matricula: matricula.trim(),
      senha: adminPassword,
    });
    setAdminPassword("");
  };

  // ⏱️ Retorna à tela Splash se ficar 20s sem uso
  useEffect(() => {
    const timer = setTimeout(() => {
      window.location.reload();
    }, 20000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="logo">
          <img src="/Logo-transparente.png" alt="CampusGO" />
        </div>

        <div className="input-group">
          <input
            type="text"
            placeholder="Digite sua matrícula ou usuário"
            value={matricula}
            onChange={(e) => setMatricula(e.target.value)}
          />
          <button
            className={`btn-entrar ${loading ? "loading" : ""}`}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? <div className="spinner"></div> : "Entrar"}
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

      {/* 🔒 Modal de autenticação do admin */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>
              🔐{" "}
              {isAdminMaster
                ? "Autenticação do Admin Master"
                : "Autenticação do Administrador"}
            </h3>
            <input
              type="password"
              placeholder="Digite a senha"
              value={adminPassword}
              onChange={(e) => setAdminPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdminAuth()}
            />
            <div className="modal-buttons">
              <button onClick={handleAdminAuth}>Confirmar</button>
              <button
                className="cancel"
                onClick={() => setShowPasswordModal(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
