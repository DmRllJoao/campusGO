// src/pages/MasterAdminPage.jsx
import React, { useEffect, useState } from "react";
import "./AdminPanel.css";

/*
  Painel do Admin Master:
  - Gerencia administradores, alunos e aulas.
  - Permite criar/editar/deletar administradores (apenas master),
    além de CRUD de alunos e aulas.
  - As chamadas usam as rotas do backend (127.0.0.1:5000).
*/

export default function MasterAdminPage({ onLogout, user }) {
  // estados de dados
  const [admins, setAdmins] = useState([]);
  const [students, setStudents] = useState([]);
  const [aulas, setAulas] = useState([]);
  const [loading, setLoading] = useState(true);

  // estados de edição inline
  const [editingAdmin, setEditingAdmin] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [editingAula, setEditingAula] = useState(null);

  // formulários para criação
  const [formAdmin, setFormAdmin] = useState({ username: "", nome: "", senha: "" });
  const [formStudent, setFormStudent] = useState({ matricula: "", name: "" });
  const [formAula, setFormAula] = useState({
    disciplina: "",
    horario: "",
    sala: "",
    sala_id: "",
    data: "",
    dia_semana: "",
    matricula: "",
  });

  // Carrega todos os dados do backend quando o componente monta
  useEffect(() => {
    async function fetchData() {
      try {
        // Faz requisições paralelas para reduzir tempo de carregamento
        const [resAdmins, resStudents, resAulas] = await Promise.all([
          fetch("http://127.0.0.1:5000/admins"),
          fetch("http://127.0.0.1:5000/students"),
          fetch("http://127.0.0.1:5000/aulas"),
        ]);

        // Converte os responses para JSON e atualiza estados
        setAdmins(await resAdmins.json());
        setStudents(await resStudents.json());
        setAulas(await resAulas.json());
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // ==============================
  // CRUD ADMINISTRADORES
  // ==============================

  /**
   * addAdmin()
   * - Valida campos do formulário de admin.
   * - Chama POST /admins para criar novo admin.
   * - Atualiza a lista local de admins após sucesso.
   */
  async function addAdmin() {
    if (!formAdmin.username || !formAdmin.nome || !formAdmin.senha)
      return alert("Preencha todos os campos!");
    const res = await fetch("http://127.0.0.1:5000/admins", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formAdmin),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Administrador criado!");
      // idealmente o backend retorna o id; aqui adicionamos provisoriamente
      setAdmins([...admins, { ...formAdmin, id: data.id || Date.now() }]);
      setFormAdmin({ username: "", nome: "", senha: "" });
    } else alert(data.error);
  }

  /**
   * saveAdminEdit()
   * - Persiste edição de um administrador existente (PUT /admins/:id).
   * - Atualiza o estado local de admins.
   */
  async function saveAdminEdit() {
    const res = await fetch(`http://127.0.0.1:5000/admins/${editingAdmin.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingAdmin),
    });
    const data = await res.json();
    if (res.ok) {
      setAdmins(admins.map((a) => (a.id === editingAdmin.id ? editingAdmin : a)));
      setEditingAdmin(null);
      alert("Administrador atualizado!");
    } else alert(data.error);
  }

  /**
   * deleteAdmin(id)
   * - Pergunta confirmação e chama DELETE /admins/:id.
   * - Atualiza a lista local removendo o admin.
   * - Evita deletar 'admin' se for o master (backend também deve reforçar).
   */
  async function deleteAdmin(id) {
    if (!window.confirm("Excluir este administrador?")) return;
    const res = await fetch(`http://127.0.0.1:5000/admins/${id}`, { method: "DELETE" });
    const data = await res.json();
    if (res.ok) {
      setAdmins(admins.filter((a) => a.id !== id));
    } else alert(data.error);
  }

  // ==============================
  // CRUD ALUNOS
  // ==============================

  /**
   * addStudent()
   * - Valida e cria novo aluno via POST /students.
   * - Atualiza estado local de students.
   */
  async function addStudent() {
    if (!formStudent.matricula || !formStudent.name) return alert("Preencha todos os campos!");
    const res = await fetch("http://127.0.0.1:5000/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formStudent),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Aluno adicionado!");
      setStudents([...students, formStudent]);
      setFormStudent({ matricula: "", name: "" });
    } else alert(data.error);
  }

  /**
   * saveStudentEdit()
   * - Atualiza um aluno existente (PUT /students/:matricula).
   */
  async function saveStudentEdit() {
    const res = await fetch(`http://127.0.0.1:5000/students/${editingStudent.matricula}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editingStudent.name }),
    });
    const data = await res.json();
    if (res.ok) {
      setStudents(students.map((s) => (s.matricula === editingStudent.matricula ? editingStudent : s)));
      setEditingStudent(null);
      alert("Aluno atualizado!");
    } else alert(data.error);
  }

  /**
   * deleteStudent(matricula)
   * - Deleta aluno via DELETE /students/:matricula e atualiza estado local.
   */
  async function deleteStudent(matricula) {
    if (!window.confirm("Excluir este aluno?")) return;
    await fetch(`http://127.0.0.1:5000/students/${matricula}`, { method: "DELETE" });
    setStudents(students.filter((s) => s.matricula !== matricula));
  }

  // ==============================
  // CRUD AULAS
  // ==============================

  /**
   * addAula()
   * - Valida campos do formulário e cria nova aula (POST /aulas).
   */
  async function addAula() {
    const campos = Object.values(formAula);
    if (campos.some((v) => !v)) return alert("Preencha todos os campos!");
    const res = await fetch("http://127.0.0.1:5000/aulas", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formAula),
    });
    const data = await res.json();
    if (res.ok) {
      alert("Aula adicionada!");
      setAulas([...aulas, formAula]);
      setFormAula({
        disciplina: "",
        horario: "",
        sala: "",
        sala_id: "",
        data: "",
        dia_semana: "",
        matricula: "",
      });
    } else alert(data.error);
  }

  /**
   * saveAulaEdit()
   * - Atualiza uma aula via PUT /aulas/:id (se sua API suportar PUT).
   */
  async function saveAulaEdit() {
    const res = await fetch(`http://127.0.0.1:5000/aulas/${editingAula.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editingAula),
    });
    const data = await res.json();
    if (res.ok) {
      setAulas(aulas.map((a) => (a.id === editingAula.id ? editingAula : a)));
      setEditingAula(null);
      alert("Aula atualizada!");
    } else alert(data.error);
  }

  /**
   * deleteAula(id)
   * - Remove uma aula via DELETE /aulas/:id.
   */
  async function deleteAula(id) {
    if (!window.confirm("Excluir esta aula?")) return;
    await fetch(`http://127.0.0.1:5000/aulas/${id}`, { method: "DELETE" });
    setAulas(aulas.filter((a) => a.id !== id));
  }

  // render loading enquanto busca os dados
  if (loading)
    return (
      <div className="admin-loading">
        <div className="spinner"></div>
        <p>Carregando painel master...</p>
      </div>
    );

  // JSX do painel (listas + formulários)
  return (
    <div className="admin-page">
      <header className="admin-header">
        <h1>👑 Painel do Admin Master</h1>
        <div className="user-info">
          <span>{user?.name}</span>
          <button onClick={onLogout} className="logout-btn">
            Sair
          </button>
        </div>
      </header>

      <main>
        {/* ==================== ADMINISTRADORES ==================== */}
        <section>
          <h2>👤 Administradores</h2>

          {/* Formulário para criar novo admin */}
          <div className="form-inline">
            <input
              placeholder="Usuário"
              value={formAdmin.username}
              onChange={(e) => setFormAdmin({ ...formAdmin, username: e.target.value })}
            />
            <input
              placeholder="Nome"
              value={formAdmin.nome}
              onChange={(e) => setFormAdmin({ ...formAdmin, nome: e.target.value })}
            />
            <input
              type="password"
              placeholder="Senha"
              value={formAdmin.senha}
              onChange={(e) => setFormAdmin({ ...formAdmin, senha: e.target.value })}
            />
            <button onClick={addAdmin}>Adicionar</button>
          </div>

          {/* Tabela de administradores com edição inline */}
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Usuário</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => (
                <tr key={a.id}>
                  <td>{a.id}</td>
                  <td>{a.username}</td>
                  <td>
                    {editingAdmin?.id === a.id ? (
                      <input
                        value={editingAdmin.nome}
                        onChange={(e) => setEditingAdmin({ ...editingAdmin, nome: e.target.value })}
                      />
                    ) : (
                      a.nome
                    )}
                  </td>
                  <td>
                    {editingAdmin?.id === a.id ? (
                      <button onClick={saveAdminEdit}>💾</button>
                    ) : (
                      <>
                        <button onClick={() => setEditingAdmin(a)}>✏️</button>
                        {a.username !== "admin" && <button onClick={() => deleteAdmin(a.id)}>🗑️</button>}
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ==================== ALUNOS ==================== */}
        <section>
          <h2>👩‍🎓 Alunos</h2>
          <div className="form-inline">
            <input
              placeholder="Matrícula"
              value={formStudent.matricula}
              onChange={(e) => setFormStudent({ ...formStudent, matricula: e.target.value })}
            />
            <input
              placeholder="Nome"
              value={formStudent.name}
              onChange={(e) => setFormStudent({ ...formStudent, name: e.target.value })}
            />
            <button onClick={addStudent}>Adicionar</button>
          </div>

          <table>
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Nome</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.matricula}>
                  <td>{s.matricula}</td>
                  <td>
                    {editingStudent?.matricula === s.matricula ? (
                      <input
                        value={editingStudent.name}
                        onChange={(e) =>
                          setEditingStudent({ ...editingStudent, name: e.target.value })
                        }
                      />
                    ) : (
                      s.name
                    )}
                  </td>
                  <td>
                    {editingStudent?.matricula === s.matricula ? (
                      <button onClick={saveStudentEdit}>💾</button>
                    ) : (
                      <>
                        <button onClick={() => setEditingStudent(s)}>✏️</button>
                        <button onClick={() => deleteStudent(s.matricula)}>🗑️</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* ==================== AULAS ==================== */}
        <section>
          <h2>📚 Aulas</h2>
          <div className="form-inline">
            {Object.entries(formAula).map(([k, v]) => (
              <input
                key={k}
                placeholder={k}
                value={v}
                onChange={(e) => setFormAula({ ...formAula, [k]: e.target.value })}
              />
            ))}
            <button onClick={addAula}>Adicionar</button>
          </div>

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
                  <td>
                    {editingAula?.id === a.id ? (
                      <input
                        value={editingAula.disciplina}
                        onChange={(e) =>
                          setEditingAula({ ...editingAula, disciplina: e.target.value })
                        }
                      />
                    ) : (
                      a.disciplina
                    )}
                  </td>
                  <td>{a.horario}</td>
                  <td>{a.sala}</td>
                  <td>{a.dia_semana}</td>
                  <td>
                    {editingAula?.id === a.id ? (
                      <button onClick={saveAulaEdit}>💾</button>
                    ) : (
                      <>
                        <button onClick={() => setEditingAula(a)}>✏️</button>
                        <button onClick={() => deleteAula(a.id)}>🗑️</button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}
