"use client";

import React from "react";
import { Palette, Music, Drama, ShieldCheck, Sparkles, User, Award, BookOpen, Star } from "lucide-react";

interface AvatarBadgeProps {
  name: string;
  role?: string;
  discipline?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showIcon?: boolean;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({
  name = "User",
  role = "user",
  discipline = "",
  size = "md",
  className = "",
  showIcon = true,
}) => {
  const parts = name.trim().split(" ");
  const initials =
    parts.length >= 2
      ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
      : name.slice(0, 2).toUpperCase();

  const getGradient = () => {
    const lowerDisc = discipline.toLowerCase();
    const lowerRole = role.toLowerCase();

    if (lowerDisc.includes("art") || lowerDisc.includes("paint")) {
      return "from-[#f27a1a] via-[#f9a03f] to-[#d97706]";
    }
    if (lowerDisc.includes("music") || lowerDisc.includes("piano")) {
      return "from-[#6366f1] via-[#8b5cf6] to-[#4338ca]";
    }
    if (lowerDisc.includes("drama") || lowerDisc.includes("perform")) {
      return "from-[#10b981] via-[#059669] to-[#047857]";
    }
    if (lowerRole === "instructor") {
      return "from-[#f27a1a] to-[#1e3a5f]";
    }
    if (lowerRole === "parent") {
      return "from-[#142850] to-[#1e3a5f]";
    }
    return "from-[#f27a1a] to-[#f9a03f]";
  };

  const getIcon = () => {
    const lowerDisc = discipline.toLowerCase();
    const lowerRole = role.toLowerCase();

    if (lowerDisc.includes("art") || lowerDisc.includes("paint")) {
      return <Palette className="w-2.5 h-2.5 text-white" />;
    }
    if (lowerDisc.includes("music") || lowerDisc.includes("piano")) {
      return <Music className="w-2.5 h-2.5 text-white" />;
    }
    if (lowerDisc.includes("drama") || lowerDisc.includes("perform")) {
      return <Drama className="w-2.5 h-2.5 text-white" />;
    }
    if (lowerRole === "instructor") {
      return <ShieldCheck className="w-2.5 h-2.5 text-[#f9a03f]" />;
    }
    if (lowerRole === "parent") {
      return <User className="w-2.5 h-2.5 text-[#f9a03f]" />;
    }
    return <Sparkles className="w-2.5 h-2.5 text-[#f9a03f]" />;
  };

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px] font-bold rounded-lg",
    sm: "w-8 h-8 text-xs font-bold rounded-xl",
    md: "w-10 h-10 text-sm font-extrabold rounded-2xl",
    lg: "w-12 h-12 text-base font-extrabold rounded-2xl",
    xl: "w-16 h-16 text-xl font-black rounded-3xl",
  }[size];

  return (
    <div className={`relative inline-flex items-center justify-center shrink-0 ${className}`}>
      <div
        className={`${sizeClasses} bg-gradient-to-br ${getGradient()} text-white flex items-center justify-center shadow-md border border-white/20 select-none font-sans tracking-wider`}
      >
        {initials}
      </div>
      {showIcon && (
        <div className="absolute -bottom-1 -right-1 bg-[#0c1a3a] border border-white/30 rounded-full p-0.5 shadow-sm">
          {getIcon()}
        </div>
      )}
    </div>
  );
};
