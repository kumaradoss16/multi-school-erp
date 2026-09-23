import React, { useState } from 'react';
import { 
  Banknote, 
  Receipt, 
  Plus, 
  Search, 
  Filter, 
  Printer, 
  Download, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X,
  CreditCard,
  QrCode,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  Tag
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { FeeInvoice, PaymentReceipt, FeeStatus, ExpenseVoucher, IncomeRecord, Vendor } from '../../types';

interface FeesModuleProps {
  initialOpenCollect?: boolean;
}

export const FeesModule: React.FC<FeesModuleProps> = ({ initialOpenCollect = false }) => {
  const { invoices, receipts, students, schoolProfile, store, expenseVouchers, incomeRecords, vendors } = useERP();

  const [activeTab, setActiveTab] = useState<'invoices' | 'receipts' | 'expenses' | 'daybook' | 'vendors'>('invoices');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  // Expense modal
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [newExpenseData, setNewExpenseData] = useState<{
    category: ExpenseVoucher['category'];
    description: string;
    amount: number;
    payeeName: string;
    paymentMethod: ExpenseVoucher['paymentMethod'];
    date: string;
    approvedBy: string;
    status: ExpenseVoucher['status'];
  }>({
    category: 'Utilities',
    description: '',
    amount: 15000,
    payeeName: '',
    paymentMethod: 'Bank Transfer',
    date: new Date().toISOString().slice(0, 10),
    approvedBy: 'Financial Bursar',
    status: 'PAID'
  });

  // Vendor modal
  const [showAddVendorModal, setShowAddVendorModal] = useState(false);
  const [newVendorData, setNewVendorData] = useState<{
    name: string;
    category: Vendor['category'];
    contactPerson: string;
    phone: string;
    email: string;
    gstin: string;
    pendingPayment: number;
    status: Vendor['status'];
  }>({
    name: '',
    category: 'Lab Equipment',
    contactPerson: '',
    phone: '',
    email: '',
    gstin: '07AAAAA0000A1Z5',
    pendingPayment: 0,
    status: 'ACTIVE'
  });

  // Collect Fee Modal
  const [showCollectModal, setShowCollectModal] = useState(initialOpenCollect);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices.find(i => i.balance > 0)?.id || ''
  );
  const [paymentAmount, setPaymentAmount] = useState<number>(5000);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Card' | 'UPI' | 'Net Banking' | 'Cheque'>('UPI');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Active Receipt to Print
  const [activeReceipt, setActiveReceipt] = useState<PaymentReceipt | null>(null);

  // New Invoice Modal
  const [showCreateInvoiceModal, setShowCreateInvoiceModal] = useState(false);
  const [newInvStudentId, setNewInvStudentId] = useState(students[0]?.id || '');
  const [newInvType, setNewInvType] = useState('Quarter 2 Tuition & Activity Fee');
  const [newInvAmount, setNewInvAmount] = useState(25000);
  const [newInvDueDate, setNewInvDueDate] = useState('2025-06-15');

  // Filtered invoices
  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.admissionNo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totalBilled = invoices.reduce((sum, i) => sum + i.totalAmount, 0);
  const totalCollected = invoices.reduce((sum, i) => sum + i.paidAmount, 0);
  const totalOutstanding = invoices.reduce((sum, i) => sum + i.balance, 0);

  const selectedInvoice = invoices.find(i => i.id === selectedInvoiceId);

  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice || paymentAmount <= 0) return;

    const receipt = store.recordPayment({
      invoiceId: selectedInvoice.id,
      amount: Math.min(paymentAmount, selectedInvoice.balance),
      paymentMethod,
      cashierName: store.getState().currentUser.name,
      notes: paymentNotes || `Payment received via ${paymentMethod}`
    });

    if (receipt) {
      setShowCollectModal(false);
      setActiveReceipt(receipt);
      setPaymentNotes('');
    }
  };

  const handleCreateInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const st = students.find(s => s.id === newInvStudentId);
    if (!st) return;

    store.createInvoice({
      studentId: st.id,
      studentName: `${st.firstName} ${st.lastName}`,
      admissionNo: st.admissionNo,
      className: `${st.className} (${st.section})`,
      feeType: newInvType,
      totalAmount: newInvAmount,
      paidAmount: 0,
      balance: newInvAmount,
      dueDate: newInvDueDate,
      status: 'PENDING',
      issueDate: new Date().toISOString().slice(0, 10)
    });

    setShowCreateInvoiceModal(false);
  };

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Fees & Financial Accounting</h1>
            <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
              Outstanding: ₹{totalOutstanding.toLocaleString()}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage fee structures, generate invoices, record payments, and issue tamper-evident fee receipts.
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowCreateInvoiceModal(true)}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs transition"
          >
            <Plus className="w-4 h-4 text-slate-500" />
            <span>Generate Invoice</span>
          </button>
          <button
            onClick={() => {
              if (selectedInvoice) {
                setPaymentAmount(selectedInvoice.balance);
              }
              setShowCollectModal(true);
            }}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/25 transition"
          >
            <Banknote className="w-4 h-4" />
            <span>Collect Fee Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs font-medium text-slate-500">Total Billed Fees</span>
          <h3 className="text-2xl font-bold text-slate-900 mt-1">₹ {totalBilled.toLocaleString()}</h3>
          <p className="text-[11px] text-slate-400 mt-1 font-mono-tech">{invoices.length} invoices generated</p>
        </div>
        <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
          <span className="text-xs font-medium text-emerald-800">Total Collected</span>
          <h3 className="text-2xl font-bold text-emerald-900 mt-1">₹ {totalCollected.toLocaleString()}</h3>
          <p className="text-[11px] text-emerald-700 mt-1">{receipts.length} verified receipts issued</p>
        </div>
        <div className="bg-red-50/60 p-4 rounded-2xl border border-red-200 shadow-2xs">
          <span className="text-xs font-medium text-red-800">Pending & Overdue Balance</span>
          <h3 className="text-2xl font-bold text-red-900 mt-1">₹ {totalOutstanding.toLocaleString()}</h3>
          <p className="text-[11px] text-red-700 mt-1">Across active enrollments</p>
        </div>
      </div>

      {/* Tab Selectors */}
      <div className="flex border-b border-slate-200 space-x-6 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'invoices'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Fee Invoices ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('receipts')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'receipts'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Payment Receipts ({receipts.length})
        </button>
        <button
          onClick={() => setActiveTab('expenses')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'expenses'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Expense Vouchers ({expenseVouchers.length})
        </button>
        <button
          onClick={() => setActiveTab('daybook')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'daybook'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Financial Daybook
        </button>
        <button
          onClick={() => setActiveTab('vendors')}
          className={`pb-3 border-b-2 whitespace-nowrap transition ${
            activeTab === 'vendors'
              ? 'border-blue-600 text-blue-600 font-bold'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Approved Vendors ({vendors.length})
        </button>
      </div>

      {activeTab === 'invoices' ? (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex items-center w-full md:w-80 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
              <input
                type="text"
                placeholder="Search invoice #, student name..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full text-xs outline-none bg-transparent text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 font-medium">Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-slate-700 font-medium outline-none"
              >
                <option value="ALL">All Statuses</option>
                <option value="PAID">Paid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PENDING">Pending</option>
                <option value="OVERDUE">Overdue</option>
              </select>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Invoice No</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Fee Breakdown</th>
                  <th className="py-3 px-4">Total Amount</th>
                  <th className="py-3 px-4">Paid</th>
                  <th className="py-3 px-4">Balance</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono-tech font-bold text-slate-800">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-tech">{inv.admissionNo} • {inv.className}</div>
                    </td>
                    <td className="py-3 px-4 text-slate-700">{inv.feeType}</td>
                    <td className="py-3 px-4 font-mono-tech font-medium text-slate-800">
                      ₹{inv.totalAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono-tech text-emerald-600 font-semibold">
                      ₹{inv.paidAmount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 font-mono-tech text-red-600 font-bold">
                      ₹{inv.balance.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-500">{inv.dueDate}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                        inv.status === 'PARTIAL' ? 'bg-amber-100 text-amber-800' :
                        inv.status === 'OVERDUE' ? 'bg-red-100 text-red-800' : 'bg-orange-100 text-orange-800'
                      }`}>
                        {inv.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {inv.balance > 0 ? (
                        <button
                          onClick={() => {
                            setSelectedInvoiceId(inv.id);
                            setPaymentAmount(inv.balance);
                            setShowCollectModal(true);
                          }}
                          className="px-3 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-lg transition"
                        >
                          Collect
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400 font-medium">Fully Cleared</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        /* Receipts Table */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase text-[11px]">
                <th className="py-3 px-4">Receipt No</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Amount Paid</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4">Cashier</th>
                <th className="py-3 px-4 text-right">Print Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {receipts.map(rcp => (
                <tr key={rcp.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-mono-tech font-bold text-slate-800">{rcp.receiptNo}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{rcp.studentName}</div>
                    <div className="text-[11px] text-slate-500 font-mono-tech">{rcp.admissionNo}</div>
                  </td>
                  <td className="py-3 px-4 font-mono-tech font-bold text-emerald-600 text-sm">
                    ₹{rcp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-semibold text-[11px]">
                      {rcp.paymentMethod}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{rcp.paymentDate}</td>
                  <td className="py-3 px-4 text-slate-700">{rcp.cashierName}</td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => setActiveReceipt(rcp)}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ============================================================ */}
      {/* EXPENSE VOUCHERS VIEW */}
      {/* ============================================================ */}
      {activeTab === 'expenses' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Authorized Institutional Operating & Capital Vouchers
            </div>
            <button
              onClick={() => setShowAddExpenseModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Create Expense Voucher</span>
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-3 px-4">Voucher No</th>
                    <th className="py-3 px-4">Expense Details & Payee</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Payment Mode</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date & Approver</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {expenseVouchers.map(exp => (
                    <tr key={exp.id} className="hover:bg-slate-50/60 transition">
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-slate-800">{exp.voucherNo}</td>
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{exp.description}</div>
                        <div className="text-[11px] text-slate-500">Payee: {exp.payeeName}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                          {exp.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-medium text-slate-600">{exp.paymentMethod}</td>
                      <td className="py-3.5 px-4 font-mono-tech font-bold text-rose-600 text-sm">
                        ₹{exp.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="text-slate-600 font-mono-tech">{exp.date}</div>
                        <div className="text-[10px] text-slate-400">By: {exp.approvedBy}</div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          exp.status === 'PAID' ? 'bg-emerald-100 text-emerald-800' :
                          exp.status === 'APPROVED' ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                        }`}>
                          {exp.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {exp.status !== 'PAID' && (
                          <button
                            onClick={() => store.updateExpenseStatus(exp.id, 'PAID')}
                            className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded font-semibold text-[11px] transition"
                          >
                            Mark Paid
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* FINANCIAL DAYBOOK VIEW */}
      {/* ============================================================ */}
      {activeTab === 'daybook' && (
        <div className="space-y-5">
          {/* Daybook Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-emerald-800">
                <span>Total Cash Inflow (Receipts & Incomes)</span>
                <ArrowDownRight className="w-4 h-4 text-emerald-600" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-900 mt-1 font-mono-tech">
                ₹ {(receipts.reduce((sum, r) => sum + r.amount, 0) + incomeRecords.reduce((sum, inc) => sum + inc.amount, 0)).toLocaleString()}
              </h3>
              <p className="text-[11px] text-emerald-700 mt-1">Student tuition collections + school bookstore / activity revenues</p>
            </div>

            <div className="bg-rose-50/60 p-4 rounded-2xl border border-rose-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-rose-800">
                <span>Total Cash Outflow (Expense Vouchers)</span>
                <ArrowUpRight className="w-4 h-4 text-rose-600" />
              </div>
              <h3 className="text-2xl font-bold text-rose-900 mt-1 font-mono-tech">
                ₹ {expenseVouchers.reduce((sum, exp) => sum + exp.amount, 0).toLocaleString()}
              </h3>
              <p className="text-[11px] text-rose-700 mt-1">Utilities, facilities maintenance, lab supplies, & vendor payouts</p>
            </div>

            <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-200 shadow-2xs">
              <div className="flex items-center justify-between text-xs font-semibold text-blue-800">
                <span>Net Cash Operating Balance</span>
                <Banknote className="w-4 h-4 text-blue-600" />
              </div>
              <h3 className="text-2xl font-bold text-blue-900 mt-1 font-mono-tech">
                ₹ {(
                  receipts.reduce((sum, r) => sum + r.amount, 0) +
                  incomeRecords.reduce((sum, inc) => sum + inc.amount, 0) -
                  expenseVouchers.reduce((sum, exp) => sum + exp.amount, 0)
                ).toLocaleString()}
              </h3>
              <p className="text-[11px] text-blue-700 mt-1">Positive liquid operating reserves</p>
            </div>
          </div>

          {/* Unified Ledger Feed */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-sm">Chronological Cash Ledger Feed</h3>
              <span className="text-xs text-slate-400 font-mono-tech">Sync: Real-time</span>
            </div>

            <div className="divide-y divide-slate-100 text-xs">
              {receipts.map(rcp => (
                <div key={rcp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <ArrowDownRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Student Fee Collection — {rcp.studentName}</div>
                      <div className="text-[11px] text-slate-500 font-mono-tech">Receipt #{rcp.receiptNo} • {rcp.paymentMethod} • Cashier: {rcp.cashierName}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-tech font-bold text-emerald-600 text-sm">+₹{rcp.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-mono-tech">{rcp.paymentDate}</div>
                  </div>
                </div>
              ))}

              {expenseVouchers.map(exp => (
                <div key={exp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/60 transition">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900">Voucher Payment: {exp.description}</div>
                      <div className="text-[11px] text-slate-500">Payee: {exp.payeeName} • Category: {exp.category} • {exp.paymentMethod}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono-tech font-bold text-rose-600 text-sm">-₹{exp.amount.toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 font-mono-tech">{exp.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* VENDOR DIRECTORY VIEW */}
      {/* ============================================================ */}
      {activeTab === 'vendors' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Institutional Approved Suppliers, Contractors & Service Providers
            </div>
            <button
              onClick={() => setShowAddVendorModal(true)}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Register New Vendor</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {vendors.map(ven => (
              <div key={ven.id} className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {ven.category}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      {ven.status}
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-2">{ven.name}</h3>
                  <div className="text-xs text-slate-500 mt-0.5">Contact: {ven.contactPerson}</div>
                  <div className="text-[11px] text-slate-400 font-mono-tech mt-1">GSTIN: {ven.gstin}</div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Phone:</span>
                    <span className="font-mono-tech text-slate-800">{ven.phone}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Pending Payable:</span>
                    <span className="font-mono-tech font-bold text-slate-900">₹{ven.pendingPayment.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: CREATE EXPENSE VOUCHER */}
      {/* ============================================================ */}
      {showAddExpenseModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Create Institutional Expense Voucher</h3>
              <button onClick={() => setShowAddExpenseModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newExpenseData.description || !newExpenseData.payeeName) return;
                store.addExpenseVoucher(newExpenseData);
                setShowAddExpenseModal(false);
                setNewExpenseData({
                  category: 'Utilities',
                  description: '',
                  amount: 15000,
                  payeeName: '',
                  paymentMethod: 'Bank Transfer',
                  date: new Date().toISOString().slice(0, 10),
                  approvedBy: 'Financial Bursar',
                  status: 'PAID'
                });
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Title / Description *</label>
                <input
                  type="text"
                  required
                  value={newExpenseData.description}
                  onChange={e => setNewExpenseData({ ...newExpenseData, description: e.target.value })}
                  placeholder="e.g. Monthly Campus Electricity & Power Bill"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payee / Beneficiary *</label>
                  <input
                    type="text"
                    required
                    value={newExpenseData.payeeName}
                    onChange={e => setNewExpenseData({ ...newExpenseData, payeeName: e.target.value })}
                    placeholder="e.g. State Electricity Board"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Expense Category *</label>
                  <select
                    value={newExpenseData.category}
                    onChange={e => setNewExpenseData({ ...newExpenseData, category: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="Utilities">Utilities & Power</option>
                    <option value="Maintenance">Maintenance & Repairs</option>
                    <option value="Lab Supplies">Laboratory Supplies</option>
                    <option value="Sports">Sports & Physical Ed</option>
                    <option value="Printing">Stationery & Printing</option>
                    <option value="Salaries">Salaries</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Amount (₹) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newExpenseData.amount}
                    onChange={e => setNewExpenseData({ ...newExpenseData, amount: Number(e.target.value) })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Disbursement Mode *</label>
                  <select
                    value={newExpenseData.paymentMethod}
                    onChange={e => setNewExpenseData({ ...newExpenseData, paymentMethod: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="Bank Transfer">Bank Transfer / NEFT</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Cash">Petty Cash</option>
                    <option value="UPI">UPI / Digital</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddExpenseModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Authorize Voucher
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* MODAL: REGISTER VENDOR */}
      {/* ============================================================ */}
      {showAddVendorModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Register Approved Institutional Vendor</h3>
              <button onClick={() => setShowAddVendorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newVendorData.name || !newVendorData.contactPerson) return;
                store.addVendor(newVendorData);
                setShowAddVendorModal(false);
                setNewVendorData({
                  name: '',
                  category: 'Lab Equipment',
                  contactPerson: '',
                  phone: '',
                  email: '',
                  gstin: '07AAAAA0000A1Z5',
                  pendingPayment: 0,
                  status: 'ACTIVE'
                });
              }}
              className="p-6 space-y-4 text-xs"
            >
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company / Vendor Name *</label>
                <input
                  type="text"
                  required
                  value={newVendorData.name}
                  onChange={e => setNewVendorData({ ...newVendorData, name: e.target.value })}
                  placeholder="e.g. Apex Scientific Labs & Equipments"
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Contact Person *</label>
                  <input
                    type="text"
                    required
                    value={newVendorData.contactPerson}
                    onChange={e => setNewVendorData({ ...newVendorData, contactPerson: e.target.value })}
                    placeholder="e.g. Sanjay Verma"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category *</label>
                  <select
                    value={newVendorData.category}
                    onChange={e => setNewVendorData({ ...newVendorData, category: e.target.value as any })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-medium"
                  >
                    <option value="Stationery">Stationery</option>
                    <option value="Lab Equipment">Lab Equipment</option>
                    <option value="IT & Hardware">IT & Hardware</option>
                    <option value="Uniforms">Uniforms</option>
                    <option value="Catering">Catering</option>
                    <option value="Maintenance">Maintenance</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    value={newVendorData.phone}
                    onChange={e => setNewVendorData({ ...newVendorData, phone: e.target.value })}
                    placeholder="+91 98110 00000"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">GSTIN Tax Registration</label>
                  <input
                    type="text"
                    value={newVendorData.gstin}
                    onChange={e => setNewVendorData({ ...newVendorData, gstin: e.target.value })}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-mono-tech"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddVendorModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold shadow-xs"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* COLLECT FEE PAYMENT MODAL */}
      {/* ============================================================ */}
      {showCollectModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <Banknote className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-slate-800 text-base">Collect Fee Payment</h3>
              </div>
              <button onClick={() => setShowCollectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRecordPaymentSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Pending Invoice *</label>
                <select
                  value={selectedInvoiceId}
                  onChange={e => {
                    setSelectedInvoiceId(e.target.value);
                    const inv = invoices.find(i => i.id === e.target.value);
                    if (inv) setPaymentAmount(inv.balance);
                  }}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none bg-slate-50 font-medium"
                >
                  {invoices.filter(i => i.balance > 0).map(i => (
                    <option key={i.id} value={i.id}>
                      {i.invoiceNo} — {i.studentName} (Due: ₹{i.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {selectedInvoice && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Student:</span>
                    <span className="font-bold text-slate-800">{selectedInvoice.studentName}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Total Billed:</span>
                    <span className="font-mono-tech">₹{selectedInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Already Paid:</span>
                    <span className="font-mono-tech text-emerald-600">₹{selectedInvoice.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-slate-800 font-bold border-t border-slate-200 pt-1">
                    <span>Current Balance:</span>
                    <span className="font-mono-tech text-red-600">₹{selectedInvoice.balance.toLocaleString()}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={selectedInvoice?.balance || 100000}
                    value={paymentAmount}
                    onChange={e => setPaymentAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech text-base font-bold text-emerald-700 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Mode *</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none font-semibold"
                  >
                    <option value="UPI">UPI / QR Code</option>
                    <option value="Cash">Cash</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Net Banking">Net Banking</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Transaction Ref / Notes</label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref #5129384729 or Bank Auth Code"
                  value={paymentNotes}
                  onChange={e => setPaymentNotes(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCollectModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold shadow-md shadow-emerald-500/20"
                >
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* PRINT OFFICIAL FEE RECEIPT MODAL */}
      {/* ============================================================ */}
      {activeReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between no-print">
              <span className="font-bold text-slate-800 text-sm">Fee Payment Receipt</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg shadow"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Receipt</span>
                </button>
                <button onClick={() => setActiveReceipt(null)} className="text-slate-400 hover:text-slate-600 p-1">
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Receipt Paper */}
            <div className="p-6 bg-white space-y-4 text-xs print-container">
              {/* Receipt Header */}
              <div className="text-center border-b border-slate-200 pb-3">
                <h3 className="font-bold text-base text-slate-900 uppercase tracking-wide">
                  {schoolProfile.name}
                </h3>
                <p className="text-[11px] text-slate-500">{schoolProfile.address}</p>
                <p className="text-[10px] text-slate-400 font-mono-tech mt-0.5">
                  Affiliation: {schoolProfile.affiliationNo} • Phone: {schoolProfile.phone}
                </p>
                <div className="inline-block mt-2 bg-slate-100 text-slate-800 font-bold px-3 py-0.5 rounded text-[11px]">
                  FEE PAYMENT RECEIPT
                </div>
              </div>

              {/* Receipt Meta */}
              <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-400">Receipt No:</span>
                  <span className="font-bold font-mono-tech text-slate-800 ml-1">{activeReceipt.receiptNo}</span>
                </div>
                <div>
                  <span className="text-slate-400">Date:</span>
                  <span className="font-bold text-slate-800 ml-1">{activeReceipt.paymentDate}</span>
                </div>
                <div>
                  <span className="text-slate-400">Student:</span>
                  <span className="font-bold text-slate-800 ml-1">{activeReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-400">Admission No:</span>
                  <span className="font-mono-tech font-bold text-slate-800 ml-1">{activeReceipt.admissionNo}</span>
                </div>
              </div>

              {/* Payment Details */}
              <table className="w-full text-left border border-slate-200 rounded-lg overflow-hidden">
                <thead className="bg-slate-100 text-slate-600 font-semibold text-[11px]">
                  <tr>
                    <th className="py-2 px-3">Description</th>
                    <th className="py-2 px-3 text-right">Amount (₹)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-[11px]">
                  <tr>
                    <td className="py-2.5 px-3">
                      <div>Tuition & Institution Installment</div>
                      <div className="text-[10px] text-slate-400">Mode: {activeReceipt.paymentMethod} • {activeReceipt.notes}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tech font-bold text-slate-900">
                      ₹{activeReceipt.amount.toLocaleString()}
                    </td>
                  </tr>
                  <tr className="bg-slate-50 font-bold text-slate-900">
                    <td className="py-2.5 px-3 uppercase text-[11px]">Total Paid Amount</td>
                    <td className="py-2.5 px-3 text-right font-mono-tech text-emerald-700 text-sm">
                      ₹{activeReceipt.amount.toLocaleString()}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Signatures */}
              <div className="pt-8 flex justify-between items-end text-[11px] text-slate-600">
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mb-1" />
                  <span>Student / Parent</span>
                </div>
                <div className="text-center">
                  <div className="w-28 border-b border-slate-400 mb-1" />
                  <span className="font-bold">Cashier / Accountant ({activeReceipt.cashierName})</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center border-t border-slate-100 pt-2">
                This is a computer generated verifiable receipt issued by SchoolERP System.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* CREATE INVOICE MODAL */}
      {/* ============================================================ */}
      {showCreateInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-800 text-base">Generate Fee Invoice</h3>
              <button onClick={() => setShowCreateInvoiceModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateInvoiceSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={newInvStudentId}
                  onChange={e => setNewInvStudentId(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                >
                  {students.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.admissionNo}) — {s.className} ({s.section})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Description *</label>
                <input
                  type="text"
                  required
                  value={newInvType}
                  onChange={e => setNewInvType(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Total Amount (₹) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={newInvAmount}
                    onChange={e => setNewInvAmount(Number(e.target.value))}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono-tech outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={newInvDueDate}
                    onChange={e => setNewInvDueDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateInvoiceModal(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold"
                >
                  Generate Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
