from flask import Flask, jsonify, request
from flask_cors import CORS
import json, os, heapq

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)

# Carregar dados
with open(os.path.join(BASE_DIR, "data", "map.json"), "r", encoding="utf-8") as f:
    MAP = json.load(f)

with open(os.path.join(BASE_DIR, "data", "students.json"), "r", encoding="utf-8") as f:
    STUDENTS = json.load(f)

# Construir grafo
GRAPH = {}
for nid in MAP["nodes"]:
    GRAPH[nid] = []
for e in MAP["edges"]:
    GRAPH[e["from"]].append((e["to"], e.get("w",1)))
    GRAPH[e["to"]].append((e["from"], e.get("w",1)))

# Função Dijkstra
def shortest_path(start, goal):
    dist = {n: float("inf") for n in GRAPH}
    prev = {n: None for n in GRAPH}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d,u = heapq.heappop(pq)
        if u == goal: break
        if d > dist[u]: continue
        for v,w in GRAPH[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                prev[v] = u
                heapq.heappush(pq,(nd,v))
    if dist[goal] == float("inf"):
        return []
    # reconstruir caminho
    path = []
    cur = goal
    while cur:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    # converter para coordenadas
    return [{"id":MAP["nodes"][n]["id"],"x":MAP["nodes"][n]["x"],"y":MAP["nodes"][n]["y"],"name":MAP["nodes"][n].get("name","")} for n in path]

# Rotas
@app.route('/')
def home():
    return "Backend está rodando"

@app.route('/map-data')
def map_data():
    return jsonify(MAP)

@app.route('/classes/<matricula>')
def student_classes(matricula):
    aluno = STUDENTS.get(matricula)
    if not aluno:
        return jsonify({"erro": "Aluno não encontrado"}), 404

    nome = aluno.get("name", "Aluno")

    # Tenta pegar aulas_da_semana ou schedule (caso antigo)
    aulas = aluno.get("aulas_da_semana") or aluno.get("schedule", {})

    aulas_formatadas = []

    # Caso o formato antigo ainda esteja em uso (dict de datas)
    if isinstance(aulas, dict):
        for data, materias in aulas.items():
            for materia in materias:
                aulas_formatadas.append({
                    "data": data,
                    "disciplina": materia.get("subject"),
                    "horário": materia.get("time"),
                    "sala": materia.get("room_node"),
                    "sala_id": materia.get("room_node")
                })

    # Caso seja o novo formato (lista pronta)
    elif isinstance(aulas, list):
        aulas_formatadas = aulas

    return jsonify({
        "matrícula": matricula,
        "nome": nome,
        "aulas_da_semana": aulas_formatadas
    })



@app.route('/login', methods=['POST'])
def login():
    body = request.json
    matricula = body.get("matricula", "").strip()

    if not matricula:
        return jsonify({"error": "Matrícula não informada"}), 400

    aluno = STUDENTS.get(matricula)
    if aluno:
        return jsonify({
            "matricula": matricula,
            "name": aluno.get("name"),
            "role": aluno.get("role", "student")
        })

    return jsonify({"error": "Matrícula não encontrada"}), 401


@app.route('/route')
def route():
    origin = request.args.get("origin")
    dest = request.args.get("dest")
    if origin not in GRAPH or dest not in GRAPH:
        return jsonify({"error":"origem/destino inválido"}), 400
    return jsonify({"path": shortest_path(origin, dest)})

# Rodar app
if __name__ == "__main__":
    app.run(debug=True, port=5000)
