"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import {
  ArrowLeft,
  Check,
  CreditCard,
  Lock,
  DollarSignIcon as PaypalLogo,
  PlusCircle,
  Tag,
  AlertCircle,
  Truck,
  Banknote,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import Logo from "@/public/Logo/Parpra.png";
import { useCallback } from "react";
// Declare Razorpay global
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface CartItem {
  _id: string;
  product_id: string;
  variation_id: string;
  quantity: number;
  price: number;
  added_at: string;
  product: {
    _id: string;
    name: string;
    slug: string;
  };
  variation: {
    _id: string;
    price: number;
    salePrice?: number;
    image: string;
    size: string;
    color: string;
  };
}

interface Cart {
  _id: string;
  user_id: string;
  items: CartItem[];
  total: number;
}

interface Address {
  _id: string;
  user_id: string;
  full_name: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

interface PaymentMethod {
  _id: string;
  user_id: string;
  type: string;
  provider: string;
  card_number?: string;
  card_holder_name?: string;
  expiry_month?: string;
  expiry_year?: string;
  is_default: boolean;
}

interface Coupon {
  _id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  discount_value: number;
  description: string;
}

interface PaymentSettings {
  cod_enabled: boolean;
  cod_min_order_value: number;
  cod_max_order_value: number;
  online_payment_enabled: boolean;
  paypal_enabled: boolean;
  bank_transfer_enabled: boolean;
}

type responseData = {
  order?: {
    _id: string;
    user_id: string;
  };
  error?: string;
  details?: any;
  rawResponse?: string;
};

export default function CheckoutPage() {
  //Abhi code

  let storeLocation = "Madhya Pradesh";

  //unknow coder code
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);
  const [isOrderDetailsOpen, setIsOrderDetailsOpen] = useState(false);
  const [promoCode, setPromoCode] = useState("");
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(false);
  const [paymentSettings, setPaymentSettings] =
    useState<PaymentSettings | null>(null);
  const [loadingPaymentSettings, setLoadingPaymentSettings] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);

  // Coupon state
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  // Selected address and payment method
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [selectedPaymentMethodId, setSelectedPaymentMethodId] =
    useState<string>("");
  const [newAddressMode, setNewAddressMode] = useState(false);
  const [newPaymentMode, setNewPaymentMode] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [zipcode, setZipcode] = useState("");
  const [country, setCountry] = useState("India");
  const [countryCode, setCountryCode] = useState("+91");
  const [mobileNumber, setMobileNumber] = useState("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");
  const [processingOrder, setProcessingOrder] = useState(false);

  // Credit card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardHolder, setCardHolder] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const fetchCart = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cart");

      if (!response.ok) {
        throw new Error("Failed to fetch cart");
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        router.push("/cart");
        return;
      }

      setCart(data);
    } catch (error) {
      console.error("Error fetching cart:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [router, toast]);

  const fetchAddresses = useCallback(async () => {
    try {
      setLoadingAddresses(true);
      const response = await fetch("/api/user/addresses");

      if (!response.ok) {
        throw new Error("Failed to fetch addresses");
      }

      const data = await response.json();
      setAddresses(data.addresses || []);

      // Select default address if available
      const defaultAddress = data.addresses.find(
        (addr: Address) => addr.is_default
      );
      if (defaultAddress) {
        setSelectedAddressId(defaultAddress._id);
        // Pre-fill form with default address
        setFirstName(defaultAddress.full_name.split(" ")[0] || "");
        setLastName(
          defaultAddress.full_name.split(" ").slice(1).join(" ") || ""
        );
        setAddress(defaultAddress.address_line1);
        setCity(defaultAddress.city);
        setState(defaultAddress.state);
        setZipcode(defaultAddress.postal_code);
        setCountry(defaultAddress.country);
        const phone = defaultAddress.phone.split(" ");
        if (phone.length > 1) {
          setCountryCode(phone[0]);
          setMobileNumber(phone[1]);
        } else {
          setMobileNumber(defaultAddress.phone);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  }, []);

  const fetchPaymentMethods = useCallback(async () => {
    try {
      setLoadingPaymentMethods(true);
      const response = await fetch("/api/user/payment-methods");

      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }

      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);

      // Select default payment method if available
      const defaultPaymentMethod = data.paymentMethods.find(
        (method: PaymentMethod) => method.is_default
      );
      if (defaultPaymentMethod) {
        setSelectedPaymentMethodId(defaultPaymentMethod._id);
        setPaymentMethod(defaultPaymentMethod.type);

        if (defaultPaymentMethod.type === "credit-card") {
          setCardNumber(defaultPaymentMethod.card_number || "");
          setCardHolder(defaultPaymentMethod.card_holder_name || "");
          if (
            defaultPaymentMethod.expiry_month &&
            defaultPaymentMethod.expiry_year
          ) {
            setExpiryDate(
              `${
                defaultPaymentMethod.expiry_month
              }/${defaultPaymentMethod.expiry_year.slice(-2)}`
            );
          }
        }
      }
    } catch (error) {
      console.error("Error fetching payment methods:", error);
    } finally {
      setLoadingPaymentMethods(false);
    }
  }, []);

  const fetchPaymentSettings = useCallback(async () => {
    try {
      setLoadingPaymentSettings(true);
      const response = await fetch("/api/payment-settings");

      if (!response.ok) {
        throw new Error("Failed to fetch payment settings");
      }

      const data = await response.json();
      setPaymentSettings(data);
    } catch (error) {
      console.error("Error fetching payment settings:", error);
    } finally {
      setLoadingPaymentSettings(false);
    }
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login?redirect=/checkout");
    }

    if (status === "authenticated") {
      fetchCart();
      fetchAddresses();
      fetchPaymentMethods();
      fetchPaymentSettings();
      if (session.user?.email) {
        setEmail(session.user.email);
      }
    }
  }, [
    status,
    router,
    session,
    fetchCart,
    fetchAddresses,
    fetchPaymentMethods,
    fetchPaymentSettings,
  ]);

  const validateCoupon = async (code: string) => {
    if (!code) return;

    try {
      setApplyingCoupon(true);
      setCouponError(null);

      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          cartTotal: cart?.total || 0,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setCouponError(data.error || "Invalid coupon code");
        setAppliedCoupon(null);
        setDiscountAmount(0);
        return;
      }

      setAppliedCoupon(data.coupon);
      setDiscountAmount(data.discountAmount);

      toast({
        title: "Coupon Applied",
        description: `Coupon "${data.coupon.code}" applied successfully!`,
      });
    } catch (error) {
      console.error("Error validating coupon:", error);
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
      setDiscountAmount(0);
    } finally {
      setApplyingCoupon(false);
    }
  };

  const applyPromoCode = () => {
    if (!promoCode) {
      toast({
        title: "Error",
        description: "Please enter a coupon code",
        variant: "destructive",
      });
      return;
    }

    validateCoupon(promoCode);
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setDiscountAmount(0);
    setPromoCode("");
    setCouponError(null);

    toast({
      title: "Coupon Removed",
      description: "Coupon has been removed from your order",
    });
  };

  const handleAddressChange = (addressId: string) => {
    setSelectedAddressId(addressId);

    if (addressId === "new") {
      setNewAddressMode(true);
      // Clear form for new address
      setFirstName("");
      setLastName("");
      setAddress("");
      setCity("");
      setState("");
      setZipcode("");
      setCountry("India");
      setCountryCode("+91");
      setMobileNumber("");
      return;
    }

    setNewAddressMode(false);
    // Find the selected address
    const selectedAddress = addresses.find((addr) => addr._id === addressId);
    if (selectedAddress) {
      // Pre-fill form with selected address
      setFirstName(selectedAddress.full_name.split(" ")[0] || "");
      setLastName(
        selectedAddress.full_name.split(" ").slice(1).join(" ") || ""
      );
      setAddress(selectedAddress.address_line1);
      setCity(selectedAddress.city);
      setState(selectedAddress.state);
      setZipcode(selectedAddress.postal_code);
      setCountry(selectedAddress.country);
      const phone = selectedAddress.phone.split(" ");
      if (phone.length > 1) {
        setCountryCode(phone[0]);
        setMobileNumber(phone[1]);
      } else {
        setMobileNumber(selectedAddress.phone);
      }
    }
  };

  const handlePaymentMethodChange = (paymentMethodId: string) => {
    setSelectedPaymentMethodId(paymentMethodId);

    if (paymentMethodId === "new") {
      setNewPaymentMode(true);
      // Clear form for new payment method
      setCardNumber("");
      setCardHolder("");
      setExpiryDate("");
      setCvv("");
      return;
    }

    setNewPaymentMode(false);
    // Find the selected payment method
    const selectedMethod = paymentMethods.find(
      (method) => method._id === paymentMethodId
    );
    if (selectedMethod) {
      setPaymentMethod(selectedMethod.type);

      if (selectedMethod.type === "credit-card") {
        setCardNumber(selectedMethod.card_number || "");
        setCardHolder(selectedMethod.card_holder_name || "");
        if (selectedMethod.expiry_month && selectedMethod.expiry_year) {
          setExpiryDate(
            `${selectedMethod.expiry_month}/${selectedMethod.expiry_year.slice(
              -2
            )}`
          );
        }
      }
    }
  };

  const saveNewAddress = async () => {
    try {
      const addressData = {
        full_name: `${firstName} ${lastName}`,
        address_line1: address,
        city,
        state,
        postal_code: zipcode,
        country,
        phone: `${countryCode} ${mobileNumber}`,
        is_default: addresses.length === 0, // Make default if it's the first address
      };

      const response = await fetch("/api/user/addresses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(addressData),
      });

      if (!response.ok) {
        throw new Error("Failed to save address");
      }

      const data = await response.json();

      // Add new address to list and select it
      setAddresses([...addresses, data.address]);
      setSelectedAddressId(data.address._id);
      setNewAddressMode(false);

      toast({
        title: "Success",
        description: "Address saved successfully",
      });
    } catch (error) {
      console.error("Error saving address:", error);
      toast({
        title: "Error",
        description: "Failed to save address",
        variant: "destructive",
      });
    }
  };

  const saveNewPaymentMethod = async () => {
    try {
      // Parse expiry date
      const [expiryMonth, expiryYear] = expiryDate.split("/");

      const paymentData = {
        type: paymentMethod,
        provider: paymentMethod === "credit-card" ? "card" : paymentMethod,
        card_number: cardNumber.replace(/\s/g, ""),
        card_holder_name: cardHolder,
        expiry_month: expiryMonth,
        expiry_year: `20${expiryYear}`,
        is_default: paymentMethods.length === 0, // Make default if it's the first method
      };

      const response = await fetch("/api/user/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error("Failed to save payment method");
      }

      const data = await response.json();

      // Add new payment method to list and select it
      setPaymentMethods([...paymentMethods, data.paymentMethod]);
      setSelectedPaymentMethodId(data.paymentMethod._id);
      setNewPaymentMode(false);

      toast({
        title: "Success",
        description: "Payment method saved successfully",
      });
    } catch (error) {
      console.error("Error saving payment method:", error);
      toast({
        title: "Error",
        description: "Failed to save payment method",
        variant: "destructive",
      });
    }
  };

  // Check if COD is available for the current order
  const isCodAvailable = () => {
    if (!paymentSettings || !paymentSettings.cod_enabled) return false;

    const orderTotal = cart?.total || 0;
    return (
      orderTotal >= paymentSettings.cod_min_order_value &&
      orderTotal <= paymentSettings.cod_max_order_value
    );
  };

  const handleRazorpayPayment = async (orderId: string) => {
    try {
      if (!razorpayLoaded) {
        toast({
          title: "Error",
          description: "Razorpay is still loading. Please try again.",
          variant: "destructive",
        });
        return;
      }

      const finalTotal = (cart?.total || 0) - discountAmount;

      // Create Razorpay order
      const response = await fetch("/api/payments/razorpay/create-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
          amount: finalTotal,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || "Failed to create Razorpay order");
      }

      // Configure Razorpay options
      const options = {
        key: data.data.key,
        amount: data.data.amount,
        currency: data.data.currency,
        name: data.data.name,
        description: data.data.description,
        image: data.data.image,
        order_id: data.data.orderId,
        prefill: data.data.prefill,
        theme: data.data.theme,
        handler: async (response: any) => {
          try {
            // Verify payment
            const verifyResponse = await fetch(
              "/api/payments/razorpay/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                }),
              }
            );

            const verifyData = await verifyResponse.json();

            if (verifyData.success) {
              toast({
                variant: "success",
                title: "Payment Successful!",
                description: "Your order has been placed successfully.",
              });

              // Redirect to order confirmation page
              router.push(`/account/orders/${verifyData.data.orderId}`);
            } else {
              throw new Error(
                verifyData.error || "Payment verification failed"
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            toast({
              title: "Payment Verification Failed",
              description:
                error instanceof Error
                  ? error.message
                  : "Please contact support",
              variant: "destructive",
            });
          }
        },
        modal: {
          ondismiss: () => {
            setProcessingOrder(false);
          },
        },
      };

      // Open Razorpay checkout
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error("Razorpay payment error:", error);
      toast({
        title: "Payment Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to initiate Razorpay payment",
        variant: "destructive",
      });
      setProcessingOrder(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!cart || cart.items.length === 0) {
      toast({
        title: "Error",
        description: "Your cart is empty",
        variant: "destructive",
      });
      return;
    }

    // Validate that an address is selected or entered
    if (!selectedAddressId && addresses.length > 0 && !newAddressMode) {
      toast({
        title: "Error",
        description: "Please select a shipping address",
        variant: "destructive",
      });
      return;
    }

    // Validate form fields if using new address
    if (newAddressMode || addresses.length === 0) {
      if (
        !firstName ||
        !lastName ||
        !address ||
        !city ||
        !state ||
        !zipcode ||
        !mobileNumber
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required address fields",
          variant: "destructive",
        });
        return;
      }
    }

    // Validate payment details if using new payment method
    if (
      paymentMethod !== "cod" &&
      paymentMethod !== "razorpay" &&
      (newPaymentMode || paymentMethods.length === 0)
    ) {
      if (
        paymentMethod === "credit-card" &&
        (!cardNumber || !expiryDate || !cardHolder)
      ) {
        toast({
          title: "Error",
          description: "Please fill in all required payment details",
          variant: "destructive",
        });
        return;
      }
    }

    setProcessingOrder(true);

    type responseData = {
      order?: {
        _id: string;
        user_id: string;
      };
      error?: string;
      details?: any;
      rawResponse?: string;
    };

    try {
      let shippingAddress;
      let selectedPaymentType;

      // If using a saved address
      if (selectedAddressId && selectedAddressId !== "new" && !newAddressMode) {
        const savedAddress = addresses.find(
          (addr) => addr._id === selectedAddressId
        );
        if (savedAddress) {
          shippingAddress = {
            full_name: savedAddress.full_name,
            address_line1: savedAddress.address_line1,
            address_line2: savedAddress.address_line2 || "",
            city: savedAddress.city,
            state: savedAddress.state,
            postal_code: savedAddress.postal_code,
            country: savedAddress.country,
            phone: savedAddress.phone,
          };
        }
      } else {
        // Using new address
        shippingAddress = {
          full_name: `${firstName} ${lastName}`.trim(),
          address_line1: address.trim(),
          city: city.trim(),
          state: state.trim(),
          postal_code: zipcode.trim(),
          country: country.trim(),
          phone: `${countryCode} ${mobileNumber}`.trim(),
        };
      }

      // If using COD
      if (paymentMethod === "cod") {
        selectedPaymentType = "cod";
      }
      // If using Razorpay
      else if (paymentMethod === "razorpay") {
        selectedPaymentType = "razorpay";
      }
      // If using a saved payment method
      else if (
        selectedPaymentMethodId &&
        selectedPaymentMethodId !== "new" &&
        !newPaymentMode
      ) {
        const savedPayment = paymentMethods.find(
          (method) => method._id === selectedPaymentMethodId
        );
        if (savedPayment) {
          selectedPaymentType = savedPayment.type;
        }
      } else {
        // Using new payment method
        selectedPaymentType = paymentMethod;
      }

      // Ensure we have a valid shipping address
      if (!shippingAddress) {
        throw new Error("Invalid shipping address");
      }

      const billingAddress = sameAsBilling
        ? { ...shippingAddress }
        : {
            // In a real app, you would collect billing address separately if not same as shipping
            full_name: `${firstName} ${lastName}`.trim(),
            address_line1: address.trim(),
            city: city.trim(),
            state: state.trim(),
            postal_code: zipcode.trim(),
            country: country.trim(),
            phone: `${countryCode} ${mobileNumber}`.trim(),
          };

      // Prepare the order data
      const orderData = {
        shipping_address: shippingAddress,
        billing_address: billingAddress,
        payment_method: selectedPaymentType || paymentMethod,
        coupon_code: appliedCoupon?.code,
        discount_amount: discountAmount,
      };

      // Log the data being sent for debugging

      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(orderData),
      });

      // Log the raw response for debugging

      // Try to parse the response as JSON, but handle non-JSON responses
      let responseData: responseData = {};
      let responseText = "";

      try {
        responseText = await response.text();

        if (responseText) {
          try {
            responseData = JSON.parse(responseText);
          } catch (parseError) {
            console.error("Error parsing response as JSON:", parseError);
            responseData = {
              error: "Invalid response format",
              rawResponse: responseText,
            };
          }
        }
      } catch (textError) {
        console.error("Error reading response text:", textError);
      }

      if (!response.ok) {
        console.error("Order API error response:", responseData);

        // Show more detailed error message
        const errorMessage =
          responseData.error ||
          `HTTP ${response.status}: ${response.statusText}`;
        const errorDetails = responseData.details
          ? JSON.stringify(responseData.details, null, 2)
          : "";

        throw new Error(
          `${errorMessage}${
            errorDetails ? `\n\nDetails:\n${errorDetails}` : ""
          }`
        );
      }

      // Parse the successful response
      let data = responseData;
      if (typeof responseData === "string") {
        try {
          data = JSON.parse(responseData);
        } catch (e) {
          console.error("Error parsing successful response:", e);
          throw new Error("Invalid response format from server");
        }
      }

      // If we have a coupon, apply it to the order
      if (appliedCoupon) {
        try {
          await fetch("/api/coupons/apply", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ code: appliedCoupon.code }),
          });
        } catch (couponError) {
          console.error("Error applying coupon:", couponError);
          // Continue with order placement even if coupon application fails
        }
      }

      // Handle Razorpay payment
      if (paymentMethod === "razorpay" && data?.order?._id) {
        await handleRazorpayPayment(data.order._id);
        return; // Don't show success message yet, wait for payment completion
      } else if (paymentMethod === "razorpay") {
        throw new Error("Order creation failed: Invalid order data received");
      }

      toast({
        variant: "success",
        title: "Order Placed Successfully",
        description:
          paymentMethod === "cod"
            ? "Your order has been placed with Cash on Delivery. You'll pay when you receive your items."
            : "Your order has been placed successfully!",
      });

      // Redirect to order confirmation page
      if (data?.order?._id) {
        router.push(`/account/orders/${data.order._id}`);
      } else {
        console.error("Invalid order data received:", data);
        toast({
          title: "Error",
          description: "Could not retrieve order details",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to place order",
        variant: "destructive",
      });
    } finally {
      setProcessingOrder(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="bg-neutral-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Skeleton className="h-12 w-1/3 mx-auto mb-8" />
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-[200px] w-full rounded-md" />
              ))}
            </div>
            <div className="lg:col-span-1">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  const cartItems = cart?.items || [];
  const subtotal = cart?.total || 0;
  const shipping = 0; // Free shipping
  const finalTotal = subtotal - discountAmount + shipping;

  return (
    <>
      {/* Load Razorpay Script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => {
          setRazorpayLoaded(true);
        }}
        onError={() => {
          console.error("Failed to load Razorpay script");
          toast({
            title: "Payment Error",
            description:
              "Failed to load payment gateway. Please refresh the page.",
            variant: "destructive",
          });
        }}
      />

      <div className="bg-neutral-50 min-h-screen py-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            {/* <Link href="/" className="flex items-center justify-center">
              <Image
                src={Logo}
                alt="PARPRA"
                width={180}
                height={60}
              />
            </Link> */}
            <div className="hidden md:flex items-center">
              <Link
                href="/cart"
                className="text-gray-600 hover:text-teal-700 flex items-center"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to cart
              </Link>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-light">Secure Checkout</h1>
            <Separator className="my-4" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Checkout Form */}
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit}>
                {/* Contact Information */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                  <h2 className="text-xl font-medium mb-4">
                    Contact Information
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Shipping Information */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                  <h2 className="text-xl font-medium mb-4">
                    Shipping Information
                  </h2>
                  <div className="bg-teal-50 p-4 border border-teal-200 rounded-md mb-4 flex items-center">
                    <div className="mr-3 bg-teal-700 rounded-full p-1">
                      <Check className="h-4 w-4 text-white" />
                    </div>
                    <p className="text-sm">
                      Unlocking Global Shopping With Free Worldwide Shipping!
                    </p>
                  </div>

                  {/* Saved Addresses */}
                  {addresses.length > 0 && !newAddressMode && (
                    <div className="mb-6">
                      <Label htmlFor="savedAddress" className="mb-2 block">
                        Select a Saved Address
                      </Label>
                      <Select
                        value={selectedAddressId}
                        onValueChange={handleAddressChange}
                      >
                        <SelectTrigger id="savedAddress">
                          <SelectValue placeholder="Select an address" />
                        </SelectTrigger>
                        <SelectContent>
                          {addresses.map((addr) => (
                            <SelectItem key={addr._id} value={addr._id}>
                              <div className="flex items-center">
                                <span>
                                  {addr.full_name} - {addr.address_line1},{" "}
                                  {addr.city}
                                </span>
                                {addr.is_default && (
                                  <Badge variant="outline" className="ml-2">
                                    Default
                                  </Badge>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                          <SelectItem value="new">
                            <div className="flex items-center text-teal-700">
                              <PlusCircle className="h-4 w-4 mr-2" />
                              <span>Add New Address</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* New Address Form */}
                  {(newAddressMode || addresses.length === 0) && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">First Name *</Label>
                          <Input
                            id="firstName"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Last Name *</Label>
                          <Input
                            id="lastName"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="address">Address *</Label>
                        <Input
                          id="address"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="country">Country *</Label>
                          <Select value={country} onValueChange={setCountry}>
                            <SelectTrigger id="country">
                              <SelectValue placeholder="Select country" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="India">India</SelectItem>
                              <SelectItem value="United States">
                                United States
                              </SelectItem>
                              <SelectItem value="United Kingdom">
                                United Kingdom
                              </SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Australia">
                                Australia
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="state">State/Province *</Label>
                          {/* <Input
                            id="state"
                            value={state}
                            onChange={(e) => setState(e.target.value)}
                            required
                          /> */}
                          <Select value={state} onValueChange={setState}>
                            <SelectTrigger id="state">
                              <SelectValue placeholder="Select State" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Madhya Pradesh">
                                Madhya Pradesh
                              </SelectItem>
                              <SelectItem value="United States">
                                United States
                              </SelectItem>
                              <SelectItem value="United Kingdom">
                                United Kingdom
                              </SelectItem>
                              <SelectItem value="Canada">Canada</SelectItem>
                              <SelectItem value="Australia">
                                Australia
                              </SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="city">City *</Label>
                          <Input
                            id="city"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="zipcode">Zipcode *</Label>
                          <Input
                            id="zipcode"
                            value={zipcode}
                            onChange={(e) => setZipcode(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-4 gap-4">
                        <div>
                          <Label htmlFor="countryCode">Code *</Label>
                          <Select
                            value={countryCode}
                            onValueChange={setCountryCode}
                          >
                            <SelectTrigger id="countryCode">
                              <SelectValue placeholder="Code" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="+91">+91</SelectItem>
                              <SelectItem value="+1">+1</SelectItem>
                              <SelectItem value="+44">+44</SelectItem>
                              <SelectItem value="+61">+61</SelectItem>
                              <SelectItem value="+81">+81</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-3">
                          <Label htmlFor="mobileNumber">Mobile No. *</Label>
                          <Input
                            id="mobileNumber"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            required
                          />
                        </div>
                      </div>

                      {newAddressMode && (
                        <div className="flex justify-end gap-2 mt-4">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setNewAddressMode(false);
                              if (addresses.length > 0 && selectedAddressId) {
                                handleAddressChange(selectedAddressId);
                              }
                            }}
                          >
                            Cancel
                          </Button>
                          <Button type="button" onClick={saveNewAddress}>
                            Save Address
                          </Button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 mt-4">
                    <Checkbox
                      id="sameAsBilling"
                      checked={sameAsBilling}
                      onCheckedChange={(checked) =>
                        setSameAsBilling(checked as boolean)
                      }
                    />
                    <label
                      htmlFor="sameAsBilling"
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      My Billing Address Is Same As My Shipping Address
                    </label>
                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white p-6 rounded-md shadow-sm mb-6">
                  <h2 className="text-xl font-medium mb-4">Payment Method</h2>

                  {/* Payment Method Selection */}
                  <RadioGroup
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    className="mb-6"
                  >
                    <div className="space-y-4">
                      {/* Razorpay Option */}
                      <div
                        className={`flex items-center space-x-2 border rounded-md p-4 ${
                          paymentMethod === "razorpay"
                            ? "border-blue-500 bg-blue-50"
                            : ""
                        }`}
                      >
                        <RadioGroupItem value="razorpay" id="razorpay" />
                        <Label
                          htmlFor="razorpay"
                          className="flex items-center cursor-pointer"
                        >
                          <CreditCard className="h-5 w-5 mr-2 text-blue-600" />
                          Razorpay (Cards, UPI, Wallets, Net Banking)
                        </Label>
                      </div>

                      {/* Cash on Delivery Option */}
                      {isCodAvailable() && (
                        <div
                          className={`flex items-center space-x-2 border rounded-md p-4 ${
                            paymentMethod === "cod"
                              ? "border-teal-500 bg-teal-50"
                              : ""
                          }`}
                        >
                          <RadioGroupItem value="cod" id="cod" />
                          <Label
                            htmlFor="cod"
                            className="flex items-center cursor-pointer"
                          >
                            <Banknote className="h-5 w-5 mr-2 text-teal-700" />
                            Cash on Delivery (COD)
                          </Label>
                        </div>
                      )}

                      {/* Credit Card Option */}
                      {paymentSettings?.online_payment_enabled && (
                        <div
                          className={`flex items-center space-x-2 border rounded-md p-4 ${
                            paymentMethod === "credit-card"
                              ? "border-teal-500 bg-teal-50"
                              : ""
                          }`}
                        >
                          <RadioGroupItem
                            value="credit-card"
                            id="credit-card"
                          />
                          <Label
                            htmlFor="credit-card"
                            className="flex items-center cursor-pointer"
                          >
                            <CreditCard className="h-5 w-5 mr-2" />
                            Credit/Debit Card
                          </Label>
                        </div>
                      )}

                      {/* PayPal Option */}
                      {paymentSettings?.paypal_enabled && (
                        <div
                          className={`flex items-center space-x-2 border rounded-md p-4 ${
                            paymentMethod === "paypal"
                              ? "border-teal-500 bg-teal-50"
                              : ""
                          }`}
                        >
                          <RadioGroupItem value="paypal" id="paypal" />
                          <Label
                            htmlFor="paypal"
                            className="flex items-center cursor-pointer"
                          >
                            <PaypalLogo className="h-5 w-5 mr-2" />
                            PayPal
                          </Label>
                        </div>
                      )}

                      {/* Bank Transfer Option */}
                      {paymentSettings?.bank_transfer_enabled && (
                        <div
                          className={`flex items-center space-x-2 border rounded-md p-4 ${
                            paymentMethod === "bank-transfer"
                              ? "border-teal-500 bg-teal-50"
                              : ""
                          }`}
                        >
                          <RadioGroupItem
                            value="bank-transfer"
                            id="bank-transfer"
                          />
                          <Label
                            htmlFor="bank-transfer"
                            className="flex items-center cursor-pointer"
                          >
                            <Truck className="h-5 w-5 mr-2" />
                            Bank Transfer
                          </Label>
                        </div>
                      )}
                    </div>
                  </RadioGroup>

                  {/* Razorpay Information */}
                  {paymentMethod === "razorpay" && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
                      <h3 className="font-medium text-blue-800 mb-2">
                        Razorpay Payment Information
                      </h3>
                      <p className="text-sm text-blue-700 mb-2">
                        Pay securely using Razorpay - India's leading payment
                        gateway trusted by millions.
                      </p>
                      <ul className="text-xs text-blue-600 list-disc list-inside space-y-1">
                        <li>
                          Supports Credit/Debit Cards, UPI, Net Banking, and
                          Digital Wallets
                        </li>
                        <li>Instant payment confirmation and receipt</li>
                        <li>Bank-level security with 256-bit SSL encryption</li>
                        <li>No additional charges for most payment methods</li>
                        <li>Easy refunds and customer support</li>
                      </ul>
                      {!razorpayLoaded && (
                        <div className="mt-2 text-xs text-amber-600">
                          Loading payment gateway...
                        </div>
                      )}
                    </div>
                  )}

                  {/* COD Information */}
                  {paymentMethod === "cod" && (
                    <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-md">
                      <h3 className="font-medium text-amber-800 mb-2">
                        Cash on Delivery Information
                      </h3>
                      <p className="text-sm text-amber-700 mb-2">
                        Pay with cash when your order is delivered to your
                        doorstep.
                      </p>
                      <ul className="text-xs text-amber-600 list-disc list-inside space-y-1">
                        <li>
                          Please keep the exact amount ready for a smooth
                          delivery experience
                        </li>
                        <li>
                          Our delivery partner will provide a receipt upon
                          payment
                        </li>
                        <li>
                          COD is available for orders between ₹
                          {paymentSettings?.cod_min_order_value.toLocaleString(
                            "en-IN"
                          )}{" "}
                          and ₹
                          {paymentSettings?.cod_max_order_value.toLocaleString(
                            "en-IN"
                          )}
                        </li>
                      </ul>
                    </div>
                  )}

                  {/* Saved Payment Methods */}
                  {paymentMethod !== "cod" &&
                    paymentMethod !== "razorpay" &&
                    paymentMethods.length > 0 &&
                    !newPaymentMode && (
                      <div className="mb-6">
                        <Label htmlFor="savedPayment" className="mb-2 block">
                          Select a Saved Payment Method
                        </Label>
                        <Select
                          value={selectedPaymentMethodId}
                          onValueChange={handlePaymentMethodChange}
                        >
                          <SelectTrigger id="savedPayment">
                            <SelectValue placeholder="Select a payment method" />
                          </SelectTrigger>
                          <SelectContent>
                            {paymentMethods.map((method) => (
                              <SelectItem key={method._id} value={method._id}>
                                <div className="flex items-center">
                                  {method.type === "credit-card" && (
                                    <CreditCard className="h-4 w-4 mr-2" />
                                  )}
                                  {method.type === "paypal" && (
                                    <PaypalLogo className="h-4 w-4 mr-2" />
                                  )}
                                  <span>
                                    {method.type === "credit-card"
                                      ? `Card ending in ${method.card_number?.slice(
                                          -4
                                        )}`
                                      : method.type
                                      ? method.type.charAt(0).toUpperCase() +
                                        method.type.slice(1)
                                      : "Unknown"}
                                  </span>
                                  {method.is_default && (
                                    <Badge variant="outline" className="ml-2">
                                      Default
                                    </Badge>
                                  )}
                                </div>
                              </SelectItem>
                            ))}
                            <SelectItem value="new">
                              <div className="flex items-center text-teal-700">
                                <PlusCircle className="h-4 w-4 mr-2" />
                                <span>Add New Payment Method</span>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                  {/* New Payment Method Form */}
                  {paymentMethod !== "cod" &&
                    paymentMethod !== "razorpay" &&
                    (newPaymentMode || paymentMethods.length === 0) && (
                      <>
                        {paymentMethod === "credit-card" && (
                          <div className="mt-4 space-y-4 p-4 border rounded-md">
                            <div>
                              <Label htmlFor="cardNumber">Card Number</Label>
                              <Input
                                id="cardNumber"
                                placeholder="1234 5678 9012 3456"
                                value={cardNumber}
                                onChange={(e) => setCardNumber(e.target.value)}
                              />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <Label htmlFor="expiryDate">Expiry Date</Label>
                                <Input
                                  id="expiryDate"
                                  placeholder="MM/YY"
                                  value={expiryDate}
                                  onChange={(e) =>
                                    setExpiryDate(e.target.value)
                                  }
                                />
                              </div>
                              <div>
                                <Label htmlFor="cvv">CVV</Label>
                                <Input
                                  id="cvv"
                                  placeholder="123"
                                  value={cvv}
                                  onChange={(e) => setCvv(e.target.value)}
                                />
                              </div>
                            </div>
                            <div>
                              <Label htmlFor="nameOnCard">Name on Card</Label>
                              <Input
                                id="nameOnCard"
                                value={cardHolder}
                                onChange={(e) => setCardHolder(e.target.value)}
                              />
                            </div>
                          </div>
                        )}

                        {newPaymentMode && (
                          <div className="flex justify-end gap-2 mt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setNewPaymentMode(false);
                                if (
                                  paymentMethods.length > 0 &&
                                  selectedPaymentMethodId
                                ) {
                                  handlePaymentMethodChange(
                                    selectedPaymentMethodId
                                  );
                                }
                              }}
                            >
                              Cancel
                            </Button>
                            <Button
                              type="button"
                              onClick={saveNewPaymentMethod}
                            >
                              Save Payment Method
                            </Button>
                          </div>
                        )}
                      </>
                    )}

                  <div className="mt-6 text-xs text-gray-500 flex items-center">
                    <Lock className="h-4 w-4 mr-1 text-green-600" />
                    Your payment information is secure and encrypted
                  </div>
                </div>

                <Button
                  type="submit"
                  className={`w-full text-lg py-6 ${
                    paymentMethod === "razorpay"
                      ? "bg-blue-600 hover:bg-blue-700"
                      : "bg-teal-700 hover:bg-teal-800"
                  }`}
                  disabled={
                    processingOrder ||
                    (paymentMethod === "razorpay" && !razorpayLoaded)
                  }
                >
                  {processingOrder
                    ? "Processing..."
                    : paymentMethod === "razorpay"
                    ? `Pay with Razorpay - ₹${finalTotal.toLocaleString(
                        "en-IN"
                      )}`
                    : `Place Order - ₹${finalTotal.toLocaleString("en-IN")}`}
                </Button>
              </form>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1 ">
              <div className=" p-6 rounded-md shadow-sm sticky top-20 ">
                <h2 className="text-xl font-medium mb-6">Order Summary</h2>

                {/* Mobile Order Details Toggle */}
                <div className="lg:hidden mb-6">
                  <Button
                    variant="outline"
                    className="w-full flex justify-between"
                    onClick={() => setIsOrderDetailsOpen(!isOrderDetailsOpen)}
                  >
                    <span>Order Details ({cartItems.length} items)</span>
                    <span>{isOrderDetailsOpen ? "−" : "+"}</span>
                  </Button>
                </div>

                {/* Order Items - Mobile Collapsible / Desktop Always Visible */}
                <div
                  className={`${
                    isOrderDetailsOpen ? "block" : "hidden"
                  } lg:block space-y-4 max-h-80 overflow-y-auto mb-6  `}
                >
                  {cartItems.map((item) => (
                    <div key={item._id} className="flex gap-4">
                      <div className="relative h-24 w-24 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.variation.image || "/placeholder.svg"}
                          alt={item.product.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-medium line-clamp-2">
                          {item.product.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Size: {item.variation.size}, Color:{" "}
                          {item.variation.color}
                        </p>
                        <div className="flex justify-between mt-2">
                          <span className="text-sm">Qty: {item.quantity}</span>
                          <span className="font-medium">
                            ₹{item.price.toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* base price , cgst and scgst  */}
                <div className="flex flex-col">
                  {state &&
                    (storeLocation === state ? (
                      <div>
                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            Base Price:
                          </span>
                          <span className="text-gray-600">
                            ₹
                            {(subtotal - (subtotal * 18) / 100).toLocaleString(
                              "en-IN"
                            )}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            CGST (9%):
                          </span>
                          <span className="text-gray-600">
                            ₹{((subtotal * 9) / 100).toLocaleString("en-IN")}
                          </span>
                        </div>

                        <div className="flex justify-between">
                          <span className="text-gray-600 text-sm">
                            SGST (9%):
                          </span>
                          <span className="text-gray-600">
                            ₹{((subtotal * 9) / 100).toLocaleString("en-IN")}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between">
                        <span className="text-gray-600 text-sm">
                          IGST (18%):
                        </span>
                        <span className="text-gray-600">
                          ₹{((subtotal * 18) / 100).toLocaleString("en-IN")}
                        </span>
                      </div>
                    ))}
                </div>

                {/* Promo Code */}
                <div className="mb-6">
                  <p className="font-medium mb-2">PROMOCODE?</p>
                  <div className="flex">
                    <Input
                      type="text"
                      placeholder="Enter coupon code here"
                      value={promoCode}
                      onChange={(e) =>
                        setPromoCode(e.target.value.toUpperCase())
                      }
                      className="rounded-r-none"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button
                        className="rounded-l-none bg-red-600 hover:bg-red-700"
                        onClick={removeCoupon}
                      >
                        Remove
                      </Button>
                    ) : (
                      <Button
                        className="rounded-l-none bg-teal-700 hover:bg-teal-800"
                        onClick={applyPromoCode}
                        disabled={!promoCode || applyingCoupon}
                      >
                        {applyingCoupon ? "Applying..." : "Apply"}
                      </Button>
                    )}
                  </div>

                  {couponError && (
                    <Alert variant="destructive" className="mt-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Error</AlertTitle>
                      <AlertDescription>{couponError}</AlertDescription>
                    </Alert>
                  )}

                  {appliedCoupon && (
                    <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
                      <div className="flex items-start">
                        <Tag className="h-4 w-4 text-green-600 mt-0.5 mr-2" />
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            {appliedCoupon.code}
                          </p>
                          <p className="text-xs text-green-700">
                            {appliedCoupon.description}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <Separator className="my-4" />

                {/* Order Details */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Sub Total</span>
                    <span className="font-medium">
                      ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-gray-600">
                      Included Tax (GST)
                    </span>
                    <span className="font-medium">
                      ₹{((subtotal * 18) / 100).toLocaleString("en-IN")}
                    </span>
                  </div>

                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span className="flex items-center">
                        <Tag className="h-4 w-4 mr-1" /> Discount
                        {appliedCoupon.discount_type === "percentage" &&
                          ` (${appliedCoupon.discount_value}%)`}
                      </span>
                      <span className="font-medium">
                        -₹{discountAmount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between">
                    <span className="text-lg font-medium">Order Total</span>
                    <span className="text-lg font-medium">
                      ₹{finalTotal.toLocaleString("en-IN")}
                    </span>
                  </div>

                  {/* COD Eligibility Message */}
                  {isCodAvailable() && (
                    <div className="mt-2 text-xs text-green-600 flex items-center">
                      <Check className="h-4 w-4 mr-1" />
                      Eligible for Cash on Delivery
                    </div>
                  )}

                  {!isCodAvailable() && paymentSettings?.cod_enabled && (
                    <div className="mt-2 text-xs text-amber-600">
                      COD available for orders between ₹
                      {paymentSettings.cod_min_order_value.toLocaleString(
                        "en-IN"
                      )}{" "}
                      and ₹
                      {paymentSettings.cod_max_order_value.toLocaleString(
                        "en-IN"
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
