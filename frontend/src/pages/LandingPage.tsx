import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const STATS = [
  { value: '₹10.7L Cr', label: 'owed to MSMEs in delayed payments annually' },
  { value: '45 days', label: 'average payment delay in Indian B2B trade' },
  { value: '63%', label: 'of MSMEs report cash-flow stress from late payments' },
];

const STEPS = [
  {
    num: '01',
    icon: '📤',
    title: 'Upload your invoice',
    desc: 'Drop a PDF, JPG, or PNG. Key fields are extracted automatically.',
    color: 'from-blue-500 to-blue-600',
  },
  {
    num: '02',
    icon: '🔍',
    title: 'Confirm the details',
    desc: 'Review extracted values. Edit anything that looks off before saving.',
    color: 'from-violet-500 to-violet-600',
  },
  {
    num: '03',
    icon: '📅',
    title: 'See your deadline',
    desc: 'Due date and overdue days are calculated instantly — no formulas needed.',
    color: 'from-amber-500 to-amber-600',
  },
  {
    num: '04',
    icon: '✉️',
    title: 'Send a follow-up',
    desc: 'Copy the pre-drafted reminder, edit it, then send from your own inbox.',
    color: 'from-green-500 to-green-600',
  },
];

const EVIDENCE_ITEMS = [
  { label: 'Invoice', status: 'available' },
  { label: 'Purchase Order', status: 'available' },
  { label: 'Proof of Delivery', status: 'missing' },
  { label: 'Payment Receipt', status: 'missing' },
];

const FEATURES = [
  {
    icon: '⚖️',
    title: 'Deterministic calculations',
    desc: 'Due dates and overdue days use plain arithmetic — never AI guesswork.',
  },
  {
    icon: '🔒',
    title: 'Private by default',
    desc: 'Documents are stored in your own private S3 bucket. No public URLs.',
  },
  {
    icon: '🇮🇳',
    title: 'Built for Indian MSMEs',
    desc: 'INR formatting, Indian date conventions, MSME payment norms in mind.',
  },
  {
    icon: '☁️',
    title: 'AWS-powered backend',
    desc: 'Textract, DynamoDB, Lambda, Cognito — enterprise-grade infrastructure.',
  },
  {
    icon: '✏️',
    title: 'Always human-reviewed',
    desc: 'Every reminder is editable. Nothing is sent automatically.',
  },
  {
    icon: '📋',
    title: 'Evidence tracking',
    desc: 'Know exactly which documents are available and which are still missing.',
  },
];

