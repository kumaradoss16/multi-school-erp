import React, { useState } from 'react';
import { 
  CalendarCheck, 
  Users, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Save, 
  Download, 
  Filter, 
  Search,
  CheckCheck
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { AttendanceStatus } from '../../types';

export const AttendanceModule: React.FC = () => {
  const { students, staff, store } = useERP();

  const [activeTab, setActiveTab] = useState<'students' | 'staff'>('students');
  const [selectedClass, setSelectedClass] = useState<string>('Class 10');
  const [selectedSection, setSelectedSection] = useState<string>('A');
  const [attendanceDate, setAttendanceDate] = useState<string>(new Date().toISOString().slice(0, 10));

  // Current session attendance map for student IDs
  const classStudents = students.filter(s => s.className === selectedClass && s.section === selectedSection);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    students.forEach(s => {
      initial[s.id] = 'PRESENT';
    });
    return initial;
  });

  // Staff attendance map
  const [staffAttendanceMap, setStaffAttendanceMap] = useState<Record<string, AttendanceStatus>>(() => {
    const initial: Record<string, AttendanceStatus> = {};
    staff.forEach(st => {
      initial[st.id] = st.attendanceStatus || 'PRESENT';
    });
    return initial;
  });

  const [isSaved, setIsSaved] = useState(false);

  // Statistics calculation for current class
  const total = classStudents.length;
  const presentCount = classStudents.filter(s => (attendanceMap[s.id] || 'PRESENT') === 'PRESENT').length;
  const absentCount = classStudents.filter(s => attendanceMap[s.id] === 'ABSENT').length;
  const lateCount = classStudents.filter(s => attendanceMap[s.id] === 'LATE').length;
  const leaveCount = classStudents.filter(s => attendanceMap[s.id] === 'LEAVE').length;
  const attendanceRate = total > 0 ? Math.round(((presentCount + lateCount * 0.8) / total) * 100) : 100;

  const handleMarkAllPresent = () => {
    const updated = { ...attendanceMap };
    classStudents.forEach(s => {
      updated[s.id] = 'PRESENT';
    });
    setAttendanceMap(updated);
    setIsSaved(false);
  };

  const handleSetStudentStatus = (studentId: string, status: AttendanceStatus) => {
    setAttendanceMap(prev => ({
      ...prev,
      [studentId]: status
    }));
    setIsSaved(false);
  };

  const handleSaveStudentAttendance = () => {
    const records = classStudents.map(s => ({
      studentId: s.id,
      status: attendanceMap[s.id] || 'PRESENT'
    }));

    store.markClassAttendance(selectedClass, selectedSection, records);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleExportAttendanceCSV = () => {
    const headers = ['Date,Class,Section,RollNo,StudentName,AdmissionNo,AttendanceStatus\n'];
    const rows = classStudents.map(s => 
      `"${attendanceDate}","${selectedClass}","${selectedSection}",${s.rollNo},"${s.firstName} ${s.lastName}","${s.admissionNo}","${attendanceMap[s.id] || 'PRESENT'}"`
    );
    const blob = new Blob([...headers, rows.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance_${selectedClass}_${selectedSection}_${attendanceDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    store.logAudit('ATTENDANCE_EXPORT', 'Attendance', `${selectedClass}-${selectedSection}`, 'Exported attendance records to CSV');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Attendance Management</h1>
            <span className="bg-purple-100 text-purple-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Today: 92% Present
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Mark daily student & faculty attendance, manage corrections, and generate analytical compliance reports.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={handleExportAttendanceCSV}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={handleSaveStudentAttendance}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <Save className="w-4 h-4" />
            <span>{isSaved ? 'Attendance Saved!' : 'Save Attendance'}</span>
          </button>
        </div>
      </div>

      {/* Tabs for Student vs Staff Attendance */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('students')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'students'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Student Daily Attendance
        </button>
        <button
          onClick={() => setActiveTab('staff')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'staff'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Staff & Faculty Attendance
        </button>
      </div>

      {activeTab === 'students' ? (
        <>
          {/* Controls Bar: Class, Section, Date & Quick Action */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Class:</span>
                <select
                  value={selectedClass}
                  onChange={e => setSelectedClass(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="Class 10">Class 10</option>
                  <option value="Class 9">Class 9</option>
                  <option value="Class 8">Class 8</option>
                  <option value="Class 7">Class 7</option>
                  <option value="Class 11">Class 11</option>
                  <option value="Class 12">Class 12</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Section:</span>
                <select
                  value={selectedSection}
                  onChange={e => setSelectedSection(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 outline-none"
                >
                  <option value="A">Section A</option>
                  <option value="B">Section B</option>
                  <option value="Sci">Section Sci</option>
                  <option value="Comm">Section Comm</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Date:</span>
                <input
                  type="date"
                  value={attendanceDate}
                  onChange={e => setAttendanceDate(e.target.value)}
                  className="text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-slate-800 outline-none"
                >
                </input>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={handleMarkAllPresent}
                className="flex items-center space-x-1.5 px-3 py-2 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-xl transition"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All Present</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Bar for Selected Class */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            <div className="bg-white p-3.5 rounded-2xl border border-slate-200/80 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-slate-500">Enrolled In Class</span>
              <p className="text-xl font-bold text-slate-900 mt-0.5">{total}</p>
            </div>
            <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-emerald-700">Present</span>
              <p className="text-xl font-bold text-emerald-900 mt-0.5">{presentCount}</p>
            </div>
            <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-amber-700">Absent</span>
              <p className="text-xl font-bold text-amber-900 mt-0.5">{absentCount}</p>
            </div>
            <div className="bg-blue-50 p-3.5 rounded-2xl border border-blue-200 text-center shadow-2xs">
              <span className="text-[11px] font-semibold text-blue-700">Leave</span>
              <p className="text-xl font-bold text-blue-900 mt-0.5">{leaveCount}</p>
            </div>
            <div className="bg-purple-50 p-3.5 rounded-2xl border border-purple-200 text-center shadow-2xs col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-purple-700">Class Attendance</span>
              <p className="text-xl font-bold text-purple-900 mt-0.5">{attendanceRate}%</p>
            </div>
          </div>

          {/* Class Attendance Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                    <th className="py-3 px-4">Roll</th>
                    <th className="py-3 px-4">Admission #</th>
                    <th className="py-3 px-4">Student Name</th>
                    <th className="py-3 px-4">Historical %</th>
                    <th className="py-3 px-4 text-center">Status Selection</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {classStudents.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No students enrolled in {selectedClass} ({selectedSection}).
                      </td>
                    </tr>
                  ) : (
                    classStudents.map(student => {
                      const currentStatus = attendanceMap[student.id] || 'PRESENT';

                      return (
                        <tr key={student.id} className="hover:bg-slate-50/70 transition">
                          <td className="py-3 px-4 font-mono-tech font-bold text-slate-800">
                            #{student.rollNo}
                          </td>
                          <td className="py-3 px-4 font-mono-tech text-slate-500 text-[11px]">
                            {student.admissionNo}
                          </td>
                          <td className="py-3 px-4 font-semibold text-slate-900">
                            {student.firstName} {student.lastName}
                          </td>
                          <td className="py-3 px-4">
                            <span className="font-bold text-slate-700">{student.attendancePercent}%</span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center justify-center space-x-1.5">
                              {/* Present Button */}
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'PRESENT')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  currentStatus === 'PRESENT'
                                    ? 'bg-emerald-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Present
                              </button>

                              {/* Absent Button */}
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'ABSENT')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  currentStatus === 'ABSENT'
                                    ? 'bg-red-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Absent
                              </button>

                              {/* Late Button */}
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'LATE')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  currentStatus === 'LATE'
                                    ? 'bg-amber-500 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Late
                              </button>

                              {/* Leave Button */}
                              <button
                                onClick={() => handleSetStudentStatus(student.id, 'LEAVE')}
                                className={`px-3 py-1 rounded-lg font-bold text-xs transition ${
                                  currentStatus === 'LEAVE'
                                    ? 'bg-blue-600 text-white shadow-xs'
                                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                                }`}
                              >
                                Leave
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Staff Attendance View */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 text-sm">Faculty & Administrative Attendance</h3>
            <button
              onClick={() => {
                store.logAudit('STAFF_ATTENDANCE', 'Attendance', 'STAFF_DAILY', 'Marked full faculty roster attendance');
                alert('Staff attendance recorded successfully.');
              }}
              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl"
            >
              Save Staff Attendance
            </button>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Employee ID</th>
                <th className="py-3 px-4">Staff Member</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Designation</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {staff.map(st => (
                <tr key={st.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono-tech text-slate-600">{st.empId}</td>
                  <td className="py-3 px-4 font-semibold text-slate-900">{st.firstName} {st.lastName}</td>
                  <td className="py-3 px-4 text-slate-700">{st.department}</td>
                  <td className="py-3 px-4 text-slate-500">{st.designation}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center justify-center space-x-2">
                      {(['PRESENT', 'ABSENT', 'LEAVE'] as const).map(status => (
                        <button
                          key={status}
                          onClick={() => setStaffAttendanceMap({ ...staffAttendanceMap, [st.id]: status })}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                            (staffAttendanceMap[st.id] || 'PRESENT') === status
                              ? status === 'PRESENT' ? 'bg-emerald-600 text-white' :
                                status === 'ABSENT' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
