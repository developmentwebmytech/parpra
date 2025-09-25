"use client"

import { motion } from "framer-motion"
import { Shield, Lock, Database, Globe, Bell, UserCheck, Clock, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"



export default function PrivacyPolicyPage() {
  const sections = [
    {
      id: "introduction",
      title: "Introduction",
      icon: <Shield className="h-6 w-6" />,
    },
    {
      id: "information-we-collect",
      title: "Information We Collect",
      icon: <Database className="h-6 w-6" />,
    },
    {
      id: "how-we-collect",
      title: "How We Collect Your Information",
      icon: <Globe className="h-6 w-6" />,
    },
    {
      id: "how-we-use",
      title: "How We Use Your Information",
      icon: <Bell className="h-6 w-6" />,
    },
    {
      id: "disclosure",
      title: "Disclosure of Your Information",
      icon: <UserCheck className="h-6 w-6" />,
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="h-6 w-6" />,
    },
    {
      id: "data-retention",
      title: "Data Retention",
      icon: <Clock className="h-6 w-6" />,
    },
    {
      id: "legal-rights",
      title: "Your Legal Rights",
      icon: <FileText className="h-6 w-6" />,
    },
  ]

  return (
    <div className="bg-gradient-to-b from-neutral-50 to-neutral-100 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-8xl mx-auto px-4">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-5xl font-light mb-4 text-teal-800">Privacy Policy</h1>
            <p className="text-gray-600 max-w-2xl mx-auto">
              At PARPRA, we value your privacy and are committed to protecting your personal data.
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
              {sections.map((section, index) => (
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
                    <Shield className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Introduction</h2>
                  </div>
                  <p>
                    PARPRA ("we," "our," or "us") respects your privacy and is committed to protecting your personal
                    data. This privacy policy will inform you about how we look after your personal data when you visit
                    our website and tell you about your privacy rights and how the law protects you.
                  </p>
                </section>

                <section id="information-we-collect" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Database className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Information We Collect</h2>
                  </div>
                  <p>We collect several types of information from and about users of our website, including:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Personal Identifiers:</strong> Name, email address, postal address, phone number, and
                        other similar contact information.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Account Information:</strong> Username, password, account preferences, and purchase
                        history.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Payment Information:</strong> Credit card numbers, banking information, and billing
                        addresses.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Technical Data:</strong> IP address, browser type and version, time zone setting,
                        browser plug-in types and versions, operating system and platform, and other technology on the
                        devices you use to access this website.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Usage Data:</strong> Information about how you use our website, products, and services.
                      </span>
                    </li>
                  </ul>
                </section>

                <section id="how-we-collect" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Globe className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">How We Collect Your Information</h2>
                  </div>
                  <p>We use different methods to collect data from and about you including through:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Direct Interactions:</strong> You may give us your identity, contact, and financial data
                        by filling in forms or by corresponding with us by post, phone, email, or otherwise.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Automated Technologies:</strong> As you interact with our website, we may automatically
                        collect technical data about your equipment, browsing actions, and patterns.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        <strong>Third Parties:</strong> We may receive personal data about you from various third
                        parties such as analytics providers, advertising networks, and search information providers.
                      </span>
                    </li>
                  </ul>
                </section>

                <section id="how-we-use" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Bell className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">How We Use Your Information</h2>
                  </div>
                  <p>
                    We will only use your personal data when the law allows us to. Most commonly, we will use your
                    personal data in the following circumstances:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>To register you as a new customer.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>To process and deliver your order.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>To manage your relationship with us.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>To personalize your website experience.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>To deliver relevant website content and advertisements to you.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        To use data analytics to improve our website, products/services, marketing, customer
                        relationships, and experiences.
                      </span>
                    </li>
                  </ul>
                </section>

                <section id="disclosure" className="mt-10">
                  <div className="flex items-center mb-4">
                    <UserCheck className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Disclosure of Your Information</h2>
                  </div>
                  <p>We may share your personal data with the following parties:</p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Service providers who provide IT and system administration services.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Professional advisers including lawyers, bankers, auditors, and insurers.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Government bodies that require us to report processing activities.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>
                        Third parties to whom we may choose to sell, transfer, or merge parts of our business or our
                        assets.
                      </span>
                    </li>
                  </ul>
                </section>

                <section id="data-security" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Lock className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Data Security</h2>
                  </div>
                  <p>
                    We have put in place appropriate security measures to prevent your personal data from being
                    accidentally lost, used, or accessed in an unauthorized way data from being accidentally lost, used,
                    or accessed in an unauthorized way, altered, or disclosed. In addition, we limit access to your
                    personal data to those employees, agents, contractors, and other third parties who have a business
                    need to know.
                  </p>
                </section>

                <section id="data-retention" className="mt-10">
                  <div className="flex items-center mb-4">
                    <Clock className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Data Retention</h2>
                  </div>
                  <p>
                    We will only retain your personal data for as long as necessary to fulfill the purposes we collected
                    it for, including for the purposes of satisfying any legal, accounting, or reporting requirements.
                  </p>
                </section>

                <section id="legal-rights" className="mt-10">
                  <div className="flex items-center mb-4">
                    <FileText className="h-6 w-6 text-teal-700 mr-3" />
                    <h2 className="text-2xl font-medium text-gray-900">Your Legal Rights</h2>
                  </div>
                  <p>
                    Under certain circumstances, you have rights under data protection laws in relation to your personal
                    data, including the right to:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Request access to your personal data.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Request correction of your personal data.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Request erasure of your personal data.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Object to processing of your personal data.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Request restriction of processing your personal data.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Request transfer of your personal data.</span>
                    </li>
                    <li className="flex items-start">
                      <span className="inline-block w-1.5 h-1.5 rounded-full bg-teal-700 mt-2 mr-2 flex-shrink-0"></span>
                      <span>Right to withdraw consent.</span>
                    </li>
                  </ul>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Changes to This Privacy Policy</h2>
                  <p>
                    We may update our privacy policy from time to time. We will notify you of any changes by posting the
                    new privacy policy on this page and updating the "Last Updated" date at the top of this privacy
                    policy.
                  </p>
                </section>

                <section className="mt-10">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4">Contact Us</h2>
                  <p>
                    If you have any questions about this privacy policy or our privacy practices, please contact us at:
                    <br />
                    Email: privacy@parpra.com
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
                href="/terms"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <FileText className="h-5 w-5 text-teal-700 mr-3" />
                <span className="text-sm font-medium text-gray-700">Terms & Conditions</span>
              </Link>
              <Link
                href="/shipping"
                className="flex items-center p-3 rounded-md hover:bg-gray-50 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-teal-700 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M5 10h12a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2Z"></path>
                  <path d="M10 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path>
                  <path d="M8 16h.01"></path>
                  <path d="M16 16h.01"></path>
                </svg>
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
