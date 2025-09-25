declare module "phonepe-pg-sdk-node" {
  export interface PhonePeConfig {
    merchantId: string
    saltKey: string
    saltIndex: number
    env: "SANDBOX" | "PRODUCTION"
  }

  export interface PaymentRequest {
    merchantId: string
    merchantTransactionId: string
    merchantUserId: string
    amount: number
    redirectUrl: string
    redirectMode: string
    callbackUrl: string
    mobileNumber?: string
    paymentInstrument: {
      type: string
      targetApp?: string
    }
  }

  export interface PaymentResponse {
    success: boolean
    code: string
    message: string
    data?: {
      merchantId: string
      merchantTransactionId: string
      transactionId: string
      amount: number
      state: string
      responseCode: string
      paymentInstrument: {
        type: string
        utr?: string
      }
      instrumentResponse?: {
        redirectInfo?: {
          url: string
          method: string
        }
      }
    }
  }

  export interface StatusResponse {
    success: boolean
    code: string
    message: string
    data?: {
      merchantId: string
      merchantTransactionId: string
      transactionId: string
      amount: number
      state: string
      responseCode: string
      paymentInstrument: {
        type: string
        utr?: string
      }
    }
  }

  export interface RefundRequest {
    merchantId: string
    merchantTransactionId: string
    originalTransactionId: string
    amount: number
  }

  export interface RefundResponse {
    success: boolean
    code: string
    message: string
    data?: {
      merchantId: string
      merchantTransactionId: string
      transactionId: string
      amount: number
      state: string
      responseCode: string
    }
  }

  export class PhonePe {
    constructor(config: PhonePeConfig)

    pay(request: PaymentRequest): Promise<PaymentResponse>

    checkStatus(merchantTransactionId: string): Promise<StatusResponse>

    refund(request: RefundRequest): Promise<RefundResponse>

    verifyResponse(response: string, checksum: string): boolean

    verifyWebhook(payload: any, signature: string): boolean
  }

  export default PhonePe
}
