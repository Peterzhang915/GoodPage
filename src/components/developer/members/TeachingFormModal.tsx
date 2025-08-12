"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Teaching } from "@prisma/client";
import type { TeachingFormData } from "@/app/actions/teachingActions"; // Import the form data type

// --- Zod Schema for Teaching Validation ---
const teachingSchema = z.object({
  course_title: z.string().min(1, "Course title is required"),
  course_code: z.string().optional().nullable(),
  semester: z.string().optional().nullable(),
  year: z
    .number({ invalid_type_error: "Year must be a number" })
    .int()
    .min(1950, "Invalid year") // Adjust min year as appropriate
    .max(new Date().getFullYear() + 10, "Invalid year") // Allow planning a bit ahead
    .optional()
    .nullable(),
  role: z.string().optional().nullable(), // Default 'Instructor' handled by DB/action
  university: z.string().optional().nullable(),
  description_url: z
    .string()
    .url("Invalid URL format (e.g., https://...)")
    .optional()
    .or(z.literal(""))
    .nullable(), // Allow empty string or valid URL
  display_order: z.number().int().optional().nullable(), // Default 0 handled by DB/action
});

// --- Infer type from Zod schema ---
type TeachingFormValues = z.infer<typeof teachingSchema>;

// --- Component Props ---
interface TeachingFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TeachingFormData, teachingId?: number) => Promise<void>; // Passes data and optional ID for update
  initialData?: Partial<Teaching> | null; // Allow partial data for editing
  memberId: string;
}

// --- The Modal Component ---
export function TeachingFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  memberId,
}: TeachingFormModalProps) {
  const isEditing = !!initialData?.id; // Determine if we are editing

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TeachingFormValues>({
    resolver: zodResolver(teachingSchema),
    defaultValues: {
      // Set defaults based on initialData or empty/undefined
      course_title: initialData?.course_title ?? "",
      course_code: initialData?.course_code ?? undefined,
      semester: initialData?.semester ?? undefined,
      year: initialData?.year ?? undefined,
      role: initialData?.role ?? undefined, // Let placeholder/DB handle default
      university: initialData?.university ?? undefined,
      description_url: initialData?.description_url ?? undefined,
      display_order: initialData?.display_order ?? undefined,
    },
  });

  // Reset form when initialData changes or when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      reset({
        course_title: initialData?.course_title ?? "",
        course_code: initialData?.course_code ?? undefined,
        semester: initialData?.semester ?? undefined,
        year: initialData?.year ?? undefined,
        role: initialData?.role ?? undefined,
        university: initialData?.university ?? undefined,
        description_url: initialData?.description_url ?? undefined,
        display_order: initialData?.display_order ?? undefined,
      });
    }
  }, [initialData, isOpen, reset]);

  // --- Form Submission Handler ---
  const handleFormSubmit: SubmitHandler<TeachingFormValues> = async (data) => {
    console.log("Teaching Form Data Submitted (from Zod):", data);

    // Prepare data matching TeachingFormData type for the action
    const processedData: TeachingFormData = {
      course_title: data.course_title,
      course_code: data.course_code || null,
      semester: data.semester || null,
      year: data.year ? Number(data.year) : null,
      // Provide default 'Instructor' if role is falsy (empty string, null, undefined)
      role: data.role || "Instructor",
      university: data.university || null,
      description_url: data.description_url || null,
      // Provide default 0 if display_order is null/undefined
      display_order: data.display_order ?? 0,
    };

    console.log("Data passed to onSubmit:", processedData);
    await onSubmit(processedData, initialData?.id); // Pass ID if editing
  };

  // --- Render ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* Increased width slightly */}
      <DialogContent className="sm:max-w-[550px] dark:bg-gray-850 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-green-400">
            {isEditing ? "Edit Teaching Record" : "Add Teaching Record"}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Enter the details of the course taught.
          </DialogDescription>
        </DialogHeader>

        {/* --- Form --- */}
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-4 py-4"
        >
          {/* Course Title (Required) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="course_title"
              className="text-right dark:text-gray-300"
            >
              Course Title <span className="text-red-500">*</span>
            </Label>
            <Input
              id="course_title"
              {...register("course_title")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="e.g., Introduction to AI"
            />
          </div>
          {errors.course_title && (
            <p className="col-start-2 col-span-3 text-sm text-red-500 dark:text-red-400">
              {errors.course_title.message}
            </p>
          )}

          {/* Course Code (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="course_code"
              className="text-right dark:text-gray-300"
            >
              Code
            </Label>
            <Input
              id="course_code"
              {...register("course_code")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="e.g., CS101 (Optional)"
            />
          </div>
          {/* No error message needed for optional field unless specific validation */}

          {/* Semester (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="semester" className="text-right dark:text-gray-300">
              Semester
            </Label>
            <Input
              id="semester"
              {...register("semester")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="e.g., Fall 2024 (Optional)"
            />
          </div>
          {/* No error message needed */}

          {/* Year (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right dark:text-gray-300">
              Year
            </Label>
            <Input
              id="year"
              type="number"
              {...register("year", { valueAsNumber: true })}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="YYYY (Optional)"
            />
          </div>
          {errors.year && (
            <p className="col-start-2 col-span-3 text-sm text-red-500 dark:text-red-400">
              {errors.year.message}
            </p>
          )}

          {/* Role (Optional, Default: Instructor) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="role" className="text-right dark:text-gray-300">
              Role
            </Label>
            <Input
              id="role"
              {...register("role")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="Instructor (Default), TA, Guest..."
            />
          </div>
          {/* No error message needed */}

          {/* University (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="university"
              className="text-right dark:text-gray-300"
            >
              University
            </Label>
            <Input
              id="university"
              {...register("university")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="If different from primary affiliation"
            />
          </div>
          {/* No error message needed */}

          {/* Description URL (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="description_url"
              className="text-right dark:text-gray-300"
            >
              Course URL
            </Label>
            <Input
              id="description_url"
              type="url"
              {...register("description_url")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="https://... (Optional)"
            />
          </div>
          {errors.description_url && (
            <p className="col-start-2 col-span-3 text-sm text-red-500 dark:text-red-400">
              {errors.description_url.message}
            </p>
          )}

          {/* --- Footer with Buttons --- */}
          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
              >
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="dark:bg-green-600 dark:hover:bg-green-700 dark:text-white"
            >
              {isSubmitting
                ? "Saving..."
                : isEditing
                  ? "Save Changes"
                  : "Add Teaching"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
