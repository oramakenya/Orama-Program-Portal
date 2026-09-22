"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  Users,
  Calendar,
  Award,
  CreditCard,
  MessageSquare,
  BookOpen,
  LogOut,
  ChevronDown,
  Sparkles,
  CheckCircle2,
  Clock,
  Download,
  Send,
  FileText,
  ShieldAlert,
  Check,
  Search,
  LayoutDashboard,
  Layers,
  GraduationCap,
  Bell,
  Sliders,
  ChevronRight,
  TrendingUp,
  BarChart2,
  Lock,
  Zap,
  CheckSquare,
  ShieldCheck,
  HelpCircle,
  FolderKanban,
  FileCheck,
  Percent,
  Plus,
  PlusCircle,
  Music,
  Palette,
  PenLine,
  X,
} from "lucide-react";
import { AvatarBadge } from "./AvatarBadge";
import { ReportCardModal } from "./ReportCardModal";

interface ParentViewProps {
  loginData: any;
  onLogout: () => void;
}

// Class catalog for adding private lessons, organized by the three creative divisions
const CLASS_CATALOG = [
  {
    division: "Performing Arts",
    accent: "purple",
    icon: Music,
    classes: [
      { name: "Piano & Music Theory", instructorCode: "INST-MUS-02" },
      { name: "Drama & Performing Arts", instructorCode: "INST-DRM-03" },
      { name: "Guitar & Vocal Ensemble", instructorCode: "INST-MUS-02" },
      { name: "Contemporary Dance & Movement", instructorCode: "INST-DRM-03" },
    ],
  },
  {
    division: "Literary Arts",
    accent: "sky",
    icon: PenLine,
    classes: [
      { name: "Creative Writing & Poetry", instructorCode: "INST-DRM-03" },
      { name: "Storytelling & Oral Tradition", instructorCode: "INST-DRM-03" },
      { name: "Youth Journalism & Debate", instructorCode: "INST-DRM-03" },
    ],
  },
  {
    division: "Visual Arts",
    accent: "orange",
    icon: Palette,
    classes: [
      { name: "Visual Arts & Painting", instructorCode: "INST-ART-01" },
      { name: "Sculpture & Ceramics", instructorCode: "INST-ART-01" },
      { name: "Digital Art & Graphic Design", instructorCode: "INST-ART-01" },
    ],
  },
];

