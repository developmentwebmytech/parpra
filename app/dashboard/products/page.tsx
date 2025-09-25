import type { Metadata } from "next";
import { getProducts, getBrands, getCategories } from "@/lib/data";
import { ProductsTable } from "@/components/products/products-table";
import { ProductsFilter } from "@/components/products/products-filter";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle, Upload } from "lucide-react";

export const metadata: Metadata = {
  title: "Products | E-commerce Admin",
  description: "Manage your store products",
};

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    page?: string;
    per_page?: string;
    name?: string;
    brand_id?: string;
    category_id?: string;
    date?: string;
  }>;
}) {
  // Await the searchParams promise
  const searchParamsObj = await searchParams;
  const searchParam = searchParamsObj || {};
  const page = Number(searchParam.page) || 1;
  const per_page = Number(searchParam.per_page) || 10;
  const name = searchParam.name || "";
  const brand_id = searchParam.brand_id || "";
  const category_id = searchParam.category_id || "";
  const date = searchParam.date || "";

  const [{ products, totalPages }, { brands }, { categories }] =
    await Promise.all([
      getProducts({ page, per_page, name, brand_id, category_id, date }),
      getBrands({ page: 1, per_page: 100 }),
      getCategories({ page: 1, per_page: 100 }),
    ]);

  return (
    <div className="flex-1 pt-8 m md:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h2 className="text-5xl font-bold tracking-tight">Products</h2>
        <div className="flex flex-col sm:flex-row gap-6 mb-8">
          <Button
            asChild
            variant="outline"
            className="bg-white  text-teal-600 hover:bg-teal-50 border-teal-600 hover:text-black transition"
          >
            <Link href="/dashboard/products/import-export">
              <Upload className="mr-2 h-4 w-4" />
              Import/Export
            </Link>
          </Button>
          <Button
            asChild
            className="bg-teal-600 text-white   hover:bg-teal-500 hover:text-white transition "
          >
            <Link href="/dashboard/products/new">
              <PlusCircle className="mr-2 h-4 w-4 " />
              Add Product
            </Link>
          </Button>
        </div>
      </div>

      <ProductsFilter brands={brands} categories={categories} />

      <ProductsTable
        products={products}
        totalPages={totalPages}
        page={page}
        per_page={per_page}
      />
    </div>
  );
}
