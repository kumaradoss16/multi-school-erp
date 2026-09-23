import React, { useState } from 'react';
import { 
  BookOpen, 
  Layers, 
  CheckCircle2, 
  Clock, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Download, 
  HelpCircle, 
  BarChart2, 
  Sparkles, 
  X,
  Award,
  Calendar,
  Check
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { Subject, LessonPlan, QuestionItem, StudyResource } from '../../types';

export const AcademicsModule: React.FC = () => {
  const { subjects, lessonPlans, questions, studyResources, store } = useERP();

  const [activeTab, setActiveTab] = useState<'lessons' | 'questions' | 'curriculum' | 'resources'>('lessons');

  // Lesson Plan state
  const [selectedClassFilter, setSelectedClassFilter] = useState('ALL');
  const [selectedSubjectFilter, setSelectedSubjectFilter] = useState('ALL');
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    className: 'Class 10 (A)',
    subject: 'Mathematics',
    topic: '',
    teacherName: 'Mr. Arvind Verma',
    periodsRequired: 10,
    completionPercent: 0,
    objectives: '',
    status: 'PLANNED' as LessonPlan['status'],
    targetDate: '2025-05-25'
  });

  // Question Bank state
  const [questionSearch, setQuestionSearch] = useState('');
  const [questionSubjectFilter, setQuestionSubjectFilter] = useState('ALL');
  const [questionDifficultyFilter, setQuestionDifficultyFilter] = useState('ALL');
  const [revealedAnswers, setRevealedAnswers] = useState<Record<string, boolean>>({});
  const [showAddQuestionModal, setShowAddQuestionModal] = useState(false);
  const [showPaperGeneratorModal, setShowPaperGeneratorModal] = useState(false);
  const [newQuestionData, setNewQuestionData] = useState({
    subject: 'Mathematics',
    topic: '',
    type: 'MCQ' as QuestionItem['type'],
    question: '',
    options: ['', '', '', ''],
    correctAnswer: '',
    difficulty: 'MEDIUM' as QuestionItem['difficulty'],
    marks: 1
  });

  // Toggle answer reveal
  const toggleAnswer = (id: string) => {
    setRevealedAnswers(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Filtered Lessons
  const filteredLessons = lessonPlans.filter(lp => {
    const matchesClass = selectedClassFilter === 'ALL' || lp.className.includes(selectedClassFilter);
    const matchesSubject = selectedSubjectFilter === 'ALL' || lp.subject === selectedSubjectFilter;
    return matchesClass && matchesSubject;
  });

  // Filtered Questions
  const filteredQuestions = questions.filter(q => {
    const matchesSearch = 
      q.question.toLowerCase().includes(questionSearch.toLowerCase()) ||
      q.topic.toLowerCase().includes(questionSearch.toLowerCase());
    const matchesSubject = questionSubjectFilter === 'ALL' || q.subject === questionSubjectFilter;
    const matchesDifficulty = questionDifficultyFilter === 'ALL' || q.difficulty === questionDifficultyFilter;
    return matchesSearch && matchesSubject && matchesDifficulty;
  });

  const handleAddLessonSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonData.topic || !newLessonData.objectives) return;
    store.addLessonPlan(newLessonData);
    setShowAddLessonModal(false);
    setNewLessonData({
      className: 'Class 10 (A)',
      subject: 'Mathematics',
      topic: '',
      teacherName: 'Mr. Arvind Verma',
      periodsRequired: 10,
      completionPercent: 0,
      objectives: '',
      status: 'PLANNED',
      targetDate: '2025-05-25'
    });
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionData.question || !newQuestionData.correctAnswer) return;
    const validOptions = newQuestionData.type === 'MCQ' 
      ? newQuestionData.options.filter(o => o.trim().length > 0)
      : undefined;

    store.addQuestion({
      ...newQuestionData,
      options: validOptions
    });
    setShowAddQuestionModal(false);
    setNewQuestionData({
      subject: 'Mathematics',
      topic: '',
      type: 'MCQ',
      question: '',
      options: ['', '', '', ''],
      correctAnswer: '',
      difficulty: 'MEDIUM',
      marks: 1
    });
  };

  // Analytics
  const avgSyllabusProgress = Math.round(
    lessonPlans.reduce((acc, curr) => acc + curr.completionPercent, 0) / (lessonPlans.length || 1)
  );

  return (
    <div id="academics-module" className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center font-bold">
            <BookOpen className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Academics, Syllabus & Question Bank</h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Lesson planning trackers, question repository with answer keys, subject curriculum, and digital resources
            </p>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center space-x-2 bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('lessons')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'lessons' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lesson Plans ({lessonPlans.length})
          </button>
          <button
            onClick={() => setActiveTab('questions')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'questions' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Question Bank ({questions.length})
          </button>
          <button
            onClick={() => setActiveTab('curriculum')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'curriculum' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Curriculum ({subjects.length})
          </button>
          <button
            onClick={() => setActiveTab('resources')}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition ${
              activeTab === 'resources' 
                ? 'bg-white text-indigo-600 shadow-xs' 
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Study Resources ({studyResources.length})
          </button>
        </div>
      </div>

      {/* KPI Highlights */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Average Syllabus Completion</div>
          <div className="text-2xl font-bold text-indigo-600 mt-1">{avgSyllabusProgress}%</div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${avgSyllabusProgress}%` }} />
          </div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Active Lesson Plans</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{lessonPlans.length}</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-1">Across 6 Academic Grades</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Verified Question Bank</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{questions.length} Items</div>
          <div className="text-[11px] text-blue-600 font-medium mt-1">MCQ, Short, & Long Answers</div>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
          <div className="text-xs text-slate-500 font-medium">Curriculum Subjects</div>
          <div className="text-2xl font-bold text-slate-800 mt-1">{subjects.length} Courses</div>
          <div className="text-[11px] text-slate-500 font-medium mt-1">CBSE Affiliation Standard</div>
        </div>
      </div>

      {/* TAB 1: LESSON PLANS */}
      {activeTab === 'lessons' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-3">
              <select
                value={selectedClassFilter}
                onChange={e => setSelectedClassFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Classes</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 8">Class 8</option>
              </select>

              <select
                value={selectedSubjectFilter}
                onChange={e => setSelectedSubjectFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Computer Applications">Computer Applications</option>
              </select>
            </div>

            <button
              onClick={() => setShowAddLessonModal(true)}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Lesson Plan</span>
            </button>
          </div>

          {/* Lesson Plans Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredLessons.map(lp => (
              <div key={lp.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-indigo-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                      {lp.className} • {lp.subject}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      lp.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                      lp.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {lp.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">{lp.topic}</h3>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">{lp.objectives}</p>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Faculty:</span>
                      <span className="font-semibold text-slate-800">{lp.teacherName}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 block">Target:</span>
                      <span className="font-mono-tech text-slate-800">{lp.targetDate}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-slate-500 font-medium">Syllabus Completion</span>
                    <span className="font-bold text-indigo-600 font-mono-tech">{lp.completionPercent}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        lp.completionPercent === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                      }`}
                      style={{ width: `${lp.completionPercent}%` }}
                    />
                  </div>

                  {/* Quick Progress Buttons */}
                  <div className="mt-3 flex items-center justify-end space-x-1">
                    {[25, 50, 75, 100].map(pct => (
                      <button
                        key={pct}
                        onClick={() => {
                          const status = pct === 100 ? 'COMPLETED' : 'IN_PROGRESS';
                          store.updateLessonPlanProgress(lp.id, pct, status);
                        }}
                        className={`text-[10px] px-2 py-0.5 rounded font-mono-tech font-semibold transition ${
                          lp.completionPercent === pct 
                            ? 'bg-indigo-600 text-white' 
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {pct}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: QUESTION BANK */}
      {activeTab === 'questions' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200/80">
            <div className="flex items-center space-x-3 flex-1 max-w-lg">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search question text, topic keywords..."
                  value={questionSearch}
                  onChange={e => setQuestionSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
              <select
                value={questionSubjectFilter}
                onChange={e => setQuestionSubjectFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Subjects</option>
                <option value="Mathematics">Mathematics</option>
                <option value="Science">Science</option>
                <option value="Computer Applications">Computer Applications</option>
              </select>
              <select
                value={questionDifficultyFilter}
                onChange={e => setQuestionDifficultyFilter(e.target.value)}
                className="text-xs border border-slate-200 rounded-lg px-2.5 py-2 bg-white text-slate-700"
              >
                <option value="ALL">All Difficulties</option>
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={() => setShowPaperGeneratorModal(true)}
                className="px-3 py-2 border border-indigo-200 bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
              >
                <FileText className="w-4 h-4" />
                <span>Compile Test Paper</span>
              </button>
              <button
                onClick={() => setShowAddQuestionModal(true)}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center space-x-1.5 shadow-xs transition"
              >
                <Plus className="w-4 h-4" />
                <span>Add Question</span>
              </button>
            </div>
          </div>

          {/* Question List */}
          <div className="space-y-3">
            {filteredQuestions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs hover:border-slate-300 transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Q{idx + 1}. {q.subject}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">Topic: {q.topic}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        q.difficulty === 'EASY' ? 'bg-emerald-100 text-emerald-800' :
                        q.difficulty === 'MEDIUM' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {q.difficulty}
                      </span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {q.type} • {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                    </div>

                    <p className="text-sm font-semibold text-slate-800 leading-relaxed">{q.question}</p>

                    {/* MCQ Options if present */}
                    {q.options && q.options.length > 0 && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-xs">
                        {q.options.map((opt, oIdx) => (
                          <div 
                            key={oIdx} 
                            className={`p-2 rounded-lg border text-slate-700 ${
                              revealedAnswers[q.id] && opt === q.correctAnswer
                                ? 'bg-emerald-50 border-emerald-300 font-bold text-emerald-800'
                                : 'bg-slate-50 border-slate-200'
                            }`}
                          >
                            <span className="font-bold mr-1.5">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Revealed Answer Box */}
                    {revealedAnswers[q.id] && (
                      <div className="mt-3 p-3 bg-emerald-50/60 border border-emerald-200 rounded-lg text-xs text-emerald-900 animate-in fade-in duration-150">
                        <strong className="block text-[11px] uppercase tracking-wider text-emerald-800 mb-0.5">
                          Official Answer Key / Marking Criteria:
                        </strong>
                        <p>{q.correctAnswer}</p>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => toggleAnswer(q.id)}
                    className="shrink-0 text-xs font-semibold px-3 py-1.5 border border-slate-200 hover:bg-slate-50 rounded-lg text-slate-700 transition"
                  >
                    {revealedAnswers[q.id] ? 'Hide Answer' : 'Show Answer'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CURRICULUM */}
      {activeTab === 'curriculum' && (
        <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Institutional Subjects & Academic Offerings</h2>
              <p className="text-xs text-slate-500">Configured course codes and practical laboratory allocations</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Subject Code</th>
                  <th className="py-3 px-4">Course Name</th>
                  <th className="py-3 px-4">Assessment Mode</th>
                  <th className="py-3 px-4">Department</th>
                  <th className="py-3 px-4">Allocated Grades</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {subjects.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4 font-mono-tech font-bold text-indigo-700">{s.code}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">{s.name}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        s.type === 'BOTH' ? 'bg-purple-100 text-purple-800' :
                        s.type === 'PRACTICAL' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {s.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-600">{s.department}</td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {s.classes.map((cls, i) => (
                          <span key={i} className="px-2 py-0.5 rounded text-[10px] font-mono-tech bg-slate-100 text-slate-700">
                            {cls}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        Active Syllabus
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STUDY RESOURCES */}
      {activeTab === 'resources' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {studyResources.map(res => (
            <div key={res.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                    {res.fileType} • {res.size}
                  </span>
                  <span className="text-xs font-mono-tech text-slate-400">{res.uploadDate}</span>
                </div>

                <h3 className="font-bold text-slate-900 text-sm mt-3 leading-snug">{res.title}</h3>
                <div className="text-xs text-indigo-600 font-medium mt-1">{res.subject} • {res.className}</div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-500 truncate max-w-[150px]">By {res.uploadedBy}</span>
                <button
                  onClick={() => alert(`Downloading official study material:\n"${res.title}" (${res.fileType} - ${res.size})`)}
                  className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL: ADD LESSON PLAN */}
      {showAddLessonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Create Curriculum Lesson Plan</h2>
              <button onClick={() => setShowAddLessonModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddLessonSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Grade & Section *</label>
                  <select
                    value={newLessonData.className}
                    onChange={e => setNewLessonData({ ...newLessonData, className: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Class 10 (A)">Class 10 (A)</option>
                    <option value="Class 10 (B)">Class 10 (B)</option>
                    <option value="Class 9 (A)">Class 9 (A)</option>
                    <option value="Class 9 (B)">Class 9 (B)</option>
                    <option value="Class 8 (A)">Class 8 (A)</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Subject *</label>
                  <select
                    value={newLessonData.subject}
                    onChange={e => setNewLessonData({ ...newLessonData, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="English Language & Lit">English</option>
                    <option value="Social Sciences">Social Sciences</option>
                    <option value="Computer Applications">Computer Applications</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Topic / Chapter Title *</label>
                <input
                  type="text"
                  required
                  value={newLessonData.topic}
                  onChange={e => setNewLessonData({ ...newLessonData, topic: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="e.g. Linear Equations in Two Variables"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Assigned Teacher</label>
                  <input
                    type="text"
                    value={newLessonData.teacherName}
                    onChange={e => setNewLessonData({ ...newLessonData, teacherName: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  />
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Target Completion Date</label>
                  <input
                    type="date"
                    value={newLessonData.targetDate}
                    onChange={e => setNewLessonData({ ...newLessonData, targetDate: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono-tech"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Learning Objectives & Outcomes *</label>
                <textarea
                  required
                  rows={3}
                  value={newLessonData.objectives}
                  onChange={e => setNewLessonData({ ...newLessonData, objectives: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Key concepts to cover, hands-on lab exercises, and assignment references..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddLessonModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Save Lesson Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD QUESTION */}
      {showAddQuestionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">Add Item to Question Bank</h2>
              <button onClick={() => setShowAddQuestionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddQuestionSubmit} className="space-y-4 pt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Subject *</label>
                  <select
                    value={newQuestionData.subject}
                    onChange={e => setNewQuestionData({ ...newQuestionData, subject: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Computer Applications">Computer Applications</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Topic *</label>
                  <input
                    type="text"
                    required
                    value={newQuestionData.topic}
                    onChange={e => setNewQuestionData({ ...newQuestionData, topic: e.target.value })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                    placeholder="e.g. Thermodynamics"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Question Type</label>
                  <select
                    value={newQuestionData.type}
                    onChange={e => setNewQuestionData({ ...newQuestionData, type: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="MCQ">Multiple Choice</option>
                    <option value="SHORT">Short Answer</option>
                    <option value="LONG">Long Answer</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Difficulty</label>
                  <select
                    value={newQuestionData.difficulty}
                    onChange={e => setNewQuestionData({ ...newQuestionData, difficulty: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-lg p-2"
                  >
                    <option value="EASY">Easy</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HARD">Hard</option>
                  </select>
                </div>
                <div>
                  <label className="font-medium text-slate-700 block mb-1">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={newQuestionData.marks}
                    onChange={e => setNewQuestionData({ ...newQuestionData, marks: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-lg p-2 font-mono-tech"
                  />
                </div>
              </div>

              <div>
                <label className="font-medium text-slate-700 block mb-1">Question Prompt *</label>
                <textarea
                  required
                  rows={3}
                  value={newQuestionData.question}
                  onChange={e => setNewQuestionData({ ...newQuestionData, question: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Write the complete question statement..."
                />
              </div>

              {newQuestionData.type === 'MCQ' && (
                <div className="space-y-2">
                  <label className="font-medium text-slate-700 block">MCQ Options (A to D)</label>
                  {newQuestionData.options.map((opt, i) => (
                    <input
                      key={i}
                      type="text"
                      placeholder={`Option ${String.fromCharCode(65 + i)}`}
                      value={opt}
                      onChange={e => {
                        const copy = [...newQuestionData.options];
                        copy[i] = e.target.value;
                        setNewQuestionData({ ...newQuestionData, options: copy });
                      }}
                      className="w-full border border-slate-200 rounded-lg p-2 text-xs"
                    />
                  ))}
                </div>
              )}

              <div>
                <label className="font-medium text-slate-700 block mb-1">Correct Answer / Solution Key *</label>
                <textarea
                  required
                  rows={2}
                  value={newQuestionData.correctAnswer}
                  onChange={e => setNewQuestionData({ ...newQuestionData, correctAnswer: e.target.value })}
                  className="w-full border border-slate-200 rounded-lg p-2"
                  placeholder="Correct option or standard evaluation criteria..."
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddQuestionModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-semibold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: COMPILE TEST PAPER */}
      {showPaperGeneratorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="font-bold text-slate-900 text-base">CBSE Formatted Examination Paper Preview</h2>
              <button onClick={() => setShowPaperGeneratorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-xl my-4 text-xs space-y-4">
              <div className="text-center space-y-1 border-b border-slate-200 pb-3">
                <div className="font-bold text-slate-900 text-base">DELHI PUBLIC INTERNATIONAL SCHOOL</div>
                <div className="text-slate-500">MID-TERM PERIODIC EXAMINATION 2024-2025</div>
                <div className="font-semibold text-indigo-700">SUBJECT: MATHEMATICS & SCIENCE (SET - A)</div>
                <div className="flex justify-between text-[11px] text-slate-600 pt-2 font-mono-tech">
                  <span>Time Allowed: 3 Hours</span>
                  <span>Maximum Marks: 80</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider text-slate-500">
                  SECTION A — OBJECTIVE & MULTIPLE CHOICE QUESTIONS
                </div>
                {questions.map((q, idx) => (
                  <div key={q.id} className="space-y-1.5 pl-2 border-l-2 border-indigo-200">
                    <div className="flex justify-between">
                      <span className="font-bold text-slate-900">Q.{idx + 1} {q.question}</span>
                      <span className="font-mono-tech font-bold text-slate-500">[{q.marks}]</span>
                    </div>
                    {q.options && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {q.options.map((opt, oIdx) => (
                          <span key={oIdx} className="text-slate-700">
                            ({String.fromCharCode(97 + oIdx)}) {opt}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowPaperGeneratorModal(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700"
              >
                Close
              </button>
              <button
                onClick={() => window.print()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold"
              >
                Print Question Paper
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
