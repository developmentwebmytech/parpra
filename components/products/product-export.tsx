"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Download, Loader2, Info } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

export function ProductExport() {
  const { toast } = useToast()
  const [fileType, setFileType] = useState<string>("excel")
  const [isLoading, setIsLoading] = useState(false)

  const handleExport = async () => {
    setIsLoading(true)

    try {
      // Instead of fetching the data and generating the file in the browser,
      // we'll redirect to the API endpoint that handles the export
      window.location.href = `/api/export/products?fileType=${fileType}`

      toast({
        title: "Export Started",
        description: "Your file download should begin shortly.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to export products",
        variant: "destructive",
      })
    } finally {
      // Add a small delay before setting isLoading to false
      // to give time for the download to start
      setTimeout(() => {
        setIsLoading(false)
      }, 1000)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Products</CardTitle>
        <CardDescription>Export all products and their variations to Excel, CSV, or JSON format.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Label htmlFor="export-type">Export Format</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-sm">
                    <p>
                      <strong>Excel/CSV:</strong> Each variation will be on a separate row with the product details
                      repeated.
                      <br />
                      <br />
                      <strong>JSON:</strong> Nested structure with variations as arrays within each product.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <RadioGroup
              id="export-type"
              value={fileType}
              onValueChange={setFileType}
              className="flex flex-col space-y-1"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="export-excel" />
                <Label htmlFor="export-excel">Excel (.xlsx)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="export-csv" />
                <Label htmlFor="export-csv">CSV (.csv)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="export-json" />
                <Label htmlFor="export-json">JSON (.json)</Label>
              </div>
            </RadioGroup>
          </div>

          <Button onClick={handleExport} disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Products
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
