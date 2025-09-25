"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface HomepageSection {
  _id: string;
  name: string;
  type: string;
  title?: string;
  subtitle?: string;
  image?: string;
  position: number;
  isActive: boolean;
}

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
const fetchSections =useCallback( async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/homepage-sections");
      if (!response.ok) {
        throw new Error("Failed to fetch homepage sections");
      }
      const data = await response.json();
      // Sort by position
      const sortedData = data.sort(
        (a: HomepageSection, b: HomepageSection) => a.position - b.position
      );
      setSections(sortedData);
    } catch (error) {
      console.error("Error fetching homepage sections:", error);
      toast({
        title: "Error",
        description: "Failed to load homepage sections",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);
  useEffect(() => {
    fetchSections();
  }, [fetchSections ]);

  

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this section?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/homepage-sections/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete section");
      }

      toast({
        title: "Success",
        description: "Section deleted successfully",
      });

      // Remove the deleted section from the state
      setSections(sections.filter((section) => section._id !== id));
    } catch (error) {
      console.error("Error deleting section:", error);
      toast({
        title: "Error",
        description: "Failed to delete section",
        variant: "destructive",
      });
    }
  };

  const handleMoveSection = async (id: string, direction: "up" | "down") => {
    const currentIndex = sections.findIndex((section) => section._id === id);
    if (
      (direction === "up" && currentIndex === 0) ||
      (direction === "down" && currentIndex === sections.length - 1)
    ) {
      return;
    }

    const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const targetSection = sections[newIndex];

    try {
      // Update the current section's position
      const currentResponse = await fetch(
        `/api/admin/homepage-sections/${id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ position: targetSection.position }),
        }
      );

      // Update the target section's position
      const targetResponse = await fetch(
        `/api/admin/homepage-sections/${targetSection._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ position: sections[currentIndex].position }),
        }
      );

      if (!currentResponse.ok || !targetResponse.ok) {
        throw new Error("Failed to update section positions");
      }

      toast({
        title: "Success",
        description: "Section order updated successfully",
      });

      // Refresh the sections
      fetchSections();
    } catch (error) {
      console.error("Error updating section positions:", error);
      toast({
        title: "Error",
        description: "Failed to update section order",
        variant: "destructive",
      });
    }
  };

  const getSectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      banner: "Banner",
      "featured-categories": "Featured Categories",
      "new-arrivals": "New Arrivals",
      "best-sellers": "Best Sellers",
      "featured-collections": "Featured Collections",
      testimonials: "Testimonials",
      "instagram-feed": "Instagram Feed",
      custom: "Custom Section",
    };
    return labels[type] || type;
  };

  return (
    <div className="p-4 ">
      <div className="flex justify-between items-center mb-4 p-6">
        <h1 className="text-4xl font-bold">Homepage Sections</h1>
        <Link href="/dashboard/homepage/new">
          <Button className=" bg-teal-600 text-white   hover:bg-teal-500 hover:text-white transition">
            <Plus className="h-4 w-4 mr-2" />
            Add Section
          </Button>
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 ">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-64">
            <p className="text-gray-500 mb-4">No homepage sections found</p>
            <Link href="/dashboard/homepage/new">
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Section
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Homepage Layout</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sections.map((section, index) => (
                <div
                  key={section._id}
                  className="flex items-center justify-between p-4 border rounded-lg bg-white"
                >
                  <div className="flex items-center space-x-4">
                    <div className="bg-gray-100 rounded-full h-8 w-8 flex items-center justify-center">
                      <span className="text-sm font-medium">{index + 1}</span>
                    </div>

                    {section.image ? (
                      <div className="relative w-12 h-12 rounded-md overflow-hidden">
                        <Image
                          src={section.image || "/placeholder.svg"}
                          alt={section.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center">
                        <ImageIcon className="h-6 w-6 text-gray-400" />
                      </div>
                    )}

                    <div>
                      <h3 className="font-medium">{section.name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="outline">
                          {getSectionTypeLabel(section.type)}
                        </Badge>
                        <Badge
                          variant={section.isActive ? "default" : "outline"}
                          className={
                            section.isActive ? "bg-teal-600 text-white" : ""
                          }
                        >
                          {section.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveSection(section._id, "up")}
                      disabled={index === 0}
                    >
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleMoveSection(section._id, "down")}
                      disabled={index === sections.length - 1}
                    >
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Link href={`/dashboard/homepage/${section._id}`}>
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Button
                      className="bg-gray-500 hover:bg-red-600"
                      variant="destructive"
                      size="icon"
                      onClick={() => handleDelete(section._id)}
                    >
                      <Trash2 className="h-4 w-4 text-white " />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
