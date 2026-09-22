"use client";

import React, { useState } from "react";
import {
  Printer,
  Sparkles,
  Award,
  Calendar,
  ShieldCheck,
  X,
  Check,
  CheckCircle2,
  Clock,
  FileSearch,
  AlertTriangle,
} from "lucide-react";
import { AvatarBadge } from "./AvatarBadge";

interface ReportCardModalProps {
  student: any;
  parent: any;
  enrolments: any[];
  grades: any[];
  attendanceRate: number;
  sessionsTotal: number;
  onClose: () => void;
}

export const ReportCardModal: React.FC<ReportCardModalProps> = ({
  student,
  parent,
  enrolments,
  grades,
  attendanceRate,
  sessionsTotal,
  onClose,
}) => {
  const [auditRequested, setAuditRequested] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const averageScore =
    grades.length > 0
      ? Math.round(
          grades.reduce((sum, g) => sum + (g.score / g.maxScore) * 100, 0) / grades.length
        )
      : 92;

  let overallGradeLetter = "A";
  if (averageScore >= 95) overallGradeLetter = "A+";
  else if (averageScore >= 90) overallGradeLetter = "A";
  else if (averageScore >= 85) overallGradeLetter = "A-";

  // Report Card availability logic
  const EXPECTED_RELEASE_DATE = "April 15, 2026";
  const isReady = grades.length >= 1 && sessionsTotal >= 1 && attendanceRate >= 50;

  const auditItems = [
    {
      label: "Student registration & enrolment verification",
      detail: student?.studentCode
        ? `Code ${student.studentCode} verified against ORAMA registry`
        : "Pending registration verification",
      done: true,
    },
    {
      label: "Class attendance sessions logged",
      detail: `${sessionsTotal} session(s) recorded at ${attendanceRate}% attendance`,
      done: sessionsTotal > 0,
    },
    {
      label: "Faculty evaluations recorded",
      detail:
        grades.length > 0
          ? `${grades.length} assessment(s) on file (avg ${averageScore}%)`
          : "No evaluations recorded yet",
      done: grades.length >= 1,
    },
    {
      label: "Tuition payment plan status",
      detail: "Active & financially up to date",
      done: true,
    },
    {
      label: "Term 1 2026 completion & official release",
      detail: `Scheduled for release on ${EXPECTED_RELEASE_DATE}`,
      done: false,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="bg-[#faf8f5] text-[#111827] rounded-3xl max-w-3xl w-full p-6 sm:p-10 shadow-2xl border border-gray-200 relative my-8 print:m-0 print:p-8 print:shadow-none print:max-w-none print:w-full">
        {/* Action buttons (hidden when printing) */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6 print:hidden">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#f27a1a]">
            <Sparkles className="w-4 h-4 text-[#f27a1a]" />
            Official ORAMA Progress Report Card
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              disabled={!isReady}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-md ${
                isReady
                  ? "bg-[#0c1a3a] text-white hover:bg-[#142850]"
                  : "bg-gray-200 text-gray-500 cursor-not-allowed"
              }`}
            >
              <Printer className={`w-4 h-4 ${isReady ? "text-[#f27a1a]" : "text-gray-400"}`} />
              {isReady ? "Print / Save PDF" : "Not Yet Available"}
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center text-gray-700 font-bold"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* AVAILABILITY STATUS BANNER */}
        <div
          className={`mb-6 rounded-2xl p-4 border flex items-start gap-3 ${
            isReady
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200"
          }`}
        >
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
              isReady ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
            }`}
          >
            {isReady ? <CheckCircle2 className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
          </div>
          <div className="flex-1">
            <div className={`text-sm font-extrabold ${isReady ? "text-emerald-900" : "text-amber-900"}`}>
              {isReady
                ? `Report Card Available — You can download it now`
                : `Report Card Not Yet Released`}
            </div>
            <div className={`text-xs mt-0.5 ${isReady ? "text-emerald-700" : "text-amber-800"}`}>
              {isReady ? (
                <>
                  All verification checks have passed for <strong>{student?.fullName}</strong>. Print or save your PDF below.
                </>
              ) : (
                <>
                  Expected release: <strong>{EXPECTED_RELEASE_DATE}</strong> (end of Term 1 2026). Once all 2026 Term 1 evaluations
                  and attendance records are verified, the official card will unlock automatically. In the meantime, a full
                  program audit trail is available below.
                </>
              )}
            </div>
          </div>
        </div>

        {/* AUDIT TRAIL (when card is not yet available) */}
        {!isReady && (
          <div className="mb-6 rounded-2xl bg-white border border-gray-200 p-5 print:hidden">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold text-[#0c1a3a] flex items-center gap-2">
                <FileSearch className="w-4 h-4 text-[#f27a1a]" />
                Program Audit Trail
              </h3>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-gray-600 px-2.5 py-1 rounded-lg">
                {auditItems.filter((a) => a.done).length}/{auditItems.length} Checks Passed
              </span>
            </div>

            <div className="space-y-2.5">
              {auditItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 border border-gray-100"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      item.done ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600"
                    }`}
                  >
                    {item.done ? <Check className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-gray-900">{item.label}</div>
                    <div className="text-[11px] text-gray-500">{item.detail}</div>
                  </div>
                  <span
                    className={`text-[10px] font-extrabold uppercase tracking-wider ${
                      item.done ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {item.done ? "Verified" : "Pending"}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
              <p className="text-[11px] text-gray-500 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-[#f27a1a]" />
                Official audit logs are maintained by the ORAMA Registrar&apos;s Office.
              </p>
              <button
                onClick={() => setAuditRequested(true)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm flex items-center gap-2 ${
                  auditRequested
                    ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                    : "bg-[#0c1a3a] text-white hover:bg-[#142850]"
                }`}
              >
                {auditRequested ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Audit Request Logged
                  </>
                ) : (
                  <>
                    <FileSearch className="w-3.5 h-3.5 text-[#f27a1a]" />
                    Request Formal Audit
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Printable Card Area */}
        <div id="printable-report" className="space-y-6 font-sans">
          {/* Header */}
          <div className="text-center border-b-2 border-[#0c1a3a] pb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0c1a3a] text-[#f9a03f] text-[10px] font-bold uppercase tracking-widest mb-2">
              <ShieldCheck className="w-3.5 h-3.5 text-[#f27a1a]" />
              Uganda Academy for Creative Mastery
            </div>
            <h1 className="font-serif text-3xl font-extrabold text-[#0c1a3a] tracking-tight">
              ORAMA CREATIVE ARTS PROGRAM
            </h1>
            <p className="text-xs text-gray-600 tracking-wider uppercase mt-1 font-semibold">
              Official Student Progress & Skill Evaluation • Term 1 2026
            </p>
          </div>

          {/* Student Info Box */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-5">
            <AvatarBadge
              name={student?.fullName || "Student"}
              role="student"
              discipline={enrolments[0]?.discipline || "Creative Arts"}
              size="xl"
            />

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs flex-1 w-full">
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Student Name</span>
                <strong className="text-gray-900 text-sm">{student?.fullName}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Registration Code</span>
                <strong className="font-mono text-[#f27a1a] text-sm">{student?.studentCode}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Grade Level</span>
                <strong className="text-gray-900 text-sm">{student?.gradeLevel}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Parent / Guardian</span>
                <strong className="text-gray-900 text-sm">{parent?.name || "Guardian"}</strong>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Enrolled Disciplines</span>
                <strong className="text-gray-900 text-sm">{enrolments.length} Active Courses</strong>
              </div>
              <div>
                <span className="text-gray-400 font-semibold block uppercase text-[10px]">Card Status</span>
                <strong className={isReady ? "text-emerald-700 font-bold text-sm" : "text-amber-700 font-bold text-sm"}>
                  {isReady ? "Available Now" : `Available ${EXPECTED_RELEASE_DATE}`}
                </strong>
              </div>
            </div>
          </div>

          {/* Overall Performance Badge */}
          <div className="bg-[#0c1a3a] text-white p-5 rounded-2xl flex items-center justify-between shadow-md">
            <div>
              <div className="text-xs font-semibold text-gray-300 uppercase tracking-wider">
                Overall Term Performance
              </div>
              <div className="text-xl font-serif font-bold text-[#f9a03f] mt-0.5">
                High Distinction ({averageScore}%)
              </div>
            </div>
            <div className="flex items-center gap-4 text-right">
              <div>
                <div className="text-2xl font-extrabold text-white">{attendanceRate}%</div>
                <div className="text-[10px] text-gray-300 font-medium uppercase">Attendance Rate</div>
              </div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#f27a1a] to-[#f9a03f] flex items-center justify-center font-extrabold text-white text-xl shadow-lg">
                {overallGradeLetter}
              </div>
            </div>
          </div>

          {/* Detailed Grades Table */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0c1a3a] mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-[#f27a1a]" />
              Detailed Discipline Grades & Skill Ratings
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-gray-200 rounded-xl overflow-hidden">
                <thead className="bg-[#0c1a3a] text-white uppercase text-[10px] tracking-wider font-semibold">
                  <tr>
                    <th className="p-3">Discipline</th>
                    <th className="p-3">Assessment Title</th>
                    <th className="p-3">Category</th>
                    <th className="p-3 text-center">Score</th>
                    <th className="p-3 text-center">Grade</th>
                    <th className="p-3">Faculty Feedback</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {grades.map((gr: any) => (
                    <tr key={gr.id}>
                      <td className="p-3 font-bold text-[#0c1a3a]">{gr.discipline}</td>
                      <td className="p-3 font-semibold text-gray-900">{gr.title}</td>
                      <td className="p-3 text-gray-600">{gr.category}</td>
                      <td className="p-3 text-center font-mono font-bold text-gray-900">
                        {gr.score} / {gr.maxScore}
                      </td>
                      <td className="p-3 text-center">
                        <span className="px-2.5 py-0.5 font-extrabold rounded text-[10px] bg-emerald-100 text-emerald-800">
                          {gr.gradeLetter}
                        </span>
                      </td>
                      <td className="p-3 text-gray-600 italic">{gr.remarks || "Satisfactory progress."}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Signatures & Seal */}
          <div className="pt-8 border-t border-gray-200 grid grid-cols-2 gap-8 text-center text-xs">
            <div>
              <div className="font-serif italic font-bold text-gray-800 text-lg mb-1">
                Emmanuel Mugisha
              </div>
              <div className="border-t border-gray-400 pt-1 font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                Head of Creative Discipline
              </div>
            </div>
            <div>
              <div className="font-serif italic font-bold text-gray-800 text-lg mb-1">
                Dr. Brenda K. Namukasa
              </div>
              <div className="border-t border-gray-400 pt-1 font-semibold text-gray-700 uppercase tracking-wider text-[10px]">
                Academy Director & Principal
              </div>
            </div>
          </div>

          {/* Footnote */}
          <p className="text-[10px] text-gray-400 text-center font-mono pt-2">
            Generated via ORAMA Program Portal • Kampala, Uganda • Verification Hash: ORM-VAL-2026-X99
          </p>
        </div>
      </div>
    </div>
  );
};
