"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Truck, RefreshCw, Clock, MapPin, CreditCard, Package, Shield } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface ShippingMethod {
  name: string
  time: string
  cost: string
  icon: string
}

interface ShippingInfo {
  _id: string
  type:
    | "domestic"
    | "international"
    | "return-eligibility"
    | "non-returnable"
    | "return-process"
    | "refunds"
    | "exchanges"
    | "damaged"
  title: string
  content: string
  items?: string[]
  methods?: ShippingMethod[]
  order: number
  lastUpdated: string
}

export default function ShippingPageClient() {
  const [shippingInfo, setShippingInfo] = useState<ShippingInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  useEffect(() => {
    const fetchShippingInfo = async () => {
      try {
        const response = await fetch("/api/shipping-info")
        if (response.ok) {
          const data = await response.json()
         
          setShippingInfo(data)

          // Find the most recent update date
          if (data.length > 0) {
            const dates = data.map((item: ShippingInfo) => new Date(item.lastUpdated))
            const mostRecent = new Date(Math.max(...dates.map((date : Date) => date.getTime())))
            setLastUpdated(mostRecent)
          }
        } else {
          console.error("Failed to fetch shipping information")
        }
      } catch (error) {
        console.error("Error fetching shipping information:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchShippingInfo()
  }, [])

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case "Truck":
        return <Truck className="h-10 w-10" />
      case "Plane":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M5 17H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1"></path>
            <polygon points="12 15 17 21 7 21 12 15"></polygon>
          </svg>
        )
      case "Globe":
        return <Globe className="h-10 w-10" />
      default:
        return <Package className="h-10 w-10" />
    }
  }

  // Default data if no data is fetched from the API
  const defaultDomesticShippingMethods = [
    {
      name: "Standard Shipping",
      time: "3-5 business days",
      cost: "₹99 for orders under ₹999, free for orders above ₹999",
      icon: "Truck",
    },
    {
      name: "Express Shipping",
      time: "1-2 business days",
      cost: "₹199",
      icon: "Plane",
    },
  ]

  const defaultInternationalShippingMethods = [
    {
      name: "Standard International",
      time: "7-14 business days",
      cost: "₹1499 for orders under ₹10,000, ₹999 for orders above ₹10,000",
      icon: "Globe",
    },
    {
      name: "Express International",
      time: "3-5 business days",
      cost: "₹2499",
      icon: "Plane",
    },
  ]

  // Get shipping methods from API or use defaults
  const getDomesticShippingMethods = () => {
    const domesticInfo = shippingInfo.find((item) => item.type === "domestic")
    return domesticInfo?.methods || defaultDomesticShippingMethods
  }

  const getInternationalShippingMethods = () => {
    const internationalInfo = shippingInfo.find((item) => item.type === "international")
    return internationalInfo?.methods || defaultInternationalShippingMethods
  }

  // Get content for different sections
  const getContentByType = (type: string) => {
    const info = shippingInfo.find((item) => item.type === type)
    return info
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    )
  }

  const domesticShippingMethods = getDomesticShippingMethods()
  const internationalShippingMethods = getInternationalShippingMethods()

  // Get content for return policy sections
  const returnEligibility = getContentByType("return-eligibility")
  const nonReturnable = getContentByType("non-returnable")
  const returnProcess = getContentByType("return-process")
  const refunds = getContentByType("refunds")
  const exchanges = getContentByType("exchanges")
  const damaged = getContentByType("damaged")

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-neutral-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-8xl px-2 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-teal-800">Shipping & Returns</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Everything you need to know about our shipping methods, delivery times, and return process.
            </p>
            <p className="text-gray-500 mt-2">
              Last Updated: {lastUpdated ? format(new Date(lastUpdated), "MMMM d, yyyy") : "May 1, 2025"}
            </p>
          </motion.div>

          {/* Tabs for Shipping and Returns */}
          <motion.div
            className="mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <div className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4 mb-8">
              <a
                href="#shipping"
                className="bg-teal-700 text-white px-6 py-3 rounded-lg font-medium flex items-center justify-center shadow-sm hover:bg-teal-800 transition-colors duration-200"
              >
                <Truck className="h-5 w-5 mr-2" />
                Shipping Policy
              </a>
              <a
                href="#returns"
                className="bg-white text-teal-700 border border-teal-700 px-6 py-3 rounded-lg font-medium flex items-center justify-center shadow-sm hover:bg-teal-50 transition-colors duration-200"
              >
                <RefreshCw className="h-5 w-5 mr-2" />
                Return & Refund Policy
              </a>
            </div>
          </motion.div>

          {/* Shipping Policy Section */}
          <section id="shipping">
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <Truck className="h-8 w-8 text-teal-700 mr-4" />
                  <h2 className="text-3xl font-light text-gray-900">Shipping Policy</h2>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p>
                    We are committed to delivering your orders promptly and securely. Here's what you need to know about
                    our shipping policies and procedures.
                  </p>

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4 flex items-center">
                    <MapPin className="h-5 w-5 text-teal-700 mr-2" />
                    Domestic Shipping
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    {domesticShippingMethods.map((method, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                        <div className="text-teal-700 mb-4">{getIconComponent(method.icon)}</div>
                        <h4 className="text-lg font-medium mb-2">{method.name}</h4>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{method.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span>{method.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-teal-50 p-4 rounded-md border border-teal-100 my-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Package className="h-5 w-5 text-teal-700" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-teal-800">Tracking Information</h3>
                        <div className="mt-2 text-sm text-teal-700">
                          <p>
                            Once your order ships, you will receive a confirmation email with tracking information. You
                            can also track your order by logging into your account.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4 flex items-center">
                    <Globe className="h-5 w-5 text-teal-700 mr-2" />
                    International Shipping
                  </h3>

                  <p>We ship to select countries worldwide. International shipping details:</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    {internationalShippingMethods.map((method, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-6 border border-gray-100">
                        <div className="text-teal-700 mb-4">{getIconComponent(method.icon)}</div>
                        <h4 className="text-lg font-medium mb-2">{method.name}</h4>
                        <div className="flex items-center text-gray-600 mb-2">
                          <Clock className="h-4 w-4 mr-2" />
                          <span>{method.time}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <CreditCard className="h-4 w-4 mr-2" />
                          <span>{method.cost}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-amber-50 p-4 rounded-md border border-amber-100 my-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <Shield className="h-5 w-5 text-amber-700" />
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-amber-800">Customs & Duties</h3>
                        <div className="mt-2 text-sm text-amber-700">
                          <p>
                            International orders may be subject to customs duties and taxes imposed by the destination
                            country. These charges are the responsibility of the customer and are not included in the
                            shipping cost.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </section>

          {/* Return & Refund Policy Section */}
          <section id="returns">
            <motion.div
              className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="p-8">
                <div className="flex items-center mb-6">
                  <RefreshCw className="h-8 w-8 text-teal-700 mr-4" />
                  <h2 className="text-3xl font-light text-gray-900">Return & Refund Policy</h2>
                </div>

                <div className="prose prose-lg max-w-none">
                  <p>
                    We want you to be completely satisfied with your purchase. If you're not entirely happy with your
                    order, we're here to help.
                  </p>

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">Return Eligibility</h3>
                  <p>You may return items purchased from PARPRA within 7 days of delivery if:</p>
                  <ul className="space-y-2">
                    {returnEligibility && returnEligibility.items ? (
                      returnEligibility.items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>The item is unworn, unwashed, and unaltered</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>The item is in its original packaging with all tags attached</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>You have the original receipt or proof of purchase</span>
                        </li>
                      </>
                    )}
                  </ul>

                  <div className="bg-red-50 p-4 rounded-md border border-red-100 my-6">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5 text-red-700"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <circle cx="12" cy="12" r="10"></circle>
                          <line x1="12" y1="8" x2="12" y2="12"></line>
                          <line x1="12" y1="16" x2="12.01" y2="16"></line>
                        </svg>
                      </div>
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Non-Returnable Items</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>The following items cannot be returned:</p>
                          <ul className="list-disc pl-5 mt-1 space-y-1">
                            {nonReturnable && nonReturnable.items ? (
                              nonReturnable.items.map((item, index) => <li key={index}>{item}</li>)
                            ) : (
                              <>
                                <li>Customized or personalized products</li>
                                <li>Intimate wear for hygiene reasons</li>
                                <li>Sale items marked as "Final Sale"</li>
                                <li>Items damaged due to customer misuse</li>
                              </>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">Return Process</h3>
                  <ol className="space-y-4">
                    {returnProcess && returnProcess.items ? (
                      returnProcess.items.map((step, index) => (
                        <li key={index} className="flex">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mr-3">
                            {index + 1}
                          </div>
                          <div dangerouslySetInnerHTML={{ __html: step }} />
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mr-3">
                            1
                          </div>
                          <div>
                            <strong>Initiate Return:</strong> Log into your account and go to "My Orders." Select the
                            order and items you wish to return and follow the prompts to initiate the return process.
                          </div>
                        </li>
                        <li className="flex">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mr-3">
                            2
                          </div>
                          <div>
                            <strong>Packaging:</strong> Pack the item(s) securely in their original packaging along with
                            all tags and accessories.
                          </div>
                        </li>
                        <li className="flex">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mr-3">
                            3
                          </div>
                          <div>
                            <strong>Shipping:</strong> For domestic returns, you can use our prepaid return label or
                            arrange your own shipping. For international returns, customers are responsible for return
                            shipping costs.
                          </div>
                        </li>
                        <li className="flex">
                          <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-teal-100 text-teal-700 font-bold mr-3">
                            4
                          </div>
                          <div>
                            <strong>Processing:</strong> Once we receive your return, we'll inspect the item and process
                            your refund within 7-10 business days.
                          </div>
                        </li>
                      </>
                    )}
                  </ol>

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">Refunds</h3>
                  <p>Refunds will be issued to the original payment method used for the purchase:</p>
                  <ul className="space-y-2">
                    {refunds && refunds.items ? (
                      refunds.items.map((item, index) => (
                        <li key={index} className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>{item}</span>
                        </li>
                      ))
                    ) : (
                      <>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>Credit/Debit Card refunds: 5-7 business days</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>Bank transfers: 7-10 business days</span>
                        </li>
                        <li className="flex items-start">
                          <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                          <span>Store credit: Immediately available after return approval</span>
                        </li>
                      </>
                    )}
                  </ul>
                  <p className="mt-4">
                    Shipping charges are non-refundable unless the return is due to our error (damaged or incorrect
                    item).
                  </p>

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">Exchanges</h3>
                  {exchanges && exchanges.content ? (
                    <p>{exchanges.content}</p>
                  ) : (
                    <p>
                      If you'd like to exchange an item for a different size or color, please follow the return process
                      and place a new order for the desired item. This ensures you get the item you want without delay.
                    </p>
                  )}

                  <h3 className="text-xl font-medium text-gray-900 mt-8 mb-4">Damaged or Defective Items</h3>
                  {damaged && damaged.content ? (
                    <p>{damaged.content}</p>
                  ) : (
                    <p>
                      If you receive a damaged or defective item, please contact our customer service team within 48
                      hours of delivery with photos of the damage. We'll arrange for a replacement or refund at no
                      additional cost to you.
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          </section>

          {/* Contact section */}
          <motion.div
            className="mt-12 bg-gradient-to-r from-teal-700 to-teal-600 p-8 rounded-lg shadow-md text-center text-white"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <h2 className="text-2xl font-medium mb-4">Need Help?</h2>
            <p className="text-teal-100 mb-6 max-w-lg mx-auto">
              If you have any questions about our shipping or return policies, our customer service team is ready to
              assist you.
            </p>
            <div className="flex flex-col sm:flex-row justify-center space-y-3 sm:space-y-0 sm:space-x-4">
              <Link href="/contact">
                <button className="bg-white text-teal-700 hover:bg-teal-50 px-6 py-3 rounded-md font-medium transition-colors duration-200 shadow-sm w-full sm:w-auto">
                  Contact Us
                </button>
              </Link>
              <Link href="/faq">
                <button className="bg-transparent text-white border border-white hover:bg-teal-600 px-6 py-3 rounded-md font-medium transition-colors duration-200 w-full sm:w-auto">
                  View FAQs
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function Globe(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10"></circle>
      <line x1="2" y1="12" x2="22" y2="12"></line>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
    </svg>
  )
}
