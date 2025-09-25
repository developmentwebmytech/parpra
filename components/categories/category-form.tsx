"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload } from "lucide-react";
import type { ICategory } from "@/lib/models";

const formSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  parent_category_id: z.string().optional(),
  image: z.any().optional(),
});

interface CategoryFormProps {
  category?: ICategory;
  parentCategories: ICategory[];
}

export function CategoryForm({
  category,
  parentCategories,
}: CategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    category?.image || null
  );
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: category?.name || "",
      parent_category_id: category?.parent_category_id
        ? category.parent_category_id.toString()
        : "",
      image: undefined,
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        setKeepExistingImage(false);
      };
      reader.readAsDataURL(file);
      form.setValue("image", file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setKeepExistingImage(false);
    form.setValue("image", undefined);
  };

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("name", values.name);

      if (values.parent_category_id) {
        formData.append("parent_category_id", values.parent_category_id);
      }

      if (values.image) {
        formData.append("image", values.image);
      }

      if (category) {
        formData.append("keepExistingImage", keepExistingImage.toString());

        const response = await fetch(`/api/categories/${category._id}`, {
          method: "PUT",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update category");
        }

        toast({
          title: "Success",
          description: "Category updated successfully",
        });
      } else {
        const response = await fetch("/api/categories", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create category");
        }

        toast({
          title: "Success",
          description: "Category created successfully",
        });
      }

      router.push("/dashboard/categories");
      router.refresh();
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-10">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg mb-2 block">
                  Category Name
                </FormLabel>
                <FormControl>
                  <Input placeholder="Enter category name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="parent_category_id"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg mb-2 block">
                  Parent Category
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a parent category (optional)" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="none">None</SelectItem>
                    {parentCategories.map((parentCategory) => (
                      <SelectItem
                        key={parentCategory._id.toString()}
                        value={parentCategory._id.toString()}
                      >
                        {parentCategory.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="image"
            render={({ field: { value, onChange, ...field } }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg mb-2 block">
                  Category Image
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("category-image")?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <Input
                        id="category-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                        {...field}
                      />
                      {imagePreview && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={removeImage}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {imagePreview && (
                      <div className="relative h-40 w-40 overflow-hidden rounded-md border">
                        <Image
                          src={imagePreview || "/placeholder.svg"}
                          alt="Category image preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <Button
            type="submit"
            disabled={isLoading}
            className="text-lg  py-4 bg-teal-600 font-light hover:bg-teal-700"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {category ? "Updating..." : "Creating..."}
              </>
            ) : category ? (
              "Update Category"
            ) : (
              "Create Category"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-lg bg-[#000000a3] font-light text-white hover:bg-teal-600 hover:text-white"
            onClick={() => router.push("/dashboard/categories")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
