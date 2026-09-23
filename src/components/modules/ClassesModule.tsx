import React, { useState } from 'react';
import { 
  GraduationCap, 
  Plus, 
  Calendar, 
  Users, 
  Clock, 
  BookOpen, 
  Edit2, 
  X,
  Sparkles
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ClassInfo, TimetableSlot } from '../../types';

export const ClassesModule: React.FC = () => {
  const { classes, students, staff, store } = useERP();

  const [selectedClassId, setSelectedClassId] = useState<string>(classes[0]?.id || '');
  const [activeTab, setActiveTab] = useState<'roster' | 'timetable'>('roster');

  const selectedClass = classes.find(c => c.id === selectedClassId) || classes[0];
  const enrolledStudents = students.filter(
    s => s.className === selectedClass?.name && s.section === selectedClass?.section
  );

  // Timetable days
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Classes & Timetable Schedules</h1>
            <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {classes.length} Active Classes
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Organize academic grades, section capacities, class mentor faculty, and weekly lecture timetables.
          </p>
        </div>
      </div>

      {/* Class Selector Badges */}
      <div className="flex flex-wrap gap-2.5">
        {classes.map(cls => (
          <button
            key={cls.id}
            onClick={() => setSelectedClassId(cls.id)}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition flex items-center space-x-2 ${
              cls.id === selectedClass?.id
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <span>{cls.name} ({cls.section})</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
              cls.id === selectedClass?.id ? 'bg-blue-700 text-blue-100' : 'bg-slate-100 text-slate-500'
            }`}>
              {students.filter(s => s.className === cls.name && s.section === cls.section).length} students
            </span>
          </button>
        ))}
      </div>

      {/* Selected Class Meta Card */}
      {selectedClass && (
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Class Mentor / In-charge</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedClass.classTeacher}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Room / Block</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">{selectedClass.roomNo}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Current Enrollment</span>
            <span className="font-bold text-slate-900 text-sm mt-0.5 block">
              {enrolledStudents.length} / {selectedClass.capacity} Max
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Curriculum Subjects</span>
            <div className="flex flex-wrap gap-1 mt-1">
              {selectedClass.subjects.map(s => (
                <span key={s} className="bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('roster')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'roster'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Enrolled Student Roster ({enrolledStudents.length})
        </button>
        <button
          onClick={() => setActiveTab('timetable')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'timetable'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Weekly Timetable Matrix
        </button>
      </div>

      {activeTab === 'roster' ? (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Roll</th>
                <th className="py-3 px-4">Admission #</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Parent Phone</th>
                <th className="py-3 px-4">Attendance</th>
                <th className="py-3 px-4">Fee Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {enrolledStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No students currently assigned to this class section.
                  </td>
                </tr>
              ) : (
                enrolledStudents.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono-tech font-bold text-slate-800">#{st.rollNo}</td>
                    <td className="py-3 px-4 font-mono-tech text-slate-500">{st.admissionNo}</td>
                    <td className="py-3 px-4 font-semibold text-slate-900">{st.firstName} {st.lastName}</td>
                    <td className="py-3 px-4 font-mono-tech text-slate-600">{st.parentPhone}</td>
                    <td className="py-3 px-4 font-bold text-slate-800">{st.attendancePercent}%</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        st.feeStatus === 'PAID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {st.feeStatus}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      ) : (
        /* Weekly Timetable Schedule Matrix */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs p-5 overflow-x-auto">
          <div className="min-w-2xl space-y-4">
            {days.map(day => (
              <div key={day} className="flex items-center space-x-3 text-xs">
                <div className="w-24 font-bold text-slate-800 shrink-0">{day}</div>
                <div className="grid grid-cols-4 gap-2 flex-1">
                  <div className="bg-blue-50 border border-blue-200 p-2.5 rounded-xl">
                    <div className="text-[10px] text-blue-600 font-mono-tech">08:30 - 09:30 AM</div>
                    <div className="font-bold text-slate-900 mt-0.5">Mathematics</div>
                    <div className="text-[10px] text-slate-500">Mr. R. Sharma</div>
                  </div>
                  <div className="bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl">
                    <div className="text-[10px] text-emerald-600 font-mono-tech">09:30 - 10:30 AM</div>
                    <div className="font-bold text-slate-900 mt-0.5">Physics / Science</div>
                    <div className="text-[10px] text-slate-500">Mrs. P. Menon</div>
                  </div>
                  <div className="bg-amber-50 border border-amber-200 p-2.5 rounded-xl">
                    <div className="text-[10px] text-amber-600 font-mono-tech">11:00 - 12:00 PM</div>
                    <div className="font-bold text-slate-900 mt-0.5">English Lit</div>
                    <div className="text-[10px] text-slate-500">Ms. Ananya K.</div>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 p-2.5 rounded-xl">
                    <div className="text-[10px] text-purple-600 font-mono-tech">12:00 - 01:00 PM</div>
                    <div className="font-bold text-slate-900 mt-0.5">Computer Lab</div>
                    <div className="text-[10px] text-slate-500">Lab Room 3</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
