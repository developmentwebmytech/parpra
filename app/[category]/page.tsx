import { Suspense } from "react";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ProductList from "@/components/product-list";
import { getProductsData } from "@/lib/api";
import { Metadata } from "next";
import SwiperComponent from "@/components/SwiperComponent";
import FilterSidebar from "@/components/FilterSidebar";

type Props = {
  params: Promise<{ category: string }>;
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params;
  const category = await getCategory(resolvedParams.category);
  return {
    title: `${category.name} - Parpra`,
    description: category.description,
    keywords:
      category.keywords?.join(", ") || "e-commerce, online shopping, products",
    authors: [{ name: "Parpra Team", url: "https://parpra.com" }],
    openGraph: {
      title: `${category.name} - Parpra`,
      description: category.description,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/category/${resolvedParams.category}`,
      images: [
        {
          url: `${
            process.env.NEXT_PUBLIC_SITE_URL
          }/api/og?title=${encodeURIComponent(
            category.name
          )}&description=${encodeURIComponent(category.description)}`,
          width: 1200,
          height: 630,
        },
      ],
      siteName: "Parpra E-commerce",
      type: "website",
    },
  };
}

async function getCategory(slug: string) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/category/${slug}`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 404) {
        return null;
      }
      throw new Error("Failed to fetch category");
    }

    return res.json();
  } catch (error) {
    console.error("Error loading category:", error);
    throw error;
  }
}

async function getProductsByCategory(categoryId: string) {
  try {
    const data = await getProductsData({ category: categoryId });
    return data;
  } catch (error) {
    console.error("Error loading products:", error);
    return { products: [] };
  }
}

export default async function CategoryPage({ params, searchParams }: Props) {
  // Await the params promise
  const resolvedParams = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};

  const category = await getCategory(resolvedParams.category);

  if (!category) {
    notFound();
  }

  const { products = [] } = await getProductsByCategory(category._id);

  return (
    <div>
      <div className="container m-auto py-4  mb-14">
        <SwiperComponent />
        <h1 className="text-3xl font-bold mb-8">{category.name}</h1>

        {/* filteration for mobile and desktop  */}

        <div >

          {/* left side of the page  */}

          {/* <FilterSidebar/> */}
      

          {/* right side of the page */}
          <div>
            {category.description && (
              <p className="text-gray-600 mb-8">{category.description}</p>
            )}
            <Suspense fallback={<ProductListSkeleton />}>
              <ProductList products={products} categoryId={category._id} />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductListSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <div key={i} className="space-y-3">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
        </div>
      ))}
    </div>
  );
}
