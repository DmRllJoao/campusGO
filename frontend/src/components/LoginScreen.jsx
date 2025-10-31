import React, {useState} from "react";

export default function LoginScreen({onLogin,onVisitor}){
  const [matricula, setMatricula] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(){
    setError("");
    if(!matricula){
      setError("Digite sua matrícula ou entre como visitante.");
      return;
    }
    try{
      const res = await fetch("http://localhost:5000/login",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({matricula})
      });
      if(res.ok){
        const j = await res.json();
        onLogin(j.matricula, j.name);
      }else{
        const j = await res.json();
        setError(j.error || "Erro no login");
      }
    }catch(err){
      setError("Erro ao conectar com o servidor.");
    }
  }

  return (
    <div className="login-screen">
      <div className="card">
        <div className="logo"><img src="public\logo-campusgo_curto.png"></img></div>
          <p className="subtitle"></p> 


        <div class="input-group">
            <input type="text" placeholder="Digite sua matrícula" value={matricula} onChange={e=>setMatricula(e.target.value)} />
            <button class="btn-entrar" onClick={handleLogin}>Entrar</button>
        </div>
        
        {error && <div className="error">{error}</div>}

        <div className="row">
          
          <button className="btn ghost" onClick={onVisitor}>Acessar como visitante</button>
        </div>
        
        <footer className="foot">Projeto de Extensão — UNIFAMETRO</footer>
      </div>
    </div>
  );
}
