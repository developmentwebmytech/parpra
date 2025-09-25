import nodemailer from "nodemailer";

// Create transporter for Mailtrap
const createTransporter = () => {
  const config = {
    host: process.env.MAILTRAP_HOST || "sandbox.smtp.mailtrap.io",
    port: Number.parseInt(process.env.MAILTRAP_PORT || "2525"),
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  }


  return nodemailer.createTransport(config)
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (orderData: any) => ({
    subject: `Order Confirmation - ${orderData.orderNumber || "N/A"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Confirmed!</h1>
          <p style="color: white; margin: 10px 0 0 0;">Thank you for your purchase</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Order Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Order Number:</strong> ${orderData.orderNumber || "N/A"}</p>
            <p><strong>Order Date:</strong> ${orderData.createdAt ? new Date(orderData.createdAt).toLocaleDateString() : "N/A"}</p>
            <p><strong>Total Amount:</strong> ₹${orderData.total || "0"}</p>
            <p><strong>Payment Method:</strong> ${orderData.paymentMethod || "N/A"}</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <p style="color: #6b7280;">Thank you for your order!</p>
          </div>
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0;">Thank you for shopping with us!</p>
        </div>
      </div>
    `,
  }),

  orderShipped: (orderData: any) => ({
    subject: `Your Order Has Shipped - ${orderData.orderNumber || "N/A"}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #10b981, #059669); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Order Shipped!</h1>
          <p style="color: white; margin: 10px 0 0 0;">Your order is on its way</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Shipping Details</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p><strong>Order Number:</strong> ${orderData.orderNumber || "N/A"}</p>
            <p><strong>Tracking Number:</strong> ${orderData.trackingNumber || "N/A"}</p>
            <p><strong>Carrier:</strong> ${orderData.carrier || "N/A"}</p>
          </div>
        </div>
      </div>
    `,
  }),

  welcomeEmail: (userData: any) => ({
    subject: "Welcome to Our Store!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #8b5cf6, #7c3aed); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Welcome ${userData?.name || "there"}!</h1>
          <p style="color: white; margin: 10px 0 0 0;">Thank you for joining our community</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Get Started</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>Welcome to our store! Here's what you can do:</p>
            <ul style="color: #6b7280;">
              <li>Browse our latest collections</li>
              <li>Add items to your wishlist</li>
              <li>Track your orders</li>
              <li>Manage your account settings</li>
            </ul>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/products" 
               style="display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Start Shopping
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  passwordReset: (resetData: any) => ({
    subject: "Reset Your Password",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #ef4444, #dc2626); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">Password Reset</h1>
          <p style="color: white; margin: 10px 0 0 0;">Reset your account password</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          <h2 style="color: #1f2937; margin-bottom: 20px;">Reset Your Password</h2>
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <p>You requested a password reset. Click the button below to reset your password:</p>
            <p style="color: #6b7280; font-size: 14px;">This link will expire in 1 hour.</p>
          </div>
          
          <div style="text-align: center; margin-top: 30px;">
            <a href="${process.env.NEXT_PUBLIC_APP_URL || ""}/reset-password?token=${resetData?.token || ""}" 
               style="display: inline-block; background: #ef4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">
              Reset Password
            </a>
          </div>
        </div>
      </div>
    `,
  }),

  newsletter: (content: any) => ({
    subject: content?.subject || "Newsletter Update",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 0;">${content?.title || "Newsletter"}</h1>
          <p style="color: white; margin: 10px 0 0 0;">${content?.subtitle || "Latest updates"}</p>
        </div>
        
        <div style="padding: 30px; background: #f9fafb;">
          ${content?.body || "<p>Thank you for subscribing to our newsletter!</p>"}
        </div>
        
        <div style="background: #1f2937; padding: 20px; text-align: center;">
          <p style="color: #9ca3af; margin: 0;">Thank you for reading!</p>
        </div>
      </div>
    `,
  }),
}

// Email service functions
export const emailService = {
  async sendEmail(to: string, template: { subject: string; html: string }) {
    try {
      
      // Validate environment variables
      if (!process.env.MAILTRAP_USER || !process.env.MAILTRAP_PASS) {
        throw new Error("Mailtrap credentials not configured")
      }

      const transporter = createTransporter()

      const mailOptions = {
        from: process.env.MAILTRAP_FROM_EMAIL || "noreply@yourstore.com",
        to,
        subject: template.subject,
        html: template.html,
      }

      
      const result = await transporter.sendMail(mailOptions)
      
      return { success: true, messageId: result.messageId }
    } catch (error) {
      console.error("Error sending email:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred while sending email",
      }
    }
  },

  async sendOrderConfirmation(userEmail: string, orderData: any) {
    const template = emailTemplates.orderConfirmation(orderData)
    return this.sendEmail(userEmail, template)
  },

  async sendOrderShipped(userEmail: string, orderData: any) {
    const template = emailTemplates.orderShipped(orderData)
    return this.sendEmail(userEmail, template)
  },

  async sendWelcomeEmail(userEmail: string, userData: any) {
    const template = emailTemplates.welcomeEmail(userData)
    return this.sendEmail(userEmail, template)
  },

  async sendPasswordReset(userEmail: string, resetData: any) {
    const template = emailTemplates.passwordReset(resetData)
    return this.sendEmail(userEmail, template)
  },

  async sendNewsletter(userEmail: string, content: any) {
    const template = emailTemplates.newsletter(content)
    return this.sendEmail(userEmail, template)
  },
}
