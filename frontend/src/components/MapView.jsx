import React, { useEffect, useState, useRef } from "react";
import "./MapView.css";


export default function MapView({ user, mode, onLogout }) {

  const [mapData, setMapData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [path, setPath] = useState([]);
  const [studentSchedule, setStudentSchedule] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [showPresencePopup, setShowPresencePopup] = useState(false);

  // Zoom e Pan
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const svgRef = useRef();
  const isPanning = useRef(false);
  const startPan = useRef({ x: 0, y: 0 });

  useEffect(() => {
  fetch("http://localhost:5000/map-data")
    .then((r) => r.json())
    .then(setMapData);

  if (mode === "student" && user?.matricula) {
    fetch(`http://localhost:5000/classes/${user.matricula}`)
      .then((r) => r.json())
      .then((j) => {
        console.log("📘 Retorno do backend /classes:", j);
        if (j.aulas_da_semana && j.aulas_da_semana.length > 0) {
          setStudentSchedule(j.aulas_da_semana);
        } else {
          console.warn("⚠️ Nenhuma aula encontrada.");
          setStudentSchedule([]);
        }
      })
      .catch((err) => {
        console.error("❌ Erro ao buscar aulas:", err);
        setStudentSchedule([]);
      });
  }
}, [mode, user]);



  async function requestRoute(destNode) {
    const origin = "n1";
    const res = await fetch(
      `http://localhost:5000/route?origin=${origin}&dest=${destNode}`
    );
    if (res.ok) {
      const j = await res.json();
      setPath(j.path || []);
    }
  }

  function handleWheel(e) {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    setZoom((z) => Math.min(Math.max(0.5, z + delta), 3));
  }

  function handleMouseDown(e) {
    isPanning.current = true;
    startPan.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  }

  function handleMouseMove(e) {
    if (!isPanning.current) return;
    setOffset({
      x: e.clientX - startPan.current.x,
      y: e.clientY - startPan.current.y,
    });
  }

  function handleMouseUp() {
    isPanning.current = false;
  }
  // 💤 Detecta inatividade e pergunta se o usuário ainda está presente
useEffect(() => {
  let inactivityTimer;
  let warningTimer;

  const handleActivity = () => {
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
    inactivityTimer = setTimeout(() => {
      setShowPresencePopup(true);
      // Se o usuário não responder em 15s → volta automaticamente
      warningTimer = setTimeout(() => {
        setShowPresencePopup(false);
        onLogout();
      }, 15000);
    }, 30000); // 30 segundos sem atividade
  };

  const events = ["mousemove", "keydown", "click", "wheel"];
  events.forEach((ev) => window.addEventListener(ev, handleActivity));

  handleActivity();

  return () => {
    events.forEach((ev) => window.removeEventListener(ev, handleActivity));
    clearTimeout(inactivityTimer);
    clearTimeout(warningTimer);
  };
}, [onLogout]);


  if (!mapData) return <div className="loading">Carregando mapa...</div>;

  const nodes = Object.values(mapData.nodes);
  const allX = nodes.map((n) => n.x);
  const allY = nodes.map((n) => n.y);
  const minX = Math.min(...allX) - 50;
  const maxX = Math.max(...allX) + 50;
  const minY = Math.min(...allY) - 50;
  const maxY = Math.max(...allY) + 50;
  const vb = `${minX} ${minY} ${maxX - minX} ${maxY - minY}`;


  
  return (
    <div className="map-container">
      {/* BOTÃO HAMBÚRGUER */}
      <div
        className={`menu-toggle ${menuOpen ? "open" : ""}`}
        onClick={() => setMenuOpen(!menuOpen)}
      >
        <span></span>
        <span></span>
        <span></span>
      </div>

      {/* MENU LATERAL */}
      <aside className={`sidebar ${menuOpen ? "visible" : ""}`}>
        <img
          src="/Logo-branca-transparente.png"
          alt="CampusGO"
          className="logo"
        />
        <nav>
          <button>🗺️ Mapa</button>
          <button>☕ Cafeteria</button>
          <button>🚻 Banheiros</button>
          <button>🎓 Salas de Aula</button>
          <button>📚 Biblioteca</button>
        </nav>
      </aside>

      {/* TOPO */}
      <header className={`topbar ${menuOpen ? "shifted" : ""}`}>
        <div className="topbar-content">
          <div className="user-info">
            👋 Olá, {user?.name || "Visitante"}{" "}
            {user?.matricula ? `(${user.matricula})` : ""}
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Pesquise o local que você procura..."
            />
            <button>🔍</button>
          </div>
          <button className="logout-btn" onClick={onLogout}>
  🚪 Sair
</button>

        </div>
      </header>

      {/* MAPA */}
      <div
        className={`map-wrapper ${menuOpen ? "shrink" : ""}`}
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          ref={svgRef}
          viewBox={vb}
          className="map-svg"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "center center",
            transition: isPanning.current ? "none" : "transform 0.1s ease",
          }}
        >
          <rect
            x={minX}
            y={minY}
            width={maxX - minX}
            height={maxY - minY}
            fill="#f7fbff"
          />

          {mapData.edges.map((e, i) => {
            const a = mapData.nodes[e.from];
            const b = mapData.nodes[e.to];
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="#cbd5e1"
                strokeWidth={6}
                strokeLinecap="round"
              />
            );
          })}

          {path.length > 0 && (
            <polyline
              className="route-line"
              points={path.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="#00b894"
              strokeWidth={10}
              strokeLinejoin="round"
              strokeLinecap="round"
              opacity={0.9}
            />
          )}

          {nodes.map((n) => {
            const isTarget = selected && selected.id === n.id;
            return (
              <g
                key={n.id}
                transform={`translate(${n.x},${n.y})`}
                className="node-group"
                onClick={() => setSelected(n)}
              >
                <circle
                  r={isTarget ? 14 : 10}
                  fill={isTarget ? "#00b894" : "#0984e3"}
                  stroke="#ffffff"
                  strokeWidth={2}
                />
                <title>{n.name}</title>
              </g>
            );
          })}
        </svg>

        {/* PAINEL DE INFORMAÇÕES */}
        <div className="info-panel">
          <h3>Informações</h3>
          {selected ? (
            <>
              <div>
                <b>{selected.name}</b>
              </div>
              <div>ID: {selected.id}</div>
              <div style={{ marginTop: 8 }}>
                <button
                  className="btn primary"
                  onClick={() => requestRoute(selected.id)}
                >
                  Traçar rota até aqui
                </button>
              </div>
            </>
          ) : (
            <div>Clique em um ponto do mapa</div>
          )}
        </div>

        {/* CRONOGRAMA */}
        {mode === "student" && studentSchedule && studentSchedule.length > 0 && (
  <div className="schedule-panel">
    <h3>📅 Aulas da Semana</h3>
    <ul>
      {studentSchedule.map((aula, i) => (
        <li
          key={i}
          onClick={() => {
            setSelected({
              id: aula.sala_id,
              name: aula.sala
            });
            requestRoute(aula.sala_id);
          }}
          className="schedule-item"
          title={`Clique para ver o caminho até ${aula.sala}`}
        >
          <div className="aula-header">
            <strong>{aula.disciplina}</strong>
            <span className="dia">{aula.dia_semana}</span>
          </div>
          <div className="aula-body">
            <span>{aula.horário}</span> — <b>{aula.sala}</b>
          </div>
        </li>
      ))}
    </ul>
  </div>
)}


      </div>
      {/* POPUP DE PRESENÇA */}
{showPresencePopup && (
  <div className="presence-popup">
    <div className="presence-box">
      <h3>👋 Tem alguém aí?</h3>
      <p>O sistema voltará à tela inicial em 15 segundos se não houver resposta.</p>
      <div className="presence-buttons">
        <button
          className="btn stay"
          onClick={() => {
            setShowPresencePopup(false);
          }}
        >
          ✅ Estou aqui
        </button>
        <button
          className="btn exit"
          onClick={() => {
            setShowPresencePopup(false);
            onLogout();
          }}
        >
          🚪 Sair agora
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