function EvidencePreview() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-64">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Evidence Checklist</p>
      <ul className="space-y-2.5">
        {EVIDENCE_ITEMS.map(({ label, status }) => (
          <li key={label} className="flex items-center gap-2.5">
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
              status === 'available' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-500'
            }`}>
              {status === 'available' ? '✓' : '✗'}
            </span>
            <span className="text-sm text-gray-700">{label}</span>
            {status === 'missing' && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded font-medium">Missing</span>
            )}
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-3 border-t border-gray-100">
        <p className="text-xs text-amber-700 font-medium">⚠ Proof of delivery missing — collect before chasing payment.</p>
      </div>
    </div>
  );
}

function InvoicePreviewCard() {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 w-72">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="font-mono font-bold text-blue-700 text-sm">INV-104</p>
          <p className="text-xs text-gray-500">ABC Components Pvt. Ltd.</p>
        </div>
        <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">Overdue</span>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-400 mb-0.5">Amount</p>
          <p className="font-bold text-gray-900 text-sm">₹82,000</p>
        </div>
        <div className="bg-red-50 rounded-lg p-2.5">
          <p className="text-gray-400 mb-0.5">Days overdue</p>
          <p className="font-bold text-red-700 text-sm">24 days</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-400 mb-0.5">Invoice date</p>
          <p className="font-semibold text-gray-800">12 Jul 2026</p>
        </div>
        <div className="bg-gray-50 rounded-lg p-2.5">
          <p className="text-gray-400 mb-0.5">Due date</p>
          <p className="font-semibold text-gray-800">26 Aug 2026</p>
        </div>
      </div>
      <button className="mt-4 w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-semibold">
        View &amp; send reminder →
      </button>
    </div>
  );
}

export function LandingPage() {
  const { loadDemo } = useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLoadDemo = async () => {
    setLoading(true);
    await loadDemo();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col overflow-x-hidden">

      {/* ── Nav ── */}
      <nav className="border-b border-gray-100 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2 font-bold text-xl text-gray-900">
          <span className="text-blue-600">⚖️</span>
          <span><span className="text-blue-600">Payment</span>Proof</span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/dashboard"
            className="text-sm text-gray-600 hover:text-gray-900 font-medium hidden sm:block"
          >
            Dashboard
          </Link>
          <button
            onClick={handleLoadDemo}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {loading ? 'Loading…' : 'Try demo →'}
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative flex-1 flex items-center">
        {/* Gradient background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-32 -right-32 w-96 h-96 bg-blue-100 rounded-full opacity-60 blur-3xl" />
          <div className="absolute top-32 -left-24 w-72 h-72 bg-violet-100 rounded-full opacity-50 blur-3xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-16 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left copy */}
            <div>
              <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-200 text-blue-700 rounded-full px-4 py-1.5 text-xs font-semibold mb-6">
                🇮🇳 &nbsp;Built for Indian MSMEs · AWS-powered
              </div>

              <h1 className="text-5xl sm:text-6xl font-extrabold text-gray-900 leading-tight mb-5">
                Stop chasing<br />
                <span className="text-blue-600">payments blindly.</span>
              </h1>

              <p className="text-lg text-gray-600 mb-8 max-w-lg leading-relaxed">
                PaymentProof turns scattered invoices, POs, and delivery proofs into a clear picture
                of who owes you, how overdue they are, and exactly what to send them.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-8">
                <button
                  onClick={handleLoadDemo}
                  disabled={loading}
                  className="px-7 py-3.5 bg-blue-600 text-white rounded-xl font-semibold text-base hover:bg-blue-700 disabled:opacity-60 shadow-lg shadow-blue-200 transition-all"
                >
                  {loading ? 'Loading demo…' : '🚀 Load demo data'}
                </button>
                <Link
                  to="/dashboard"
                  className="px-7 py-3.5 bg-white border-2 border-gray-200 text-gray-700 rounded-xl font-semibold text-base hover:border-blue-400 hover:text-blue-600 transition-all text-center"
                >
                  Open dashboard
                </Link>
              </div>

              <p className="text-xs text-gray-400">
                🔒 Demo uses synthetic data only · No real documents required
              </p>
            </div>

            {/* Right — floating UI previews */}
            <div className="hidden lg:flex items-center justify-center gap-4 relative h-80">
              <div className="absolute top-0 left-8 rotate-[-3deg] drop-shadow-xl">
                <InvoicePreviewCard />
              </div>
              <div className="absolute bottom-0 right-0 rotate-[2deg] drop-shadow-xl">
                <EvidencePreview />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gray-900 text-white py-10">
        <div className="max-w-5xl mx-auto px-6 grid sm:grid-cols-3 gap-8 text-center">
          {STATS.map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-extrabold text-blue-400 mb-1">{value}</p>
              <p className="text-sm text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">How it works</p>
            <h2 className="text-3xl font-extrabold text-gray-900">From invoice to follow-up in 4 steps</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map(({ num, icon, title, desc, color }) => (
              <div key={num} className="bg-white rounded-2xl p-6 border border-gray-200 shadow-sm relative overflow-hidden">
                <div className={`absolute top-0 left-0 w-1 h-full bg-gradient-to-b ${color}`} />
                <p className="text-4xl font-black text-gray-100 absolute top-4 right-4 leading-none select-none">{num}</p>
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ── */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-14">
            <p className="text-xs font-semibold uppercase tracking-widest text-blue-600 mb-2">Features</p>
            <h2 className="text-3xl font-extrabold text-gray-900">Everything an MSME needs</h2>
            <p className="text-gray-500 mt-2">No spreadsheets. No guesswork. No legal claims.</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map(({ icon, title, desc }) => (
              <div key={title} className="flex gap-4 p-5 rounded-2xl border border-gray-100 hover:border-blue-200 hover:shadow-sm transition-all bg-white">
                <span className="text-2xl flex-shrink-0">{icon}</span>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ── */}
      <section className="py-16 px-6">
        <div className="max-w-3xl mx-auto bg-gradient-to-br from-blue-600 to-violet-600 rounded-3xl p-10 text-center text-white shadow-2xl shadow-blue-200">
          <h2 className="text-3xl font-extrabold mb-3">Ready to see it in action?</h2>
          <p className="text-blue-100 mb-8 text-base">
            Load three realistic synthetic invoices and explore every feature — no signup, no real data needed.
          </p>
          <button
            onClick={handleLoadDemo}
            disabled={loading}
            className="px-8 py-4 bg-white text-blue-700 rounded-xl font-bold text-base hover:bg-blue-50 disabled:opacity-60 shadow-lg transition-all"
          >
            {loading ? 'Loading…' : '🚀 Load demo data — free, instant'}
          </button>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-bold text-gray-700">
            <span className="text-blue-600">Payment</span>Proof
          </p>
          <p className="text-xs text-gray-400 text-center max-w-md">
            Administrative document and deadline assistant only. Does not provide legal, tax, accounting, or financial advice.
            Verify all information before taking action. Demo data is synthetic — not real customer information.
          </p>
          <p className="text-xs text-gray-400">© 2026 PaymentProof</p>
        </div>
      </footer>

    </div>
  );
}
