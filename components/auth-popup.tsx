"use client";

import Image from "next/image";
import { X, Loader2, Eye, EyeOff } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import LoginImg from "../public/loginimage/login.jpg";
import { useSession } from "next-auth/react";

type AuthPopupProps = {
  onClose: () => void;
};

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const signupSchema = loginSchema.extend({
  name: z.string().min(1, "Name is required"),
  acceptTerms: z.literal(true, {
    errorMap: () => ({
      message: "You must accept the terms and conditions",
    }),
  }),
});

export const AuthPopup = ({ onClose }: AuthPopupProps) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();
  const { data: session, status } = useSession();
  const role = session?.user?.role;
  const [showPassword, setShowPassword] = useState(false);
  const form = useForm<z.infer<typeof signupSchema | typeof loginSchema>>({
    resolver: zodResolver(isSignUp ? signupSchema : loginSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      // acceptTerms: false,
    },
  });

  const toggleMode = () => {
    setIsSignUp((prev) => !prev);
    form.reset();
  };

  useEffect(() => {
    const handleEscKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowPopup(false);
    };
    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, []);

  const onSubmit1 = async (values: any) => {
    setIsLoading(true);
    try {
      if (isSignUp) {
        // Implement actual signup request
        const response = await fetch("/api/auth/register", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          toast({
            variant: "destructive",
            title: "Registration failed",
            description: data.error || "Something went wrong",
          });
          setIsLoading(false);
          return;
        }

        toast({
          variant: "success",
          title: "Welcome to Parpra!",
          description: "Your account has been created successfully",
        });

        // Auto login after registration
        await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        router.push("/");
        router.refresh();
      } else {
        const result = await signIn("credentials", {
          email: values.email,
          password: values.password,
          redirect: false,
        });

        if (result?.error) {
          toast({
            variant: "destructive",
            title: "Login failed",
            description: "Invalid email or password. Please try again.",
          });
          setIsLoading(false);
          return;
        }

        // Successful login
        toast({
          variant: "success",
          title: "Welcome back!",
          description: "You have successfully logged in",
        });

        // Fetch session to get the role
        const sessionRes = await fetch("/api/auth/session");
        const session = await sessionRes.json();

        if (session?.user?.role === "admin") {
          router.push("/dashboard");
        }

        router.refresh();
      }

      setShowPopup(false);
      onClose();
    } catch (err) {
      console.error("Auth error:", err);
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "An unexpected error occurred. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!showPopup) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-999 p-4">
      <div className="flex h-[90vh] w-full max-w-5xl bg-white rounded-lg overflow-hidden relative shadow-lg">
        <div className="w-1/2 h-full hidden md:block bg-gray-100 relative">
          <Image
            src={LoginImg || "/placeholder.svg"}
            alt="login visual"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        <div className="w-full md:w-1/2 flex justify-center items-center p-6 md:p-10 relative">
          <div className="w-full max-w-md">
            <button
              onClick={() => {
                setShowPopup(false);
                onClose();
              }}
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition-colors"
              aria-label="Close"
            >
              <X className="h-6 w-6" />
            </button>
            <div className="max-w-md mx-auto p-6  ">
              <h2 className="text-2xl md:text-3xl font-extrabold text-center mb-4 text-teal-900">
                {isSignUp ? "Create Account" : "Welcome Back"}
              </h2>
              <p className="text-center text-gray-600 text-sm md:text-base leading-relaxed">
                {isSignUp
                  ? "Create your account and start your amazing journey with us ✨."
                  : "We missed you 😊. Log in to continue your journey with us."}
              </p>
            </div>

            <Form {...form} >
              <form
                onSubmit={form.handleSubmit(onSubmit1)}
                className="space-y-4"
              >
                {isSignUp && (
                  <div>
                    <label htmlFor="name" className="cursor-pointer"> Name</label>
                  <FormField
                    name="name"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="mt-2">
                        <FormControl>
                          <Input placeholder="Your name *" {...field} id="name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  </div>
                )}
  <label htmlFor="email" className="cursor-pointer">Email</label>
                <FormField
                  name="email"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormControl>
                        <Input placeholder="E-mail address *" {...field} id="email"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

<label htmlFor="password" className="cursor-pointer">Password</label>
                <FormField
                  name="password"
                  control={form.control}
                  render={({ field }) => (
                    <FormItem className="mt-2">
                      <FormControl>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password *"
                            {...field}
                            id="password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {!isSignUp && (
                  <div className="text-right">
                    <a
                      href="#"
                      className="text-sm text-gray-500 hover:text-teal-900"
                    >
                      Forgot Password?
                    </a>
                  </div>
                )}

                {isSignUp && (
                  <FormField
                    name="acceptTerms"
                    control={form.control}
                    render={({ field }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <Label htmlFor="acceptTerms" className="text-sm">
                          I agree to the{" "}
                          <Link
                            href="/terms"
                            className="text-teal-600 hover:underline"
                          >
                            Terms & Conditions
                          </Link>
                        </Label>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <Button
                  type="submit"
                  className="w-full bg-teal-700 hover:bg-teal-800"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {isSignUp ? "Creating account..." : "Logging in..."}
                    </>
                  ) : isSignUp ? (
                    "Sign Up"
                  ) : (
                    "Log In"
                  )}
                </Button>

                <div className="text-center text-sm text-gray-900 mt-4">
                  {isSignUp
                    ? "Already have an account?"
                    : "Don't have an account?"}{" "}
                  <button
                    type="button"
                    onClick={toggleMode}
                    className="text-teal-700 hover:underline ml-1"
                  >
                    {isSignUp ? "Log In" : "Sign Up"}
                  </button>
                </div>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPopup;
