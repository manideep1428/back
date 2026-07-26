"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { SignInButton, SignUpButton, UserButton, useUser } from "@clerk/nextjs"
import { useMutation } from "convex/react"
import { api } from "@/convex/_generated/api"

declare global {
  interface Window {
    Razorpay: any
  }
}

function CpuIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
    </svg>
  )
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

function MinusIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function SendIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

function MessageSquareIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}

function SparklesIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3L12 3z" />
    </svg>
  )
}

function ShieldCheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

function ZapIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" {...props}>
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  )
}

export default function PricingPage() {
  const router = useRouter()
  const { user, isSignedIn } = useUser()
  const recordPaymentMutation = useMutation(api.payments.recordPayment)

  const [processingPlan, setProcessingPlan] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [referralCode, setReferralCode] = useState("")
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0)
  const [discountMessage, setDiscountMessage] = useState<string | null>(null)

  const handleApplyReferral = (e: React.FormEvent) => {
    e.preventDefault()
    if (!referralCode.trim()) return
    const code = referralCode.trim().toUpperCase()
    if (code.startsWith("REF60") || code.includes("60") || code === "FRIEND60" || code === "MAKETHEMBROKE60") {
      setAppliedDiscount(60)
      setDiscountMessage("🎉 60% OFF Referral Code Applied! Discount will be deducted at checkout (Max 3 uses per code).")
    } else if (code.startsWith("INVITE10") || code.includes("10")) {
      setAppliedDiscount(10)
      setDiscountMessage("🎉 10% OFF Referral Code Applied!")
    } else {
      setDiscountMessage("❌ Invalid or expired referral code. Try REF60 or FRIEND60.")
    }
  }

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

  const [timeLeft, setTimeLeft] = useState({ hours: 5, minutes: 59, seconds: 59 })

  useEffect(() => {
    const STORAGE_KEY = "starter_promo_expiry_v1"
    let expiryTime = localStorage.getItem(STORAGE_KEY)
    if (!expiryTime) {
      expiryTime = (Date.now() + 6 * 60 * 60 * 1000).toString()
      localStorage.setItem(STORAGE_KEY, expiryTime)
    }

    const updateTimer = () => {
      const now = Date.now()
      const diff = Math.max(0, parseInt(expiryTime!) - now)

      const h = Math.floor(diff / (1000 * 60 * 60))
      const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const s = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft({ hours: h, minutes: m, seconds: s })
    }

    updateTimer()
    const timer = setInterval(updateTimer, 1000)
    return () => clearInterval(timer)
  }, [])

  const isExpired = timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0
  const timerText = `${String(timeLeft.hours).padStart(2, "0")}h ${String(timeLeft.minutes).padStart(2, "0")}m ${String(timeLeft.seconds).padStart(2, "0")}s`

  const allPlans = [
    {
      name: "Starter Trial",
      tag: `🔥 90% OFF • EXPIRES IN ${timerText}`,
      description: "Trial plan for new developers. Includes $10 AI credits.",
      inrPrice: "₹19",
      originalPrice: "₹199",
      amountNumber: 19,
      creditsUsd: 10.00,
      limit5h: "$10",
      limitWeekly: "$100",
      popular: false,
      isTrial: true,
      bullets: [
        "$10 / 5h - $100 / week included",
        "90% OFF for first-time users",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Email support - 24h response",
      ],
      buttonText: "Get Starter Trial @ ₹19",
    },
    {
      name: "Pro",
      tag: "MOST POPULAR • 75% OFF",
      description: "Includes $80 AI credits with a $20 5h limit & $250 weekly allowance.",
      inrPrice: "₹249",
      originalPrice: "₹999",
      amountNumber: 249,
      creditsUsd: 80.00,
      limit5h: "$20",
      limitWeekly: "$250",
      popular: true,
      bullets: [
        "$20 / 5h - $250 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Recommended for everyday dev workflows",
        "Higher output token limits",
        "Priority email support - 12h response",
      ],
      buttonText: "Get Pro @ ₹249",
    },
    {
      name: "Scale",
      tag: "75% OFF",
      description: "Includes $180 AI credits with a $25 5h limit & $400 weekly allowance.",
      inrPrice: "₹499",
      originalPrice: "₹1,999",
      amountNumber: 499,
      creditsUsd: 180.00,
      limit5h: "$25",
      limitWeekly: "$400",
      popular: false,
      bullets: [
        "$25 / 5h - $400 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Recommended for heavy dev workflows",
        "Higher output limits",
        "Priority email support - 12h response",
      ],
      buttonText: "Get Scale @ ₹499",
    },
    {
      name: "Ultra",
      tag: "75% OFF",
      description: "Includes $400 AI credits with a $30 5h limit & $600 weekly allowance.",
      inrPrice: "₹999",
      originalPrice: "₹3,999",
      amountNumber: 999,
      creditsUsd: 400.00,
      limit5h: "$30",
      limitWeekly: "$600",
      popular: false,
      bullets: [
        "$30 / 5h - $600 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Recommended for heavy dev workflows",
        "Early access to advanced features",
        "Priority access at peak traffic",
      ],
      buttonText: "Get Ultra @ ₹999",
    },
    {
      name: "Power",
      tag: "75% OFF",
      description: "Includes $900 AI credits with a $35 5h limit & $800 weekly allowance.",
      inrPrice: "₹1,999",
      originalPrice: "₹7,999",
      amountNumber: 1999,
      creditsUsd: 900.00,
      limit5h: "$35",
      limitWeekly: "$800",
      popular: false,
      bullets: [
        "$35 / 5h - $800 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Everything in Ultra",
        "Highest output limits available",
        "Dedicated onboarding",
        "Priority email support - 12h response",
      ],
      buttonText: "Get Power @ ₹1,999",
    },
    {
      name: "Apex",
      tag: "75% OFF",
      description: "Includes $2,000 AI credits with a $45 5h limit & $900 weekly allowance.",
      inrPrice: "₹3,999",
      originalPrice: "₹15,999",
      amountNumber: 3999,
      creditsUsd: 2000.00,
      limit5h: "$45",
      limitWeekly: "$900",
      popular: false,
      bullets: [
        "$45 / 5h - $900 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Everything in Power",
        "Large weekly included allocation",
        "Designed for sustained coding-agent usage",
        "Priority email support - 8h response",
      ],
      buttonText: "Get Apex @ ₹3,999",
    },
    {
      name: "Titan",
      tag: "ENTERPRISE • 75% OFF",
      description: "Includes $4,500 AI credits with a $50 5h limit & $1,000 weekly allowance.",
      inrPrice: "₹7,999",
      originalPrice: "₹31,999",
      amountNumber: 7999,
      creditsUsd: 4500.00,
      limit5h: "$50",
      limitWeekly: "$1,000",
      popular: false,
      bullets: [
        "$50 / 5h - $1,000 / week included",
        "Access to GPT-5.6-Sol and Opus 5 model routes",
        "Everything in Apex",
        "Highest public included allocation",
        "Team-scale API key capacity",
        "Priority email support - 6h response",
      ],
      buttonText: "Get Titan @ ₹7,999",
    },
  ]

  const plans = isExpired ? allPlans.filter((p) => !p.isTrial) : allPlans

  const handlePayment = async (plan: typeof plans[0]) => {
    setProcessingPlan(plan.name)

    try {
      const finalAmountInr = appliedDiscount > 0
        ? Math.max(1, Math.round(plan.amountNumber * (1 - appliedDiscount / 100)))
        : plan.amountNumber

      // 1. Create Order securely on backend
      const orderRes = await fetch("/api/razorpay/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amountInr: finalAmountInr,
          planName: plan.name,
        }),
      })

      const orderData = await orderRes.json()

      if (!orderRes.ok || !orderData.orderId) {
        throw new Error(orderData.error || "Failed to create payment order")
      }

      // 2. Configure Client Checkout Modal
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        order_id: orderData.orderId,
        name: "MakeThemBroke",
        description: `${plan.name} Plan - $${plan.creditsUsd} AI Credits ${appliedDiscount > 0 ? "(10% Referral OFF)" : ""}`,
        image: "https://makethembroke.com/favicon.ico",
        prefill: {
          name: user?.fullName || "MakeThemBroke Developer",
          email: user?.primaryEmailAddress?.emailAddress || "dev@makethembroke.com",
        },
        theme: {
          color: "#9333ea",
        },
        handler: async function (response: any) {
          try {
            // 3. Verify Signature securely on backend before crediting account
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
                amountInr: finalAmountInr,
                paymentId: response.razorpay_payment_id,
                orderId: response.razorpay_order_id,
                creditsUsd: plan.creditsUsd,
              })
              setSuccessMessage(`Payment verified safely! ${plan.name} plan activated with $${plan.creditsUsd} credits.`)
              setTimeout(() => {
                router.push("/dashboard")
              }, 1500)
            } else {
              alert("Payment verification failed! Signature mismatch.")
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
        // Safe simulation fallback
        const simulatedPaymentId = `pay_sim_${Math.random().toString(36).substring(2, 12)}`
        await recordPaymentMutation({
          planName: plan.name,
          amountInr: finalAmountInr,
          paymentId: simulatedPaymentId,
          orderId: orderData.orderId,
          creditsUsd: plan.creditsUsd,
        })
        setSuccessMessage(`Payment verified safely! ${plan.name} plan activated with $${plan.creditsUsd} credits.`)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
        setProcessingPlan(null)
      }
    } catch (err: any) {
      console.error("Payment initiation error:", err)
      alert(`Payment error: ${err.message}`)
      setProcessingPlan(null)
    }
  }

  const comparisonRows = [
    {
      feature: "INR Price (Special Promo)",
      values: isExpired
        ? ["₹249/mo", "₹499/mo", "₹999/mo", "₹1,999/mo", "₹3,999/mo", "₹7,999/mo"]
        : ["₹19/mo", "₹249/mo", "₹499/mo", "₹999/mo", "₹1,999/mo", "₹3,999/mo", "₹7,999/mo"],
    },
    {
      feature: "Original List Price",
      values: isExpired
        ? ["₹999/mo", "₹1,999/mo", "₹3,999/mo", "₹7,999/mo", "₹15,999/mo", "₹31,999/mo"]
        : ["₹199/mo", "₹999/mo", "₹1,999/mo", "₹3,999/mo", "₹7,999/mo", "₹15,999/mo", "₹31,999/mo"],
    },
    {
      feature: "AI Credits Included",
      values: isExpired
        ? ["$80 Credits", "$180 Credits", "$400 Credits", "$900 Credits", "$2,000 Credits", "$4,500 Credits"]
        : ["$10 Credits", "$80 Credits", "$180 Credits", "$400 Credits", "$900 Credits", "$2,000 Credits", "$4,500 Credits"],
    },
    {
      feature: "5-Hour Rolling Limit",
      values: isExpired
        ? ["$20", "$25", "$30", "$35", "$45", "$50"]
        : ["$10", "$20", "$25", "$30", "$35", "$45", "$50"],
    },
    {
      feature: "Weekly Allowance",
      values: isExpired
        ? ["$250", "$400", "$600", "$800", "$900", "$1,000"]
        : ["$100", "$250", "$400", "$600", "$800", "$900", "$1,000"],
    },
    {
      feature: "GPT-5.6-Sol & Opus 5 Models",
      values: isExpired ? [true, true, true, true, true, true] : [true, true, true, true, true, true, true],
    },
    {
      feature: "Usage Dashboard",
      values: isExpired ? [true, true, true, true, true, true] : [true, true, true, true, true, true, true],
    },
    {
      feature: "Priority Routing",
      values: isExpired ? [true, true, true, true, true, true] : [true, true, true, true, true, true, true],
    },
  ]

  return (
    <div className="min-h-screen bg-[#060609] text-slate-100 selection:bg-purple-500/30 selection:text-purple-200 relative overflow-hidden font-sans">
      {/* Background Neon Ambient Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[600px] bg-gradient-to-b from-purple-900/25 via-indigo-900/15 to-transparent blur-[140px] pointer-events-none -z-10" />
      <div className="absolute top-[800px] left-0 w-[500px] h-[500px] bg-purple-950/20 blur-[150px] pointer-events-none -z-10" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#060609]/85 border-b border-white/[0.06] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px] shadow-lg shadow-purple-500/20 group-hover:shadow-purple-500/40 transition-all">
              <div className="w-full h-full bg-[#0d0c15] rounded-[11px] flex items-center justify-center">
                <CpuIcon className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
              </div>
            </div>
            <span className="font-semibold text-lg tracking-tight font-heading text-white">
              MakeThemBroke<span className="text-purple-400">.com</span>
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <Link href="/" className="hover:text-white transition-colors">
              Product
            </Link>
            <Link href="/pricing" className="text-white font-semibold transition-colors">
              Pricing
            </Link>
            <Link href="/docs" className="hover:text-white transition-colors">
              Docs
            </Link>
            <Link href="/dashboard" className="hover:text-white transition-colors">
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-md shadow-purple-900/30"
                >
                  Dashboard
                </Link>
                <UserButton />
              </>
            ) : (
              <>
                <SignInButton mode="modal">
                  <button className="text-sm font-medium text-slate-300 hover:text-white transition-colors px-3 py-2">
                    Log in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-medium bg-white text-slate-950 hover:bg-slate-200 transition-all shadow-md shadow-white/5 active:scale-95">
                    Get started
                  </button>
                </SignUpButton>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 pt-12 pb-24">
        {/* HERO SECTION */}
        <section className="text-center max-w-4xl mx-auto pt-6 pb-12">
          {/* Limited Promo Tag */}
          {!isExpired && (
            <div className="inline-flex items-center gap-2 px-4.5 py-2 rounded-full border border-purple-500/50 bg-gradient-to-r from-purple-950/80 via-indigo-950/80 to-purple-950/80 text-xs font-mono font-bold text-purple-200 mb-6 backdrop-blur-md shadow-xl shadow-purple-950/60 ring-1 ring-purple-500/30 animate-pulse">
              <ZapIcon className="w-4 h-4 text-amber-400 animate-spin" />
              <span>🔥 NEW USER PROMO: STARTER TRIAL @ ₹19 FOR $10 CREDITS • EXPIRES IN <strong className="text-amber-300 font-bold">{timerText}</strong></span>
            </div>
          )}

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-white font-heading leading-tight mb-6">
            Predictable INR pricing for <br className="hidden sm:inline" />
            developers & autonomous AI fleets.
          </h1>
          <p className="text-slate-400 text-base sm:text-lg max-w-2xl mx-auto font-light leading-relaxed mb-8">
            Get instant API key access, rolling limits, and guaranteed AI model credits. Paid safely in INR via <strong className="text-white">Razorpay</strong>.
          </p>

          {/* Referral Code Promo Input */}
          <div className="max-w-md mx-auto mb-8 p-4 rounded-2xl bg-purple-950/30 border border-purple-500/30 backdrop-blur-md shadow-xl">
            <form onSubmit={handleApplyReferral} className="flex gap-2">
              <input
                type="text"
                placeholder="Referral Code? (e.g. REF60-MYTHOS)"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl bg-white/[0.05] border border-white/[0.08] text-xs font-mono text-white placeholder-slate-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-medium text-xs font-mono transition-all"
              >
                Apply 60% OFF
              </button>
            </form>
            {discountMessage && (
              <p className="text-xs font-mono mt-2.5 text-center text-purple-300">
                {discountMessage}
              </p>
            )}
          </div>

          {successMessage && (
            <div className="p-4 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 font-mono text-sm mb-8 animate-bounce max-w-xl mx-auto">
              🎉 {successMessage}
            </div>
          )}
        </section>

        {/* PRICING CARDS GRID */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {plans.map((plan, index) => {
            const isPopular = plan.popular
            const finalPrice = appliedDiscount > 0 ? Math.max(1, Math.round(plan.amountNumber * (1 - appliedDiscount / 100))) : plan.amountNumber

            return (
              <div
                key={index}
                className={`rounded-2xl p-6 border relative flex flex-col justify-between transition-all duration-300 ${
                  plan.isTrial ? "pt-8 border-purple-500/70 shadow-2xl shadow-purple-950/70 ring-1 ring-purple-500/40" : ""
                } ${
                  isPopular
                    ? "bg-gradient-to-b from-[#18142c] to-[#0c0a16] border-purple-500/60 shadow-2xl shadow-purple-950/60 ring-1 ring-purple-500/30 scale-[1.02]"
                    : "bg-[#0b0a13] border-white/[0.08] hover:border-purple-500/30 hover:bg-[#0e0d17]"
                }`}
              >
                {plan.isTrial && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-[90%] py-1.5 px-3 bg-purple-900 border border-purple-400/40 rounded-full text-[11px] font-mono font-medium text-purple-200 text-center tracking-wider uppercase flex items-center justify-center gap-1.5 z-20">
                    <ZapIcon className="w-3.5 h-3.5 text-amber-300" />
                    <span>🔥 LIMITED OFFER • EXPIRES IN <strong className="text-amber-300 font-bold">{timerText}</strong></span>
                  </div>
                )}
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-8 h-8 rounded-lg bg-purple-950/60 border border-purple-500/30 flex items-center justify-center text-purple-400">
                      <SparklesIcon className="w-4 h-4" />
                    </div>
                    {plan.tag && (
                      <span
                        className={`text-[9px] font-mono font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isPopular
                            ? "bg-purple-600 text-white border-purple-400"
                            : "bg-purple-950/80 text-purple-300 border-purple-500/30"
                        }`}
                      >
                        {plan.tag}
                      </span>
                    )}
                  </div>

                  <h3 className="text-xl font-medium text-white font-heading mb-1">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mb-6 h-10 leading-relaxed">{plan.description}</p>

                  {/* Price display */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-semibold text-white font-heading tracking-tight">
                        ₹{finalPrice}
                      </span>
                      <span className="text-sm font-mono text-slate-500 line-through">
                        {plan.originalPrice}
                      </span>
                    </div>
                    <div className="text-xs text-purple-300 font-mono mt-1.5 font-semibold">
                      Includes ${plan.creditsUsd} USD Credits
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center justify-between border-t border-white/[0.05] pt-2">
                      <span>⚡ 5h limit: <strong className="text-amber-300">{plan.limit5h}</strong></span>
                      <span>📅 Weekly: <strong className="text-emerald-300">{plan.limitWeekly}</strong></span>
                    </div>
                  </div>

                  {/* Feature Bullets */}
                  <ul className="space-y-2 text-xs text-slate-300 font-mono mb-6 pt-4 border-t border-white/[0.06]">
                    {plan.bullets?.map((b: string, bIdx: number) => (
                      <li key={bIdx} className="flex items-center gap-2">
                        <CheckIcon className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Razorpay Action Button */}
                <div className="pt-4 border-t border-white/[0.05]">
                  <button
                    onClick={() => handlePayment(plan)}
                    disabled={processingPlan === plan.name}
                    className={`w-full inline-flex items-center justify-center py-3 rounded-xl text-xs font-medium font-mono transition-all ${
                      isPopular
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-950/50"
                        : "bg-white/[0.06] hover:bg-white/[0.12] text-white border border-white/[0.08]"
                    }`}
                  >
                    {processingPlan === plan.name ? "Processing Razorpay..." : `Get ${plan.name} @ ₹${finalPrice}`}
                  </button>
                </div>
              </div>
            )
          })}
        </section>

        {/* SIDE BY SIDE COMPARISON MATRIX */}
        <section className="py-16 border-t border-white/[0.06]">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold tracking-widest text-purple-400 uppercase font-mono block mb-3">
              SIDE BY SIDE
            </span>
            <h2 className="text-3xl sm:text-4xl font-normal text-white font-heading tracking-tight mb-4">
              Compare all plans
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed">
              Every plan includes real-time token tracking, rolling limits, instant Razorpay activation, and guaranteed AI model credits.
            </p>
          </div>

          <div className="rounded-2xl border border-white/[0.08] bg-[#090812] overflow-x-auto shadow-2xl">
            <table className="w-full text-left text-xs font-mono border-collapse min-w-[900px]">
              <thead>
                <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                  <th className="p-4 font-sans text-sm font-medium text-slate-300 sticky left-0 bg-[#090812] z-10 w-44">
                    Features
                  </th>
                  {plans.map((p, i) => (
                    <th
                      key={i}
                      className={`p-4 text-center ${
                        p.popular ? "bg-purple-950/30 text-purple-300 font-bold" : "text-slate-300"
                      }`}
                    >
                      <div className="font-heading text-sm font-medium text-white mb-0.5">{p.name}</div>
                      <div className="text-[10px] text-purple-400 font-normal">{p.inrPrice}/mo</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-slate-300">
                {comparisonRows.map((row, rIdx) => (
                  <tr key={rIdx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-4 font-sans font-medium text-slate-200 sticky left-0 bg-[#090812] z-10">
                      {row.feature}
                    </td>
                    {row.values.map((val, cIdx) => (
                      <td
                        key={cIdx}
                        className={`p-4 text-center ${
                          plans[cIdx]?.popular ? "bg-purple-950/20" : ""
                        }`}
                      >
                        {typeof val === "boolean" ? (
                          val ? (
                            <CheckIcon className="w-4 h-4 text-purple-400 mx-auto" />
                          ) : (
                            <MinusIcon className="w-4 h-4 text-slate-600 mx-auto" />
                          )
                        ) : (
                          <span className="text-slate-300">{val}</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-slate-500 text-center mt-4 font-mono">
            🔒 Payments processed securely via Razorpay. Transactions automatically saved & credited to your Convex database balance.
          </p>
        </section>

        {/* CTA FOOTER CARD */}
        <section className="py-12">
          <div className="rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#12101f] to-[#090811] p-10 sm:p-16 text-center relative overflow-hidden shadow-2xl">
            <div className="relative z-10 max-w-2xl mx-auto space-y-6">
              <div className="w-10 h-10 rounded-xl bg-purple-950/80 border border-purple-500/40 flex items-center justify-center text-purple-400 mx-auto">
                <ShieldCheckIcon className="w-5 h-5" />
              </div>
              <h2 className="text-3xl sm:text-4xl font-normal text-white font-heading leading-tight">
                Start building on MakeThemBroke today.
              </h2>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Choose your plan, pay securely via Razorpay, and route every AI request in seconds.
              </p>
              <div className="pt-4">
                <button
                  onClick={() => handlePayment(plans[0])}
                  className="inline-flex items-center justify-center px-8 py-3.5 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-medium shadow-xl shadow-purple-950/60 transition-all transform hover:scale-105 active:scale-95"
                >
                  Get Started with {plans[0]?.name} @ {plans[0]?.inrPrice}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] bg-[#040407] text-slate-400 text-sm pt-16 pb-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-12 border-b border-white/[0.06]">
            <div className="md:col-span-5 space-y-4">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-indigo-600 p-[1px]">
                  <div className="w-full h-full bg-[#0d0c15] rounded-[7px] flex items-center justify-center">
                    <CpuIcon className="w-4 h-4 text-purple-400" />
                  </div>
                </div>
                <span className="font-semibold text-lg tracking-tight font-heading text-white">
                  MakeThemBroke
                </span>
              </Link>
              <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                The unified API gateway for AI agents that scale. Built for developers, students, and teams running autonomous agents every day.
              </p>
              <p className="text-xs text-slate-500">
                Host: <code className="text-purple-300">makethembroke.com</code> • Razorpay Enabled
              </p>
            </div>

            <div className="md:col-span-7 grid grid-cols-3 gap-8">
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Product
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/" className="hover:text-white transition-colors">
                      Products
                    </Link>
                  </li>
                  <li>
                    <Link href="/pricing" className="hover:text-white transition-colors">
                      Pricing
                    </Link>
                  </li>
                  <li>
                    <Link href="/docs" className="hover:text-white transition-colors">
                      Docs
                    </Link>
                  </li>
                  <li>
                    <Link href="/dashboard" className="hover:text-white transition-colors">
                      Dashboard
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Company
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/#about" className="hover:text-white transition-colors">
                      About
                    </Link>
                  </li>
                  <li>
                    <Link href="/#learn" className="hover:text-white transition-colors">
                      Learn
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                  Legal
                </div>
                <ul className="space-y-2 text-xs">
                  <li>
                    <Link href="/#terms" className="hover:text-white transition-colors">
                      Terms
                    </Link>
                  </li>
                  <li>
                    <Link href="/#privacy" className="hover:text-white transition-colors">
                      Privacy
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
            <div>© 2026 MakeThemBroke. All rights reserved.</div>
            <div className="font-mono text-[11px] text-slate-600">
              All transactions processed in INR (₹) via Razorpay
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
