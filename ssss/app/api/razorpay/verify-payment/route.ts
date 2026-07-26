import { NextResponse } from "next/server"
import crypto from "crypto"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = body

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return NextResponse.json({ valid: false, error: "Missing verification parameters" }, { status: 400 })
    }

    const keySecret = process.env.RAZORPAY_KEY_SECRET || "rzp_secret_makethembroke_secure_signature_987"

    // Construct expected signature string
    const generatedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex")

    // Timing-safe comparison to prevent timing attacks
    const isSignatureValid = crypto.timingSafeEqual(
      Buffer.from(generatedSignature),
      Buffer.from(razorpay_signature)
    )

    if (isSignatureValid) {
      return NextResponse.json({ valid: true, message: "Payment signature verified successfully" })
    } else {
      return NextResponse.json({ valid: false, error: "Invalid payment signature" }, { status: 400 })
    }
  } catch (error: any) {
    console.error("Razorpay Signature Verification Error:", error)
    return NextResponse.json({ valid: false, error: "Signature verification failed" }, { status: 500 })
  }
}
