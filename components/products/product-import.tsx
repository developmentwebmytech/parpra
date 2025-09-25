"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Upload } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function ProductImport() {
  const { toast } = useToast()
  const [file, setFile] = useState<File | null>(null)
  const [fileType, setFileType] = useState<string>("excel")
  const [isLoading, setIsLoading] = useState(false)
  const [results, setResults] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file to import",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)
    setResults(null)

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("fileType", fileType)

      const response = await fetch("/api/import/products", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to import products")
      }

      toast({
        title: "Success",
        description: data.message,
      })

      setResults(data.results)
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import products",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import Products</CardTitle>
        <CardDescription>
          Import products from Excel, CSV, or JSON files. Make sure your file follows the required format.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="file-type">File Type</Label>
            <RadioGroup id="file-type" value={fileType} onValueChange={setFileType} className="flex flex-col space-y-1">
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="excel" id="excel" />
                <Label htmlFor="excel">Excel (.xlsx)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="csv" id="csv" />
                <Label htmlFor="csv">CSV (.csv)</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="json" id="json" />
                <Label htmlFor="json">JSON (.json)</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="file">Upload File</Label>
            <Input
              id="file"
              type="file"
              accept={fileType === "excel" ? ".xlsx,.xls" : fileType === "csv" ? ".csv" : ".json"}
              onChange={handleFileChange}
            />
            <p className="text-sm text-muted-foreground">
              {fileType === "excel" && "Upload an Excel file (.xlsx, .xls)"}
              {fileType === "csv" && "Upload a CSV file (.csv)"}
              {fileType === "json" && "Upload a JSON file (.json)"}
            </p>
          </div>

          <Button type="submit" disabled={isLoading || !file} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Import Products
              </>
            )}
          </Button>
        </form>

        {results && (
          <div className="mt-6 space-y-4">
            <div className="flex justify-between">
              <div>
                <p className="font-medium">Successful imports:</p>
                <p className="text-2xl font-bold text-green-600">{results.success}</p>
              </div>
              <div>
                <p className="font-medium">Failed imports:</p>
                <p className="text-2xl font-bold text-red-600">{results.failed}</p>
              </div>
            </div>

            {results.errors.length > 0 && (
              <Alert variant="destructive">
                <AlertTitle>Import Errors</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 max-h-40 overflow-y-auto">
                    <ul className="list-disc pl-5 space-y-1">
                      {results.errors.map((error, index) => (
                        <li key={index} className="text-sm">
                          {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col items-start">
        <h4 className="font-semibold mb-2">File Format Requirements:</h4>
        <ul className="list-disc pl-5 space-y-1 text-sm">
          <li>Required product fields: name, description, brand_name, category_name</li>
          <li>Optional product fields: material, tags, is_featured, is_best_seller</li>
          <li>For variations, include a variations array with objects containing: size, color, price, sku, quantity</li>
          <li>
            <a
              href="/api/export/products?fileType=excel"
              className="text-primary hover:underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              Download a sample template
            </a>
          </li>
        </ul>
      </CardFooter>
    </Card>
  )
}
