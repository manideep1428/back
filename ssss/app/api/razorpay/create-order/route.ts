import { NextResponse } from "next/server"
import Razorpay from "razorpay"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { amountInr, planName } = body

    if (!amountInr || amountInr <= 0) {
      return NextResponse.json({ error: "Invalid payment amount" }, { status: 400 })
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_makethembroke_key_123"
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_makethembroke_secure_signature_987"

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    })

    const options = {
      amount: Math.round(amountInr * 100), // Amount in paise
      currency: "INR",
      receipt: `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      notes: {
        planName: planName || "Starter",
        source: "MakeThemBroke Web Gateway",
      },
    }

    const order = await razorpay.orders.create(options)

    return NextResponse.json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId,
    })
  } catch (error: any) {
    console.error("Razorpay Order Creation Error:", error)
    return NextResponse.json(
      { error: error?.message || "Failed to create Razorpay order" },
      { status: 500 }
    )
  }
}
