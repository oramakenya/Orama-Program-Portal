"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Users,
  CheckSquare,
  Award,
  BookOpen,
  MessageSquare,
  LogOut,
  Sparkles,
  Plus,
  Send,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  User,
  Star,
  Check,
  Search,
  Layers,
  LayoutDashboard,
  Lock,
  PlusCircle,
  Trash2,
  Edit3,
  FolderKanban,
  Sliders,
  FileCode,
  ListTree,
} from "lucide-react";
import { AvatarBadge } from "./AvatarBadge";

interface InstructorViewProps {
  loginData: any;
  onLogout: () => void;
}

export const InstructorView: React.FC<InstructorViewProps> = ({ loginData, onLogout }) => {
  const [activeTab, setActiveTab] = useState<
    "studio" | "roster" | "attendance" | "grades" | "chat"
  >("studio");

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [portalData, setPortalData] = useState<any>(null);

  // Form states for Attendance
  const [attStudentId, setAttStudentId] = useState("");
  const [attSessionTitle, setAttSessionTitle] = useState("Weekly Masterclass & Technique");
  const [attDate, setAttDate] = useState(new Date().toISOString().split("T")[0]);
  const [attStatus, setAttStatus] = useState("Present");
  const [attNotes, setAttNotes] = useState("");
  const [submittingAtt, setSubmittingAtt] = useState(false);
  const [attSuccess, setAttSuccess] = useState<string | null>(null);

  // Form states for Gradebook
  const [grStudentId, setGrStudentId] = useState("");
  const [grCategory, setGrCategory] = useState("Canvas Project");
  const [grTitle, setGrTitle] = useState("");
  const [grScore, setGrScore] = useState(92);
  const [grRemarks, setGrRemarks] = useState("");
  const [submittingGr, setSubmittingGr] = useState(false);
  const [grSuccess, setGrSuccess] = useState<string | null>(null);

  // Form states for Course Studio & Lesson Authoring (ScienceSoft reference feature)
  const [lpWeek, setLpWeek] = useState(6);
  const [lpTitle, setLpTitle] = useState("");
  const [lpObjectives, setLpObjectives] = useState("");
  const [lpMaterials, setLpMaterials] = useState("");
  const [lpAssignment, setLpAssignment] = useState("");
  const [submittingLp, setSubmittingLp] = useState(false);
  const [lpSuccess, setLpSuccess] = useState<string | null>(null);

  // Form states for Chat
  const [selectedParentId, setSelectedParentId] = useState<string>("");
  const [selectedChatStudentId, setSelectedChatStudentId] = useState<string>("");
  const [chatInput, setChatInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  const instructorObj = loginData.instructor;

  const fetchPortalData = async () => {
    setLoadingData(true);
    try {
      const res = await fetch(
        `/api/portal/data?role=instructor&instructorId=${instructorObj.id}`
      );
      const data = await res.json();
      if (data.success) {
        setPortalData(data);
        if (data.roster && data.roster.length > 0) {
          if (!attStudentId) setAttStudentId(data.roster[0].id);
          if (!grStudentId) setGrStudentId(data.roster[0].id);
          if (!selectedParentId && data.roster[0].parentId) {
            setSelectedParentId(data.roster[0].parentId);
            setSelectedChatStudentId(data.roster[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching instructor data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    fetchPortalData();
  }, []);

  const roster = portalData?.roster || [];
  const attendance = portalData?.attendance || [];
  const grades = portalData?.grades || [];
  const lessonPlans = portalData?.lessonPlans || [];
  const chats = portalData?.chats || [];

  // Submit attendance
  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!attStudentId || !attSessionTitle || !attDate) return;

    setSubmittingAtt(true);
    setAttSuccess(null);
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: attStudentId,
          instructorId: instructorObj.id,
          discipline: instructorObj.discipline,
          date: attDate,
          sessionTitle: attSessionTitle,
          status: attStatus,
          notes: attNotes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAttSuccess("Attendance recorded!");
        setAttNotes("");
        fetchPortalData();
        setTimeout(() => setAttSuccess(null), 3000);
      }
    } catch (err: any) {
      alert("Error marking attendance: " + err.message);
    } finally {
      setSubmittingAtt(false);
    }
  };

  // Submit grade
  const handlePostGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grStudentId || !grTitle || !grCategory) return;

    setSubmittingGr(true);
    setGrSuccess(null);
    try {
      const res = await fetch("/api/grades", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: grStudentId,
          instructorId: instructorObj.id,
          discipline: instructorObj.discipline,
          category: grCategory,
          title: grTitle,
          score: grScore,
          maxScore: 100,
          remarks: grRemarks,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGrSuccess("Evaluation successfully posted!");
        setGrTitle("");
        setGrRemarks("");
        fetchPortalData();
        setTimeout(() => setGrSuccess(null), 3000);
      }
    } catch (err: any) {
      alert("Error posting grade: " + err.message);
    } finally {
      setSubmittingGr(false);
    }
  };

  // Submit lesson plan
  const handleCreateLessonPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lpTitle || !lpObjectives) return;

    setSubmittingLp(true);
    setLpSuccess(null);
    try {
      const res = await fetch("/api/lesson-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instructorId: instructorObj.id,
          discipline: instructorObj.discipline,
          weekNumber: lpWeek,
          title: lpTitle,
          objectives: lpObjectives,
          materialsNeeded: lpMaterials,
          practiceAssignment: lpAssignment,
          status: "Published",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setLpSuccess("Lesson plan published to student portal!");
        setLpTitle("");
        setLpObjectives("");
        setLpMaterials("");
        setLpAssignment("");
        fetchPortalData();
        setTimeout(() => setLpSuccess(null), 3000);
      }
    } catch (err: any) {
      alert("Error creating lesson plan: " + err.message);
    } finally {
      setSubmittingLp(false);
    }
  };

  // Send Chat message
  const handleSendChatMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !selectedParentId || !selectedChatStudentId) return;

    setSendingChat(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: selectedParentId,
          instructorId: instructorObj.id,
          studentId: selectedChatStudentId,
          senderRole: "instructor",
          senderName: loginData.user.name,
          message: chatInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatInput("");
        fetchPortalData();
      }
    } catch (err) {
      console.error("Error sending chat:", err);
    } finally {
      setSendingChat(false);
    }
  };

  const activeChatMessages = chats.filter(
    (m: any) => m.parentId === selectedParentId && m.studentId === selectedChatStudentId
  );

  const selectedRosterItem = roster.find((r: any) => r.parentId === selectedParentId);

  return (
    <div className="min-h-screen bg-[#0c1a3a] text-[#faf8f5] flex flex-col font-sans border-t-4 border-[#f27a1a]">
      {/* INVERTED TOP BAR - DEEP NAVY LMS HEADER */}
      <header className="bg-[#081226] border-b border-white/10 sticky top-0 z-30 shadow-2xl">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f27a1a] to-[#f9a03f] flex items-center justify-center font-bold text-white shadow-lg shadow-[#f27a1a]/30">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif font-extrabold text-lg text-white tracking-tight">
                  ORAMA <span className="gradient-text">Instructor Studio</span>
                </span>
                <span className="block text-[10px] text-emerald-400 font-mono uppercase tracking-wider font-semibold">
                  Program Portal
                </span>
              </div>
            </div>

            {/* Quick Search Bar */}
            <div className="flex-1 max-w-md hidden md:block">
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search students, lesson modules, evaluations..."
                  className="w-full pl-10 pr-4 py-2 bg-[#0c1a3a] border border-white/20 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#f27a1a]"
                />
              </div>
            </div>

            {/* Discipline Tag & User profile */}
            <div className="flex items-center gap-4">
              <div className="hidden lg:flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#f27a1a]" />
                <span className="text-gray-400">Faculty Discipline:</span>
                <span className="font-bold text-[#f9a03f]">{instructorObj.discipline}</span>
              </div>

              <div className="flex items-center gap-3 pl-3 border-l border-white/10">
                <AvatarBadge
                  name={loginData.user.name}
                  role="instructor"
                  discipline={instructorObj.discipline}
                  size="md"
                />
                <div className="text-right hidden xl:block">
                  <div className="text-xs font-bold text-white">{loginData.user.name}</div>
                  <div className="text-[10px] text-[#f27a1a] font-mono">{instructorObj.instructorCode}</div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-white/5 text-gray-400 hover:text-red-400 hover:bg-white/10 transition border border-white/10"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER WITH SIDEBAR & MAIN STUDIO CANVAS */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row">
        {/* LEFT FACULTY SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#081226] text-white border-r border-white/10 shrink-0 p-4 space-y-6">
          {/* Instructor Bio Box */}
          <div className="p-4 rounded-2xl bg-[#0c1a3a] border border-white/10 space-y-2">
            <div className="flex items-center gap-3">
              <AvatarBadge
                name={loginData.user.name}
                role="instructor"
                discipline={instructorObj.discipline}
                size="lg"
              />
              <div>
                <h3 className="font-bold text-sm text-white">{loginData.user.name}</h3>
                <span className="text-[10px] text-[#f27a1a] font-mono block">
                  {instructorObj.instructorCode}
                </span>
                <span className="text-[10px] text-gray-400 block mt-0.5">{instructorObj.discipline}</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1 text-xs">
            <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Program Portal Navigation
            </div>

            <button
              onClick={() => setActiveTab("studio")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "studio"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-lg shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Course & Lesson Authoring</span>
            </button>

            <button
              onClick={() => setActiveTab("roster")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "roster"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-lg shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Class Roster</span>
              </div>
              <span className="text-[10px] font-mono bg-white/10 px-2 py-0.5 rounded-md">
                {roster.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "attendance"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-lg shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>Session Attendance</span>
            </button>

            <button
              onClick={() => setActiveTab("grades")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "grades"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-lg shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Gradebook & Evaluations</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-lg shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Parent Messaging</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </nav>
        </aside>

        {/* MAIN STUDIO WORKSPACE CANVAS */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto bg-[#0c1a3a]">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#f27a1a] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-300">Loading Instructor Studio Canvas...</p>
            </div>
          ) : (
            <>
              {/* FACULTY HERO KPI BANNER */}
              <div className="bg-gradient-to-r from-[#142850] via-[#0c1a3a] to-[#1e3a5f] text-white p-6 sm:p-8 rounded-3xl border border-white/10 shadow-2xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#f27a1a]" />
                    Course Creation & Studio Hub
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {instructorObj.discipline} Faculty Studio
                  </h2>
                  <p className="text-xs text-gray-300 mt-1">
                    Manage course modules, record skill evaluations, mark attendance, and publish lesson plans.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xl font-extrabold text-[#f9a03f]">{roster.length}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Enrolled Students
                    </div>
                  </div>
                  <div className="px-4 py-2.5 rounded-2xl bg-white/5 border border-white/10 text-center">
                    <div className="text-xl font-extrabold text-emerald-400">{lessonPlans.length}</div>
                    <div className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                      Published Plans
                    </div>
                  </div>
                </div>
              </div>

              {/* TAB 1: COURSE & LESSON AUTHORING STUDIO (ScienceSoft reference feature) */}
              {activeTab === "studio" && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
                  {/* Left Column: Lesson Authoring Form */}
                  <div className="lg:col-span-7 glass-dark rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    <h3 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-[#f27a1a]" />
                      Author & Publish Weekly Lesson Module
                    </h3>
                    <p className="text-xs text-gray-400 mb-6">
                      Design structured weekly learning objectives, materials lists, and homework assignments.
                    </p>

                    {lpSuccess && (
                      <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{lpSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleCreateLessonPlan} className="space-y-4 text-xs">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                            Week Number
                          </label>
                          <input
                            type="number"
                            min="1"
                            max="20"
                            value={lpWeek}
                            onChange={(e) => setLpWeek(Number(e.target.value))}
                            className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white font-mono focus:outline-none focus:border-[#f27a1a]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                            Lesson Module Title
                          </label>
                          <input
                            type="text"
                            required
                            value={lpTitle}
                            onChange={(e) => setLpTitle(e.target.value)}
                            placeholder="e.g. Acrylic Layering & Impasto Knife Study"
                            className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Learning Objectives
                        </label>
                        <textarea
                          rows={3}
                          required
                          value={lpObjectives}
                          onChange={(e) => setLpObjectives(e.target.value)}
                          placeholder="e.g. Master color harmony, light reflections, and palette knife sculpting."
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Required Studio Materials Needed
                        </label>
                        <input
                          type="text"
                          value={lpMaterials}
                          onChange={(e) => setLpMaterials(e.target.value)}
                          placeholder="e.g. Stretched Canvas 16x20, Heavy Body Acrylics, Palette Knives"
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Home Practice Assignment
                        </label>
                        <input
                          type="text"
                          value={lpAssignment}
                          onChange={(e) => setLpAssignment(e.target.value)}
                          placeholder="e.g. Complete 10x12 sunrise landscape study using palette knives only"
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingLp}
                        className="w-full py-3.5 bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white rounded-2xl font-bold shadow-xl shadow-[#f27a1a]/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submittingLp ? "Publishing Plan..." : "Publish Module to Portal"}
                      </button>
                    </form>
                  </div>

                  {/* Right Column: Active Published Plans Stream */}
                  <div className="lg:col-span-5 space-y-4">
                    <h4 className="text-sm font-bold text-white flex items-center gap-2">
                      <ListTree className="w-4 h-4 text-[#f27a1a]" />
                      Published Course Modules ({lessonPlans.length})
                    </h4>

                    <div className="space-y-4 max-h-[550px] overflow-y-auto pr-1">
                      {lessonPlans.map((lp: any) => (
                        <div key={lp.id} className="glass-dark rounded-2xl p-5 border border-white/10 text-xs">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-bold text-[#f9a03f] font-mono">Week {lp.weekNumber}</span>
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold uppercase">
                              Published
                            </span>
                          </div>

                          <h5 className="font-bold text-white text-sm">{lp.title}</h5>
                          <p className="text-gray-300 mt-2 line-clamp-2">{lp.objectives}</p>

                          {lp.practiceAssignment && (
                            <div className="mt-3 p-2.5 rounded-xl bg-white/5 border border-white/5 text-[11px] text-[#f9a03f]">
                              <strong>Assignment:</strong> {lp.practiceAssignment}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: CLASS ROSTER */}
              {activeTab === "roster" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-serif font-bold text-white flex items-center gap-2">
                      <Users className="w-6 h-6 text-[#f27a1a]" />
                      Enrolled Students Roster — {instructorObj.discipline}
                    </h3>
                    <span className="text-xs bg-[#142850] text-[#f9a03f] px-3 py-1 rounded-full border border-white/10 font-mono">
                      {roster.length} Enrolled
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {roster.map((std: any) => (
                      <div
                        key={std.id}
                        className="glass-dark rounded-3xl p-6 border border-white/10 hover:border-[#f27a1a]/50 transition relative overflow-hidden shadow-xl"
                      >
                        <div className="flex items-start gap-4">
                          <AvatarBadge
                            name={std.fullName}
                            role="student"
                            discipline={instructorObj.discipline}
                            size="xl"
                          />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="text-lg font-bold text-white">{std.fullName}</h4>
                              <span className="font-mono text-[11px] text-[#f9a03f] bg-black/40 px-2 py-0.5 rounded border border-white/10">
                                {std.studentCode}
                              </span>
                            </div>
                            <div className="text-xs text-gray-300 mt-1">
                              Level: <strong className="text-white">{std.gradeLevel}</strong> • Age: {std.age}
                            </div>
                            <div className="text-xs text-gray-400 mt-0.5">Schedule: {std.schedule}</div>

                            <div className="mt-4 pt-3 border-t border-white/10 space-y-1 text-xs">
                              <div className="text-gray-300">
                                Guardian: <strong className="text-white">{std.parentName}</strong>
                              </div>
                              <div className="text-gray-400 font-mono">
                                Phone: {std.parentPhone || "+256 700 000 000"}
                              </div>
                            </div>

                            <div className="mt-4 flex flex-wrap gap-2">
                              <button
                                onClick={() => {
                                  setAttStudentId(std.id);
                                  setActiveTab("attendance");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5"
                              >
                                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                                Attendance
                              </button>
                              <button
                                onClick={() => {
                                  setGrStudentId(std.id);
                                  setActiveTab("grades");
                                }}
                                className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold text-white transition flex items-center gap-1.5"
                              >
                                <Award className="w-3.5 h-3.5 text-[#f27a1a]" />
                                Evaluate
                              </button>
                              <button
                                onClick={() => {
                                  if (std.parentId) {
                                    setSelectedParentId(std.parentId);
                                    setSelectedChatStudentId(std.id);
                                    setActiveTab("chat");
                                  }
                                }}
                                className="px-3 py-1.5 rounded-xl bg-[#f27a1a] hover:bg-[#f9a03f] text-xs font-bold text-white transition flex items-center gap-1.5"
                              >
                                <MessageSquare className="w-3.5 h-3.5" />
                                Chat Parent
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 3: SESSION ATTENDANCE */}
              {activeTab === "attendance" && (
                <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    <h3 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2">
                      <CheckSquare className="w-6 h-6 text-emerald-400" />
                      Record Session Attendance
                    </h3>
                    <p className="text-xs text-gray-400 mb-6">
                      Log attendance records for discipline sessions. Parents see instant updates.
                    </p>

                    {attSuccess && (
                      <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{attSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handleMarkAttendance} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Select Student
                        </label>
                        <select
                          value={attStudentId}
                          onChange={(e) => setAttStudentId(e.target.value)}
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        >
                          {roster.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.studentCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                            Date
                          </label>
                          <input
                            type="date"
                            value={attDate}
                            onChange={(e) => setAttDate(e.target.value)}
                            className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                          />
                        </div>

                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                            Status
                          </label>
                          <select
                            value={attStatus}
                            onChange={(e) => setAttStatus(e.target.value)}
                            className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                          >
                            <option value="Present">Present</option>
                            <option value="Late">Late</option>
                            <option value="Excused">Excused</option>
                            <option value="Absent">Absent</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Session Focus Title
                        </label>
                        <input
                          type="text"
                          required
                          value={attSessionTitle}
                          onChange={(e) => setAttSessionTitle(e.target.value)}
                          placeholder="e.g. Masterclass #5: Impasto Canvas Layering"
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Session Notes / Remarks
                        </label>
                        <textarea
                          rows={3}
                          value={attNotes}
                          onChange={(e) => setAttNotes(e.target.value)}
                          placeholder="e.g. Excellent focus and posture during today's studio practice."
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingAtt}
                        className="w-full py-3.5 bg-[#f27a1a] hover:bg-[#f9a03f] text-white rounded-2xl font-bold shadow-lg shadow-[#f27a1a]/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submittingAtt ? "Submitting..." : "Save Attendance Record"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 4: GRADEBOOK EVALUATOR */}
              {activeTab === "grades" && (
                <div className="space-y-8 animate-fade-in max-w-2xl mx-auto">
                  <div className="glass-dark rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl">
                    <h3 className="text-xl font-serif font-bold text-white mb-2 flex items-center gap-2">
                      <Award className="w-6 h-6 text-[#f27a1a]" />
                      Post Skill Grade / Performance Evaluation
                    </h3>
                    <p className="text-xs text-gray-400 mb-6">
                      Record assessment scores out of 100 for your student.
                    </p>

                    {grSuccess && (
                      <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>{grSuccess}</span>
                      </div>
                    )}

                    <form onSubmit={handlePostGrade} className="space-y-4 text-xs">
                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Select Student
                        </label>
                        <select
                          value={grStudentId}
                          onChange={(e) => setGrStudentId(e.target.value)}
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        >
                          {roster.map((s: any) => (
                            <option key={s.id} value={s.id}>
                              {s.fullName} ({s.studentCode})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                            Category
                          </label>
                          <select
                            value={grCategory}
                            onChange={(e) => setGrCategory(e.target.value)}
                            className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                          >
                            <option value="Canvas Project">Canvas Project</option>
                            <option value="Performance Recital">Performance Recital</option>
                            <option value="Technique Assessment">Technique Assessment</option>
                            <option value="Theory Exam">Theory Exam</option>
                            <option value="Stage Monologue">Stage Monologue</option>
                          </select>
                        </div>

                        <div>
                          <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                            Score (Out of 100)
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            required
                            value={grScore}
                            onChange={(e) => setGrScore(Number(e.target.value))}
                            className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white font-mono font-bold text-sm focus:outline-none focus:border-[#f27a1a]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Evaluation Title
                        </label>
                        <input
                          type="text"
                          required
                          value={grTitle}
                          onChange={(e) => setGrTitle(e.target.value)}
                          placeholder="e.g. Expressionist Landscape Canvas Study"
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <div>
                        <label className="block font-semibold uppercase tracking-wider text-gray-300 mb-1.5">
                          Faculty Remarks & Feedback
                        </label>
                        <textarea
                          rows={3}
                          value={grRemarks}
                          onChange={(e) => setGrRemarks(e.target.value)}
                          placeholder="e.g. Exceptional spatial composition and vibrant brushwork."
                          className="w-full p-3 bg-[#081226] border border-white/20 rounded-2xl text-white focus:outline-none focus:border-[#f27a1a]"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={submittingGr}
                        className="w-full py-3.5 bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white rounded-2xl font-bold shadow-lg shadow-[#f27a1a]/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                      >
                        {submittingGr ? "Posting Grade..." : "Publish Grade Evaluation"}
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* TAB 5: PARENT MESSAGING */}
              {activeTab === "chat" && (
                <div className="glass-dark rounded-3xl border border-white/10 shadow-2xl overflow-hidden flex flex-col md:flex-row h-[600px] animate-fade-in">
                  <div className="w-full md:w-72 bg-[#081226] border-r border-white/10 p-4 flex flex-col">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#f27a1a]" />
                      Parent Contacts
                    </h4>

                    <div className="space-y-2 overflow-y-auto flex-1">
                      {roster.map((r: any) => (
                        <button
                          key={r.id}
                          onClick={() => {
                            if (r.parentId) {
                              setSelectedParentId(r.parentId);
                              setSelectedChatStudentId(r.id);
                            }
                          }}
                          className={`w-full text-left p-3 rounded-2xl transition flex items-center gap-3 ${
                            r.parentId === selectedParentId && r.id === selectedChatStudentId
                              ? "bg-[#f27a1a] text-white shadow-md shadow-[#f27a1a]/30"
                              : "bg-white/5 hover:bg-white/10 text-gray-300"
                          }`}
                        >
                          <AvatarBadge name={r.parentName} role="parent" size="md" />
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs truncate text-white">{r.parentName}</div>
                            <div className="text-[10px] text-gray-300 truncate">Student: {r.fullName}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col bg-[#0c1a3a]">
                    {selectedRosterItem ? (
                      <>
                        <div className="p-4 bg-[#081226] border-b border-white/10 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AvatarBadge name={selectedRosterItem.parentName} role="parent" size="md" />
                            <div>
                              <div className="font-bold text-sm text-white">
                                Chatting with {selectedRosterItem.parentName}
                              </div>
                              <div className="text-xs text-gray-400">
                                Parent of {selectedRosterItem.fullName} ({selectedRosterItem.studentCode})
                              </div>
                            </div>
                          </div>
                          <span className="text-xs bg-[#1e3a5f] text-[#f9a03f] px-2.5 py-1 rounded-full font-bold border border-[#f27a1a]/30">
                            Direct Faculty Line
                          </span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                          {activeChatMessages.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-xs">
                              <MessageSquare className="w-8 h-8 text-gray-500 mx-auto mb-2" />
                              No prior messages. Send a message to {selectedRosterItem.parentName}.
                            </div>
                          ) : (
                            activeChatMessages.map((msg: any) => {
                              const isMe = msg.senderRole === "instructor";
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                >
                                  <div
                                    className={`max-w-md p-3.5 rounded-2xl text-xs shadow-sm ${
                                      isMe
                                        ? "bg-[#1e3a5f] text-white border border-[#f27a1a]/40 rounded-br-none"
                                        : "bg-white/10 text-white border border-white/10 rounded-bl-none"
                                    }`}
                                  >
                                    <div className="font-bold text-[10px] text-[#f9a03f] mb-1">
                                      {msg.senderName}
                                    </div>
                                    <p className="leading-relaxed">{msg.message}</p>
                                  </div>
                                  <span className="text-[9px] text-gray-400 mt-1 px-1">
                                    {new Date(msg.createdAt).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <form onSubmit={handleSendChatMessage} className="p-3 bg-[#081226] border-t border-white/10 flex gap-2">
                          <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            placeholder={`Message parent ${selectedRosterItem.parentName}...`}
                            className="flex-1 px-4 py-2.5 bg-[#0c1a3a] border border-white/20 rounded-2xl text-xs text-white focus:outline-none focus:border-[#f27a1a]"
                          />
                          <button
                            type="submit"
                            disabled={sendingChat || !chatInput.trim()}
                            className="px-4 py-2.5 bg-[#f27a1a] hover:bg-[#f9a03f] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                        Select a parent from the left contacts list to open messaging.
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
};
