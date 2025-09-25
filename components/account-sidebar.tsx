import Link from "next/link"

interface AccountSidebarProps {
  activeItem?: "profile" | "shipping" | "orders" | "wishlist"
}

export default function AccountSidebar({ activeItem }: AccountSidebarProps) {
  return (
    <div className="bg-white p-6 rounded-md shadow-sm">
      <h2 className="text-xl font-medium mb-6">My Account</h2>
      <nav className="space-y-2">
        <Link
          href="/account/profile"
          className={`block py-2 px-3 rounded-md ${activeItem === "profile" ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
        >
          My Profile
        </Link>
        <Link
          href="/account/shipping"
          className={`block py-2 px-3 rounded-md ${activeItem === "shipping" ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
        >
          My Shipping Details
        </Link>
        <Link
          href="/account/orders"
          className={`block py-2 px-3 rounded-md ${activeItem === "orders" ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
        >
          My Orders
        </Link>
        <Link
          href="/wishlist"
          className={`block py-2 px-3 rounded-md ${activeItem === "wishlist" ? "bg-amber-50 text-amber-700 font-medium" : "text-gray-700 hover:bg-gray-50"}`}
        >
          My Wish List
        </Link>
        <Link href="/logout" className="block py-2 px-3 rounded-md text-gray-700 hover:bg-gray-50">
          Logout
        </Link>
      </nav>
    </div>
  )
}
