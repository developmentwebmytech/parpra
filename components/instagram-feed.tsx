import Image from "next/image"
import Link from "next/link"
import { Instagram } from "lucide-react"

interface InstagramFeedProps {
  sectionImage?: string
  sectionTitle?: string
  sectionSubtitle?: string
}

export default function InstagramFeed({
  sectionImage,
  sectionTitle = "Follow Us on Instagram",
  sectionSubtitle = "Tag us @yourbrand for a chance to be featured",
}: InstagramFeedProps) {
  // Sample Instagram posts
  const instagramPosts = [
    { id: 1, image: "/elegant-indian-woman-saree.png", likes: 245, comments: 12 },
    { id: 2, image: "/indian-man-sherwani.png", likes: 189, comments: 8 },
    { id: 3, image: "/indian-bride-red-lehenga.png", likes: 320, comments: 24 },
    { id: 4, image: "/elegant-evening-gown.png", likes: 178, comments: 7 },
    { id: 5, image: "/indian-woman-portrait.png", likes: 210, comments: 15 },
    { id: 6, image: "/indian-man-portrait.png", likes: 156, comments: 5 },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12">
          <div className="mb-6 md:mb-0 md:max-w-xl">
            <h2 className="text-3xl font-bold mb-4">{sectionTitle}</h2>
            <p className="text-gray-600">{sectionSubtitle}</p>
          </div>

          {sectionImage && (
            <div className="w-full md:w-1/3 lg:w-1/4 relative h-40 md:h-60">
              <Image
                src={sectionImage || "/placeholder.svg"}
                alt={sectionTitle || "Instagram Feed"}
                fill
                className="object-cover rounded-lg"
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {instagramPosts.map((post) => (
            <Link
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              key={post.id}
              className="group relative overflow-hidden"
            >
              <div className="aspect-square relative">
                <Image
                  src={post.image || "/placeholder.svg"}
                  alt={`Instagram post ${post.id}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-110 duration-500"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-center">
                    <div className="flex items-center justify-center gap-4">
                      <span>❤️ {post.likes}</span>
                      <span>💬 {post.comments}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex justify-center mt-8">
          <Link
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
          >
            <Instagram className="h-5 w-5" />
            <span>Follow @yourbrand</span>
          </Link>
        </div>
      </div>
    </section>
  )
}
