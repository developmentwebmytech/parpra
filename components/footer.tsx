"use client";
import Link from "next/link";
import Image from "next/image";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
  Award,
  CreditCard,
  HandMetal,
  Globe,
} from "lucide-react";
import { useEffect, useState } from "react";
import Logo from "../public/Logo/ParPraWhite.webp";
import PhonePe from "../public/Payment-icons/PhonePe.png";
import Cash from "../public/Payment-icons/cash.png";
import Upi from "../public/Payment-icons/upi.png";
import Paytm from "../public/Payment-icons/Paytm.png";
import { getCategories } from "@/lib/api";
import { Category } from "@/types";
import { useSession } from "next-auth/react";

export default function Footer() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { data: session } = useSession();
  const userRole = session?.user?.role;

  interface ContactInfoItem {
    _id: string;
    type: string;
    title: string;
    content: Record<string, string>;
    icon: string;
    order: number;
  }

  useEffect(() => {
    async function fetchCategories() {
      try {
        setIsLoading(true);
        const response = await getCategories();
        // Get top level categories and limit to 6 for the footer

        const topCategories = response.categories
          .filter((cat: Category) => !cat.parent_category_id)
          .slice(0, 6);
        setCategories(topCategories);
      } catch (error) {
        console.error("Error fetching categories for footer:", error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchContactInfo = async () => {
      try {
        const response = await fetch("/api/contact-info");
        if (response.ok) {
          const data = await response.json();
          setContactInfo(data);
        } else {
          console.error("Failed to fetch contact information");
        }
      } catch (error) {
        console.error("Error fetching contact information:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchContactInfo();
  }, []);

  const address = contactInfo.find((item) => item.type === "address");
  // console.log("Contact Info:", contactInfo);
  const phone = contactInfo.find((item) => item.type === "phone");
  const email = contactInfo.find((item) => item.type === "email");
  // Function to convert category name to URL-friendly format
  const getCategoryUrl = (name: string) => {
    return `/${name.toLowerCase().replace(/\s+/g, "-")}`;
  };
  const features = [
    {
      icon: MapPin,
      title: "MADE IN INDIA",
      description: "Authentic products crafted in India",
    },
    {
      icon: Award,
      title: "ASSURED QUALITY",
      description: "Premium quality guaranteed",
    },
    {
      icon: CreditCard,
      title: "SECURE PAYMENTS",
      description: "Safe and protected transactions",
    },
    {
      icon: HandMetal,
      title: "EMPOWERING WEAVERS",
      description: "Supporting local artisans and communities",
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-700"></div>
      </div>
    );
  }

  if (userRole === "admin") return null;

  return (
    //unknown coder code
    // <footer className=" border-t w-full">
    //   <div className="container m-auto ">
    //   {/* Features Section */}
    //   <div className="w-full bg-white py-8 md:py-12 border-b border-gray-200">
    //     <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
    //       <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
    //         {features.map((feature, index) => (
    //           <div
    //             key={index}
    //             className="flex flex-col items-center text-center px-2"
    //           >
    //             <div className="w-16 h-16 flex items-center justify-center mb-2 sm:mb-3">
    //               <feature.icon
    //                 className="w-10 h-10 sm:w-12 sm:h-12 text-teal-800"
    //                 strokeWidth={1.5}
    //               />
    //             </div>
    //             <h3 className="text-teal-800 font-medium text-xs sm:text-sm md:text-base">
    //               {feature.title}
    //             </h3>
    //             <p className="text-teal-800 text-[11px] sm:text-xs mt-1 hidden sm:block">
    //               {feature.description}
    //             </p>
    //           </div>
    //         ))}
    //       </div>
    //     </div>
    //   </div>

    //   {/* Newsletter Section */}
    //   <div className="w-full py-12 my-12 bg-white">
    //     <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
    //       <h3 className="text-lg sm:text-xl font-semibold mb-2">
    //         Subscribe to our newsletter
    //       </h3>
    //       <p className="text-gray-600 mb-6 text-sm sm:text-base">
    //         Stay updated with our latest collections and exclusive offers
    //       </p>

    //       <form className="flex flex-col sm:flex-row gap-3 w-full">
    //         <input
    //           type="text"
    //           placeholder="Your name"
    //           className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800 text-sm sm:text-base"
    //         />
    //         <input
    //           type="email"
    //           placeholder="Your email address"
    //           className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800 text-sm sm:text-base"
    //         />
    //         <button
    //           type="submit"
    //           className="bg-teal-800 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200 text-sm sm:text-base whitespace-nowrap"
    //         >
    //           Subscribe
    //         </button>
    //       </form>
    //     </div>
    //   </div>

    //   {/* Main Footer Content */}

    //   <div className="w-full bg-teal-800">
    //     <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-8 py-10 max-w-screen-2xl mx-auto">
    //       {/* Logo and About */}
    //       <div className="space-y-4">
    //         <Link href="/">
    //           <Image src={Logo} alt="PARPRA" width={150} height={50} />
    //         </Link>
    //         <p className="text-white mt-4">
    //           Discover the elegance of Indian ethnic wear with our curated
    //           collection of traditional and contemporary designs.
    //         </p>
    //         <div className="flex space-x-4 mt-4">
    //           <a
    //             href="https://facebook.com"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-white"
    //           >
    //             <Facebook size={20} />
    //             <span className="sr-only">Facebook</span>
    //           </a>
    //           <a
    //             href="https://instagram.com"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-white"
    //           >
    //             <Instagram size={20} />
    //             <span className="sr-only">Instagram</span>
    //           </a>
    //           <a
    //             href="https://twitter.com"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-white"
    //           >
    //             <Twitter size={20} />
    //             <span className="sr-only">Twitter</span>
    //           </a>
    //           <a
    //             href="https://youtube.com"
    //             target="_blank"
    //             rel="noopener noreferrer"
    //             className="text-white"
    //           >
    //             <Youtube size={20} />
    //             <span className="sr-only">YouTube</span>
    //           </a>
    //         </div>
    //       </div>

    //       {/* Quick Links */}
    //       <div>
    //         <h3 className="text-2xl font-semibold mb-4 text-white">
    //           Quick Links
    //         </h3>
    //         <ul className="space-y-2">
    //           <li>
    //             <Link href="/about" className="text-white hover:text-teal-300">
    //               About Us
    //             </Link>
    //           </li>
    //           <li>
    //             <Link
    //               href="/contact"
    //               className="text-white hover:text-teal-300"
    //             >
    //               Contact Us
    //             </Link>
    //           </li>
    //           <li>
    //             <Link href="/faq" className="text-white hover:text-teal-300">
    //               FAQ
    //             </Link>
    //           </li>
    //           <li>
    //             <Link href="/blog" className="text-white hover:text-teal-300">
    //               Blog
    //             </Link>
    //           </li>
    //           <li>
    //             <Link
    //               href="/shipping"
    //               className="text-white hover:text-teal-300"
    //             >
    //               Shipping & Returns
    //             </Link>
    //           </li>
    //           <li>
    //             <Link
    //               href="/privacy-policy"
    //               className="text-white hover:text-teal-300"
    //             >
    //               Privacy Policy
    //             </Link>
    //           </li>
    //           <li>
    //             <Link href="/terms" className="text-white hover:text-teal-300">
    //               Terms & Conditions
    //             </Link>
    //           </li>
    //         </ul>
    //       </div>

    //       {/* Categories - Now Dynamic */}
    //       <div>
    //         <h3 className="text-lg font-semibold mb-4 text-white">
    //           Categories
    //         </h3>
    //         <ul className="space-y-2">
    //           {isLoading ? (
    //             // Skeleton loader for categories
    //             Array(6)
    //               .fill(0)
    //               .map((_, index) => (
    //                 <li
    //                   key={index}
    //                   className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4"
    //                 ></li>
    //               ))
    //           ) : categories.length > 0 ? (
    //             // Render dynamic categories
    //             categories.map((category) => (
    //               <li key={category._id} className="text-white">
    //                 <Link
    //                   href={getCategoryUrl(category.name)}
    //                   className="text-white hover:text-teal-300 transition-colors"
    //                 >
    //                   {category.name}
    //                 </Link>
    //               </li>
    //             ))
    //           ) : (
    //             // Fallback if no categories are found
    //             <li className="text-gray-600">No categories available</li>
    //           )}
    //         </ul>
    //       </div>

    //       {/* Contact Info */}
    //       <div>
    //         <h3 className="text-2xl font-semibold mb-4 text-white">
    //           Contact Us
    //         </h3>
    //         <ul className="space-y-4">
    //           <li className="flex items-start">
    //             <MapPin className="h-5 w-5 text-white mr-2 mt-0.5" />
    //             <span className="text-white">
    //               {address?.content.line1}, {address?.content.line2},{" "}
    //               {address?.content.line3}
    //             </span>
    //           </li>
    //           {/* Comma-separated phone numbers */}
    //           {phone && (
    //             <li className="flex items-center">
    //               <Phone className="h-5 w-5 text-white mr-2" />
    //               <span className="text-white">
    //                 {Object.values(phone.content).map((num, idx, arr) => (
    //                   <a
    //                     key={num}
    //                     href={`tel:${num}`}
    //                     className="hover:text-teal-300"
    //                   >
    //                     {num}
    //                     {idx < arr.length - 1 ? ", " : ""}
    //                   </a>
    //                 ))}
    //               </span>
    //             </li>
    //           )}
    //           {/* Comma-separated emails */}
    //           {email && (
    //             <li className="flex items-center">
    //               <Mail className="h-5 w-8 text-white mr-2" />
    //               <span className="text-white">
    //                 {Object.values(email.content).map((mail, idx, arr) => (
    //                   <a
    //                     key={mail}
    //                     href={`mailto:${mail}`}
    //                     className="hover:text-teal-300"
    //                   >
    //                     {mail}
    //                     {idx < arr.length - 1 ? " , " : ""}
    //                   </a>
    //                 ))}
    //               </span>
    //             </li>
    //           )}
    //         </ul>
    //       </div>
    //     </div>
    //   </div>

    //   {/* Copyright */}
    //   <div className="w-full bg-teal-800">
    //     <div className=" flex flex-col md:flex-row justify-between items-center gap-6 px-4 py-6">
    //       {/* Left section - Country and Shipping */}
    //       <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-4 text-white text-center sm:text-left bg-red-500">
    //         <div className="flex items-center gap-2">
    //           <Globe className="w-6 h-6" />
    //           <span className="text-xl">India</span>
    //         </div>
    //         <div className="flex items-center gap-2  flex-wrap justify-center sm:justify-start">
    //           <span className="font-bold text-xl">FedEx</span>
    //             <span className="text-blue-400">BLUE</span>
    //             <span className="text-green-400">DART</span>
    //           <span className="font-bold text-xl">DELHIVERY</span>
    //         </div>
    //       </div>

    //       {/* Center section - Copyright */}
    //       <div className="text-sm sm:text-md text-white text-center">
    //         © 2025 Parpra Fashions Ltd. All rights reserved.
    //       </div>

    //       {/* Right section - Payment methods */}
    //       <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2  sm:gap-4 text-white text-center sm:text-left">
    //         <span className="text-sm sm:text-md whitespace-nowrap mt-3">
    //           100% Secure Payments
    //         </span>
    //         <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
    //           {[Paytm, Cash, Upi, PhonePe].map((src, i) => (
    //             <div
    //               key={i}
    //               className="bg-white rounded h-10 w-20 flex items-center justify-center"
    //             >
    //               <Image
    //                 src={src}
    //                 alt={`Payment ${i}`}
    //                 width={80}
    //                 height={40}
    //                 className="object-contain"
    //               />
    //             </div>
    //           ))}
    //         </div>
    //       </div>
    //     </div>
    //   </div>

    //   </div>
    // </footer>

    <footer className="border-t w-full  ">
      {/* Features Section */}
      <div className="container m-auto w-full bg-white py-8 md:py-12 border-b border-gray-200">
        <div className="px-4 sm:px-6 lg:px-8 max-w-screen-2xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex flex-col items-center text-center px-2"
              >
                <div className="w-16 h-16 flex items-center justify-center mb-2 sm:mb-3">
                  <feature.icon
                    className="w-10 h-10 sm:w-12 sm:h-12 text-teal-800"
                    strokeWidth={1.5}
                  />
                </div>
                <h3 className="text-teal-800 font-medium text-xs sm:text-sm md:text-base">
                  {feature.title}
                </h3>
                <p className="text-teal-800 text-[11px] sm:text-xs mt-1 hidden sm:block">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className=" container m-auto w-full py-12 bg-white">
        <div className="max-w-2xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-lg sm:text-xl font-semibold mb-2">
            Subscribe to our newsletter
          </h3>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Stay updated with our latest collections and exclusive offers
          </p>

          <form className="flex flex-col sm:flex-row gap-3 w-full">
            <input
              type="text"
              placeholder="Your name"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800 text-sm sm:text-base"
            />
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-800 text-sm sm:text-base"
            />
            <button
              type="submit"
              className="bg-teal-800 text-white px-4 py-2 rounded-md hover:bg-teal-700 transition duration-200 text-sm sm:text-base whitespace-nowrap"
            >
              Subscribe
            </button>
          </form>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="w-full bg-teal-800 ">
        <div className="container m-auto grid grid-cols-1 md:grid-cols-4 gap-8  py-10  ">
          {/* Logo and About */}
          <div className="space-y-4">
            <Link href="/">
              <Image src={Logo} alt="PARPRA" width={150} height={50} />
            </Link>
            <p className="text-white mt-4">
              Discover the elegance of Indian ethnic wear with our curated
              collection of traditional and contemporary designs.
            </p>
            <div className="flex space-x-4 mt-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <Facebook size={20} />
                <span className="sr-only">Facebook</span>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <Instagram size={20} />
                <span className="sr-only">Instagram</span>
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <Twitter size={20} />
                <span className="sr-only">Twitter</span>
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white"
              >
                <Youtube size={20} />
                <span className="sr-only">YouTube</span>
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-white hover:text-teal-300">
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-white hover:text-teal-300"
                >
                  Contact Us
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-white hover:text-teal-300">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/blog" className="text-white hover:text-teal-300">
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/shipping"
                  className="text-white hover:text-teal-300"
                >
                  Shipping & Returns
                </Link>
              </li>
              <li>
                <Link
                  href="/privacy-policy"
                  className="text-white hover:text-teal-300"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-white hover:text-teal-300">
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xl font-semibold mb-4 text-white">
              Categories
            </h3>
            <ul className="space-y-2">
              {isLoading ? (
                Array(6)
                  .fill(0)
                  .map((_, index) => (
                    <li
                      key={index}
                      className="h-5 bg-gray-200 rounded animate-pulse mb-2 w-3/4"
                    ></li>
                  ))
              ) : categories.length > 0 ? (
                categories.map((category) => (
                  <li key={category._id} className="text-white">
                    <Link
                      href={getCategoryUrl(category.name)}
                      className="hover:text-teal-300"
                    >
                      {category.name}
                    </Link>
                  </li>
                ))
              ) : (
                <li className="text-gray-400">No categories available</li>
              )}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-xl font-semibold mb-3 text-white">
              Contact Us
            </h3>
            <ul className="space-y-2">
              {/* Address */}
              <li className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-white flex-shrink-0" />
                <span className="text-white  ">
                  {address?.content.line1}, {address?.content.line2},{" "}
                  {address?.content.line3}
                </span>
              </li>

              {/* Phone */}
              {phone && (
                <li className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="text-white ">
                    {Object.values(phone.content).map((num, idx, arr) => (
                      <a
                        key={num}
                        href={`tel:${num}`}
                        className="hover:text-teal-300"
                      >
                        {num}
                        {idx < arr.length - 1 ? ", " : ""}
                      </a>
                    ))}
                  </span>
                </li>
              )}

              {/* Email */}
              {email && (
                <li className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-white flex-shrink-0" />
                  <span className="text-white ">
                    {Object.values(email.content).map((mail, idx, arr) => (
                      <a
                        key={mail}
                        href={`mailto:${mail}`}
                        className="hover:text-teal-300"
                      >
                        {mail}
                        {idx < arr.length - 1 ? ", " : ""}
                      </a>
                    ))}
                  </span>
                </li>
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="container m-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6  py-6 max-w-screen-2xl mx-auto text-white">
            {/* Left section */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <Globe className="w-6 h-6" />
                <span className="text-lg">India</span>
              </div>
              <div className="flex items-center gap-3 flex-wrap justify-center sm:justify-start">
                <span className="font-bold text-lg">FedEx</span>
                <span className="text-blue-400">BLUE DART</span>
                <span className="font-bold text-lg">DELHIVERY</span>
              </div>
            </div>

            {/* Center section */}
            <div className="text-sm sm:text-md text-center">
              © 2025 Parpra Fashions Ltd. All rights reserved.
            </div>

            {/* Right section */}
            <div className="flex flex-col sm:flex-row items-center gap-3 text-center sm:text-left">
              <span className="text-sm sm:text-md whitespace-nowrap">
                100% Secure Payments
              </span>
              <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                {[Paytm, Cash, Upi, PhonePe].map((src, i) => (
                  <div
                    key={i}
                    className="bg-white rounded h-10 w-20 flex items-center justify-center"
                  >
                    <Image
                      src={src}
                      alt={`Payment ${i}`}
                      width={80}
                      height={40}
                      className="object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
