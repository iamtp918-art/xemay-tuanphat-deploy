import { useState, useEffect } from "react";
import { LOGO_URL } from "@shared/constants";

export default function LoadingScreen() {
  const [show, setShow] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const fadeTimer = setTimeout(() => setFadeOut(true), 1500);
    const hideTimer = setTimeout(() => setShow(false), 1900);
    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(hideTimer);
    };
  }, []);

  if (!show) return null;

  return (
    <>
      <style>{`
        @keyframes logoBreath {
          0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 62, 62, 0.4); }
          50% { transform: scale(1.06); box-shadow: 0 0 30px 10px rgba(229, 62, 62, 0.3); }
        }
        @keyframes textReveal {
          0% { transform: translateY(20px); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes progressBar {
          0% { width: 0%; }
          100% { width: 100%; }
        }
        @keyframes screenFadeOut {
          0% { opacity: 1; }
          100% { opacity: 0; }
        }
      `}</style>
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{
          backgroundColor: "#F8F8F8",
          animation: fadeOut ? "screenFadeOut 0.4s ease-out forwards" : "none",
        }}
      >
        <div className="flex flex-col items-center">
          <div
            style={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              overflow: "hidden",
              animation: "logoBreath 2s ease-in-out infinite",
            }}
          >
            <img
              src={LOGO_URL}
              alt="Xe Máy Tuấn Phát"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                borderRadius: "50%",
              }}
            />
          </div>
          <div
            style={{
              marginTop: 20,
              animation: "textReveal 0.6s ease-out 0.3s both",
            }}
          >
            <h1
              style={{
                fontSize: 20,
                fontWeight: 800,
                color: "#1A1A1A",
                letterSpacing: "0.5px",
                textAlign: "center",
                fontFamily: "'Be Vietnam Pro', sans-serif",
                margin: 0,
              }}
            >
              XE MÁY TUẤN PHÁT
            </h1>
            <p
              style={{
                fontSize: 12,
                color: "#666666",
                textAlign: "center",
                marginTop: 4,
                fontFamily: "'Be Vietnam Pro', sans-serif",
              }}
            >
              Uy Tín - Chất Lượng - Giá Tốt
            </p>
          </div>
          <div
            style={{
              marginTop: 24,
              width: 180,
              height: 3,
              backgroundColor: "#E5E5E5",
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                backgroundColor: "#E53E3E",
                borderRadius: 2,
                animation: "progressBar 1.5s ease-in-out forwards",
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
