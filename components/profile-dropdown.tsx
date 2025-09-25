import { signOut } from "next-auth/react";
import Link from "next/link";

export default function ProfileDropdown() {
  return (
    <div className="absolute right-0 top-full mt-2 w-56 bg-white shadow-lg rounded-md z-50 border">
      <div className="py-2 px-4 border-b">
        <Link
          href="/account/profile"
          className="block py-2 text-amber-700 hover:text-amber-800 font-medium"
        >
          My Profile
        </Link>
      </div>
      <div className="py-2 px-4">
        <Link
          href="/account/addresses"
          className="block py-2 text-gray-700 hover:text-amber-700"
        >
          My Shipping Details
        </Link>
        <Link
          href="/account/orders"
          className="block py-2 text-gray-700 hover:text-amber-700"
        >
          My Orders
        </Link>
        <Link
          href="/wishlist"
          className="block py-2 text-gray-700 hover:text-amber-700"
        >
          My Wish List
        </Link>
      </div>
       <div className="py-2 px-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full text-left py-2 text-gray-700 hover:text-amber-700"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
