from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
import os

db = SQLAlchemy()

# ========================
# MODELOS DO BANCO DE DADOS
# ========================

class Student(db.Model):
    __tablename__ = "students"

    matricula = db.Column(db.String(20), primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relacionamento com aulas
    aulas = db.relationship("Aula", backref="student", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Student {self.matricula} - {self.name}>"


class Aula(db.Model):
    __tablename__ = "aulas"

    id = db.Column(db.Integer, primary_key=True)
    disciplina = db.Column(db.String(100), nullable=False)
    horario = db.Column(db.String(50), nullable=False)
    sala = db.Column(db.String(100), nullable=False)
    sala_id = db.Column(db.String(20), nullable=False)
    data = db.Column(db.String(20))
    dia_semana = db.Column(db.String(20))
    student_matricula = db.Column(db.String(20), db.ForeignKey("students.matricula"), nullable=False)

    def __repr__(self):
        return f"<Aula {self.disciplina} ({self.sala})>"

from werkzeug.security import generate_password_hash, check_password_hash

# ========================
# NOVO MODELO DE ADMIN
# ========================
class Admin(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password_hash = db.Column(db.String(200), nullable=False)
    nome = db.Column(db.String(120), nullable=False)

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)
