import React, { useEffect, useState } from "react";
import "./SplashScreen.css";

export default function SplashScreen({ onEnter }) {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "Enter") handleExit();
    };
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, []);

  const handleExit = () => {
    setFadeOut(true);
    setTimeout(() => onEnter(), 600); // tempo do fade-out
  };

  return (
    <div
      className={`splash-screen ${fadeOut ? "fade-out" : ""}`}
      onClick={handleExit}
      onTouchStart={handleExit}
    >
      <img
        src="/Logo-full-hd-transparente.png"
        alt="CampusGO"
        className="splash-logo"
      />
      <div className="touch-hint">
        <span className="touch-icon">👆</span>
        <span className="touch-text">Toque para continuar</span>
      </div>
    </div>
  );
}
