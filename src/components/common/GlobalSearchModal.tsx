import React, { useState, useEffect, useRef } from 'react';
import { Search, X, Users, UserCheck, BookOpen, Banknote, UserPlus, ArrowRight } from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ERPModule } from '../layout/Sidebar';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectModule: (module: ERPModule) => void;
  onSelectStudent?: (studentId: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectModule,
  onSelectStudent
}) => {
  const { students, staff, admissions, invoices, books, classes } = useERP();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Parent will handle
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const trimmed = query.trim().toLowerCase();

  // Search Results
  const matchedStudents = trimmed
    ? students.filter(
        s =>
          s.firstName.toLowerCase().includes(trimmed) ||
          s.lastName.toLowerCase().includes(trimmed) ||
          s.admissionNo.toLowerCase().includes(trimmed) ||
          s.className.toLowerCase().includes(trimmed) ||
          s.parentName.toLowerCase().includes(trimmed)
      ).slice(0, 4)
    : [];

  const matchedStaff = trimmed
    ? staff.filter(
        st =>
          st.firstName.toLowerCase().includes(trimmed) ||
          st.lastName.toLowerCase().includes(trimmed) ||
          st.empId.toLowerCase().includes(trimmed) ||
          st.department.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedInvoices = trimmed
    ? invoices.filter(
        inv =>
          inv.invoiceNo.toLowerCase().includes(trimmed) ||
          inv.studentName.toLowerCase().includes(trimmed) ||
          inv.feeType.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedAdmissions = trimmed
    ? admissions.filter(
        adm =>
          adm.studentName.toLowerCase().includes(trimmed) ||
          adm.applicationNo.toLowerCase().includes(trimmed) ||
          adm.appliedClass.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const matchedBooks = trimmed
    ? books.filter(
        b =>
          b.title.toLowerCase().includes(trimmed) ||
          b.author.toLowerCase().includes(trimmed) ||
          b.isbn.toLowerCase().includes(trimmed)
      ).slice(0, 3)
    : [];

  const totalResults =
    matchedStudents.length +
    matchedStaff.length +
    matchedInvoices.length +
    matchedAdmissions.length +
    matchedBooks.length;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-start justify-center pt-20 px-4 animate-in fade-in duration-100">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        {/* Search Input Box */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-blue-600 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search students, staff, admission numbers, invoices, books..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full text-base outline-none text-slate-800 placeholder-slate-400 bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="ml-2 text-xs font-mono-tech px-2 py-1 bg-slate-100 text-slate-500 rounded border border-slate-200 hover:bg-slate-200"
          >
            ESC
          </button>
        </div>

        {/* Results Area */}
        <div className="max-h-96 overflow-y-auto p-3 space-y-4">
          {!trimmed && (
            <div className="py-8 text-center text-slate-400 text-sm">
              <p>Type to search across all school records.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-slate-500">
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Class 10</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Rohan</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">INV-2025</span>
                <span className="px-2.5 py-1 bg-slate-100 rounded-lg">Science</span>
              </div>
            </div>
          )}

          {trimmed && totalResults === 0 && (
            <div className="py-8 text-center text-slate-500 text-sm">
              No records found matching <span className="font-semibold text-slate-800">"{query}"</span>.
            </div>
          )}

          {/* Students Group */}
          {matchedStudents.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <Users className="w-3.5 h-3.5 mr-1 text-blue-500" />
                Students
              </div>
              <div className="space-y-1">
                {matchedStudents.map(student => (
                  <div
                    key={student.id}
                    onClick={() => {
                      onSelectModule('students');
                      if (onSelectStudent) onSelectStudent(student.id);
                      onClose();
                    }}
                    className="p-2.5 hover:bg-blue-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs">
                        {student.firstName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {student.firstName} {student.lastName}
                        </div>
                        <div className="text-slate-500 font-mono-tech text-[11px]">
                          {student.admissionNo} • {student.className} ({student.section})
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Staff Group */}
          {matchedStaff.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <UserCheck className="w-3.5 h-3.5 mr-1 text-emerald-500" />
                Staff Members
              </div>
              <div className="space-y-1">
                {matchedStaff.map(st => (
                  <div
                    key={st.id}
                    onClick={() => {
                      onSelectModule('staff');
                      onClose();
                    }}
                    className="p-2.5 hover:bg-emerald-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                        {st.firstName[0]}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-800">
                          {st.firstName} {st.lastName}
                        </div>
                        <div className="text-slate-500 text-[11px]">
                          {st.empId} • {st.department} • {st.designation}
                        </div>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Invoices Group */}
          {matchedInvoices.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <Banknote className="w-3.5 h-3.5 mr-1 text-amber-500" />
                Fee Invoices
              </div>
              <div className="space-y-1">
                {matchedInvoices.map(inv => (
                  <div
                    key={inv.id}
                    onClick={() => {
                      onSelectModule('fees');
                      onClose();
                    }}
                    className="p-2.5 hover:bg-amber-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {inv.invoiceNo} — {inv.studentName}
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        {inv.feeType} • Total: ₹{inv.totalAmount.toLocaleString()} • Balance: ₹{inv.balance.toLocaleString()}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                      inv.status === 'OVERDUE' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {inv.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Admissions Group */}
          {matchedAdmissions.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <UserPlus className="w-3.5 h-3.5 mr-1 text-purple-500" />
                Admissions
              </div>
              <div className="space-y-1">
                {matchedAdmissions.map(adm => (
                  <div
                    key={adm.id}
                    onClick={() => {
                      onSelectModule('admissions');
                      onClose();
                    }}
                    className="p-2.5 hover:bg-purple-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">
                        {adm.studentName} ({adm.applicationNo})
                      </div>
                      <div className="text-slate-500 text-[11px]">
                        Class: {adm.appliedClass} • Parent: {adm.parentName} • Status: {adm.status}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Books Group */}
          {matchedBooks.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1 flex items-center">
                <BookOpen className="w-3.5 h-3.5 mr-1 text-cyan-500" />
                Library Books
              </div>
              <div className="space-y-1">
                {matchedBooks.map(b => (
                  <div
                    key={b.id}
                    onClick={() => {
                      onSelectModule('library');
                      onClose();
                    }}
                    className="p-2.5 hover:bg-cyan-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition"
                  >
                    <div>
                      <div className="font-semibold text-slate-800">{b.title}</div>
                      <div className="text-slate-500 text-[11px]">
                        Author: {b.author} • Available: {b.availableCopies}/{b.totalCopies}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-500 border-t border-slate-200 flex items-center justify-between">
          <span>Navigate with mouse or keyboard</span>
          <span>Press ESC to dismiss</span>
        </div>
      </div>
    </div>
  );
};
