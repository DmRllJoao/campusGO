import React, { useEffect, useState, useRef } from "react";
import "./MapView.css";

export default function MapView({ user, mode }) {
  const [mapData, setMapData] = useState(null);
  const [selected, setSelected] = useState(null);
  const [path, setPath] = useState([]);
  const [studentSchedule, setStudentSchedule] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

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
        .then((j) => setStudentSchedule(j.schedule || {}))
        .catch(() => setStudentSchedule(null));
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
          src="/logo-campusgo_curto.png"
          alt="Campus Go"
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
      <header className="topbar">
        <div className="topbar-content">
          <div className="user-info">
            👋 Olá, {user?.name || "Visitante"}{" "}
            {user?.matricula ? `(${user.matricula})` : ""}
          </div>
          <div className="search-bar">
            <input type="text" placeholder="Pesquise o local que você procura..." />
            <button>🔍</button>
          </div>
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
          <rect x={minX} y={minY} width={maxX - minX} height={maxY - minY} fill="#f7fbff" />

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
                <button className="btn primary" onClick={() => requestRoute(selected.id)}>
                  Traçar rota até aqui
                </button>
              </div>
            </>
          ) : (
            <div>Clique em um ponto do mapa</div>
          )}
        </div>
      </div>
    </div>
  );
}
