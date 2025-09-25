"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/hooks/use-toast"
import { Save, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface PaymentSettings {
  cod_enabled: boolean
  cod_min_order_value: number
  cod_max_order_value: number
  online_payment_enabled: boolean
  paypal_enabled: boolean
  bank_transfer_enabled: boolean
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
    cod_enabled: true,
    cod_min_order_value: 0,
    cod_max_order_value: 10000,
    online_payment_enabled: true,
    paypal_enabled: true,
    bank_transfer_enabled: true,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch("/api/payment-settings")

      if (!response.ok) {
        throw new Error("Failed to fetch payment settings")
      }

      const data = await response.json()
      setSettings(data)
    } catch (error) {
      console.error("Error fetching payment settings:", error)
      setError("Failed to load payment settings. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    try {
      setSaving(true)
      setError(null)

      const response = await fetch("/api/payment-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(settings),
      })

      if (!response.ok) {
        throw new Error("Failed to update payment settings")
      }

      toast({
        variant: "success",
        title: "Settings saved",
        description: "Payment settings have been updated successfully.",
      })
    } catch (error) {
      console.error("Error saving payment settings:", error)
      setError("Failed to save payment settings. Please try again.")
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to save payment settings.",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof PaymentSettings, value: boolean | number) => {
    setSettings((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Payment Settings</h1>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Payment Methods</CardTitle>
          <CardDescription>Configure which payment methods are available to customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Cash on Delivery Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Cash on Delivery (COD)</h3>
                <p className="text-sm text-gray-500">Allow customers to pay when they receive their order</p>
              </div>
              <Switch
                checked={settings.cod_enabled}
                onCheckedChange={(checked) => handleChange("cod_enabled", checked)}
              />
            </div>

            {settings.cod_enabled && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-6 border-l-2 border-gray-100">
                <div className="space-y-2">
                  <Label htmlFor="cod_min_order_value">Minimum Order Value (₹)</Label>
                  <Input
                    id="cod_min_order_value"
                    type="number"
                    value={settings.cod_min_order_value}
                    onChange={(e) => handleChange("cod_min_order_value", Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Minimum order amount for COD eligibility</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cod_max_order_value">Maximum Order Value (₹)</Label>
                  <Input
                    id="cod_max_order_value"
                    type="number"
                    value={settings.cod_max_order_value}
                    onChange={(e) => handleChange("cod_max_order_value", Number(e.target.value))}
                  />
                  <p className="text-xs text-gray-500">Maximum order amount for COD eligibility</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Online Payment Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Online Payments</h3>
                <p className="text-sm text-gray-500">Allow customers to pay online with credit/debit cards</p>
              </div>
              <Switch
                checked={settings.online_payment_enabled}
                onCheckedChange={(checked) => handleChange("online_payment_enabled", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* PayPal Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">PayPal</h3>
                <p className="text-sm text-gray-500">Allow customers to pay using PayPal</p>
              </div>
              <Switch
                checked={settings.paypal_enabled}
                onCheckedChange={(checked) => handleChange("paypal_enabled", checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Bank Transfer Settings */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Bank Transfer</h3>
                <p className="text-sm text-gray-500">Allow customers to pay via bank transfer</p>
              </div>
              <Switch
                checked={settings.bank_transfer_enabled}
                onCheckedChange={(checked) => handleChange("bank_transfer_enabled", checked)}
              />
            </div>
          </div>

          <div className="pt-4">
            <Button onClick={saveSettings} disabled={saving} className="flex items-center">
              {saving ? (
                "Saving..."
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
