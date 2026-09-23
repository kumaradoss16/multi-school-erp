import React, { useState } from 'react';
import { 
  BookOpen, 
  Plus, 
  Search, 
  BookMarked, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle, 
  X,
  Clock
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Book, BookIssue } from '../../types';

export const LibraryModule: React.FC = () => {
  const { books, bookIssues, students, store } = useERP();

  const [activeTab, setActiveTab] = useState<'catalog' | 'issued'>('catalog');
  const [searchTerm, setSearchTerm] = useState('');
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [showAddBookModal, setShowAddBookModal] = useState(false);

  // Issue modal state
  const [issueBookId, setIssueBookId] = useState<string>(books[0]?.id || '');
  const [issueStudentId, setIssueStudentId] = useState<string>(students[0]?.id || '');
  const [issueDueDate, setIssueDueDate] = useState<string>('2025-05-15');

  // New book state
  const [newTitle, setNewTitle] = useState('');
  const [newAuthor, setNewAuthor] = useState('');
  const [newCategory, setNewCategory] = useState('Science');
  const [newQuantity, setNewQuantity] = useState(5);

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.isbn.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleIssueSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === issueStudentId);
    if (!st || !issueBookId) return;

    store.issueBook(issueBookId, st.id, `${st.firstName} ${st.lastName}`, issueDueDate);
    setShowIssueModal(false);
  };

  const handleAddBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    store.addBook({
      title: newTitle,
      author: newAuthor,
      category: newCategory,
      totalCopies: newQuantity
    });
    setShowAddBookModal(false);
    setNewTitle('');
    setNewAuthor('');
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Library Catalog & Borrowing</h1>
            <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              {books.reduce((acc, b) => acc + b.totalCopies, 0)} Total Volumes
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Catalog book circulation, process student checkouts, and manage due dates and overdue fines.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowAddBookModal(true)}
            className="flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Add Book</span>
          </button>
          <button
            onClick={() => setShowIssueModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-500/25 transition"
          >
            <BookMarked className="w-4 h-4" />
            <span>Issue Book to Student</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('catalog')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'catalog'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Book Repository ({books.length})
        </button>
        <button
          onClick={() => setActiveTab('issued')}
          className={`pb-3 border-b-2 transition ${
            activeTab === 'issued'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Active Checkouts & Returns ({bookIssues.filter(i => i.status === 'ISSUED').length})
        </button>
      </div>

      {activeTab === 'catalog' ? (
        <>
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
            <input
              type="text"
              placeholder="Search by title, author, ISBN..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">ISBN</th>
                  <th className="py-3 px-4">Title & Author</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Total Copies</th>
                  <th className="py-3 px-4">Available</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBooks.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50">
                    <td className="py-3 px-4 font-mono-tech text-slate-500">{b.isbn}</td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{b.title}</div>
                      <div className="text-[11px] text-slate-500">{b.author}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono-tech">{b.totalCopies}</td>
                    <td className="py-3 px-4">
                      <span className={`font-mono-tech font-bold ${
                        b.availableCopies > 0 ? 'text-emerald-600' : 'text-red-500'
                      }`}>
                        {b.availableCopies} left
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {b.availableCopies > 0 ? (
                        <button
                          onClick={() => {
                            setIssueBookId(b.id);
                            setShowIssueModal(true);
                          }}
                          className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold"
                        >
                          Issue
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">Out of Stock</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Issued Books List */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Book Title</th>
                <th className="py-3 px-4">Issued To</th>
                <th className="py-3 px-4">Issue Date</th>
                <th className="py-3 px-4">Due Date</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {bookIssues.map(issue => (
                <tr key={issue.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-slate-900">{issue.bookTitle}</td>
                  <td className="py-3 px-4 text-slate-800 font-medium">{issue.studentName}</td>
                  <td className="py-3 px-4 text-slate-500">{issue.issueDate}</td>
                  <td className="py-3 px-4 text-slate-500 font-semibold">{issue.dueDate}</td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      issue.status === 'ISSUED' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {issue.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    {issue.status === 'ISSUED' && (
                      <button
                        onClick={() => store.returnBook(issue.id)}
                        className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold"
                      >
                        Return Book
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Issue Book to Student</h3>
              <button onClick={() => setShowIssueModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleIssueSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Available Book *</label>
                <select
                  value={issueBookId}
                  onChange={e => setIssueBookId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                >
                  {books.filter(b => b.availableCopies > 0).map(b => (
                    <option key={b.id} value={b.id}>
                      {b.title} by {b.author} ({b.availableCopies} available)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={issueStudentId}
                  onChange={e => setIssueStudentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) — {s.className}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Return Due Date</label>
                <input
                  type="date"
                  value={issueDueDate}
                  onChange={e => setIssueDueDate(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowIssueModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Confirm Checkout
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Book Modal */}
      {showAddBookModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Add New Book Volume</h3>
              <button onClick={() => setShowAddBookModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleAddBookSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Book Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  placeholder="e.g. Modern Physics Concepts"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Author *</label>
                <input
                  type="text"
                  required
                  value={newAuthor}
                  onChange={e => setNewAuthor(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  placeholder="e.g. Dr. H.C. Verma"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  >
                    <option value="Science">Science</option>
                    <option value="Mathematics">Mathematics</option>
                    <option value="Literature">Literature</option>
                    <option value="Social Studies">Social Studies</option>
                    <option value="Computer Science">Computer Science</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Copies Quantity</label>
                  <input
                    type="number"
                    min={1}
                    value={newQuantity}
                    onChange={e => setNewQuantity(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddBookModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Add to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
