import Razorpay from "razorpay"

export class RazorpayService {
  private razorpay: Razorpay

  constructor() {
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      throw new Error("Razorpay credentials not configured")
    }

    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    })
  }

  async createOrder(amount: number, currency = "INR", receipt?: string) {
    try {
      const options = {
        amount: Math.round(amount * 100), // Convert to paise
        currency,
        receipt: receipt || `receipt_${Date.now()}`,
        payment_capture: 1, // Auto capture payment
      }

  
      const order = await this.razorpay.orders.create(options)
    
      return {
        success: true,
        data: order,
      }
    } catch (error) {
      console.error("Razorpay order creation error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to create order",
      }
    }
  }

  async verifyPayment(razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    try {
      const crypto = require("crypto")
      const body = razorpayOrderId + "|" + razorpayPaymentId
      const expectedSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(body.toString())
        .digest("hex")

      const isValid = expectedSignature === razorpaySignature

      return {
        success: true,
        isValid,
      }
    } catch (error) {
      console.error("Payment verification error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Verification failed",
      }
    }
  }

  async fetchPayment(paymentId: string) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId)
      return {
        success: true,
        data: payment,
      }
    } catch (error) {
      console.error("Fetch payment error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch payment",
      }
    }
  }

  async refundPayment(paymentId: string, amount?: number) {
    try {
      const refundData: any = {}
      if (amount) {
        refundData.amount = Math.round(amount * 100) // Convert to paise
      }

      const refund = await this.razorpay.payments.refund(paymentId, refundData)
      return {
        success: true,
        data: refund,
      }
    } catch (error) {
      console.error("Refund error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Refund failed",
      }
    }
  }

  async fetchOrder(orderId: string) {
    try {
      const order = await this.razorpay.orders.fetch(orderId)
      return {
        success: true,
        data: order,
      }
    } catch (error) {
      console.error("Fetch order error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch order",
      }
    }
  }

  async getOrderPayments(orderId: string) {
    try {
      const payments = await this.razorpay.orders.fetchPayments(orderId)
      return {
        success: true,
        data: payments,
      }
    } catch (error) {
      console.error("Fetch order payments error:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch payments",
      }
    }
  }
}
