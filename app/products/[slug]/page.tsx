import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ProductDetailClient from "./product-detail-client";
import { Metadata } from "next";



async function getProduct(slug: string) {
  try {
    // Use absolute URL to avoid path issues
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

    const res = await fetch(`${baseUrl}/api/products/${slug}`, {
      cache: "no-store", // Disable cache to always get fresh data
    });

    if (!res.ok) {
      console.error(`Failed to fetch product: ${res.status} ${res.statusText}`);
      if (res.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${res.status}`);
    }

    return await res.json();
  } catch (error) {
    console.error("Error loading product:", error);
    return null;
  }
}


// Use typed route params
interface ProductParams {
  params: Promise<{
    slug: string;
  }>;
}

export const generateMetadata = async ({ params }: ProductParams): Promise<Metadata> => {
  const {slug} = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: "Product Not Found - Parpra",
      description: "This product could not be found.",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

  return {
    title: `${product.name} - Parpra`,
    description: product.description,
    keywords: product.tags?.join(", ") || "e-commerce, online shopping, products",
    authors: [
      { name: "Parpra Team", url: "https://parpra.com" }
    ],
    openGraph: {
      title: product.name,
      description: product.description,
      url: `${siteUrl}/products/${product.slug}`,
      images: [
        {
          url: `${siteUrl}/api/og?title=${encodeURIComponent(product.name)}&description=${encodeURIComponent(product.description)}`,
          width: 1200,
          height: 630,
        }
      ],
      siteName: "Parpra E-commerce",
      type: "website",
    },
  };
};

async function getRelatedProducts(categoryId: string, productId: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
    const res = await fetch(
      `${baseUrl}/api/products?category=${categoryId}&exclude=${productId}&limit=4`,
      {
        cache: "no-store",
      }
    );

    if (!res.ok) {
      throw new Error("Failed to fetch related products");
    }

    const data = await res.json();
    return { relatedProducts: data.products || [] };
  } catch (error) {
    console.error("Error loading related products:", error);
    return { relatedProducts: [] };
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Await the params promise to get the actual slug
  const param = await params;
  const product = await getProduct(param.slug);

  if (!product) {
    console.error(`Product not found for slug: ${param.slug}`);
    notFound();
  }

  // Get related products based on category if available
  const categoryId = product.category_id?._id || product.category_id;
  const { relatedProducts = [] } = categoryId
    ? await getRelatedProducts(categoryId, product._id)
    : { relatedProducts: [] };



    // console.log("related products data yaha hai " , relatedProducts)

  return (
    <div className="container mx-auto px-4 py-6">
      <div className=" ">
        <nav className="w-full px-4 py-2 md:px-0" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-x-1 md:gap-x-3 text-sm">
            <li className="inline-flex items-center">
              <Link
                href="/"
                className="text-gray-900 hover:text-amber-700 text-sm md:text-sm"
              >
                Home
              </Link>
            </li>
            <li className="flex items-center">
              <span className="mx-1 text-gray-400">/</span>
              <Link
                href="/products"
                className="text-gray-900 hover:text-amber-700 text-sm md:text-md"
              >
                Products
              </Link>
            </li>
            {product.category_id && (
              <li className="flex items-center">
                <span className="mx-1 text-gray-400">/</span>
                <Link
                  href={`/${product.category_id.name
                    ?.toLowerCase()
                    .replace(/\s+/g, "-")}`}
                  className="text-gray-900 hover:text-amber-700 text-sm md:text-sm"
                >
                  {product.category_id.name || "Category"}
                </Link>
              </li>
            )}
            <li aria-current="page" className="flex items-center">
              <span className="mx-1 text-gray-400">/</span>
              <span className="text-gray-900 text-sm md:text-sm">
                {product.name}
              </span>
            </li>
          </ol>
        </nav>
      </div>

      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetailClient product={product} />
      </Suspense>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-12 mb-16 px-4 sm:px-6 lg:px-8">
          <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">
            You May Also Like
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((relatedProduct: any) => (
              <Link
                href={`/products/${relatedProduct.slug}`}
                key={relatedProduct._id}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg bg-gray-100">
                  {relatedProduct.variations &&
                  relatedProduct.variations[0]?.image ? (
                    <Image
                      src={
                        fixImagePath(relatedProduct.variations[0].image) ||
                        "/placeholder.svg"
                      }
                      alt={relatedProduct.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, 25vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-400">No image</span>
                    </div>
                  )}
                </div>

                <div className="mt-2">
                  <h3 className="text-sm sm:text-base font-medium text-gray-900">
                    {relatedProduct.name}
                  </h3>
                  <p className="text-sm sm:text-md text-teal-700 mt-1">
                    ₹
                    {(
                      relatedProduct.variations?.[0]?.price || 0
                    ).toLocaleString()}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// Helper function to fix image paths
function fixImagePath(path: string) {
  if (!path) return "/diverse-products-still-life.png";

  // If it's already a full URL or starts with /, return as is
  if (path.startsWith("http") || path.startsWith("/")) {
    return path;
  }

  // Otherwise, add /uploads/ prefix
  return `/uploads/${path}`;
}

function ProductDetailSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <Skeleton className="h-96 w-full rounded-lg" />
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-24 w-full rounded-lg" />
          ))}
        </div>
      </div>
      <div className="space-y-6">
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-6 w-1/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-10 w-10 rounded-full" />
            ))}
          </div>
        </div>
        <div className="space-y-2">
          <Skeleton className="h-6 w-1/3" />
          <div className="flex space-x-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-10 w-16 rounded-md" />
            ))}
          </div>
        </div>
        <div className="flex space-x-4">
          <Skeleton className="h-12 w-1/2" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
    </div>
  );
}
