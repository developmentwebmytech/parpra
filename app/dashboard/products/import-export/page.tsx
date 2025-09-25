import type { Metadata } from "next"
import { ProductImport } from "@/components/products/product-import"
import { ProductExport } from "@/components/products/product-export"
import { BackButton } from "@/components/back-button"

export const metadata: Metadata = {
  title: "Import/Export Products | E-commerce Admin",
  description: "Import and export products for your store",
}

export default function ImportExportPage() {
  return (
    <div className="flex-1 p-4 pt-6 md:p-8">
      <div className="mb-6 flex items-center">
        <BackButton section="products" />
        <h2 className="text-3xl font-bold tracking-tight">Import/Export Products</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <ProductImport />
        <ProductExport />
      </div>
    </div>
  )
}
