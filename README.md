# Campus Go - Package ready to run

Este pacote contém uma versão inicial do *Campus Go*:
- Frontend: React + Vite
- Backend: Flask (mock API com Dijkstra para rotas)
- Arquivos de exemplo (mapa, estudantes) e assets (planta, logo, welcome image)

## Como rodar

### Backend (Flask)
```
cd backend
python -m venv venv
# Linux / Mac
source venv/bin/activate
# Windows
# venv\Scripts\activate
pip install -r requirements.txt
python app.py
```
Servidor rodará em http://127.0.0.1:5000

### Frontend (React + Vite)
Em outro terminal:
```
cd frontend
npm install
npm run dev
```
Vite normalmente abre em http://localhost:5173

### Observações
- Substitua `backend/data/map.json` pelo mapa do seu campus (nodes + edges).
- Substitua `backend/data/students.json` com dados reais ou integre à API da instituição.
- A planta baixa SVG enviada foi copiada para `frontend/src/assets/plant.svg`.
