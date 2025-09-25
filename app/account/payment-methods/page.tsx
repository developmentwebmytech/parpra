"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, CreditCard, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useSession } from "next-auth/react";
import UserAccountSidebar from "@/components/user-account-sidebar";

interface PaymentMethod {
  _id: string;
  user_id: string;
  card_type: string;
  last_four: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PaymentMethodsPage() {
  const {  status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
    try {
      const response = await fetch("/api/user/payment-methods");
      if (!response.ok) {
        throw new Error("Failed to fetch payment methods");
      }
      const data = await response.json();
      setPaymentMethods(data.paymentMethods || []);
    } catch (error) {
      console.error("Error fetching payment methods:", error);
      toast({
        title: "Error",
        description: "Failed to load payment methods",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
    if (status === "unauthenticated") {
      router.push("/login?redirect=/account/payment-methods");
    }

    if (status === "authenticated") {
      fetchPaymentMethods();
    }
  }, [status, router, toast]);

  

  const handleAddPaymentMethod = () => {
    router.push("/account/payment-methods/new");
  };

  const handleDeletePaymentMethod = async (id: string) => {
    if (confirm("Are you sure you want to delete this payment method?")) {
      try {
        const response = await fetch(`/api/user/payment-methods/${id}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Failed to delete payment method");
        }

        // Update the payment methods list
        setPaymentMethods((prev) => prev.filter((method) => method._id !== id));

        toast({
          title: "Success",
          description: "Payment method deleted successfully",
        });
      } catch (error) {
        console.error("Error deleting payment method:", error);
        toast({
          title: "Error",
          description: "Failed to delete payment method",
          variant: "destructive",
        });
      }
    }
  };

  const handleSetDefaultPaymentMethod = async (id: string) => {
    try {
      const method = paymentMethods.find((m) => m._id === id);
      if (!method) return;

      const response = await fetch(`/api/user/payment-methods/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...method,
          is_default: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update payment method");
      }

      // Update the payment methods list
      setPaymentMethods((prev) =>
        prev.map((method) => ({
          ...method,
          is_default: method._id === id,
        }))
      );

      toast({
        title: "Success",
        description: "Default payment method updated",
      });
    } catch (error) {
      console.error("Error updating payment method:", error);
      toast({
        title: "Error",
        description: "Failed to update payment method",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || (status === "authenticated" && loading)) {
    return (
      <div className="bg-neutral-50 min-h-screen py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <Skeleton className="h-[400px] w-full rounded-md" />
            </div>
            <div className="flex-1">
              <Skeleton className="h-12 w-1/3 mb-6" />
              <Skeleton className="h-[200px] w-full rounded-md mb-4" />
              <Skeleton className="h-[200px] w-full rounded-md" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-50 min-h-screen py-6 sm:py-10 md:py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row gap-6 md:gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 lg:w-1/4">
            <UserAccountSidebar activeItem="payment-methods" />
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="bg-white p-4 sm:p-6 md:p-8 rounded-md shadow-sm">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-4 sm:gap-0">
                <h1 className="text-xl sm:text-2xl font-medium">
                  Payment Methods
                </h1>
                <Button
                  className="w-full sm:w-auto bg-amber-700 hover:bg-amber-800"
                  onClick={handleAddPaymentMethod}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>

              {paymentMethods.length === 0 ? (
                <div className="text-center py-12 px-4 border rounded-md">
                  <p className="text-gray-500 mb-4">
                    You don't have any saved payment methods yet.
                  </p>
                  <Button
                    className="bg-amber-700 hover:bg-amber-800 w-full sm:w-auto"
                    onClick={handleAddPaymentMethod}
                  >
                    Add Payment Method
                  </Button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                  {paymentMethods.map((method) => (
                    <div
                      key={method._id}
                      className={`border rounded-md p-4 ${
                        method.is_default ? "border-amber-700 bg-amber-50" : ""
                      }`}
                    >
                      {method.is_default && (
                        <div className="mb-2">
                          <span className="bg-amber-700 text-white text-xs px-2 py-1 rounded">
                            Default
                          </span>
                        </div>
                      )}

                      <div className="flex items-center">
                        <CreditCard className="h-8 w-8 mr-3 text-gray-600" />
                        <div>
                          <p className="font-medium">
                            {method.card_type} ending in {method.last_four}
                          </p>
                          <p className="text-sm text-gray-500">
                            Expires {method.expiry_month}/{method.expiry_year}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-600"
                          onClick={() => handleDeletePaymentMethod(method._id)}
                        >
                          <Trash className="h-4 w-4 mr-1" />
                          Delete
                        </Button>

                        {!method.is_default && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleSetDefaultPaymentMethod(method._id)
                            }
                          >
                            Set as Default
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
