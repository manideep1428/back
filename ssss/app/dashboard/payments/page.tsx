"use client"

export default function PaymentsPage() {
  return (
    <div className="space-y-8 max-w-5xl mx-auto font-sans">
      <div>
        <h1 className="text-3xl font-normal text-white font-heading tracking-tight">Payments & Receipts</h1>
        <p className="text-xs text-slate-400 font-light mt-1">
          View your payment history, invoices, and INR/USD receipts.
        </p>
      </div>

      <div className="p-8 rounded-2xl border border-white/[0.08] bg-[#0c0b13] py-16 text-center text-xs text-slate-500 font-mono">
        No payment history available yet.
      </div>
    </div>
  )
}
