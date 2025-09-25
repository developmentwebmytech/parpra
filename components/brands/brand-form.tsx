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
import { useToast } from "@/hooks/use-toast";
import { Loader2, Trash2, Upload } from "lucide-react";
import type { IBrand } from "@/lib/models";

const formSchema = z.object({
  name: z.string().min(1, "Brand name is required"),
  image: z.any().optional(),
});

interface BrandFormProps {
  brand?: IBrand;
}

export function BrandForm({ brand }: BrandFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(
    brand?.image || null
  );
  const [keepExistingImage, setKeepExistingImage] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: brand?.name || "",
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

      if (values.image) {
        formData.append("image", values.image);
      }

      if (brand) {
        formData.append("keepExistingImage", keepExistingImage.toString());

        const response = await fetch(`/api/brands/${brand._id}`, {
          method: "PUT",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to update brand");
        }

        toast({
          title: "Success",
          description: "Brand updated successfully",
        });
      } else {
        const response = await fetch("/api/brands", {
          method: "POST",
          body: formData,
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to create brand");
        }

        toast({
          title: "Success",
          description: "Brand created successfully",
        });
      }

      router.push("/dashboard/brands");
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 py-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="mb-4">
                <FormLabel className="text-lg mb-2 block">Brand Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter brand name" {...field} />
                </FormControl>
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
                  Brand Image
                </FormLabel>
                <FormControl>
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() =>
                          document.getElementById("brand-image")?.click()
                        }
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        Upload Image
                      </Button>
                      <Input
                        id="brand-image"
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
                          alt="Brand image preview"
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
                {brand ? "Updating..." : "Creating..."}
              </>
            ) : brand ? (
              "Update Brand"
            ) : (
              "Create Brand"
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="text-lg bg-[#000000a3] font-light text-white hover:bg-teal-600 hover:text-white"
            onClick={() => router.push("/dashboard/brands")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
