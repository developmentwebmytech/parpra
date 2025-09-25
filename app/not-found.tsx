import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-9xl font-bold text-gray-300">404</h1>
          <h2 className="text-2xl font-bold text-gray-900 mt-4">Page Not Found</h2>
          <p className="text-gray-600 mt-2">Sorry, we couldn't find the page you're looking for.</p>
        </div>

        <div className="space-y-4 flex flex-col gap-2">
          <Link href="/">
            <Button className="w-full bg-teal-800 hover:bg-teal-600 ">Go Back Home</Button>
          </Link>

          <Link href="/products">
            <Button variant="outline" className="w-full">
              Browse Products
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
