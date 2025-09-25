"use client"

import { motion } from "framer-motion"
import { Book, ShoppingBag, CreditCard, Truck, RefreshCw, Shield, HelpCircle } from "lucide-react"
import Link from "next/link"

export default function TermsPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <Book className="h-6 w-6" />,
    },
    {
      id: "account",
      title: "Account Registration",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-6 w-6"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      ),
    },
    {
      id: "products",
      title: "Products and Orders",
      icon: <ShoppingBag className="h-6 w-6" />,
    },
    {
      id: "payment",
      title: "Payment Terms",
      icon: <CreditCard className="h-6 w-6" />,
    },
    {
      id: "shipping",
      title: "Shipping and Delivery",
      icon: <Truck className="h-6 w-6" />,
    },
    {
      id: "returns",
      title: "Returns and Refunds",
      icon: <RefreshCw className="h-6 w-6" />,
    },
    {
      id: "intellectual",
      title: "Intellectual Property",
      icon: <Shield className="h-6 w-6" />,
    },
  ]

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-neutral-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-8xl px-4 mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-teal-800">Terms and Conditions</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Please read these terms carefully before using our website and services.
            </p>
            <p className="text-gray-500 mt-2">Last Updated: May 1, 2023</p>
          </motion.div>

          {/* Quick navigation */}
          <motion.div
            className="mb-10 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <h2 className="text-lg font-medium mb-4 text-gray-900">Quick Navigation</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              {sections.map((section) => (
                <a
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="text-teal-700 mr-3">{section.icon}</div>
                  <span className="text-sm font-medium text-gray-700">{section.title}</span>
                </a>
              ))}
            </div>
          </motion.div>

          {/* Main content */}
          <motion.div
            className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <div className="p-8">
              <div className="prose prose-lg max-w-none">
                <section id="introduction">
                  <div className="flex items-center mb-4">
                    <Book className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Introduction</h2>
                  </div>
                  <p>
                    These terms and conditions ("Terms") govern your use of the PARPRA website and services. By
                    accessing or using our website, you agree to be bound by these Terms. If you do not agree with any
                    part of these Terms, you must not use our website.
                  </p>

                  <h3 className="text-xl font-medium text-gray-900 mt-6 mb-3">Definitions</h3>
                  <p>In these Terms:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>"Website" refers to PARPRA, accessible at www.parpra.com</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>"We," "us," or "our" refers to PARPRA</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>"You" refers to the individual accessing or using the Website</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        "Content" refers to all information, text, graphics, photos, designs, logos, and other materials
                        that appear on our Website
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>"Products" refers to all items available for purchase on our Website</span>
                    </li>
                  </ul>
                </section>

                <section id="account" className="mt-10">
                  <div className="flex items-center mb-4">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-teal-700 mr-3"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                    <h2 className="text-2xl font-medium text-gray-900">Account Registration</h2>
                  </div>
                  <p>
                    To access certain features of the Website, you may be required to register for an account. You agree
                    to provide accurate, current, and complete information during the registration process and to update
                    such information to keep it accurate, current, and complete.
                  </p>
                  <p>
                    You are responsible for safeguarding your password and for all activities that occur under your
                    account. You agree to notify us immediately of any unauthorized use of your account.
                  </p>
                </section>

                <section id="products" className="mt-10">
                  <div className="flex items-center mb-4">
                    <ShoppingBag className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Products and Orders</h2>
                  </div>
                  <p>
                    All Products are subject to availability. We reserve the right to discontinue any Products at any
                    time.
                  </p>
                  <p>
                    Prices for our Products are subject to change without notice. We reserve the right to modify or
                    discontinue the Website or any Products without notice at any time.
                  </p>
                  <p>
                    We reserve the right to refuse any order you place with us. We may, in our sole discretion, limit or
                    cancel quantities purchased per person, per household, or per order.
                  </p>
                </section>

                <section id="payment" className="mt-10">
                  <div className="flex items-center mb-4">
                    <CreditCard className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Payment Terms</h2>
                  </div>
                  <p>
                    We accept various payment methods as indicated on our Website. By providing a payment method, you
                    represent and warrant that you are authorized to use the designated payment method.
                  </p>
                  <p>
                    You agree to pay all charges incurred by you or any users of your account and payment method at the
                    prices in effect when such charges are incurred.
                  </p>
                </section>

                <section id="shipping" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Truck className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Shipping and Delivery</h2>
                  </div>
                  <p>
                    We will make every effort to ship Products within the timeframe specified on our Website. However,
                    shipping times are estimates and not guaranteed. We are not liable for any delays in shipments.
                  </p>
                  <p>
                    Risk of loss and title for Products purchased from our Website pass to you upon delivery of the
                    Products to the carrier.
                  </p>
                </section>

                <section id="returns" className="mt-10">
                  <div className="flex items-center mb-4">
                    <RefreshCw className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Returns and Refunds</h2>
                  </div>
                  <p>
                    Our return and refund policy is outlined in our separate Return & Refund Policy, which is
                    incorporated by reference into these Terms.
                  </p>
                </section>

                <section id="intellectual" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Shield className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Intellectual Property</h2>
                  </div>
                  <p>
                    The Website and its entire contents, features, and functionality (including but not limited to all
                    information, software, text, displays, images, video, and audio, and the design, selection, and
                    arrangement thereof) are owned by us, our licensors, or other providers of such material and are
                    protected by copyright, trademark, patent, trade secret, and other intellectual property or
                    proprietary rights laws.
                  </p>
                  <p>
                    You may not reproduce, distribute, modify, create derivative works of, publicly display, publicly
                    perform, republish, download, store, or transmit any of the material on our Website without our
                    prior written consent.
                  </p>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">User Content</h2>
                  <p>
                    Our Website may allow you to post, link, store, share, and otherwise make available certain
                    information, text, graphics, videos, or other material ("User Content"). You are responsible for the
                    User Content that you post on or through the Website.
                  </p>
                  <p>
                    By posting User Content on or through the Website, you grant us the right to use, modify, publicly
                    perform, publicly display, reproduce, and distribute such User Content on and through the Website.
                  </p>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Prohibited Uses</h2>
                  <p>
                    You may use the Website only for lawful purposes and in accordance with these Terms. You agree not
                    to:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        Use the Website in any way that violates any applicable federal, state, local, or international
                        law
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        Use the Website to engage in any conduct that restricts or inhibits anyone's use or enjoyment of
                        the Website
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        Use the Website to impersonate or attempt to impersonate us, our employees, another user, or any
                        other person or entity
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        Use the Website to engage in any other conduct that restricts or inhibits anyone's use or
                        enjoyment of the Website, or which may harm us or users of the Website
                      </span>
                    </li>
                  </ul>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Disclaimer of Warranties</h2>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 my-4">
                    <p className="uppercase text-sm font-bold text-gray-700 mb-2">Important Notice:</p>
                    <p className="text-gray-700">
                      THE WEBSITE AND PRODUCTS ARE PROVIDED ON AN "AS IS" AND "AS AVAILABLE" BASIS, WITHOUT ANY
                      WARRANTIES OF ANY KIND, EITHER EXPRESS OR IMPLIED. WE DISCLAIM ALL WARRANTIES, INCLUDING BUT NOT
                      LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                      NON-INFRINGEMENT.
                    </p>
                  </div>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Limitation of Liability</h2>
                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200 my-4">
                    <p className="text-gray-700">
                      IN NO EVENT WILL WE, OUR AFFILIATES, OR THEIR LICENSORS, SERVICE PROVIDERS, EMPLOYEES, AGENTS,
                      OFFICERS, OR DIRECTORS BE LIABLE FOR DAMAGES OF ANY KIND, UNDER ANY LEGAL THEORY, ARISING OUT OF
                      OR IN CONNECTION WITH YOUR USE, OR INABILITY TO USE, THE WEBSITE, ANY WEBSITES LINKED TO IT, ANY
                      CONTENT ON THE WEBSITE OR SUCH OTHER WEBSITES, OR ANY PRODUCTS OBTAINED THROUGH THE WEBSITE.
                    </p>
                  </div>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Indemnification</h2>
                  <p>
                    You agree to defend, indemnify, and hold harmless us, our affiliates, licensors, and service
                    providers, and our and their respective officers, directors, employees, contractors, agents,
                    licensors, suppliers, successors, and assigns from and against any claims, liabilities, damages,
                    judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising
                    out of or relating to your violation of these Terms or your use of the Website.
                  </p>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Governing Law</h2>
                  <p>
                    These Terms and any dispute or claim arising out of or in connection with them or their subject
                    matter or formation shall be governed by and construed in accordance with the laws of India, without
                    giving effect to any choice or conflict of law provision or rule.
                  </p>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Changes to Terms</h2>
                  <p>
                    We may revise and update these Terms from time to time in our sole discretion. All changes are
                    effective immediately when we post them. Your continued use of the Website following the posting of
                    revised Terms means that you accept and agree to the changes.
                  </p>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact Us</h2>
                  <p>
                    If you have any questions about these Terms, please contact us at:
                    <br />
                    Email: terms@parpra.com
                    <br />
                    Phone: +91 98765 43210
                  </p>
                </section>
              </div>
            </div>
          </motion.div>

          {/* Related links */}
          <motion.div
            className="mt-10 bg-white rounded-lg shadow-sm p-6 border border-gray-100"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-lg font-medium mb-4 text-gray-900">Related Policies</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Link
                href="/privacy-policy"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <Shield className="h-5 w-5 text-teal-700 mr-3" />
                <span className="text-sm font-medium text-gray-700">Privacy Policy</span>
              </Link>
              <Link
                href="/shipping"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <Truck className="h-5 w-5 text-teal-700 mr-3" />
                <span className="text-sm font-medium text-gray-700">Shipping & Returns</span>
              </Link>
              <Link
                href="/faq"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <HelpCircle className="h-5 w-5 text-teal-700 mr-3" />
                <span className="text-sm font-medium text-gray-700">FAQs</span>
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
