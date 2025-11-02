from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash
import json, os, heapq

# ========================
# 🔧 CONFIGURAÇÃO INICIAL
# ========================
BASE_DIR = os.path.dirname(__file__)
app = Flask(__name__)

# ✅ Permite o frontend (React) acessar a API
CORS(
    app,
    origins=["http://localhost:5173"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type"]
)

# Banco SQLite
app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{os.path.join(BASE_DIR, 'campusgo.db')}"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
db = SQLAlchemy(app)


# ========================
# 📦 MODELOS DO BANCO
# ========================

# 👨‍🎓 Alunos
class Student(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    matricula = db.Column(db.String(50), unique=True, nullable=False)
    nome = db.Column(db.String(120), nullable=False)
    aulas = db.relationship("Aula", backref="student", lazy=True)

# 📚 Aulas
class Aula(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey("student.id"))
    disciplina = db.Column(db.String(120))
    horario = db.Column(db.String(50))
    sala = db.Column(db.String(50))
    sala_id = db.Column(db.String(20))
    data = db.Column(db.String(20))
    dia_semana = db.Column(db.String(30))

# 👑 Administradores
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    nome = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)


# ========================
# 🗺️ MAPA / GRAFO
# ========================
with open(os.path.join(BASE_DIR, "data", "map.json"), "r", encoding="utf-8") as f:
    MAP = json.load(f)

GRAPH = {nid: [] for nid in MAP["nodes"]}
for e in MAP["edges"]:
    GRAPH[e["from"]].append((e["to"], e.get("w", 1)))
    GRAPH[e["to"]].append((e["from"], e.get("w", 1)))

def shortest_path(start, goal):
    """Algoritmo de Dijkstra — calcula o caminho mais curto."""
    dist = {n: float("inf") for n in GRAPH}
    prev = {n: None for n in GRAPH}
    dist[start] = 0
    pq = [(0, start)]
    while pq:
        d, u = heapq.heappop(pq)
        if u == goal:
            break
        if d > dist[u]:
            continue
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
# 🌐 ROTAS PRINCIPAIS
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
# ⚙️ SUPORTE GLOBAL A CORS / OPTIONS
# ========================
@app.before_request
def handle_options_request():
    if request.method == "OPTIONS":
        return '', 200


# ========================
# 🔐 LOGIN (ADMIN + ALUNO)
# ========================
@app.route('/login', methods=['POST'])
def login():
    body = request.json
    matricula = body.get("matricula", "").strip()
    senha = body.get("senha", "").strip() if body.get("senha") else ""

    if not matricula:
        return jsonify({"error": "Matrícula ou usuário não informado"}), 400

    # 👑 LOGIN DE ADMINISTRADOR
    admin = Admin.query.filter_by(username=matricula).first()
    if admin:
        if senha and admin.check_password(senha):
            role = "master" if admin.username == "admin" else "admin"
            return jsonify({
                "matricula": admin.username,
                "name": admin.nome,
                "role": role
            }), 200
        elif not senha:
            return jsonify({"error": "Senha não informada"}), 401
        else:
            return jsonify({"error": "Senha incorreta"}), 401

    # 👨‍🎓 LOGIN DE ALUNO
    aluno = Student.query.filter_by(matricula=matricula).first()
    if aluno:
        return jsonify({
            "matricula": aluno.matricula,
            "name": aluno.nome,
            "role": "student"
        }), 200

    return jsonify({"error": "Usuário não encontrado"}), 401


# ========================
# 🧾 CHECAGEM DE ADMIN
# ========================
@app.route("/admins/check", methods=["GET"])
def check_admin():
    username = request.args.get("username")
    admin = Admin.query.filter_by(username=username).first()
    if admin:
        return jsonify({"valid": True, "nome": admin.nome})
    return jsonify({"valid": False}), 404


# ========================
# 👑 CRUD DE ADMINISTRADORES
# ========================

@app.route("/admins", methods=["GET"])
def list_admins():
    admins = Admin.query.all()
    return jsonify([{"id": a.id, "username": a.username, "nome": a.nome} for a in admins])

@app.route("/admins", methods=["POST"])
def create_admin():
    """Cria um novo administrador."""
    data = request.json
    username = data.get("username")
    nome = data.get("nome")
    senha = data.get("senha")

    if not all([username, nome, senha]):
        return jsonify({"error": "Campos obrigatórios: username, nome e senha"}), 400

    if Admin.query.filter_by(username=username).first():
        return jsonify({"error": "Administrador já existe"}), 400

    novo = Admin(username=username, nome=nome)
    novo.set_password(senha)
    db.session.add(novo)
    db.session.commit()

    # 🟢 Retorna o ID real criado
    return jsonify({
        "message": f"Administrador '{username}' criado com sucesso",
        "id": novo.id
    }), 201

@app.route("/admins/<int:id>", methods=["PUT"])
def update_admin(id):
    """Atualiza nome ou senha de um administrador."""
    admin = Admin.query.get(id)
    if not admin:
        return jsonify({"error": "Administrador não encontrado"}), 404

    data = request.json
    admin.nome = data.get("nome", admin.nome)
    if data.get("senha"):
        admin.set_password(data["senha"])

    db.session.commit()
    return jsonify({"message": "Administrador atualizado com sucesso", "id": admin.id}), 200

@app.route("/admins/<int:id>", methods=["DELETE"])
def delete_admin(id):
    """Remove um administrador (exceto o master)."""
    admin = Admin.query.get(id)
    if not admin:
        return jsonify({"error": "Administrador não encontrado"}), 404

    if admin.username == "admin":
        return jsonify({"error": "Não é permitido remover o admin master."}), 403

    total_admins = Admin.query.count()
    if total_admins == 1:
        return jsonify({"error": "Não é possível remover o único administrador existente"}), 400

    db.session.delete(admin)
    db.session.commit()
    return jsonify({"message": "Administrador removido com sucesso"}), 200


# ========================
# 👨‍🎓 CRUD DE ALUNOS
# ========================

@app.route("/students", methods=["GET"])
def get_students():
    students = Student.query.all()
    return jsonify([{"id": s.id, "matricula": s.matricula, "name": s.nome} for s in students])

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
    return jsonify({"message": "Aluno adicionado com sucesso", "id": new_s.id}), 201


# ========================
# 📚 CRUD DE AULAS
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
    return jsonify({"message": "Aula adicionada com sucesso", "id": new_a.id}), 201


# ========================
# 🧱 CRIAÇÃO INICIAL DO BANCO
# ========================
with app.app_context():
    db.create_all()

    # Cria o admin master se ainda não existir
    if not Admin.query.filter_by(username="admin").first():
        print("👑 Criando admin master...")
        master = Admin(username="admin", nome="Administrador Geral")
        master.set_password("admin123")
        db.session.add(master)
        db.session.commit()
        print("✅ Admin master criado (login: admin / senha: admin123)")

    # Adiciona aluno e aulas de exemplo
    if not Student.query.first():
        aluno = Student(matricula="1-2024233319", nome="Francisca Camilly Gomes de Oliveira")
        db.session.add(aluno)
        db.session.commit()

        aulas = [
            Aula(student_id=aluno.id, disciplina="Programação Web", horario="08:00-09:40",
                 sala="Laboratório 1", sala_id="n3", data="2025-10-27", dia_semana="Segunda-feira"),
            Aula(student_id=aluno.id, disciplina="Redes de Computadores", horario="10:00-11:40",
                 sala="Laboratório de Redes", sala_id="n4", data="2025-10-28", dia_semana="Terça-feira")
        ]
        db.session.add_all(aulas)
        db.session.commit()


# ========================
# ▶️ EXECUÇÃO
# ========================
if __name__ == "__main__":
    app.run(debug=True, port=5000)
