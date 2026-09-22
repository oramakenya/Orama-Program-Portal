"use client";

import React, { useState, useEffect } from "react";
import { LoginForm } from "@/components/LoginForm";
import { ParentView } from "@/components/ParentView";
import { InstructorView } from "@/components/InstructorView";

export default function HomePage() {
  const [sessionData, setSessionData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Restore session from sessionStorage if available
    try {
      const saved = sessionStorage.getItem("orama_portal_session");
      if (saved) {
        setSessionData(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Session restore error:", e);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleLoginSuccess = (data: any) => {
    setSessionData(data);
    try {
      sessionStorage.setItem("orama_portal_session", JSON.stringify(data));
    } catch (e) {
      console.error("Session save error:", e);
    }
  };

  const handleLogout = () => {
    setSessionData(null);
    try {
      sessionStorage.removeItem("orama_portal_session");
    } catch (e) {
      console.error("Session clear error:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0c1a3a] flex flex-col items-center justify-center text-white">
        <div className="w-10 h-10 border-4 border-[#f27a1a] border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-sm font-semibold text-gray-300">Initializing ORAMA Creative Arts Portal...</p>
      </div>
    );
  }

  if (!sessionData) {
    return <LoginForm onLoginSuccess={handleLoginSuccess} />;
  }

  if (sessionData.user?.role === "instructor") {
    return <InstructorView loginData={sessionData} onLogout={handleLogout} />;
  }

  return <ParentView loginData={sessionData} onLogout={handleLogout} />;
}