export const ParentView: React.FC<ParentViewProps> = ({ loginData, onLogout }) => {
  const [activeStudentId, setActiveStudentId] = useState<string>(
    loginData.activeStudentId || loginData.students[0]?.id
  );
  const [activeTab, setActiveTab] = useState<
    "overview" | "curriculum" | "attendance" | "grades" | "payments" | "chat" | "lessonPlans"
  >("overview");

  const [searchQuery, setSearchQuery] = useState("");
  const [loadingData, setLoadingData] = useState(false);
  const [portalData, setPortalData] = useState<any>(null);

  // Modal states for UGX 50,000 Plan Change
  const [showChangePlanModal, setShowChangePlanModal] = useState(false);
  const [selectedNewPlan, setSelectedNewPlan] = useState<any>({
    name: "Full Annual Pass (10% Discount)",
    amount: 1800000,
    cycle: "Annual",
  });
  const [paymentMethod, setPaymentMethod] = useState("MTN Mobile Money");
  const [processingPlanChange, setProcessingPlanChange] = useState(false);
  const [planChangeSuccess, setPlanChangeSuccess] = useState<string | null>(null);

  // Chat states
  const [selectedInstructorId, setSelectedInstructorId] = useState<string>("");
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [sendingChat, setSendingChat] = useState(false);

  // Report Card Modal state
  const [showReportCard, setShowReportCard] = useState(false);

  // Add Class / Private Lesson states
  const [showAddClassModal, setShowAddClassModal] = useState(false);
  const [selectedDivision, setSelectedDivision] = useState("Performing Arts");
  const [selectedClassName, setSelectedClassName] = useState("Piano & Music Theory");
  const [addingClass, setAddingClass] = useState(false);
  const [addClassSuccess, setAddClassSuccess] = useState<string | null>(null);

  // Fetch portal data whenever active student changes
  const fetchPortalData = async (studentId: string) => {
    setLoadingData(true);
    try {
      const res = await fetch(
        `/api/portal/data?role=parent&parentId=${loginData.parent.id}&studentId=${studentId}`
      );
      const data = await res.json();
      if (data.success) {
        setPortalData(data);
        if (data.instructors && data.instructors.length > 0) {
          if (!selectedInstructorId) {
            setSelectedInstructorId(data.instructors[0].id);
          }
        }
      }
    } catch (err) {
      console.error("Error fetching portal data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    if (activeStudentId) {
      fetchPortalData(activeStudentId);
    }
  }, [activeStudentId]);

  const currentStudent =
    loginData.students.find((s: any) => s.id === activeStudentId) || loginData.students[0];

  const enrolments = portalData?.enrolments || [];
  const instructors = portalData?.instructors || [];
  const attendance = portalData?.attendance || [];
  const grades = portalData?.grades || [];
  const paymentPlans = portalData?.paymentPlans || [];
  const payments = portalData?.payments || [];
  const planChanges = portalData?.planChanges || [];
  const lessonPlans = portalData?.lessonPlans || [];
  const chats = portalData?.chats || [];

  const studentPlan = paymentPlans.find((p: any) => p.studentId === activeStudentId) || paymentPlans[0];

  // Calculate stats
  const presentCount = attendance.filter((a: any) => a.status === "Present").length;
  const totalSessions = attendance.length;
  const attendanceRate = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 100;

  const totalScoreSum = grades.reduce((acc: number, g: any) => acc + (g.score / g.maxScore) * 100, 0);
  const averageGrade = grades.length > 0 ? Math.round(totalScoreSum / grades.length) : 92;

  // Process Plan Change (UGX 50,000 fee)
  const handleProcessPlanChange = async () => {
    setProcessingPlanChange(true);
    setPlanChangeSuccess(null);
    try {
      const res = await fetch("/api/payments/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: loginData.parent.id,
          studentId: activeStudentId,
          newPlanName: selectedNewPlan.name,
          newAmountUgx: selectedNewPlan.amount,
          newBillingCycle: selectedNewPlan.cycle,
          paymentMethod,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setPlanChangeSuccess(data.message);
        fetchPortalData(activeStudentId);
        setTimeout(() => {
          setShowChangePlanModal(false);
          setPlanChangeSuccess(null);
        }, 2200);
      } else {
        alert(data.message || "Failed to process payment plan change.");
      }
    } catch (err: any) {
      alert("Error changing payment plan: " + err.message);
    } finally {
      setProcessingPlanChange(false);
    }
  };

  // Send Chat message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessageInput.trim() || !selectedInstructorId) return;

    setSendingChat(true);
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          parentId: loginData.parent.id,
          instructorId: selectedInstructorId,
          studentId: activeStudentId,
          senderRole: "parent",
          senderName: loginData.user.name,
          message: chatMessageInput.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setChatMessageInput("");
        fetchPortalData(activeStudentId);
      }
    } catch (err) {
      console.error("Error sending chat:", err);
    } finally {
      setSendingChat(false);
    }
  };

  const activeChatMessages = chats.filter(
    (m: any) => m.instructorId === selectedInstructorId && m.studentId === activeStudentId
  );

  const selectedInstructorObj = instructors.find((i: any) => i.id === selectedInstructorId);

  // Handle adding a new class as a private lesson
  const handleAddClass = async () => {
    if (!selectedClassName) return;
    setAddingClass(true);
    setAddClassSuccess(null);
    try {
      const classDef = CLASS_CATALOG.flatMap((d) => d.classes).find(
        (c) => c.name === selectedClassName
      );
      const res = await fetch("/api/enrolments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: activeStudentId,
          discipline: selectedClassName,
          instructorCode: classDef?.instructorCode,
          lessonType: "Private Lesson",
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAddClassSuccess(data.message);
        fetchPortalData(activeStudentId);
        setTimeout(() => {
          setShowAddClassModal(false);
          setAddClassSuccess(null);
        }, 2200);
      } else {
        alert(data.message || "Failed to add the class.");
      }
    } catch (err: any) {
      alert("Error adding class: " + err.message);
    } finally {
      setAddingClass(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf8f5] text-[#111827] flex flex-col font-sans">
      {/* SCIENCE SOFT STYLE TOP LMS BAR */}
      <header className="bg-[#0c1a3a] text-white border-b border-[#1e3a5f] sticky top-0 z-30 shadow-md">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo Mark & Portal Title */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#f27a1a] to-[#f9a03f] flex items-center justify-center font-bold text-white shadow-lg shadow-[#f27a1a]/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="font-serif font-extrabold text-lg text-white tracking-tight">
                  ORAMA <span className="gradient-text">Creative Arts Program Portal</span>
                </span>
                <span className="block text-[10px] text-[#f9a03f] font-mono uppercase tracking-wider">
                  Parent / Guardian Workspace
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
                  placeholder="Search course modules, grades, lesson plans..."
                  className="w-full pl-10 pr-4 py-2 bg-[#142850] border border-[#1e3a5f] rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none focus:border-[#f27a1a]"
                />
              </div>
            </div>

            {/* Alternating Student Switcher Pill */}
            <div className="flex items-center gap-3">
              {loginData.students.length > 1 ? (
                <div className="flex items-center bg-[#142850] p-1 rounded-2xl border border-[#1e3a5f]">
                  <span className="text-[11px] text-gray-300 font-semibold px-2.5 hidden lg:inline-flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#f27a1a]" />
                    Select Student:
                  </span>
                  <div className="flex items-center gap-1">
                    {loginData.students.map((st: any) => (
                      <button
                        key={st.id}
                        onClick={() => setActiveStudentId(st.id)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                          st.id === activeStudentId
                            ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                            : "text-gray-300 hover:text-white hover:bg-[#1e3a5f]"
                        }`}
                      >
                        <AvatarBadge name={st.fullName} role="student" size="sm" showIcon={false} />
                        <span>{st.fullName}</span>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-[#142850] px-3 py-1.5 rounded-2xl border border-[#1e3a5f] text-xs">
                  <AvatarBadge name={currentStudent?.fullName || "Student"} role="student" size="sm" />
                  <div>
                    <div className="font-bold text-white text-xs">{currentStudent?.fullName}</div>
                    <div className="font-mono text-[#f9a03f] text-[10px]">{currentStudent?.studentCode}</div>
                  </div>
                </div>
              )}

              {/* User Profile & Logout */}
              <div className="flex items-center gap-3 pl-3 border-l border-[#1e3a5f]">
                <AvatarBadge name={loginData.user.name} role="parent" size="md" />
                <div className="text-right hidden xl:block">
                  <div className="text-xs font-bold text-white">{loginData.user.name}</div>
                  <div className="text-[10px] text-[#f9a03f] uppercase tracking-wider font-semibold">
                    Parent / Guardian
                  </div>
                </div>
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-2 rounded-xl bg-[#142850] text-gray-300 hover:text-red-400 hover:bg-[#1e3a5f] transition border border-[#1e3a5f]"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* DASHBOARD CONTAINER WITH SIDEBAR & MAIN LMS WORKSPACE */}
      <div className="flex-1 max-w-[1600px] w-full mx-auto flex flex-col md:flex-row">
        {/* LEFT LMS SIDEBAR NAVIGATION */}
        <aside className="w-full md:w-64 bg-[#0c1a3a] text-white border-r border-[#1e3a5f] shrink-0 p-4 space-y-6">
          {/* Active Student Info Badge */}
          <div className="p-4 rounded-2xl bg-[#142850] border border-[#1e3a5f] space-y-3">
            <div className="flex items-center gap-3">
              <AvatarBadge name={currentStudent?.fullName || "Student"} role="student" size="lg" />
              <div>
                <h3 className="font-bold text-sm text-white">{currentStudent?.fullName}</h3>
                <span className="text-[10px] text-[#f9a03f] font-mono block">
                  {currentStudent?.studentCode}
                </span>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-extrabold bg-[#f27a1a]/20 text-[#f9a03f] border border-[#f27a1a]/40">
                  {currentStudent?.gradeLevel}
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1 text-xs">
            <div className="px-3 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">
              Program Portal Navigation
            </div>

            <button
              onClick={() => setActiveTab("overview")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "overview"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab("curriculum")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "curriculum"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <FolderKanban className="w-4 h-4" />
              <span>Course Modules ({enrolments.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("attendance")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "attendance"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Attendance Log</span>
            </button>

            <button
              onClick={() => setActiveTab("grades")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "grades"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Gradebook & Skills</span>
            </button>

            <button
              onClick={() => setActiveTab("payments")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "payments"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Payment Plan (UGX Fee)</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <div className="flex items-center gap-3">
                <MessageSquare className="w-4 h-4" />
                <span>Instructor Chat</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </button>

            <button
              onClick={() => setActiveTab("lessonPlans")}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold transition-all ${
                activeTab === "lessonPlans"
                  ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                  : "text-gray-300 hover:bg-[#142850] hover:text-white"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Lesson Plans & Tasks</span>
            </button>
          </nav>

          {/* Report Card Export Button */}
          <div className="pt-4 border-t border-[#1e3a5f]">
            <button
              onClick={() => setShowReportCard(true)}
              className="w-full py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center justify-center gap-2 border border-white/20 transition shadow-sm"
            >
              <Download className="w-3.5 h-3.5 text-[#f27a1a]" />
              Official Report Card
            </button>
          </div>
        </aside>

        {/* MAIN CANVAS CONTENT WORKSPACE */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-8 overflow-y-auto">
          {loadingData ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="w-10 h-10 border-4 border-[#f27a1a] border-t-transparent rounded-full animate-spin mb-4" />
              <p className="text-sm font-semibold text-gray-600">Syncing student portal metrics...</p>
            </div>
          ) : (
            <>
              {/* TOP HERO KPI BANNER */}
              <div className="bg-gradient-to-r from-[#0c1a3a] via-[#142850] to-[#0c1a3a] text-white rounded-3xl p-6 border border-[#1e3a5f] shadow-xl flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f27a1a]/20 text-[#f9a03f] text-xs font-bold border border-[#f27a1a]/30 mb-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Student Progress Dashboard
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-serif font-bold text-white">
                    {currentStudent?.fullName}&apos;s Learning Workspace
                  </h2>
                  <p className="text-xs text-gray-300 mt-1">
                    Enrolled in {enrolments.length} discipline modules at ORAMA Creative Arts Academy, Kampala.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setShowReportCard(true)}
                    className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-2 border border-white/20 transition shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5 text-[#f27a1a]" />
                    Print Progress Card
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab("payments");
                      setShowChangePlanModal(true);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-[#f27a1a]/30"
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    Change Plan (UGX 50k Fee)
                  </button>
                </div>
              </div>

              {/* TAB 1: OVERVIEW & SCIENCE SOFT COURSE WIDGETS */}
              {activeTab === "overview" && (
                <div className="space-y-8 animate-fade-in">
                  {/* Metric Stat Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                        <Calendar className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-gray-900">{attendanceRate}%</div>
                        <div className="text-xs font-semibold text-gray-500">Attendance Rate</div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#f27a1a] flex items-center justify-center shrink-0">
                        <Award className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-gray-900">{averageGrade}%</div>
                        <div className="text-xs font-semibold text-gray-500">Average Performance Score</div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 truncate">
                          {studentPlan ? studentPlan.planName : "Termly Plan"}
                        </div>
                        <div className="text-xs font-semibold text-emerald-600">UGX Up-to-Date</div>
                      </div>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                        <BookOpen className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-2xl font-extrabold text-gray-900">{enrolments.length}</div>
                        <div className="text-xs font-semibold text-gray-500">Active Discipline Courses</div>
                      </div>
                    </div>
                  </div>

                  {/* Course Module Cards (NO PICTURES) */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-bold text-[#0c1a3a] flex items-center gap-2">
                        <FolderKanban className="w-5 h-5 text-[#f27a1a]" />
                        Enrolled Discipline Modules & Faculty Mentors
                      </h3>
                      <button
                        onClick={() => setActiveTab("curriculum")}
                        className="text-xs font-bold text-[#f27a1a] hover:underline"
                      >
                        View Full Curriculum &rarr;
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {enrolments.map((enr: any) => {
                        const inst = instructors.find((i: any) => i.id === enr.instructorId);
                        return (
                          <div
                            key={enr.id}
                            className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition relative overflow-hidden flex flex-col justify-between"
                          >
                            <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-[#f27a1a] to-[#f9a03f]" />

                            <div>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f27a1a] bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100">
                                  {enr.term}
                                </span>
                                <div className="flex items-center gap-1.5">
                                  {enr.lessonType === "Private Lesson" && (
                                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg border border-purple-200">
                                      Private Lesson
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-400 font-mono">Module Active</span>
                                </div>
                              </div>

                              <h4 className="text-lg font-bold text-gray-900">{enr.discipline}</h4>
                              <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-1">
                                <Clock className="w-3.5 h-3.5 text-gray-400" />
                                {enr.schedule}
                              </p>

                              {/* Progress completion bar */}
                              <div className="mt-4">
                                <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                                  <span>Term Completion</span>
                                  <span className="font-bold text-[#0c1a3a]">85% Completed</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] h-2 rounded-full"
                                    style={{ width: "85%" }}
                                  />
                                </div>
                              </div>
                            </div>

                            {/* Instructor Footer */}
                            {inst && (
                              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <AvatarBadge
                                    name={inst.instructorName}
                                    role="instructor"
                                    discipline={enr.discipline}
                                    size="md"
                                  />
                                  <div>
                                    <div className="text-xs font-bold text-gray-900">{inst.instructorName}</div>
                                    <div className="text-[11px] text-gray-500">{inst.discipline}</div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => {
                                    setSelectedInstructorId(inst.id);
                                    setActiveTab("chat");
                                  }}
                                  className="px-3.5 py-2 rounded-xl bg-[#0c1a3a] text-white hover:bg-[#142850] text-xs font-bold flex items-center gap-1.5 transition shadow-sm"
                                >
                                  <MessageSquare className="w-3.5 h-3.5 text-[#f27a1a]" />
                                  Chat
                                </button>
                              </div>
                            )}
                          </div>
                        );
                      })}

                      {/* ADD ANOTHER CLASS / PRIVATE LESSON CARD */}
                      <button
                        onClick={() => setShowAddClassModal(true)}
                        className="min-h-[260px] rounded-3xl border-2 border-dashed border-gray-300 hover:border-[#f27a1a] bg-white/60 hover:bg-orange-50/40 transition p-6 flex flex-col items-center justify-center gap-3 text-center group"
                      >
                        <div className="w-14 h-14 rounded-2xl bg-[#f27a1a]/10 text-[#f27a1a] group-hover:bg-[#f27a1a] group-hover:text-white transition flex items-center justify-center shadow-sm">
                          <Plus className="w-7 h-7" />
                        </div>
                        <div>
                          <div className="text-sm font-extrabold text-[#0c1a3a] group-hover:text-[#f27a1a] transition">
                            Add Another Class
                          </div>
                          <div className="text-[11px] text-gray-500 mt-1 max-w-[200px]">
                            Enrol in a private lesson from Performing, Literary, or Visual Arts
                          </div>
                        </div>
                        <span className="text-[11px] font-bold text-[#f27a1a] group-hover:underline">
                          Browse 3 Divisions &rarr;
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Recent Evaluations Preview */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-serif font-bold text-[#0c1a3a] flex items-center gap-2">
                        <Award className="w-5 h-5 text-[#f27a1a]" />
                        Recent Performance Evaluations
                      </h3>
                      <button
                        onClick={() => setActiveTab("grades")}
                        className="text-xs font-bold text-[#f27a1a] hover:underline"
                      >
                        Gradebook Details &rarr;
                      </button>
                    </div>

                    <div className="divide-y divide-gray-100">
                      {grades.slice(0, 3).map((g: any) => (
                        <div key={g.id} className="py-3 flex items-center justify-between">
                          <div>
                            <div className="text-sm font-bold text-gray-900">{g.title}</div>
                            <div className="text-xs text-gray-500">
                              {g.discipline} • {g.category} • {g.date}
                            </div>
                            {g.remarks && (
                              <p className="text-xs text-gray-600 mt-1 italic">&ldquo;{g.remarks}&rdquo;</p>
                            )}
                          </div>
                          <div className="text-right shrink-0">
                            <span className="text-lg font-extrabold text-[#0c1a3a]">{g.score}%</span>
                            <span className="ml-2 px-2.5 py-1 text-xs font-extrabold rounded-lg bg-emerald-100 text-emerald-800">
                              {g.gradeLetter}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COURSE MODULE CURRICULUM */}
              {activeTab === "curriculum" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-serif font-bold text-[#0c1a3a] flex items-center gap-2">
                      <FolderKanban className="w-6 h-6 text-[#f27a1a]" />
                      Course Module Curriculum & Skill Tree
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Explore detailed course units, lesson outlines, and instructor-led artistic modules.
                    </p>
                  </div>

                  <div className="space-y-4">
                    {enrolments.map((enr: any, idx: number) => (
                      <div key={enr.id} className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                        <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-[#0c1a3a] text-[#f9a03f] font-extrabold flex items-center justify-center text-sm">
                              0{idx + 1}
                            </div>
                            <div>
                              <h4 className="text-base font-bold text-gray-900">
                                {enr.discipline}
                                {enr.lessonType === "Private Lesson" && (
                                  <span className="ml-2 align-middle text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2 py-0.5 rounded-lg border border-purple-200">
                                    Private Lesson
                                  </span>
                                )}
                              </h4>
                              <div className="text-xs text-gray-500">{enr.term} • Schedule: {enr.schedule}</div>
                            </div>
                          </div>
                          <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                            Active Enrolment
                          </span>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                              <span className="font-bold text-gray-800">Unit 1: Fundamentals & Skill Foundations</span>
                            </div>
                            <span className="text-gray-400 font-mono">Passed (95%)</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-orange-50/60 border border-orange-200/80 flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <Sparkles className="w-4 h-4 text-[#f27a1a]" />
                              <span className="font-bold text-[#0c1a3a]">Unit 2: Expressive Dynamics & Advanced Technique</span>
                            </div>
                            <span className="text-[#f27a1a] font-bold">In Progress</span>
                          </div>

                          <div className="p-3 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-between text-gray-400">
                            <div className="flex items-center gap-2.5">
                              <Lock className="w-4 h-4 text-gray-400" />
                              <span>Unit 3: End-of-Term Recital & Exhibition Gallery</span>
                            </div>
                            <span className="font-mono">Upcoming</span>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* ADD ANOTHER CLASS / PRIVATE LESSON CARD */}
                    <button
                      onClick={() => setShowAddClassModal(true)}
                      className="w-full rounded-3xl border-2 border-dashed border-gray-300 hover:border-[#f27a1a] bg-white/60 hover:bg-orange-50/40 transition p-5 flex items-center justify-center gap-4 text-center group"
                    >
                      <div className="w-11 h-11 rounded-2xl bg-[#f27a1a]/10 text-[#f27a1a] group-hover:bg-[#f27a1a] group-hover:text-white transition flex items-center justify-center shrink-0">
                        <Plus className="w-5.5 h-5.5" />
                      </div>
                      <div className="text-left">
                        <div className="text-sm font-extrabold text-[#0c1a3a] group-hover:text-[#f27a1a] transition">
                          Add Another Class as a Private Lesson
                        </div>
                        <div className="text-[11px] text-gray-500 mt-0.5">
                          Choose from Performing Arts, Literary Arts, and Visual Arts divisions
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#f27a1a] group-hover:underline shrink-0">
                        Select Class &rarr;
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 3: ATTENDANCE LOG */}
              {activeTab === "attendance" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
                      <div>
                        <h3 className="text-xl font-serif font-bold text-[#0c1a3a] flex items-center gap-2">
                          <Calendar className="w-6 h-6 text-[#f27a1a]" />
                          Attendance Log & Session Records
                        </h3>
                        <p className="text-xs text-gray-500">
                          Tracks present, late, excused, and unexcused absences for {currentStudent?.fullName}.
                        </p>
                      </div>

                      <div className="flex items-center gap-2 bg-[#faf8f5] p-2 rounded-2xl border border-gray-200 text-xs">
                        <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                          Present: {presentCount}
                        </span>
                        <span className="font-bold text-amber-700 bg-orange-100 px-2.5 py-1 rounded-lg">
                          Late: {attendance.filter((a: any) => a.status === "Late").length}
                        </span>
                        <span className="font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-lg">
                          Total: {totalSessions}
                        </span>
                      </div>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0c1a3a] text-white uppercase text-[10px] tracking-wider font-semibold">
                          <tr>
                            <th className="p-3.5 rounded-l-xl">Date</th>
                            <th className="p-3.5">Discipline</th>
                            <th className="p-3.5">Session Topic</th>
                            <th className="p-3.5">Status</th>
                            <th className="p-3.5 rounded-r-xl">Instructor Notes</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {attendance.map((att: any) => (
                            <tr key={att.id} className="hover:bg-gray-50 transition">
                              <td className="p-3.5 font-mono font-semibold text-gray-900">{att.date}</td>
                              <td className="p-3.5 font-bold text-[#0c1a3a]">{att.discipline}</td>
                              <td className="p-3.5 font-medium text-gray-800">{att.sessionTitle}</td>
                              <td className="p-3.5">
                                <span
                                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                                    att.status === "Present"
                                      ? "bg-emerald-100 text-emerald-800"
                                      : att.status === "Late"
                                      ? "bg-amber-100 text-amber-800"
                                      : "bg-red-100 text-red-800"
                                  }`}
                                >
                                  {att.status}
                                </span>
                              </td>
                              <td className="p-3.5 text-gray-600 italic">
                                {att.notes || "Standard lesson participation."}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: GRADEBOOK & SKILLS */}
              {activeTab === "grades" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <div>
                      <h3 className="text-xl font-serif font-bold text-[#0c1a3a] flex items-center gap-2">
                        <Award className="w-6 h-6 text-[#f27a1a]" />
                        Gradebook & Skill Progression Matrix
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        Comprehensive skill grading, recital evaluations, and project feedback from ORAMA faculty.
                      </p>
                    </div>
                    <button
                      onClick={() => setShowReportCard(true)}
                      className="px-4 py-2.5 bg-[#0c1a3a] text-white hover:bg-[#142850] rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md"
                    >
                      <Download className="w-4 h-4 text-[#f27a1a]" />
                      Print Official Card
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {grades.map((gr: any) => (
                      <div
                        key={gr.id}
                        className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-[#f27a1a] px-2.5 py-0.5 rounded-lg">
                              {gr.category}
                            </span>
                            <h4 className="text-base font-bold text-gray-900 mt-2">{gr.title}</h4>
                            <div className="text-xs text-gray-500">{gr.discipline} • Date: {gr.date}</div>
                          </div>

                          <div className="text-right bg-[#0c1a3a] text-white px-3 py-1.5 rounded-2xl shadow-sm">
                            <div className="text-lg font-extrabold text-[#f9a03f]">
                              {gr.score} / {gr.maxScore}
                            </div>
                            <div className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest text-center">
                              Grade {gr.gradeLetter}
                            </div>
                          </div>
                        </div>

                        <div className="w-full bg-gray-100 rounded-full h-2 mt-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] h-2 rounded-full"
                            style={{ width: `${(gr.score / gr.maxScore) * 100}%` }}
                          />
                        </div>

                        {gr.remarks && (
                          <div className="mt-4 p-3.5 rounded-2xl bg-[#faf8f5] border border-gray-200/80 text-xs text-gray-700 italic">
                            &ldquo;{gr.remarks}&rdquo;
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* TAB 5: PAYMENTS & PLAN SWITCHER (UGX 50,000 FEE) */}
              {activeTab === "payments" && (
                <div className="space-y-8 animate-fade-in">
                  <div className="bg-gradient-to-r from-[#0c1a3a] via-[#142850] to-[#0c1a3a] text-white p-6 sm:p-8 rounded-3xl border border-[#1e3a5f] shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div>
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f27a1a]/20 text-[#f9a03f] text-xs font-bold border border-[#f27a1a]/30 mb-2">
                        <Sparkles className="w-3.5 h-3.5" />
                        Active Tuition Subscription Plan
                      </div>
                      <h3 className="text-2xl font-serif font-bold text-white">
                        {studentPlan ? studentPlan.planName : "Termly Installment Plan"}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-300 mt-1">
                        <span>
                          Tuition Value:{" "}
                          <strong className="text-white font-mono">
                            UGX {studentPlan ? studentPlan.amountUgx.toLocaleString() : "650,000"}
                          </strong>
                        </span>
                        <span>•</span>
                        <span>
                          Cycle: <strong>{studentPlan ? studentPlan.billingCycle : "Termly"}</strong>
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => setShowChangePlanModal(true)}
                      className="px-5 py-3 rounded-2xl bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white text-xs font-bold flex items-center gap-2 shadow-xl shadow-[#f27a1a]/30 transition shrink-0 transform active:scale-95"
                    >
                      <CreditCard className="w-4 h-4" />
                      Change Payment Plan (UGX 50,000 Fee)
                    </button>
                  </div>

                  <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-950 text-xs flex items-start gap-3">
                    <ShieldAlert className="w-5 h-5 text-[#f27a1a] shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold block mb-0.5">ORAMA Payment Policy Notice:</strong>
                      Parents/guardians can change payment plans (Annual Pass, Termly, or Monthly) at any time.
                      <span className="font-bold text-[#f27a1a]"> Standard administrative plan change fee is UGX 50,000</span> per switch.
                    </div>
                  </div>

                  {/* Payment History Table */}
                  <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                    <h3 className="text-lg font-serif font-bold text-[#0c1a3a] mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-[#f27a1a]" />
                      Payment History & Official Receipts (UGX)
                    </h3>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-[#0c1a3a] text-white uppercase text-[10px] tracking-wider font-semibold">
                          <tr>
                            <th className="p-3.5 rounded-l-xl">Receipt No.</th>
                            <th className="p-3.5">Date</th>
                            <th className="p-3.5">Description</th>
                            <th className="p-3.5">Payment Method</th>
                            <th className="p-3.5">Fee (UGX)</th>
                            <th className="p-3.5">Tuition (UGX)</th>
                            <th className="p-3.5 rounded-r-xl text-right">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {payments.map((pm: any) => (
                            <tr key={pm.id} className="hover:bg-gray-50 transition">
                              <td className="p-3.5 font-mono font-bold text-[#0c1a3a]">{pm.receiptNo}</td>
                              <td className="p-3.5 font-mono text-gray-700">{pm.date}</td>
                              <td className="p-3.5 font-semibold text-gray-900">{pm.description}</td>
                              <td className="p-3.5 text-gray-700">{pm.paymentMethod}</td>
                              <td className="p-3.5 font-mono font-bold text-[#f27a1a]">
                                {pm.feeUgx > 0 ? `UGX ${pm.feeUgx.toLocaleString()}` : "UGX 0"}
                              </td>
                              <td className="p-3.5 font-mono font-bold text-gray-900">
                                UGX {pm.amountUgx.toLocaleString()}
                              </td>
                              <td className="p-3.5 text-right">
                                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[10px] bg-emerald-100 text-emerald-800">
                                  <Check className="w-3 h-3" />
                                  {pm.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {planChanges.length > 0 && (
                    <div className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm">
                      <h4 className="text-sm font-bold text-[#0c1a3a] mb-3">Plan Switch Logs</h4>
                      <div className="space-y-2">
                        {planChanges.map((pc: any) => (
                          <div
                            key={pc.id}
                            className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs flex items-center justify-between"
                          >
                            <div>
                              <span className="font-bold text-gray-900">
                                Switched from &ldquo;{pc.oldPlan}&rdquo; to &ldquo;{pc.newPlan}&rdquo;
                              </span>
                              <div className="text-[11px] text-gray-500">
                                Method: {pc.paymentMethod} • Date: {pc.changeDate}
                              </div>
                            </div>
                            <span className="font-mono text-[#f27a1a] font-bold bg-orange-100 px-2.5 py-1 rounded-lg">
                              UGX {pc.switchFeeUgx.toLocaleString()} Fee Paid
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* TAB 6: INSTRUCTOR CHAT */}
              {activeTab === "chat" && (
                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden flex flex-col md:flex-row h-[600px] animate-fade-in">
                  <div className="w-full md:w-72 bg-[#0c1a3a] text-white border-r border-[#1e3a5f] p-4 flex flex-col">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1.5">
                      <MessageSquare className="w-4 h-4 text-[#f27a1a]" />
                      Discipline Instructors
                    </h4>

                    <div className="space-y-2 overflow-y-auto flex-1">
                      {instructors.map((inst: any) => (
                        <button
                          key={inst.id}
                          onClick={() => setSelectedInstructorId(inst.id)}
                          className={`w-full text-left p-3 rounded-2xl transition flex items-center gap-3 ${
                            inst.id === selectedInstructorId
                              ? "bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] text-white shadow-md shadow-[#f27a1a]/30"
                              : "bg-[#142850] hover:bg-[#1e3a5f] text-gray-300"
                          }`}
                        >
                          <AvatarBadge
                            name={inst.instructorName}
                            role="instructor"
                            discipline={inst.discipline}
                            size="md"
                          />
                          <div className="overflow-hidden">
                            <div className="font-bold text-xs truncate text-white">{inst.instructorName}</div>
                            <div className="text-[10px] text-white/80 truncate">{inst.discipline}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col bg-[#faf8f5]">
                    {selectedInstructorObj ? (
                      <>
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <AvatarBadge
                              name={selectedInstructorObj.instructorName}
                              role="instructor"
                              discipline={selectedInstructorObj.discipline}
                              size="md"
                            />
                            <div>
                              <div className="font-bold text-sm text-gray-900">
                                {selectedInstructorObj.instructorName}
                              </div>
                              <div className="text-xs text-gray-500">
                                {selectedInstructorObj.discipline} • Hours: {selectedInstructorObj.officeHours}
                              </div>
                            </div>
                          </div>
                          <span className="text-xs bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full font-bold">
                            Direct Channel
                          </span>
                        </div>

                        <div className="flex-1 p-4 overflow-y-auto space-y-3">
                          {activeChatMessages.length === 0 ? (
                            <div className="text-center py-16 text-gray-400 text-xs">
                              <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                              No messages yet. Start a conversation with {selectedInstructorObj.instructorName}.
                            </div>
                          ) : (
                            activeChatMessages.map((msg: any) => {
                              const isMe = msg.senderRole === "parent";
                              return (
                                <div
                                  key={msg.id}
                                  className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                                >
                                  <div
                                    className={`max-w-md p-3.5 rounded-2xl text-xs shadow-sm ${
                                      isMe
                                        ? "bg-[#f27a1a] text-white rounded-br-none"
                                        : "bg-white text-gray-900 border border-gray-200 rounded-bl-none"
                                    }`}
                                  >
                                    <div className="font-bold text-[10px] opacity-80 mb-1">{msg.senderName}</div>
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

                        <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-gray-200 flex gap-2">
                          <input
                            type="text"
                            value={chatMessageInput}
                            onChange={(e) => setChatMessageInput(e.target.value)}
                            placeholder={`Type message to ${selectedInstructorObj.instructorName}...`}
                            className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs text-gray-900 focus:outline-none focus:border-[#f27a1a]"
                          />
                          <button
                            type="submit"
                            disabled={sendingChat || !chatMessageInput.trim()}
                            className="px-4 py-2.5 bg-[#f27a1a] hover:bg-[#f9a03f] text-white rounded-2xl text-xs font-bold flex items-center gap-1.5 transition shadow-sm disabled:opacity-50"
                          >
                            <Send className="w-3.5 h-3.5" />
                            Send
                          </button>
                        </form>
                      </>
                    ) : (
                      <div className="flex-1 flex items-center justify-center text-gray-400 text-xs">
                        Select an instructor to start messaging.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB 7: LESSON PLANS */}
              {activeTab === "lessonPlans" && (
                <div className="space-y-6 animate-fade-in">
                  <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <h3 className="text-xl font-serif font-bold text-[#0c1a3a] flex items-center gap-2">
                      <BookOpen className="w-6 h-6 text-[#f27a1a]" />
                      Published Discipline Lesson Plans & Homework
                    </h3>
                    <p className="text-xs text-gray-500 mt-1">
                      Review weekly learning modules, target objectives, required practice materials, and assignments.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {lessonPlans.map((lp: any) => (
                      <div
                        key={lp.id}
                        className="bg-white rounded-3xl p-6 border border-gray-200 shadow-sm hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800 px-2.5 py-0.5 rounded-lg">
                              Week {lp.weekNumber} • {lp.discipline}
                            </span>
                            <h4 className="text-base font-bold text-gray-900 mt-2">{lp.title}</h4>
                            <div className="text-xs text-gray-400 mt-0.5">{lp.dateSchedule}</div>
                          </div>
                        </div>

                        <div className="space-y-3 mt-4 text-xs">
                          <div>
                            <span className="font-bold text-gray-900 block mb-0.5">Objectives:</span>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-xl border border-gray-100">
                              {lp.objectives}
                            </p>
                          </div>

                          {lp.materialsNeeded && (
                            <div>
                              <span className="font-bold text-gray-900 block mb-0.5">Materials:</span>
                              <p className="text-gray-600 italic">{lp.materialsNeeded}</p>
                            </div>
                          )}

                          {lp.practiceAssignment && (
                            <div className="p-3.5 bg-orange-50/80 border border-orange-200/80 rounded-2xl text-orange-950">
                              <span className="font-bold block mb-0.5 text-[#f27a1a]">Home Assignment:</span>
                              <p>{lp.practiceAssignment}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {/* ADD CLASS / PRIVATE LESSON MODAL */}
      {showAddClassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative overflow-hidden max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-purple-700 bg-purple-100 px-2.5 py-1 rounded-lg">
                  Private Lesson Enrolment
                </span>
                <h3 className="text-xl font-serif font-bold text-[#0c1a3a] mt-1">
                  Add Another Class
                </h3>
              </div>
              <button
                onClick={() => setShowAddClassModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {addClassSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-gray-900">Private Lesson Added!</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">{addClassSuccess}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-xs text-gray-600">
                  Select a class for <strong>{currentStudent?.fullName}</strong>. It will be enrolled as a
                  <span className="font-bold text-purple-700"> private lesson</span> scheduled by appointment with the
                  assigned ORAMA instructor.
                </p>

                {/* Division Tabs */}
                <div className="grid grid-cols-3 gap-2">
                  {CLASS_CATALOG.map((div) => {
                    const DivIcon = div.icon;
                    const isActive = selectedDivision === div.division;
                    return (
                      <button
                        key={div.division}
                        onClick={() => {
                          setSelectedDivision(div.division);
                          setSelectedClassName(div.classes[0].name);
                        }}
                        className={`p-2.5 rounded-2xl border-2 text-center transition flex flex-col items-center gap-1.5 ${
                          isActive
                            ? "border-[#f27a1a] bg-orange-50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <DivIcon className={`w-5 h-5 ${isActive ? "text-[#f27a1a]" : "text-gray-400"}`} />
                        <div className={`text-[10px] font-extrabold leading-tight ${isActive ? "text-[#0c1a3a]" : "text-gray-600"}`}>
                          {div.division}
                        </div>
                        <div className="text-[9px] text-gray-400">{div.classes.length} classes</div>
                      </button>
                    );
                  })}
                </div>

                {/* Class Selection List */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-2">
                    Available {selectedDivision} Classes
                  </label>
                  <div className="space-y-2">
                    {CLASS_CATALOG.find((d) => d.division === selectedDivision)?.classes.map((cls) => (
                      <button
                        key={cls.name}
                        onClick={() => setSelectedClassName(cls.name)}
                        className={`w-full text-left p-3.5 rounded-2xl border-2 transition flex items-center justify-between ${
                          selectedClassName === cls.name
                            ? "border-[#f27a1a] bg-orange-50/50"
                            : "border-gray-200 hover:border-gray-300 bg-white"
                        }`}
                      >
                        <div>
                          <div className="text-sm font-bold text-gray-900">{cls.name}</div>
                          <div className="text-[11px] text-gray-500">Private Lesson • By Appointment</div>
                        </div>
                        {selectedClassName === cls.name && (
                          <span className="w-5 h-5 rounded-full bg-[#f27a1a] text-white flex items-center justify-center text-[10px] font-extrabold shrink-0">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-600 flex items-start gap-2.5">
                  <Sparkles className="w-4 h-4 text-[#f27a1a] shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-gray-900">How it works:</strong> The instructor will confirm your private
                    lesson schedule directly via chat. New class tuition is billed on the next invoice at the private
                    lesson rate.
                  </span>
                </div>

                <button
                  onClick={handleAddClass}
                  disabled={addingClass}
                  className="w-full py-3.5 bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#f27a1a]/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {addingClass ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Enrolling Private Lesson...
                    </div>
                  ) : (
                    <>
                      <PlusCircle className="w-4 h-4" />
                      Enrol {selectedClassName} as Private Lesson
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHANGE PAYMENT PLAN MODAL (Fee UGX 50,000) */}
      {showChangePlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-5">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#f27a1a] bg-orange-50 px-2.5 py-1 rounded-lg">
                  Fee: UGX 50,000
                </span>
                <h3 className="text-xl font-serif font-bold text-[#0c1a3a] mt-1">
                  Change Student Payment Plan
                </h3>
              </div>
              <button
                onClick={() => setShowChangePlanModal(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 font-bold"
              >
                ✕
              </button>
            </div>

            {planChangeSuccess ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto text-2xl font-bold">
                  ✓
                </div>
                <h4 className="text-lg font-bold text-gray-900">Payment Plan Switch Completed!</h4>
                <p className="text-xs text-gray-600 max-w-xs mx-auto">{planChangeSuccess}</p>
              </div>
            ) : (
              <div className="space-y-5">
                <p className="text-xs text-gray-600">
                  Select a new payment structure for <strong>{currentStudent?.fullName}</strong>. Every plan switch carries a required administrative fee of <strong>UGX 50,000</strong>.
                </p>

                <div className="space-y-2.5">
                  <div
                    onClick={() =>
                      setSelectedNewPlan({
                        name: "Full Annual Pass (10% Discount)",
                        amount: 1800000,
                        cycle: "Annual",
                      })
                    }
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      selectedNewPlan.cycle === "Annual"
                        ? "border-[#f27a1a] bg-orange-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-gray-900">Full Annual Pass</div>
                      <div className="text-xs text-gray-500">Includes all terms + recital entry</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-sm text-[#0c1a3a]">UGX 1,800,000</div>
                      <div className="text-[10px] text-emerald-600 font-bold">Save 10%</div>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setSelectedNewPlan({
                        name: "Termly Installment Plan",
                        amount: 650000,
                        cycle: "Termly",
                      })
                    }
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      selectedNewPlan.cycle === "Termly"
                        ? "border-[#f27a1a] bg-orange-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-gray-900">Termly Plan</div>
                      <div className="text-xs text-gray-500">Pay at start of each term</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-sm text-[#0c1a3a]">UGX 650,000</div>
                      <div className="text-[10px] text-gray-400">per term</div>
                    </div>
                  </div>

                  <div
                    onClick={() =>
                      setSelectedNewPlan({
                        name: "Monthly Subscription Plan",
                        amount: 230000,
                        cycle: "Monthly",
                      })
                    }
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center justify-between ${
                      selectedNewPlan.cycle === "Monthly"
                        ? "border-[#f27a1a] bg-orange-50/40"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm text-gray-900">Monthly Subscription</div>
                      <div className="text-xs text-gray-500">Flex monthly billing</div>
                    </div>
                    <div className="text-right font-mono">
                      <div className="font-bold text-sm text-[#0c1a3a]">UGX 230,000</div>
                      <div className="text-[10px] text-gray-400">per month</div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-gray-600">
                    <span>New Plan Base ({selectedNewPlan.name}):</span>
                    <span>UGX {selectedNewPlan.amount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-[#f27a1a] font-bold">
                    <span>Plan Switch Processing Fee:</span>
                    <span>UGX 50,000</span>
                  </div>
                  <div className="pt-1.5 border-t border-gray-200 flex justify-between text-sm font-bold text-gray-900">
                    <span>Total Charge:</span>
                    <span className="text-[#0c1a3a]">
                      UGX {(selectedNewPlan.amount + 50000).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1.5">
                    Payment Method (Uganda)
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-300 rounded-2xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-[#f27a1a]"
                  >
                    <option value="MTN Mobile Money">MTN Mobile Money (*165#)</option>
                    <option value="Airtel Money">Airtel Money (*185#)</option>
                    <option value="Visa / Mastercard">Visa / Mastercard</option>
                    <option value="Bank Transfer">Centenary / Stanbic Bank Transfer</option>
                  </select>
                </div>

                <button
                  onClick={handleProcessPlanChange}
                  disabled={processingPlanChange}
                  className="w-full py-3.5 bg-gradient-to-r from-[#f27a1a] to-[#f9a03f] hover:from-[#f9a03f] hover:to-[#f27a1a] text-white rounded-2xl text-xs font-bold shadow-lg shadow-[#f27a1a]/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {processingPlanChange ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Processing UGX 50,000 Plan Fee...
                    </div>
                  ) : (
                    <>
                      Confirm & Pay Plan Change (UGX {(selectedNewPlan.amount + 50000).toLocaleString()})
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* REPORT CARD MODAL */}
      {showReportCard && (
        <ReportCardModal
          student={currentStudent}
          parent={loginData.parent}
          enrolments={enrolments}
          grades={grades}
          attendanceRate={attendanceRate}
          sessionsTotal={totalSessions}
          onClose={() => setShowReportCard(false)}
        />
      )}
    </div>
  );
};
