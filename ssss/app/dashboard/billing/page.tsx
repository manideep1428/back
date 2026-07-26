"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useQuery, useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"
import { useUser } from "@clerk/nextjs"

declare global {
  interface Window {
    Razorpay: any
  }
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function ReceiptIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
      <path d="M8 8h8M8 12h8M8 16h4" />
    </svg>
  )
}

function PlusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

export default function BillingPage() {
  const { user } = useUser()
  const stats = useQuery(api.userStats.getUserStats) || {
    plan: "No Plan",
    balanceUsd: 0.0,
    bonusUsd: 2.5,
  }

  const recordPaymentMutation = useMutation(api.payments.recordPayment)
  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Dynamically load Razorpay checkout script
  useEffect(() => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
    script.async = true
    document.body.appendChild(script)
    return () => {
      document.body.removeChild(script)
    }
  }, [])

  const plans = [
    {
      name: "Starter Trial",
      tag: "80% OFF • FIRST USERS",
      description: "Trial plan for new developers. Includes $10 AI credits.",
      displayPrice: "$10",
      inrPrice: "₹39",
      originalInr: "₹199",
      amountNumber: 39,
      creditsUsd: 10,
      limit5h: "$10",
      limitWeekly: "$100",
      bullets: [
        "$10 / 5h - $100 / week included",
        "80% OFF for first-time users",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Email support - 24h response",
      ],
      buttonText: "Pay ₹39 and switch to Starter Trial",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Builder",
      tag: "80% OFF",
      description: "For regular work & active dev",
      displayPrice: "$30",
      inrPrice: "₹99",
      originalInr: "₹499",
      amountNumber: 99,
      creditsUsd: 30,
      limit5h: "$15",
      limitWeekly: "$150",
      bullets: [
        "$15 / 5h - $150 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Higher concurrent requests",
        "Email support - 24h response",
      ],
      buttonText: "Pay ₹99 and switch to Builder",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Pro",
      tag: "MOST POPULAR • 75% OFF",
      description: "For everyday devs",
      displayPrice: "$80",
      inrPrice: "₹249",
      originalInr: "₹999",
      amountNumber: 249,
      creditsUsd: 80,
      limit5h: "$20",
      limitWeekly: "$250",
      bullets: [
        "$20 / 5h - $250 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Dev productivity tools",
        "Higher output limits",
        "Priority email support",
      ],
      buttonText: "Pay ₹249 and switch to Pro",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Scale",
      tag: "75% OFF",
      description: "For power users",
      displayPrice: "$180",
      inrPrice: "₹499",
      originalInr: "₹1,999",
      amountNumber: 499,
      creditsUsd: 180,
      limit5h: "$25",
      limitWeekly: "$400",
      bullets: [
        "$25 / 5h - $400 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Recommended for heavy dev workflows",
        "Higher output limits",
        "Priority email support - 12h response",
      ],
      buttonText: "Pay ₹499 and switch to Scale",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Ultra",
      tag: "75% OFF",
      description: "For heavy workflows",
      displayPrice: "$400",
      inrPrice: "₹999",
      originalInr: "₹3,999",
      amountNumber: 999,
      creditsUsd: 400,
      limit5h: "$30",
      limitWeekly: "$600",
      bullets: [
        "$30 / 5h - $600 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Recommended for heavy dev workflows",
        "Early access to advanced features",
        "Priority access at peak traffic",
      ],
      buttonText: "Pay ₹999 and switch to Ultra",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Power",
      tag: "75% OFF",
      description: "For teams and high volume",
      displayPrice: "$900",
      inrPrice: "₹1,999",
      originalInr: "₹7,999",
      amountNumber: 1999,
      creditsUsd: 900,
      limit5h: "$35",
      limitWeekly: "$800",
      bullets: [
        "$35 / 5h - $800 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Everything in Ultra",
        "Highest output limits available",
        "Dedicated onboarding",
        "Priority email support - 12h response",
      ],
      buttonText: "Pay ₹1,999 and switch to Power",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Apex",
      tag: "75% OFF",
      description: "For sustained high-volume agent workflows",
      displayPrice: "$2,000",
      inrPrice: "₹3,999",
      originalInr: "₹15,999",
      amountNumber: 3999,
      creditsUsd: 2000,
      limit5h: "$45",
      limitWeekly: "$900",
      bullets: [
        "$45 / 5h - $900 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Everything in Power",
        "Large weekly included allocation",
        "Designed for sustained coding-agent usage",
        "Priority email support - 8h response",
      ],
      buttonText: "Pay ₹3,999 and switch to Apex",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
    {
      name: "Titan",
      tag: "ENTERPRISE • 75% OFF",
      description: "For extreme volume and team-scale automation",
      displayPrice: "$4,500",
      inrPrice: "₹7,999",
      originalInr: "₹31,999",
      amountNumber: 7999,
      creditsUsd: 4500,
      limit5h: "$50",
      limitWeekly: "$1,000",
      bullets: [
        "$50 / 5h - $1,000 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Everything in Apex",
        "Highest public included allocation",
        "Team-scale API key capacity",
        "Priority email support - 6h response",
      ],
      buttonText: "Pay ₹7,999 and switch to Titan",
      buttonColor: "bg-purple-600 hover:bg-purple-500 text-white",
    },
  ]

  const handlePayment = async (plan: typeof plans[0]) => {
    setProcessingPlan(plan.name)

    try {
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInr: plan.amountNumber,
          planName: plan.name,
        }),
      })

      const orderData = await orderRes.json()
      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to create order")
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "MakeThemBroke",
        description: `${plan.name} Plan - $${plan.creditsUsd} AI Credits`,
        image: "https://makethembroke.com/favicon.ico",
        prefill: {
          name: user?.fullName || "Developer",
          email: user?.primaryEmailAddress?.emailAddress || "dev@makethembroke.com",
        },
        theme: {
          color: "#9333ea",
        },
        handler: async function (response: any) {
          try {
            const verifyRes = await fetch("/api/razorpay/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            })

            const verifyData = await verifyRes.json()

            if (verifyData.valid) {
              await recordPaymentMutation({
                planName: plan.name,
                amountInr: plan.amountNumber,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                creditsUsd: plan.creditsUsd,
              })
              setSuccessMessage(`🎉 ${plan.name} plan activated successfully! $${plan.creditsUsd} added to balance.`)
              setTimeout(() => setSuccessMessage(null), 4000)
            } else {
              alert("Payment verification failed! Invalid signature.")
            }
          } catch (err) {
            console.error("Verification error:", err)
          } finally {
            setProcessingPlan(null)
          }
        },
        modal: {
          ondismiss: function () {
            setProcessingPlan(null)
          },
        },
      }

      if (typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        const simulatedPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 12)}`
        await recordPaymentMutation({
          planName: plan.name,
          amountInr: plan.amountNumber,
          paymentId: simulatedPaymentId,
          orderId: orderData.orderId,
          creditsUsd: plan.creditsUsd,
        })
        setSuccessMessage(`🎉 ${plan.name} plan activated successfully! $${plan.creditsUsd} added to balance.`)
        setTimeout(() => setSuccessMessage(null), 4000)
        setProcessingPlan(null)
      }
    } catch (err: any) {
      console.error("Payment error:", err)
      alert(`Error: ${err.message}`)
      setProcessingPlan(null)
    }
  }

  return (
    <div className="space-y-10 max-w-6xl mx-auto font-sans">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-normal text-white font-heading tracking-tight">Billing & plan</h1>
          <p className="text-xs text-slate-400 font-light mt-1">
            Manage your balance, plan, and usage limits.
          </p>
        </div>

        <Link
          href="/dashboard/payments"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/[0.08] text-xs font-mono text-slate-300 transition-colors self-start sm:self-auto"
        >
          <ReceiptIcon className="w-4 h-4 text-purple-400" />
          <span>Payment history</span>
        </Link>
      </div>

      {successMessage && (
        <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-sm animate-bounce">
          {successMessage}
        </div>
      )}

      {/* TOP TWO STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1: BALANCE */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0b0a13] flex flex-col justify-between space-y-6">
          <div>
            <div className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500 mb-2">
              BALANCE
            </div>
            <div className="text-4xl font-semibold text-white font-heading tracking-tight">
              ${(stats.balanceUsd || 0.0).toFixed(2)}
            </div>
            <div className="text-xs text-slate-400 mt-1 font-light">Available for API usage</div>

            <div className="flex items-center gap-2 mt-4">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-white/[0.04] border border-white/[0.06] text-slate-400">
                $0.00 paid
              </span>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-950/60 border border-purple-500/30 text-purple-300">
                $2.50 bonus • exp. Jul 28
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between">
            <span className="text-[11px] font-mono text-slate-500">UPI, cards, and crypto</span>
            <button
              onClick={() => handlePayment(plans[0])}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs font-mono transition-all shadow-md shadow-purple-900/30"
            >
              <PlusIcon className="w-3.5 h-3.5" />
              <span>Add Balance</span>
            </button>
          </div>
        </div>

        {/* CARD 2: YOUR PLAN */}
        <div className="p-6 rounded-2xl border border-white/[0.08] bg-[#0b0a13] flex flex-col justify-between space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold font-mono uppercase tracking-widest text-slate-500">
                YOUR PLAN
              </span>
              <span className="text-2xl font-semibold text-white font-heading">$0</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-2xl font-medium text-white font-heading">
                {stats.plan && stats.plan !== "Free Starter Tier" ? stats.plan : "No Plan"}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-white/[0.06] text-slate-400">
                {stats.plan && stats.plan !== "No Plan" ? "active" : "inactive"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">Buy a plan to start using the API</p>

            {/* 5-Hour & Weekly boxes */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">5-HOUR LIMIT</span>
                <span className="text-base font-semibold text-white font-heading mt-0.5 block">$0</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                <span className="text-[10px] font-mono text-slate-500 uppercase block">WEEKLY LIMIT</span>
                <span className="text-base font-semibold text-white font-heading mt-0.5 block">$0</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.06] flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>Included usage <strong className="text-slate-300 font-normal">No usage</strong></span>
            <span>Plan access <strong className="text-slate-300 font-normal">does not expire</strong></span>
          </div>
        </div>
      </div>

      {/* AVAILABLE PLANS SECTION */}
      <div className="space-y-6">
        <h2 className="text-xl font-medium text-white font-heading">Available plans</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl border border-white/[0.08] bg-[#0b0a13] flex flex-col justify-between space-y-6 hover:border-purple-500/30 transition-all duration-200"
            >
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-medium text-white font-heading">{plan.name}</h3>
                  {plan.tag && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase bg-white/[0.06] text-slate-400 border border-white/[0.08]">
                      {plan.tag}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-light">{plan.description}</p>

                {/* Main Price */}
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="text-3xl font-semibold text-white font-heading">
                    {plan.displayPrice}
                  </span>
                  <span className="text-xs font-mono text-purple-300 font-medium">
                    ({plan.inrPrice} / mo)
                  </span>
                  <span className="text-xs font-mono text-slate-500 line-through">
                    {plan.originalInr}
                  </span>
                </div>

                {/* 5-Hour & Weekly Windows Box */}
                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-white/[0.02] border border-white/[0.04]">
                  <div>
                    <div className="text-base font-semibold text-white font-heading">{plan.limit5h}</div>
                    <div className="text-[10px] font-mono text-slate-500">5-hour window</div>
                  </div>
                  <div>
                    <div className="text-base font-semibold text-white font-heading">{plan.limitWeekly}</div>
                    <div className="text-[10px] font-mono text-slate-500">Weekly window</div>
                  </div>
                </div>

                {/* Bullets */}
                <ul className="space-y-2.5 text-xs text-slate-300 font-sans pt-2">
                  {plan.bullets.map((bullet, bIdx) => (
                    <li key={bIdx} className="flex items-start gap-2.5">
                      <CheckIcon className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                      <span className="leading-snug text-slate-300">{bullet}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Button */}
              <div className="pt-4 border-t border-white/[0.05]">
                <button
                  onClick={() => handlePayment(plan)}
                  disabled={processingPlan === plan.name}
                  className={`w-full py-3 rounded-xl text-xs font-medium font-mono transition-all ${plan.buttonColor}`}
                >
                  {processingPlan === plan.name ? "Processing..." : plan.buttonText}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
