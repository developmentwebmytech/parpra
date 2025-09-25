"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Layers, LayoutDashboard, Package, Tag , Users ,House , BadgeCheck, CalendarArrowDown , MailOpen,BookOpenCheck , BadgeDollarSign , PartyPopper ,TableOfContents, PanelTop , TruckElectric , Star   } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const items = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Products",
    href: "/dashboard/products",
    icon: Package,
  },
  {
    title: "Categories",
    href: "/dashboard/categories",
    icon: Layers,
  },
  {
    title: "Brands",
    href: "/dashboard/brands",
    icon: Tag,
  },
  {
    title: "Users",
    href: "/dashboard/users",
    icon: Users,
  },
  {
    title: "Homepage Sections",
    href: "/dashboard/homepage",
    icon: House,
  },
  {
    title: "Testimonials",
    href: "/dashboard/testimonials",
    icon: BadgeCheck,
  },
  {
    title:"Orders",
    href: "/dashboard/orders",
    icon: CalendarArrowDown,
  },
  {
    title:"Blogs",
    href: "/dashboard/blogs",
    icon: BookOpenCheck,
  },
  {
    title:"Coupons",
    href: "/dashboard/coupons",
    icon: BadgeDollarSign,
  },
  {
    title:"Announcement Bar",
    href: "/dashboard/announcements",
    icon: PartyPopper,
  },
  {
    title:"Faqs",
    href: "/dashboard/faqs",
    icon: TableOfContents,
  },
  {
    title:"Emails",
    href: "/dashboard/emails",
    icon: MailOpen,
  },
  {
    title:"Contact Us",
    href: "/dashboard/contact",
    icon: PanelTop ,
  },
  {
    title:"Shipping Page",
    href: "/dashboard/shipping",
    icon: TruckElectric  ,
  },
  {
    title:"Reviews",
    href: "/dashboard/reviews",
    icon: Star   ,
  },
  {
    title:"Store Location",
    href: "/dashboard/storelocation",
    icon: Star   ,
  },
]

interface DashboardNavProps {
  setOpen?: (open: boolean) => void
}

export function DashboardNav({ setOpen }: DashboardNavProps) {
  const pathname = usePathname()

  return (
    <nav className="h-full py-4 overflow-y-scroll scrollbar-none">
      <div className="px-3 py-2">
        {/* <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">Navigation</h2> */}
        <div className="space-y-1 ">
          {items.map((item, index) => (
            <div key={item.href} className="flex flex-col">
              <Link
                href={item.href}
                onClick={() => {
                  if (setOpen) setOpen(false)
                }}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-teal-600 hover:text-white transition-colors",
                  pathname === item.href ? "bg-teal-600 text-white " : "transparent",
                )}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.title}</span>
              </Link>
              {index < items.length - 1 && <Separator className="my-2" />}
            </div>
          ))}
        </div>
      </div>
    </nav>
  )
}
