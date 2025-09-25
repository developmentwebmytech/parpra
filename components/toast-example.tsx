"use client"

import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function ToastExample() {
  const { toast } = useToast()

  return (
    <div className="grid gap-2">
      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Default Toast",
            description: "This is a default toast notification",
          })
        }}
      >
        Show Default Toast
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: "destructive",
            title: "Error Toast",
            description: "Something went wrong!",
          })
        }}
      >
        Show Error Toast
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: "success",
            title: "Success!",
            description: "Your order has been placed successfully.",
          })
        }}
      >
        Show Success Toast
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: "warning",
            title: "Warning",
            description: "Your session will expire in 5 minutes.",
          })
        }}
      >
        Show Warning Toast
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          toast({
            variant: "info",
            title: "Information",
            description: "New products have been added to our collection.",
          })
        }}
      >
        Show Info Toast
      </Button>

      <Button
        variant="outline"
        onClick={() => {
          toast({
            title: "Toast with Action",
            description: "Your cart has been updated.",
            action: (
              <Button variant="outline" className="h-8 px-3 text-xs" >
                Undo
              </Button>
            ),
          })
        }}
      >
        Show Toast with Action
      </Button>
    </div>
  )
}
