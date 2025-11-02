import React, { useEffect, useState } from "react";
import "./AdminPanel.css";

export default function AdminPage({ onLogout, user }) {
  const [students, setStudents] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newStudent, setNewStudent] = useState({ matricula: "", name: "" });
  const [newAula, setNewAula] = useState({
    disciplina: "",
    horario: "",
    sala: "",
    sala_id: "",
    data: "",
    dia_semana: "",
    matricula: "",
  });

  // 🔹 Carrega alunos e aulas
  useEffect(() => {
    async function fetchData() {
      try {
        const [studentsRes, aulasRes] = await Promise.all([
          fetch("http://127.0.0.1:5000/students"),
          fetch("http://127.0.0.1:5000/aulas"),
        ]);
        setStudents(await studentsRes.json());
        setAulas(await aulasRes.json());
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // ➕ Adicionar aluno
  async function addStudent() {
    if (!newStudent.matricula || !newStudent.name) return alert("Preencha todos os campos!");
    const res = await fetch("http://127.0.0.1:5000/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newStudent),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Aluno adicionado!");
      setStudents([...students, newStudent]);
      setNewStudent({ matricula: "", name: "" });
    } else {
      alert(data.error || "Erro ao adicionar aluno");
    }
  }

  // ➕ Adicionar aula
  async function addAula() {
    const campos = Object.values(newAula);
    if (campos.some((v) => !v)) return alert("Preencha todos os campos!");
    const res = await fetch("http://127.0.0.1:5000/aulas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newAula),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Aula adicionada!");
      setAulas([...aulas, newAula]);
      setNewAula({
        disciplina: "",
        horario: "",
        sala: "",
        sala_id: "",
        data: "",
        dia_semana: "",
        matricula: "",
      });
    } else {
      alert(data.error || "Erro ao adicionar aula");
    }
  }

  // 🗑️ Excluir aula
  async function deleteAula(id) {
    if (!window.confirm("Excluir esta aula?")) return;
    await fetch(`http://127.0.0.1:5000/aulas/${id}`, { method: "DELETE" });
    setAulas(aulas.filter((a) => a.id !== id));
  }

  if (loading)
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Carregando painel...</p>
      </div>
    );

  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>🎓 Painel Administrativo</h1>
        <div className="user-info">
          <span>{user?.name || "Administrador"}</span>
          <button onClick={onLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </header>

      <main>
        {/* ==================== ALUNOS ==================== */}
        <section>
          <h2>👩‍🎓 Alunos</h2>
          <div className="form-inline">
            <input
              type="text"
              placeholder="Matrícula"
              value={newStudent.matricula}
              onChange={(e) =>
                setNewStudent({ ...newStudent, matricula: e.target.value })
              }
            />
            <input
              type="text"
              placeholder="Nome"
              value={newStudent.name}
              onChange={(e) =>
                setNewStudent({ ...newStudent, name: e.target.value })
              }
            />
            <button onClick={addStudent}>Adicionar</button>
          </div>

          {students.length === 0 ? (
            <p>Nenhum aluno cadastrado.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Matrícula</th>
                  <th>Nome</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => (
                  <tr key={s.matricula}>
                    <td>{s.matricula}</td>
                    <td>{s.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* ==================== AULAS ==================== */}
        <section>
          <h2>📚 Aulas</h2>
          <div className="form-inline">
            {[
              ["disciplina", "Disciplina"],
              ["horario", "Horário"],
              ["sala", "Sala"],
              ["sala_id", "Sala ID"],
              ["data", "Data"],
              ["dia_semana", "Dia da Semana"],
              ["matricula", "Matrícula do Aluno"],
            ].map(([key, label]) => (
              <input
                key={key}
                type="text"
                placeholder={label}
                value={newAula[key]}
                onChange={(e) =>
                  setNewAula({ ...newAula, [key]: e.target.value })
                }
              />
            ))}
            <button onClick={addAula}>Adicionar</button>
          </div>

          {aulas.length === 0 ? (
            <p>Nenhuma aula cadastrada.</p>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Disciplina</th>
                  <th>Horário</th>
                  <th>Sala</th>
                  <th>Dia</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {aulas.map((a) => (
                  <tr key={a.id}>
                    <td>{a.disciplina}</td>
                    <td>{a.horario}</td>
                    <td>{a.sala}</td>
                    <td>{a.dia_semana}</td>
                    <td>
                      <button onClick={() => deleteAula(a.id)}>🗑️</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </main>
    </div>
  );
}
