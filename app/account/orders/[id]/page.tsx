"use client";


import { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";


import {
  ArrowLeft,
  Package,
  Truck,
  CheckCircle,
  Clock,
  Tag,
  AlertCircle,
  ArrowUpRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import UserAccountSidebar from "@/components/user-account-sidebar";

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
  user_id: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  coupon_code?: string;
  total: number;
  status:
    | "pending"
    | "processing"
    | "shipped"
    | "delivered"
    | "cancelled"
    | "returned"
    | "return_requested";
  shipping_address: Address;
  billing_address: Address;
  payment_method: string;
  payment_status: "pending" | "paid" | "failed" | "refunded" | "completed";
  tracking_number?: string;
  cancel_reason?: string;
  return_reason?: string;
  createdAt: string;
  updatedAt: string;
  additionalComments?: string;
  returnType?: "full" | "partial";
}

const CANCELLATION_REASONS = [
  "Changed my mind",
  "Found a better price elsewhere",
  "Ordered by mistake",
  "Delivery time too long",
  "Item no longer needed",
  "Financial reasons",
  "Other (please specify)",
];

const RETURN_REASONS = [
  "Item damaged or defective",
  "Wrong item received",
  "Item doesn't match description",
  "Size/fit issues",
  "Quality not as expected",
  "Received incomplete order",
  "Other (please specify)",
];

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedReason, setSelectedReason] = useState("");
  const [additionalComments, setAdditionalComments] = useState("");
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [returnType, setReturnType] = useState<"full" | "partial">("full");
  const [ordersId, setOrdersId] = useState<string | null>(null);

 let storeLocation = "Madhya Pradesh";


  useEffect(() => {
    const fetchParams = async () => {
      const resolvedParams = await params;
      setOrdersId(resolvedParams.id);
    };
    fetchParams();
  }, [params]);

  useEffect(() => {
     const fetchOrder = async (orderId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/orders/${orderId}`);
      

      if (!response.ok) {
        throw new Error("Failed to fetch order");
      }

      const data = await response.json();
      // console.log("data aa gaya ",data)
      setOrder(data);
      
    } catch (error) {
      console.error("Error fetching order:", error);
      toast({
        title: "Error",
        description: "Failed to load order details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    if (status === "unauthenticated") {
      router.push("/login?redirect=/account/orders");
      return;
    }

    if (status === "authenticated" && ordersId) {
      fetchOrder(ordersId);
    }
  }, [status, ordersId, router, toast]);

  const handleCancelOrder = async () => {
    if (!order) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/orders/${order._id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: selectedReason,
          additionalComments: additionalComments,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to cancel order");
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setCancelDialogOpen(false);
      setSelectedReason("");
      setAdditionalComments("");

      toast({
        title: "Order Cancelled",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error: any) {
      console.error("Error cancelling order:", error);
      toast({
        title: "Cancellation Failed",
        description:
          error.message || "Failed to cancel your order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnRequest = async () => {
    if (!order) return;

    try {
      setSubmitting(true);
      const response = await fetch(`/api/orders/${order._id}/return`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reason: selectedReason,
          additionalComments: additionalComments,
          items: returnType === "full" ? "all" : selectedItems,
          returnType: returnType,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to request return");
      }

      const updatedOrder = await response.json();
      setOrder(updatedOrder);
      setReturnDialogOpen(false);
      setSelectedReason("");
      setAdditionalComments("");
      setSelectedItems([]);
      setReturnType("full");

      toast({
        title: "Return Requested",
        description: "Your return request has been submitted successfully.",
      });
    } catch (error: any) {
      console.error("Error requesting return:", error);
      toast({
        title: "Return Request Failed",
        description:
          error.message ||
          "Failed to submit your return request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    if (selectedItems.includes(itemId)) {
      setSelectedItems(selectedItems.filter((id) => id !== itemId));
    } else {
      setSelectedItems([...selectedItems, itemId]);
    }
  };

  // Fix image paths if needed
  const fixImagePath = (path: string) => {
    if (!path) return "/diverse-products-still-life.png";
    if (path.startsWith("http")) return path;
    if (path.startsWith("/")) return path;
    return `/${path}`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-5 w-5 text-amber-500" />;
      case "processing":
        return <Package className="h-5 w-5 text-blue-500" />;
      case "shipped":
        return <Truck className="h-5 w-5 text-purple-500" />;
      case "delivered":
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case "cancelled":
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case "return_requested":
        return <ArrowUpRight className="h-5 w-5 text-orange-500" />;
      case "returned":
        return <ArrowUpRight className="h-5 w-5 text-teal-500" />;
      default:
        return <Clock className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800 hover:bg-amber-100";
      case "processing":
        return "bg-blue-100 text-blue-800 hover:bg-blue-100";
      case "shipped":
        return "bg-purple-100 text-purple-800 hover:bg-purple-100";
      case "delivered":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "cancelled":
        return "bg-red-100 text-red-800 hover:bg-red-100";
      case "return_requested":
        return "bg-orange-100 text-orange-800 hover:bg-orange-100";
      case "returned":
        return "bg-teal-100 text-teal-800 hover:bg-teal-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const canBeCancelled = (order: Order) => {
    // Can only cancel orders that are pending or processing
    return (
      (order.status === "pending" || order.status === "processing") &&
      ![
        "cancelled",
        "shipped",
        "delivered",
        "returned",
        "return_requested",
      ].includes(order.status)
    );
  };

  const canBeReturned = (order: Order) => {
    // Can only return delivered orders that are not already cancelled, returned or with return requested
    return (
      order.status === "delivered" &&
      !["cancelled", "returned", "return_requested"].includes(order.status)
    );
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <UserAccountSidebar activeItem="orders" />
            </div>
            <div className="md:w-3/4">
              <Skeleton className="h-12 w-1/3 mb-8" />
              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-[200px] w-full rounded-md" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="md:w-1/4">
              <UserAccountSidebar activeItem="orders" />
            </div>
            <div className="md:w-3/4">
              <div className="bg-white p-8 rounded-md shadow-sm">
                <h1 className="text-2xl font-medium mb-4">Order Not Found</h1>
                <p className="text-gray-500 mb-6">
                  The order you are looking for does not exist or you do not
                  have permission to view it.
                </p>
                <Link href="/account/orders">
                  <Button className="bg-teal-700 hover:bg-teal-800">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

 //pdf downloading , download invoice
  // const invoiceRef = useRef<HTMLDivElement>(null);

  
 

  return (
    <div className="bg-neutral-50 min-h-screen py-12">
      <div className="container mx-auto px-4 ">
        <div className="flex flex-col md:flex-row gap-8">
          <div className="md:w-1/4">
            <UserAccountSidebar activeItem="orders" />
          </div>
          <div className="md:w-3/4">

            <div className=" p-6 rounded-md shadow-sm mb-6 ">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-medium">
                      Order #{order.order_number}
                    </h1>
                    <Badge className={getStatusColor(order.status)}>
                      <span className="flex items-center gap-1">
                        {getStatusIcon(order.status)}
                        {order.status === "return_requested"
                          ? "Return Requested"
                          : order.status.charAt(0).toUpperCase() +
                            order.status.slice(1)}
                      </span>
                    </Badge>
                  </div>
                  <p className="text-gray-500 mt-1">
                    Placed on {formatDate(order.createdAt)}
                  </p>
                </div>
                <Link href="/account/orders">
                  <Button variant="outline" className="mt-4 md:mt-0">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Orders
                  </Button>
                </Link>
              </div>

              {/* Display cancellation or return reason if applicable */}
              {order.status === "cancelled" && order.cancel_reason && (
                <Alert className="mb-6 bg-red-50 border-red-200">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    <span className="font-medium">Cancellation Reason:</span>{" "}
                    {order.cancel_reason}
                    {order.additionalComments && (
                      <div className="mt-1 text-sm text-red-700">
                        Additional comments: {order.additionalComments}
                      </div>
                    )}
                  </AlertDescription>
                </Alert>
              )}

              {(order.status === "return_requested" ||
                order.status === "returned") &&
                order.return_reason && (
                  <Alert className="mb-6 bg-orange-50 border-orange-200">
                    <ArrowUpRight className="h-4 w-4 text-orange-600" />
                    <AlertDescription className="text-orange-800">
                      <span className="font-medium">Return Reason:</span>{" "}
                      {order.return_reason}
                      {order.additionalComments && (
                        <div className="mt-1 text-sm text-orange-700">
                          Additional comments: {order.additionalComments}
                        </div>
                      )}
                    </AlertDescription>
                  </Alert>
                )}

              <Separator className="my-6" />

              {/* Order Items */}
              <div className="space-y-6">
                <h2 className="text-xl font-medium">Order Items</h2>
                <div className="space-y-4">
                  {order.items.map((item) => (
                    <div
                      key={item._id}
                      className="flex flex-col md:flex-row gap-4 p-4 border rounded-md"
                    >
                      <div className="w-full md:w-1/6">
                        <div className="relative aspect-square rounded-md overflow-hidden">
                          <Image
                            src={fixImagePath(item.image) || "/placeholder.svg"}
                            alt={item.name}
                            fill
                            className="object-contain "
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.size}, Color: {item.color}
                        </p>
                        <div className="flex justify-between mt-2">
                          <p className="text-sm">Quantity: {item.quantity}</p>
                          <p className="font-medium">
                            ₹{item.price.toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Order Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h2 className="text-xl font-medium mb-4">
                    Shipping Information
                  </h2>
                  <div className="p-4 border rounded-md">
                    <p className="font-medium">
                      {order.shipping_address.full_name}
                    </p>
                    <p>{order.shipping_address.address_line1}</p>
                    {order.shipping_address.address_line2 && (
                      <p>{order.shipping_address.address_line2}</p>
                    )}
                    <p>
                      {order.shipping_address.city},{" "}
                      {order.shipping_address.state}{" "}
                      {order.shipping_address.postal_code}
                    </p>
                    <p>{order.shipping_address.country}</p>
                    <p className="mt-2">
                      Phone: {order.shipping_address.phone}
                    </p>
                  </div>

                  <h2 className="text-xl font-medium mt-6 mb-4">
                    Payment Information
                  </h2>
                  <div className="p-4 border rounded-md">
                    <p>
                      <span className="font-medium">Payment Method:</span>{" "}
                      {order.payment_method === "cod"
                        ? "Cash on Delivery"
                        : order.payment_method.charAt(0).toUpperCase() +
                          order.payment_method.slice(1).replace("-", " ")}
                    </p>
                    <p>
                      <span className="font-medium">Payment Status:</span>{" "}
                      <Badge
                        className={
                          order.payment_status === "paid" ||
                          order.payment_status === "completed"
                            ? "bg-green-100 text-green-800"
                            : order.payment_status === "failed"
                            ? "bg-red-100 text-red-800"
                            : order.payment_status === "refunded"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }
                      >
                        {order.payment_status.charAt(0).toUpperCase() +
                          order.payment_status.slice(1)}
                      </Badge>
                    </p>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                  <div className="p-4 border rounded-md">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Subtotal</span>
                        
                        <span>
                          ₹
                          {order.subtotal?.toLocaleString("en-IN") ||
                            order.total.toLocaleString("en-IN")}
                        </span>
                        
                      </div>
                              {/* base price , cgst , sgst  */}
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

                      <div className="flex justify-between">
                        <span className="text-gray-600">Total Taxes</span>
                    
                        <span>
                          ₹
                          {((order.total*18)/100).toLocaleString("en-IN")}
                        </span>
                        
                      </div>
                      

                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center">
                            <Tag className="h-4 w-4 mr-1" /> Discount
                            {order.coupon_code && ` (${order.coupon_code})`}
                          </span>
                          <span>
                            -₹{order.discount.toLocaleString("en-IN")}
                          </span>
                        </div>
                      )}

                      <div className="flex justify-between">
                        <span className="text-gray-600">Shipping</span>
                        <span className="text-green-600">FREE</span>
                      </div>
                      <Separator className="my-2" />
                      <div className="flex justify-between font-medium">
                        <span>Total</span>
                        <span>₹{order.total.toLocaleString("en-IN")}</span>
                      </div>
                    </div>
                  </div>

                  {order.tracking_number && (
                    <div className="mt-6">
                      <h2 className="text-xl font-medium mb-4">
                        Tracking Information
                      </h2>
                      <div className="p-4 border rounded-md">
                        <p>
                          <span className="font-medium">Tracking Number:</span>{" "}
                          {order.tracking_number}
                        </p>
                        <Button className="mt-4 bg-teal-700 hover:bg-teal-800">
                          Track Package
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <button 
               
        className="mt-4 px-4 py-2 bg-teal-700 text-white rounded-md" onClick={() => {
    router.push(`/account/orders/invoice?id=${order._id}`);
  }}>Download invoice</button>
              </div>
            </div>

            <div className="bg-white p-6 rounded-md shadow-sm">
              <h2 className="text-xl font-medium mb-4">Order Actions</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-2">Need to Cancel?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {canBeCancelled(order)
                          ? "You can cancel this order if you've changed your mind."
                          : "This order can no longer be cancelled."}
                      </p>
                      <Button
                        onClick={() => setCancelDialogOpen(true)}
                        variant="outline"
                        className="w-full"
                        disabled={!canBeCancelled(order)}
                      >
                        Cancel Order 
                      </Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-6">
                      <h3 className="font-medium mb-2">Need to Return?</h3>
                      <p className="text-sm text-gray-600 mb-4">
                        {canBeReturned(order)
                          ? "Not satisfied? You can request a return."
                          : order.status === "return_requested"
                          ? "Your return request is being processed."
                          : "This order is not eligible for return."}
                      </p>
                      <Button
                        onClick={() => setReturnDialogOpen(true)}
                        variant="outline"
                        className="w-full"
                        disabled={!canBeReturned(order)}
                      >
                        Request Return
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Other options</h3>
                  <div className="flex flex-wrap gap-2">
                    <Link href="/contact">
                      <Button variant="outline" size="sm">
                        Contact Support
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Cancel Order Dialog */}
      <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Cancel Order</DialogTitle>
            <DialogDescription>
              Please tell us why you want to cancel this order. This helps us
              improve our services.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="cancel-reason">Reason for cancellation</Label>
              <Select
                value={selectedReason}
                onValueChange={setSelectedReason}
                disabled={submitting}
              >
                <SelectTrigger id="cancel-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {CANCELLATION_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additional-comments">
                Additional comments (optional)
              </Label>
              <Textarea
                id="additional-comments"
                placeholder="Tell us more about your reason for cancellation..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCancelDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCancelOrder}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={!selectedReason || submitting}
            >
              {submitting ? "Processing..." : "Confirm Cancellation"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Return Order Dialog */}
      <Dialog open={returnDialogOpen} onOpenChange={setReturnDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Return</DialogTitle>
            <DialogDescription>
              Please provide details about your return request to help us
              process it quickly.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Return type</Label>
              <RadioGroup
                value={returnType}
                onValueChange={(value: "full" | "partial") =>
                  setReturnType(value)
                }
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="full"
                    id="full-return"
                    disabled={submitting}
                  />
                  <Label htmlFor="full-return">Full order return</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem
                    value="partial"
                    id="partial-return"
                    disabled={submitting}
                  />
                  <Label htmlFor="partial-return">
                    Partial return (select items)
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {returnType === "partial" && (
              <div className="space-y-3 border rounded-md p-3">
                <p className="text-sm font-medium">Select items to return:</p>
                {order.items.map((item) => (
                  <div key={item._id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id={`item-${item._id}`}
                      checked={selectedItems.includes(item._id)}
                      onChange={() => toggleItemSelection(item._id)}
                      disabled={submitting}
                      className="rounded border-gray-300"
                    />
                    <Label
                      htmlFor={`item-${item._id}`}
                      className="flex-1 text-sm"
                    >
                      {item.name} ({item.size}, {item.color})
                    </Label>
                  </div>
                ))}
                {selectedItems.length === 0 && returnType === "partial" && (
                  <p className="text-xs text-red-500">
                    Please select at least one item to return
                  </p>
                )}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="return-reason">Reason for return</Label>
              <Select
                value={selectedReason}
                onValueChange={setSelectedReason}
                disabled={submitting}
              >
                <SelectTrigger id="return-reason">
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  {RETURN_REASONS.map((reason) => (
                    <SelectItem key={reason} value={reason}>
                      {reason}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="return-comments">
                Additional comments (optional)
              </Label>
              <Textarea
                id="return-comments"
                placeholder="Provide any additional details about your return request..."
                value={additionalComments}
                onChange={(e) => setAdditionalComments(e.target.value)}
                disabled={submitting}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setReturnDialogOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleReturnRequest}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={
                !selectedReason ||
                submitting ||
                (returnType === "partial" && selectedItems.length === 0)
              }
            >
              {submitting ? "Processing..." : "Submit Return Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
