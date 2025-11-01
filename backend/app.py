from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import json, os, heapq

# ========================
# CONFIGURAÇÃO INICIAL
# ========================
BASE_DIR = os.path.dirname(__file__)
app = Flask(__name__)

# ✅ Configuração do CORS — permite o React (localhost:5173)
CORS(
    app,
    origins=["http://localhost:5173"],
    methods=["GET", "POST", "OPTIONS"],
    allow_headers=["Content-Type"]
)

# Banco de dados SQLite
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'campusgo.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)

# ========================
# MODELOS (TABELAS)
# ========================
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(50), unique=True, nullable=False)
    nome = db.Column(db.String(120), nullable=False)
    aulas = db.relationship("Aula", backref="student", lazy=True)

class Aula(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"))
    disciplina = db.Column(db.String(120))
    horario = db.Column(db.String(50))
    sala = db.Column(db.String(50))
    sala_id = db.Column(db.String(20))
    data = db.Column(db.String(20))
    dia_semana = db.Column(db.String(30))

# ========================
# MAPA / GRAFO
# ========================
with open(os.path.join(BASE_DIR, "data", "map.json"), "r", encoding="utf-8") as f:
    MAP = json.load(f)

GRAPH = {nid: [] for nid in MAP["nodes"]}
for e in MAP["edges"]:
    GRAPH[e["from"]].append((e["to"], e.get("w", 1)))
    GRAPH[e["to"]].append((e["from"], e.get("w", 1)))

def shortest_path(start, goal):
    dist = {n: float("inf") for n in GRAPH}
    prev = {n: None for n in GRAPH}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == goal: break
        if d > dist[u]: continue
        for v, w in GRAPH[u]:
            nd = d + w
            if nd < dist[v]:
                dist[v] = nd
                prev[v] = u
                heapq.heappush(pq, (nd, v))
    if dist[goal] == float("inf"):
        return []
    path, cur = [], goal
    while cur:
        path.append(cur)
        cur = prev[cur]
    path.reverse()
    return [{"id": n, **MAP["nodes"][n]} for n in path]

# ========================
# ROTAS PRINCIPAIS
# ========================

@app.route('/')
def home():
    return "✅ Backend CampusGO rodando com banco SQLite!"

@app.route('/map-data')
def map_data():
    return jsonify(MAP)

@app.route('/route')
def route():
    origin = request.args.get("origin")
    dest = request.args.get("dest")
    if origin not in GRAPH or dest not in GRAPH:
        return jsonify({"error": "origem/destino inválido"}), 400
    return jsonify({"path": shortest_path(origin, dest)})

# ========================
# SUPORTE GLOBAL A CORS / OPTIONS
# ========================
@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        return '', 200

# ========================
# ROTA DE LOGIN
# ========================
@app.route('/login', methods=['POST'])
def login():
    body = request.json
    print("📩 Requisição recebida no /login:", body)
    matricula = body.get("matricula", "").strip()

    if not matricula:
        return jsonify({"error": "Matrícula não informada"}), 400

    aluno = Student.query.filter_by(matricula=matricula).first()
    if aluno:
        return jsonify({"matricula": aluno.matricula, "name": aluno.nome})
    return jsonify({"error": "Matrícula não encontrada"}), 401

# ========================
# ROTAS DE ALUNOS (CRUD)
# ========================
@app.route("/students", methods=["GET"])
def get_students():
    students = Student.query.all()
    return jsonify([{
        "matricula": s.matricula,
        "name": s.nome
    } for s in students])

@app.route("/students/<matricula>", methods=["GET"])
def get_student(matricula):
    s = Student.query.filter_by(matricula=matricula).first()
    if not s:
        return jsonify({"error": "Aluno não encontrado"}), 404
    aulas = [{"id": a.id, "disciplina": a.disciplina, "horario": a.horario,
              "sala": a.sala, "sala_id": a.sala_id,
              "data": a.data, "dia_semana": a.dia_semana} for a in s.aulas]
    return jsonify({
        "matricula": s.matricula,
        "name": s.nome,
        "aulas_da_semana": aulas
    })

@app.route("/students", methods=["POST"])
def add_student():
    data = request.json
    if not data.get("matricula") or not data.get("name"):
        return jsonify({"error": "Dados inválidos"}), 400
    if Student.query.filter_by(matricula=data["matricula"]).first():
        return jsonify({"error": "Matrícula já existe"}), 400
    new_s = Student(matricula=data["matricula"], nome=data["name"])
    db.session.add(new_s)
    db.session.commit()
    return jsonify({"message": "Aluno adicionado com sucesso"}), 201

@app.route("/students/<matricula>", methods=["PUT"])
def update_student(matricula):
    s = Student.query.filter_by(matricula=matricula).first()
    if not s:
        return jsonify({"error": "Aluno não encontrado"}), 404
    data = request.json
    s.nome = data.get("name", s.nome)
    db.session.commit()
    return jsonify({"message": "Aluno atualizado"})

@app.route("/students/<matricula>", methods=["DELETE"])
def delete_student(matricula):
    s = Student.query.filter_by(matricula=matricula).first()
    if not s:
        return jsonify({"error": "Aluno não encontrado"}), 404
    db.session.delete(s)
    db.session.commit()
    return jsonify({"message": "Aluno removido"})

# ========================
# ROTAS DE AULAS
# ========================
@app.route("/aulas", methods=["GET"])
def get_aulas():
    aulas = Aula.query.all()
    return jsonify([{
        "id": a.id,
        "disciplina": a.disciplina,
        "horario": a.horario,
        "sala": a.sala,
        "sala_id": a.sala_id,
        "data": a.data,
        "dia_semana": a.dia_semana,
        "matricula": a.student_id
    } for a in aulas])

@app.route("/aulas", methods=["POST"])
def add_aula():
    data = request.json
    required = ["disciplina", "horario", "sala", "sala_id", "data", "dia_semana", "matricula"]
    if not all(k in data for k in required):
        return jsonify({"error": "Dados incompletos"}), 400
    aluno = Student.query.filter_by(matricula=data["matricula"]).first()
    if not aluno:
        return jsonify({"error": "Aluno não existe"}), 404
    new_a = Aula(
        student_id=aluno.id,
        disciplina=data["disciplina"],
        horario=data["horario"],
        sala=data["sala"],
        sala_id=data["sala_id"],
        data=data["data"],
        dia_semana=data["dia_semana"]
    )
    db.session.add(new_a)
    db.session.commit()
    return jsonify({"message": "Aula adicionada"}), 201

@app.route("/aulas/<int:id>", methods=["DELETE"])
def delete_aula(id):
    a = Aula.query.get(id)
    if not a:
        return jsonify({"error": "Aula não encontrada"}), 404
    db.session.delete(a)
    db.session.commit()
    return jsonify({"message": "Aula removida"})

# ========================
# ROTA /CLASSES/<MATRICULA>
# ========================
@app.route('/classes/<matricula>')
def student_classes(matricula):
    aluno = Student.query.filter_by(matricula=matricula).first()
    if not aluno:
        return jsonify({"erro": "Aluno não encontrado"}), 404

    aulas = Aula.query.filter_by(student_id=aluno.id).all()
    aulas_formatadas = [
        {
            "disciplina": a.disciplina,
            "horário": a.horario,
            "sala": a.sala,
            "sala_id": a.sala_id,
            "data": a.data,
            "dia_semana": a.dia_semana
        } for a in aulas
    ]

    return jsonify({
        "matrícula": matricula,
        "nome": aluno.nome,
        "aulas_da_semana": aulas_formatadas
    })

# ========================
# CRIAÇÃO E POPULAÇÃO DO BANCO
# ========================
with app.app_context():
    db.create_all()

    if not Student.query.first():
        print("🧠 Inserindo dados de exemplo...")
        aluno = Student(matricula="1-2024233319", nome="Francisca Camilly Gomes de Oliveira")
        db.session.add(aluno)
        db.session.commit()

        aulas = [
            Aula(student_id=aluno.id, disciplina="Programação Web", horario="08:00-09:40", sala="Laboratório 1", sala_id="n3", data="2025-10-27", dia_semana="Segunda-feira"),
            Aula(student_id=aluno.id, disciplina="Redes de Computadores", horario="10:00-11:40", sala="Laboratório de Redes", sala_id="n4", data="2025-10-28", dia_semana="Terça-feira"),
            Aula(student_id=aluno.id, disciplina="Banco de Dados", horario="08:00-09:40", sala="Sala 101", sala_id="n5", data="2025-10-29", dia_semana="Quarta-feira"),
            Aula(student_id=aluno.id, disciplina="Engenharia de Software", horario="10:00-11:40", sala="Sala 201", sala_id="n6", data="2025-10-30", dia_semana="Quinta-feira"),
            Aula(student_id=aluno.id, disciplina="Arquitetura de Computadores", horario="08:00-09:40", sala="Sala 202", sala_id="n7", data="2025-10-31", dia_semana="Sexta-feira")
        ]
        db.session.add_all(aulas)
        db.session.commit()
        print("✅ Banco criado e populado com dados iniciais.")

# ========================
# EXECUÇÃO
# ========================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
