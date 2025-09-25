"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Mail, Send, Users, Settings, AlertCircle } from "lucide-react"

export default function EmailsPage() {
  const [emailType, setEmailType] = useState("newsletter")
  const [recipient, setRecipient] = useState("")
  const [subject, setSubject] = useState("")
  const [content, setContent] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [subscribers, setSubscribers] = useState([])
  const [debugInfo, setDebugInfo] = useState("")

  useEffect(() => {
    fetchSubscribers()
  }, [])

  const fetchSubscribers = async () => {
    try {
      const response = await fetch("/api/admin/newsletter/subscribers")
      if (response.ok) {
        const data = await response.json()
        setSubscribers(data.subscribers || [])
      }
    } catch (error) {
      console.error("Error fetching subscribers:", error)
    }
  }

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setDebugInfo("")

    try {
      interface EmailRequestBody {
        to: string
        type: string
        data: {
          subject: string
          title: string
          subtitle: string
          body: string
          name: string
        }
      }

      const requestBody: EmailRequestBody = {
        to: recipient,
        type: emailType,
        data: {
          subject,
          title: subject,
          subtitle: "Newsletter Update",
          body: content.replace(/\n/g, "<br>"),
          name: "Valued Customer",
        },
      }

      console.log("Request body:", requestBody)

      const response = await fetch("/api/email/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      })

     
      

      const responseText = await response.text()
      

      let responseData
      try {
        responseData = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse response as JSON:", parseError)
        setDebugInfo(`Response was not JSON: ${responseText.substring(0, 500)}`)
        throw new Error(`Server returned non-JSON response: ${responseText.substring(0, 100)}`)
      }

      if (response.ok) {
        toast({
          title: "Email sent",
          description: "Email has been sent successfully",
        })
        setRecipient("")
        setSubject("")
        setContent("")
        setDebugInfo(`Success: ${JSON.stringify(responseData, null, 2)}`)
      } else {
        console.error("API error:", responseData)
        setDebugInfo(`Error: ${JSON.stringify(responseData, null, 2)}`)
        throw new Error(responseData.error || "Failed to send email")
      }
    } catch (error) {
      console.error("Error sending email:", error)
      const errorMessage = error instanceof Error ? error.message : "Failed to send email"
      setDebugInfo(`Exception: ${errorMessage}`)
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSendToAllSubscribers = async () => {
    if (!subject || !content) {
      toast({
        title: "Error",
        description: "Please fill in subject and content",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/admin/newsletter/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subject,
          content: content.replace(/\n/g, "<br>"),
        }),
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "Newsletter sent",
          description: `Newsletter sent to ${data.successful} subscribers`,
        })
        setSubject("")
        setContent("")
      } else {
        const error = await response.json()
        throw new Error(error.error || "Failed to send newsletter")
      }
    } catch (error) {
      console.error("Error sending newsletter:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send newsletter",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Email Management</h1>
        <p className="text-gray-600">Send emails and manage newsletter subscribers</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Individual Email */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Send Email
              </CardTitle>
              <CardDescription>Send individual emails or newsletters</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="emailType" className="text-lg mb-2 block">Email Type</Label>
                  <Select value={emailType} onValueChange={setEmailType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select email type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newsletter">Newsletter</SelectItem>
                      <SelectItem value="welcome">Welcome Email</SelectItem>
                      <SelectItem value="order-confirmation">Order Confirmation</SelectItem>
                      <SelectItem value="order-shipped">Order Shipped</SelectItem>
                      <SelectItem value="password-reset">Password Reset</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="recipient"  className="text-lg mb-2 block">Recipient Email</Label>
                  <Input
                    id="recipient"
                    type="email"
                    value={recipient}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="Enter recipient email"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="subject"  className="text-lg mb-2 block">Subject</Label>
                  <Input
                    id="subject"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Enter email subject"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="content"  className="text-lg mb-2 block">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter email content"
                    rows={8}
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading} className="bg-teal-600 text-white hover:bg-teal-700">
                    <Send className="h-4 w-4 mr-2" />
                    {isLoading ? "Sending..." : "Send Email"}
                  </Button>

                  <Button
                   
                    type="button"
                    variant="outline"
                    className="bg-teal-200 text-black hover:bg-teal-700"
                    onClick={handleSendToAllSubscribers}
                    disabled={isLoading || subscribers.length === 0}
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Send to All Subscribers ({subscribers.length})
                  </Button>
                </div>
              </form>

              {/* Debug Information */}
              {debugInfo && (
                <div className="mt-6 p-4 bg-gray-100 rounded-lg">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertCircle className="h-4 w-4" />
                    <span className="font-medium">Debug Information</span>
                  </div>
                  <pre className="text-xs overflow-auto max-h-40">{debugInfo}</pre>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Email Statistics */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Newsletter Subscribers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-amber-600 mb-2">{subscribers.length}</div>
              <p className="text-gray-600 mb-4">Total subscribers</p>

              <Button variant="outline" className="w-full bg-teal-600 text-white hover:bg-teal-700 hover:text-white" onClick={fetchSubscribers}>
                Refresh
              </Button>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Email Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>SMTP Host:</span>
                  <span className="text-gray-600">Mailtrap</span>
                </div>
                <div className="flex justify-between">
                  <span>Status:</span>
                  <span className="text-green-600">Connected</span>
                </div>
                <div className="flex justify-between">
                  <span>From Email:</span>
                  <span className="text-gray-600 text-xs">
                    {process.env.NEXT_PUBLIC_MAILTRAP_FROM_EMAIL || "noreply@yourstore.com"}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
