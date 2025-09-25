"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";
import { useReactToPrint } from "react-to-print";
interface OrderItem {
  _id: string;
  product_id: string;
  variation_id: string;
  quantity: number;
  price: number;
  name: string;
  image: string;
  size: string;
  color: string;
}

interface Address {
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
}

interface Order {
  _id: string;
  order_number: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  total: number;
  status: string;
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: string;
  createdAt: string;
}

export default function InvoicePage() {
     let storeLocation = "Madhya Pradesh";

  const searchParams = useSearchParams();
  const orderId = searchParams.get("id");
  const router = useRouter();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const invoiceRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/orders/${orderId}`);
        if (!res.ok) throw new Error("Failed to fetch order");
        const data = await res.json();
        setOrder(data);
      } catch (err) {
        console.error(err);
        router.push("/account/orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  
 const contentRef = useRef<HTMLDivElement>(null);
  const reactToPrintFn = useReactToPrint({ contentRef });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const fixImagePath = (path: string) => {
    if (!path) return "/placeholder.svg";
    return path.startsWith("http") ? path : `http://localhost:3000/${path}`;
  };

  if (loading || !order) return <div className="p-6">Loading...</div>;

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white p-6 rounded-md shadow-md" ref={contentRef}>
          <h1 className="text-2xl font-bold mb-4">
            Invoice #{order.order_number}
          </h1>
          <Badge className="bg-green-100 text-green-800">{order.status}</Badge>
          <p className="text-gray-500 mb-4">
            Placed on {formatDate(order.createdAt)}
          </p>
          <Separator className="my-4" />

          {/* Shipping Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
            <div>
              <h2 className="font-medium mb-2">Shipping Address</h2>
              <p>{order.shipping_address.full_name}</p>
              <p>{order.shipping_address.address_line1}</p>
              {order.shipping_address.address_line2 && (
                <p>{order.shipping_address.address_line2}</p>
              )}
              <p>
                {order.shipping_address.city}, {order.shipping_address.state}{" "}
                {order.shipping_address.postal_code}
              </p>
              <p>{order.shipping_address.country}</p>
              <p>Phone: {order.shipping_address.phone}</p>
            </div>

            <div>
              <h2 className="font-medium mb-2">Payment Information</h2>
              <p>
                <span className="font-medium">Method: </span>
                {order.payment_method === "cod"
                  ? "Cash on Delivery"
                  : order.payment_method}
              </p>
              <p>
                <span className="font-medium">Status: </span>
                <Badge className="bg-green-100 text-green-800">
                  {order.payment_status}
                </Badge>
              </p>
            </div>
          </div>

          <Separator className="my-4" />

          {/* Items */}
          <div className="space-y-4">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex items-center gap-4 border rounded-md p-2"
              >
                <div className="w-16 h-16 relative">
                  {/* Use normal img to avoid next/image restrictions */}
                  <img
                    src={fixImagePath(item.image)}
                    alt={item.name}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{item.name}</p>
                  <p className="text-sm text-gray-500">
                    Size: {item.size}, Color: {item.color}
                  </p>
                </div>
                <div className="text-right">
                  <p>Qty: {item.quantity}</p>
                  <p className="font-medium">
                    ₹{item.price.toLocaleString("en-IN")}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          {/* Summary */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>₹{order.subtotal.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex flex-col">
                  {order.shipping_address.state &&
                    (storeLocation === order.shipping_address.state ? (
                      <div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            Base Price:
                          </span>
                          <span className="text-gray-600">
                            ₹
                            {(order.total - (order.total * 18) / 100).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            CGST (9%):
                          </span>
                          <span className="text-gray-600">
                            ₹{((order.total * 9) / 100).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            SGST (9%):
                          </span>
                          <span className="text-gray-600">
                            ₹{((order.total * 9) / 100).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          IGST (18%):
                        </span>
                        <span className="text-gray-600">
                          ₹{((order.total * 18) / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-green-600">
                <span className="flex items-center">
                  <Tag className="h-4 w-4 mr-1" /> Discount
                  {order.coupon_code && ` (${order.coupon_code})`}
                </span>
                <span>-₹{order.discount.toLocaleString("en-IN")}</span>
              </div>
            )}
            <div className="flex justify-between font-medium">
              <span>Total</span>
              <span>
                ₹
                {(order.subtotal - (order.discount || 0)).toLocaleString(
                  "en-IN"
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Download Button */}
        <Button
           onClick={reactToPrintFn}
          className="mt-6 bg-teal-700 hover:bg-teal-800 text-white"
        >
          Download Invoice
        </Button>
      </div>
    </div>
  );
}
