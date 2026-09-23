import React, { useState } from 'react';
import { 
  Award, 
  Plus, 
  Calendar, 
  CheckCircle, 
  Printer, 
  FileText, 
  Sparkles, 
  Edit3, 
  CheckCheck,
  X,
  Trophy
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Exam, ExamMark, Student } from '../../types';

interface ExaminationsModuleProps {
  initialOpenCreate?: boolean;
}

export const ExaminationsModule: React.FC<ExaminationsModuleProps> = ({ initialOpenCreate = false }) => {
  const { exams, examMarks, students, schoolProfile, store } = useERP();

  const [selectedExamId, setSelectedExamId] = useState<string>(exams[0]?.id || '');
  const [selectedClass, setSelectedClass] = useState<string>('Class 10 (A)');
  const [selectedSubject, setSelectedSubject] = useState<string>('Mathematics');

  // New Exam Modal
  const [showCreateModal, setShowCreateModal] = useState(initialOpenCreate);
  const [newExamName, setNewExamName] = useState('First Term Assessment');
  const [newExamType, setNewExamType] = useState<'Unit Test' | 'Mid-Term' | 'Final'>('Mid-Term');
  const [newExamStart, setNewExamStart] = useState('2025-05-10');
  const [newExamEnd, setNewExamEnd] = useState('2025-05-20');

  // Report Card Generator
  const [activeReportStudent, setActiveReportStudent] = useState<Student | null>(null);

  // Marks Entry Form state
  const classStudents = students.filter(s => `${s.className} (${s.section})` === selectedClass);
  const [marksState, setMarksState] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    students.forEach(s => {
      initial[s.id] = 85;
    });
    return initial;
  });

  const selectedExam = exams.find(e => e.id === selectedExamId);

  const calculateGrade = (marks: number): { grade: string; status: 'PASS' | 'FAIL' } => {
    if (marks >= 90) return { grade: 'A+', status: 'PASS' };
    if (marks >= 80) return { grade: 'A', status: 'PASS' };
    if (marks >= 70) return { grade: 'B', status: 'PASS' };
    if (marks >= 60) return { grade: 'C', status: 'PASS' };
    if (marks >= 50) return { grade: 'D', status: 'PASS' };
    return { grade: 'F', status: 'FAIL' };
  };

  const handleSaveMarks = () => {
    if (!selectedExam) return;

    classStudents.forEach(st => {
      const marks = marksState[st.id] !== undefined ? marksState[st.id] : 85;
      const { grade, status } = calculateGrade(marks);

      store.recordExamMark({
        examId: selectedExam.id,
        studentId: st.id,
        studentName: `${st.firstName} ${st.lastName}`,
        admissionNo: st.admissionNo,
        className: selectedClass,
        subject: selectedSubject,
        maxMarks: 100,
        marksObtained: marks,
        grade,
        resultStatus: status
      });
    });

    store.logAudit('MARKS_RECORDED', 'Examinations', selectedExam.name, `Entered marks for ${selectedClass} - ${selectedSubject}`);
    alert(`Marks for ${selectedSubject} saved and grades calculated successfully.`);
  };

  const handlePublishResults = () => {
    if (!selectedExam) return;
    if (confirm(`Publish official examination results for "${selectedExam.name}"? This action will notify students and record an audit entry.`)) {
      store.publishExam(selectedExam.id);
    }
  };

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.createExam({
      name: newExamName,
      examType: newExamType,
      academicYear: schoolProfile.academicYear,
      startDate: newExamStart,
      endDate: newExamEnd,
      classes: ['Class 10 (A)', 'Class 10 (B)', 'Class 9 (A)', 'Class 9 (B)']
    });
    setShowCreateModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Examinations & Grade Analysis</h1>
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              CBSE Grading Norms
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Configure examination schedules, input marks, compute automated ranks, and publish official report cards.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          {selectedExam && selectedExam.status !== 'PUBLISHED' && (
            <button
              onClick={handlePublishResults}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/20 transition"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Publish Results</span>
            </button>
          )}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Exam</span>
          </button>
        </div>
      </div>

      {/* Active Exams Roster Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {exams.map(exam => {
          const isSelected = exam.id === selectedExamId;

          return (
            <div
              key={exam.id}
              onClick={() => setSelectedExamId(exam.id)}
              className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'bg-blue-50/60 border-blue-500 shadow-md ring-2 ring-blue-500/20'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                    {exam.examType}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    exam.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-700' :
                    exam.status === 'ONGOING' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {exam.status}
                  </span>
                </div>
                <h3 className="font-bold text-slate-900 text-base">{exam.name}</h3>
                <p className="text-xs text-slate-500 mt-1">
                  {exam.startDate} to {exam.endDate}
                </p>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600 font-medium">
                <span>Classes: {exam.classes.length}</span>
                <span className="text-blue-600 font-bold">{isSelected ? 'Active Selection' : 'Click to Select'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Marks Input Panel */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-4">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Class:</span>
              <select
                value={selectedClass}
                onChange={e => setSelectedClass(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium outline-none"
              >
                <option value="Class 10 (A)">Class 10 (A)</option>
                <option value="Class 10 (B)">Class 10 (B)</option>
                <option value="Class 9 (A)">Class 9 (A)</option>
                <option value="Class 9 (B)">Class 9 (B)</option>
              </select>
            </div>

            <div>
              <span className="text-xs font-bold text-slate-700 block mb-1">Subject:</span>
              <select
                value={selectedSubject}
                onChange={e => setSelectedSubject(e.target.value)}
                className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-medium outline-none"
              >
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="English">English</option>
                <option value="Social Science">Social Science</option>
                <option value="Hindi">Hindi</option>
                <option value="Computer">Computer</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleSaveMarks}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <CheckCircle className="w-4 h-4" />
            <span>Save Marks & Calculate Grades</span>
          </button>
        </div>

        {/* Marks Entry Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-2.5 px-3">Roll</th>
                <th className="py-2.5 px-3">Admission #</th>
                <th className="py-2.5 px-3">Student Name</th>
                <th className="py-2.5 px-3">Max Marks</th>
                <th className="py-2.5 px-3">Marks Obtained (0-100)</th>
                <th className="py-2.5 px-3">Computed Grade</th>
                <th className="py-2.5 px-3">Result</th>
                <th className="py-2.5 px-3 text-right">Report Card</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {classStudents.map(student => {
                const mark = marksState[student.id] !== undefined ? marksState[student.id] : 85;
                const { grade, status } = calculateGrade(mark);

                return (
                  <tr key={student.id} className="hover:bg-slate-50">
                    <td className="py-2.5 px-3 font-mono-tech font-bold text-slate-800">#{student.rollNo}</td>
                    <td className="py-2.5 px-3 font-mono-tech text-slate-500">{student.admissionNo}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{student.firstName} {student.lastName}</td>
                    <td className="py-2.5 px-3 font-mono-tech text-slate-500">100</td>
                    <td className="py-2.5 px-3">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        value={mark}
                        onChange={e => setMarksState({ ...marksState, [student.id]: Number(e.target.value) })}
                        className="w-24 border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-mono-tech font-bold text-blue-700 outline-none focus:border-blue-600"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-bold text-xs px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                        {grade}
                      </span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        status === 'PASS' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {status}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => setActiveReportStudent(student)}
                        className="inline-flex items-center space-x-1 px-2.5 py-1 bg-purple-50 text-purple-700 hover:bg-purple-100 rounded-lg text-xs font-semibold"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Report Card</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ============================================================ */}
      {/* STUDENT REPORT CARD PRINTABLE MODAL */}
      {/* ============================================================ */}
      {activeReportStudent && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print">
              <span className="font-bold text-slate-800 text-sm">Official Academic Report Card</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Report Card</span>
                </button>
                <button onClick={() => setActiveReportStudent(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Report Card Paper */}
            <div className="p-8 bg-white space-y-6 text-xs print-container overflow-y-auto">
              <div className="text-center border-b-2 border-slate-800 pb-4">
                <h2 className="text-xl font-bold tracking-wide uppercase text-slate-900 font-serif">
                  {schoolProfile.name}
                </h2>
                <p className="text-slate-600 text-xs font-serif">{schoolProfile.address}</p>
                <p className="text-[10px] text-slate-500 font-mono-tech mt-0.5">
                  Affiliation No: {schoolProfile.affiliationNo} • Academic Session: {schoolProfile.academicYear}
                </p>
                <div className="inline-block mt-3 px-4 py-1 bg-slate-900 text-white font-bold tracking-wider text-xs uppercase rounded">
                  STUDENT PROGRESS REPORT CARD
                </div>
              </div>

              {/* Student Bio */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
                <div>
                  <span className="text-slate-400">Student Name:</span>
                  <span className="font-bold text-slate-900 ml-1">
                    {activeReportStudent.firstName} {activeReportStudent.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Admission No:</span>
                  <span className="font-mono-tech font-bold text-slate-900 ml-1">
                    {activeReportStudent.admissionNo}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Class & Section:</span>
                  <span className="font-bold text-slate-900 ml-1">
                    {activeReportStudent.className} ({activeReportStudent.section})
                  </span>
                </div>
                <div>
                  <span className="text-slate-400">Roll Number:</span>
                  <span className="font-mono-tech font-bold text-slate-900 ml-1">
                    #{activeReportStudent.rollNo}
                  </span>
                </div>
              </div>

              {/* Subject Breakdown Table */}
              <table className="w-full text-left border border-slate-300 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
                  <tr>
                    <th className="py-2 px-3">Subject</th>
                    <th className="py-2 px-3 text-center">Max Marks</th>
                    <th className="py-2 px-3 text-center">Marks Obtained</th>
                    <th className="py-2 px-3 text-center">Grade</th>
                    <th className="py-2 px-3 text-center">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {[
                    { subject: 'Mathematics', max: 100, marks: 94, grade: 'A+' },
                    { subject: 'Science', max: 100, marks: 88, grade: 'A' },
                    { subject: 'English', max: 100, marks: 86, grade: 'A' },
                    { subject: 'Social Science', max: 100, marks: 90, grade: 'A+' },
                    { subject: 'Hindi', max: 100, marks: 82, grade: 'A' },
                    { subject: 'Computer Applications', max: 100, marks: 96, grade: 'A+' },
                  ].map(sub => (
                    <tr key={sub.subject}>
                      <td className="py-2 px-3 font-semibold text-slate-900">{sub.subject}</td>
                      <td className="py-2 px-3 text-center font-mono-tech">{sub.max}</td>
                      <td className="py-2 px-3 text-center font-mono-tech font-bold text-blue-700">{sub.marks}</td>
                      <td className="py-2 px-3 text-center font-bold text-emerald-700">{sub.grade}</td>
                      <td className="py-2 px-3 text-center text-slate-500">Excellent</td>
                    </tr>
                  ))}
                  <tr className="bg-slate-100 font-bold text-slate-900">
                    <td className="py-2 px-3">Grand Total</td>
                    <td className="py-2 px-3 text-center font-mono-tech">600</td>
                    <td className="py-2 px-3 text-center font-mono-tech text-emerald-700">546 / 600</td>
                    <td className="py-2 px-3 text-center text-emerald-700">91% (A+)</td>
                    <td className="py-2 px-3 text-center text-emerald-700">Distinction</td>
                  </tr>
                </tbody>
              </table>

              {/* Attendance and Teacher Remarks */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="border border-slate-200 p-3 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-700 block mb-1">Attendance Record:</span>
                  <p className="text-slate-600">Total Working Days: 180 | Days Present: 172 ({activeReportStudent.attendancePercent}%)</p>
                </div>
                <div className="border border-slate-200 p-3 rounded-xl bg-slate-50">
                  <span className="font-bold text-slate-700 block mb-1">Class Teacher Remarks:</span>
                  <p className="text-slate-600 italic">"Shows exceptional analytical aptitude and consistent discipline."</p>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-10 flex justify-between items-end text-xs font-medium text-slate-800 px-4">
                <div className="text-center">
                  <div className="w-32 border-b border-slate-600 mb-1" />
                  <span>Class Teacher</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-600 mb-1" />
                  <span>Parent / Guardian</span>
                </div>
                <div className="text-center">
                  <div className="w-32 border-b border-slate-600 mb-1" />
                  <span className="font-bold">Principal ({schoolProfile.principal})</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE EXAM MODAL */}
      {/* ============================================================ */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Schedule New Examination</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateExamSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Name *</label>
                <input
                  type="text"
                  required
                  value={newExamName}
                  onChange={e => setNewExamName(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Exam Type</label>
                <select
                  value={newExamType}
                  onChange={e => setNewExamType(e.target.value as any)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                >
                  <option value="Unit Test">Unit Test</option>
                  <option value="Mid-Term">Mid-Term</option>
                  <option value="Final">Annual Final</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={newExamStart}
                    onChange={e => setNewExamStart(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={newExamEnd}
                    onChange={e => setNewExamEnd(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Schedule Exam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
