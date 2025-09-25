"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";

interface Announcement {
  _id: string;
  text: string;
  link?: string;
  backgroundColor?: string;
  textColor?: string;
}

export default function AnnouncementBar() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        setLoading(true);
        const response = await fetch("/api/announcements");

        if (!response.ok) {
          throw new Error("Failed to fetch announcements");
        }

        const data = await response.json();
        setAnnouncements(data.announcements);
      } catch (error) {
        console.error("Error fetching announcements:", error);
        setError("Failed to load announcements");
      } finally {
        setLoading(false);
      }
    };

    fetchAnnouncements();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    // Only set up the interval if there are multiple announcements
    if (announcements.length > 1) {
      // Clear any existing interval
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      // Set up a new interval to rotate announcements every 5 seconds
      intervalRef.current = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % announcements.length);
      }, 5000);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [announcements]);

  // Don't render anything if loading or there are no announcements
  if (loading || announcements.length === 0) {
    return null;
  }

  const currentAnnouncement = announcements[currentIndex];

  return (
    <div
      className="transition-all duration-300 ease-in-out"
      style={{
        backgroundColor: currentAnnouncement.backgroundColor || "#064e3b",
        color: currentAnnouncement.textColor || "#ffffff",
      }}
    >
      <div className="container mx-auto flex items-center justify-center px-4 sm:px-6 md:px-8 relative">
        <div className="flex-1 overflow-hidden">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {announcements.map((announcement, index) => (
              <div
                key={announcement._id}
                className="w-full flex-shrink-0 py-2 text-center px-2 sm:px-4"
              >
                {announcement.link ? (
                  <Link
                    href={announcement.link}
                    className="block text-sm sm:text-base font-medium hover:underline"
                  >
                    {announcement.text}
                  </Link>
                ) : (
                  <div className="text-sm sm:text-base font-medium">
                    {announcement.text}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Optional: Indicator dots for multiple announcements */}
      {/* {announcements.length > 1 && (
        <div className="flex justify-center gap-1 pb-2 pt-1">
          {announcements.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50"
              }`}
            />
          ))}
        </div>
      )} */}
    </div>
  );
}
