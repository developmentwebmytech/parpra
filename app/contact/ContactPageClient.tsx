"use client"

import type React from "react"

import { useState, useEffect, type FormEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { Mail, Phone, MapPin, Clock, Send, MessageSquare, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import Cont from "@/public/aboutpage/map.jpg"

interface ContactInfoItem {
  _id: string
  type: string
  title: string
  content: Record<string, string>
  icon: string
  order: number
}

export default function ContactPageClient() {
  const { toast } = useToast()
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [privacyChecked, setPrivacyChecked] = useState(false)

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("/api/contact-info")
        if (response.ok) {
          const data = await response.json()
          setContactInfo(data)
        } else {
          console.error("Failed to fetch contact information")
        }
      } catch (error) {
        console.error("Error fetching contact information:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContactInfo()
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()

    if (!privacyChecked) {
      toast({
        title: "Please agree to the Privacy Policy",
        variant: "destructive",
      })
      return
    }

    try {
      setSubmitting(true)
      const response = await fetch("/api/contact-submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Message sent successfully",
          description: "We'll get back to you as soon as possible.",
        })
        // Reset form
        setFormData({
          name: "",
          email: "",
          phone: "",
          subject: "",
          message: "",
        })
        setPrivacyChecked(false)
      } else {
        toast({
          title: "Failed to send message",
          description: "Please try again later.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error submitting form:", error)
      toast({
        title: "An error occurred",
        description: "Please try again later.",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "MapPin":
        return <MapPin className="h-6 w-6 text-teal-700" />
      case "Phone":
        return <Phone className="h-6 w-6 text-teal-700" />
      case "Mail":
        return <Mail className="h-6 w-6 text-teal-700" />
      case "Clock":
        return <Clock className="h-6 w-6 text-teal-700" />
      default:
        return <MessageSquare className="h-6 w-6 text-teal-700" />
    }
  }

  const renderContactCard = (item: ContactInfoItem) => {
    switch (item.type) {
      case "address":
        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-teal-100 hover:border-teal-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              {getIconComponent(item.icon)}
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <address className="not-italic text-gray-600">
              {item.content.line1}
              <br />
              {item.content.line2}
              <br />
              {item.content.line3}
            </address>
            <Link
              href={item.content.mapUrl || "https://maps.google.com"}
              target="_blank"
              className="inline-flex items-center text-teal-700 font-medium mt-3 hover:text-teal-800"
            >
              Get directions
              <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        )

      case "phone":
        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-teal-100 hover:border-teal-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              {getIconComponent(item.icon)}
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            {Object.entries(item.content).map(
              ([key, value], index) =>
                key !== "mapUrl" && (
                  <div key={index}>
                    <p className="text-gray-600 mb-1">{key}:</p>
                    <Link href={`tel:${value}`} className="text-lg font-medium text-teal-700 hover:text-teal-800">
                      {value}
                    </Link>
                    {index < Object.entries(item.content).length - 2 && <div className="mt-3"></div>}
                  </div>
                ),
            )}
          </div>
        )

      case "email":
        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-teal-100 hover:border-teal-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              {getIconComponent(item.icon)}
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            {Object.entries(item.content).map(([key, value], index) => (
              <div key={index}>
                <p className="text-gray-600 mb-1">{key}:</p>
                <Link href={`mailto:${value}`} className="text-teal-700 hover:text-teal-800 break-all">
                  {value}
                </Link>
                {index < Object.entries(item.content).length - 1 && <div className="mt-3"></div>}
              </div>
            ))}
          </div>
        )

      case "hours":
        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl shadow-md p-6 border border-teal-100 hover:border-teal-300 transition-colors"
          >
            <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mb-4">
              {getIconComponent(item.icon)}
            </div>
            <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
            <div className="space-y-2 text-gray-600">
              {Object.entries(item.content).map(([day, hours], index) => (
                <div key={index} className="flex justify-between">
                  <span>{day}:</span>
                  <span className="font-medium">{hours}</span>
                </div>
              ))}
            </div>
          </div>
        )

      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    )
  }

  // Default contact info if none is found in the database
  const defaultContactInfo = [
    {
      _id: "address1",
      type: "address",
      title: "Visit Us",
      content: {
        line1: "123 Fashion Street, Suite 100",
        line2: "New Delhi, 110001",
        line3: "India",
        mapUrl: "https://maps.google.com",
      },
      icon: "MapPin",
      order: 1,
    },
    {
      _id: "phone1",
      type: "phone",
      title: "Call Us",
      content: {
        "Customer Service": "+91 123 456 7890",
        "Order Support": "+91 123 456 7891",
      },
      icon: "Phone",
      order: 2,
    },
    {
      _id: "email1",
      type: "email",
      title: "Email Us",
      content: {
        "General Inquiries": "info@yourfashionstore.com",
        "Customer Support": "support@yourfashionstore.com",
      },
      icon: "Mail",
      order: 3,
    },
    {
      _id: "hours1",
      type: "hours",
      title: "Business Hours",
      content: {
        "Monday - Friday": "10:00 AM - 7:00 PM",
        Saturday: "11:00 AM - 6:00 PM",
        Sunday: "Closed",
      },
      icon: "Clock",
      order: 4,
    },
  ]

  const displayContactInfo = contactInfo.length > 0 ? contactInfo : defaultContactInfo

  return (
    <div className="min-h-screen bg-gradient-to-b from-neutral-50 to-white">
      {/* Hero Section */}
      <div className="relative h-[30vh] md:h-[40vh] overflow-hidden">
        <div className="absolute inset-0 bg-teal-900 flex items-center">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
              transition={{ duration: 0.5 }}
              className="max-w-2xl text-white"
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-lg md:text-xl opacity-90 ml-2">
                We're here to help with any questions or concerns about our products and services.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-8xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information Cards */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:col-span-1 space-y-6"
            >
              {displayContactInfo.map((item) => renderContactCard(item as any))}
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeIn}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <div className="bg-white rounded-2xl shadow-md p-6 md:p-8 border border-teal-100">
                <div className="flex items-center mb-6">
                  <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center mr-4">
                    <MessageSquare className="h-6 w-6 text-teal-700" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-semibold">Send us a message</h2>
                    <p className="text-gray-600">We'll get back to you as soon as possible</p>
                  </div>
                </div>

                <form className="space-y-6" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                        Your Name <span className="text-teal-700">*</span>
                      </label>
                      <Input
                        id="name"
                        name="name"
                        placeholder="John Doe"
                        required
                        value={formData.name}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                        Email Address <span className="text-teal-700">*</span>
                      </label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        placeholder="john@example.com"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <Input
                        id="phone"
                        name="phone"
                        placeholder="+1 (555) 123-4567"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                      />
                    </div>

                    <div className="space-y-2">
                      <label htmlFor="subject" className="block text-sm font-medium text-gray-700">
                        Subject <span className="text-teal-700">*</span>
                      </label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="Order Inquiry"
                        required
                        value={formData.subject}
                        onChange={handleInputChange}
                        className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                      Message <span className="text-teal-700">*</span>
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      placeholder="How can we help you?"
                      rows={5}
                      required
                      value={formData.message}
                      onChange={handleInputChange}
                      className="border-gray-300 focus:border-teal-500 focus:ring-teal-500 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center">
                    <input
                      id="privacy"
                      name="privacy"
                      type="checkbox"
                      required
                      checked={privacyChecked}
                      onChange={(e) => setPrivacyChecked(e.target.checked)}
                      className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                    />
                    <label htmlFor="privacy" className="ml-2 block text-sm text-gray-700">
                      I agree to the{" "}
                      <Link href="/privacy-policy" className="text-teal-700 hover:text-teal-800">
                        Privacy Policy
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    disabled={submitting}
                    className="w-full bg-teal-700 hover:bg-teal-800 text-white py-3 rounded-lg flex items-center justify-center"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...
                      </>
                    ) : (
                      <>
                        Send Message
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              </div>

              {/* Map */}
              <motion.div
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeIn}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mt-8 bg-white rounded-2xl shadow-md overflow-hidden border border-teal-100"
              >
                <h3 className="text-xl font-semibold p-6 border-b border-gray-100">Find Us</h3>
                <div className="aspect-video relative">
                  <Image src={Cont || "/placeholder.svg"} alt="Store Location Map" fill className="object-cover" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Link
                      href="https://maps.google.com"
                      target="_blank"
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
                    >
                      Open in Google Maps
                    </Link>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* FAQ Section */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-16 text-center"
          >
            <div className="inline-block px-4 py-1 rounded-full bg-teal-100 text-teal-800 font-medium text-sm mb-4">
              Quick Help
            </div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-2">Frequently Asked Questions</h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Find quick answers to common questions about our products and services
            </p>

            <div className="bg-gradient-to-r from-teal-700 to-teal-500 rounded-2xl p-8 text-white text-center">
              <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
              <p className="mb-6">Check our comprehensive FAQ section or reach out to our customer support team</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/faq"
                  className="bg-white text-teal-700 px-6 py-3 rounded-lg font-medium hover:bg-teal-50 transition-colors"
                >
                  Visit FAQ Page
                </Link>
                <Link
                  href="tel:+911234567890"
                  className="bg-teal-800 text-white px-6 py-3 rounded-lg font-medium hover:bg-teal-900 transition-colors"
                >
                  Call Support
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
