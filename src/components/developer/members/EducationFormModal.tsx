'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose, // Import DialogClose for a dedicated close button
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import type { Education } from '@/lib/prisma';
import type { EducationFormData } from '@/app/actions/educationActions'; // Import the form data type

// --- Zod Schema for Validation ---
// 用于表单输入的schema（全部string）
const educationStringSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional(),
  start_year: z.union([
    z.string().min(1, "Start year is required"),
    z.number().int().min(1900, "Invalid year").max(new Date().getFullYear() + 10, "Invalid year")
  ]),
  end_year: z.string().optional(),
  thesis_title: z.string().optional(),
  description: z.string().optional(),
});
// 用于校验和转换的schema
const educationSchema = z.object({
  school: z.string().min(1, "School name is required"),
  degree: z.string().min(1, "Degree is required"),
  field: z.string().optional().nullable(),
  start_year: z.preprocess(
    (val) => val === '' ? undefined : Number(val),
    z.number({ invalid_type_error: "Start year must be a number" })
      .int()
      .min(1900, "Invalid year")
      .max(new Date().getFullYear() + 10, "Invalid year")
  ),
  end_year: z.preprocess(
    (val) => val === '' ? null : Number(val),
    z.number({ invalid_type_error: "End year must be a number" })
      .int()
      .min(1900, "Invalid year")
      .max(new Date().getFullYear() + 20, "Invalid year")
      .nullable()
      .optional()
  ),
  thesis_title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
}).refine(data => !data.end_year || data.end_year >= data.start_year, {
    message: "End year cannot be earlier than start year",
    path: ["end_year"],
});

// --- Infer type from Zod schema ---
// --- 表单输入类型，start_year和end_year为string ---
type EducationFormValues = {
  school: string;
  degree: string;
  field?: string;
  start_year: string | number;
  end_year?: string;
  thesis_title?: string;
  description?: string;
};

// --- Component Props ---
interface EducationFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: EducationFormData, educationId?: number) => Promise<void>; // Passes data and optional ID for update
  initialData?: Partial<Education> | null; // Allow partial data for editing
  memberId: string; // Needed to potentially pass to onSubmit if context needed, though actions handle it
}

// --- The Modal Component ---
export function EducationFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  memberId
}: EducationFormModalProps) {

  const isEditing = !!initialData?.id; // Determine if we are editing based on ID presence

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<EducationFormValues>({
    resolver: zodResolver(educationStringSchema),
    defaultValues: {
      school: initialData?.school ?? '',
      degree: initialData?.degree ?? '',
      field: initialData?.field ?? '',
      start_year: initialData?.start_year ?? '',
      end_year: initialData?.end_year?.toString() ?? '',
      thesis_title: initialData?.thesis_title ?? '',
      description: initialData?.description ?? '',
    },
  });

  // Reset form when initialData changes (e.g., opening modal for different item) or when modal closes
  useEffect(() => {
    if (isOpen) {
        reset({
            school: initialData?.school ?? '',
            degree: initialData?.degree ?? '',
            field: initialData?.field ?? '',
            start_year: initialData?.start_year ?? '',
            end_year: initialData?.end_year?.toString() ?? '',
            thesis_title: initialData?.thesis_title ?? '',
            description: initialData?.description ?? '',
        });
    } else {
         // Optionally reset to empty when closed if desired,
         // but resetting on open covers most cases.
         // reset({...empty values...});
    }
  }, [initialData, isOpen, reset]);

  // --- Form Submission Handler ---
  const handleFormSubmit: SubmitHandler<EducationFormValues> = async (data) => {
    // 先用zod校验转换
    const parsed = educationSchema.safeParse(data);
    if (!parsed.success) {
      toast.error(parsed.error.errors.map(e => e.message).join(', '));
      return;
    }
    const zodData = parsed.data;
    // The 'zodData' here is已经处理为number/null/undefined
    const processedData: EducationFormData = {
        school: zodData.school,
        degree: zodData.degree,
        field: zodData.field ?? null,
        start_year: zodData.start_year ? Number(zodData.start_year) : null,
        end_year: zodData.end_year ? Number(zodData.end_year) : null,
        thesis_title: zodData.thesis_title ?? null,
        description: zodData.description ?? null,
        display_order: 0, // Add default display_order
    };
    await onSubmit(processedData, initialData?.id); // Pass ID if editing
  };


  // --- Render ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px] dark:bg-gray-850 dark:border-gray-700"> {/* Adjust width and dark styles */}
        <DialogHeader>
          <DialogTitle className="dark:text-green-400">
            {isEditing ? 'Edit Education Record' : 'Add Education Record'}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Fill in the details for the education history entry.
          </DialogDescription>
        </DialogHeader>

        {/* --- Form --- */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
            {/* School (Required) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="school" className="text-right dark:text-gray-300">
                  School <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="school"
                  {...register("school")}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isSubmitting}
                />
              </div>
              {errors.school && <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">{errors.school.message}</p>}
            </div>

            {/* Degree (Required) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="degree" className="text-right dark:text-gray-300">
                  Degree <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="degree"
                  {...register("degree")}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isSubmitting}
                />
              </div>
              {errors.degree && <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">{errors.degree.message}</p>}
            </div>

            {/* Field (Optional) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="field" className="text-right dark:text-gray-300">Field</Label>
                <Input
                  id="field"
                  {...register("field")}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Start Year (Required) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="start_year" className="text-right dark:text-gray-300">
                  Start Year <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="start_year"
                  type="number"
                  {...register("start_year", { valueAsNumber: true })}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isSubmitting}
                  placeholder="YYYY"
                />
              </div>
              {errors.start_year && <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">{errors.start_year.message}</p>}
            </div>

            {/* End Year (Optional) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="end_year" className="text-right dark:text-gray-300">End Year</Label>
                <Input
                  id="end_year"
                  type="number"
                  {...register("end_year")}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isSubmitting}
                  placeholder="YYYY or leave blank if ongoing"
                />
              </div>
              {errors.end_year && <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">{errors.end_year.message}</p>}
            </div>

            {/* Thesis Title (Optional) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thesis_title" className="text-right dark:text-gray-300">Thesis Title</Label>
                <Input
                  id="thesis_title"
                  {...register("thesis_title")}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* Description (Optional) */}
            <div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right dark:text-gray-300">Description</Label>
                <Textarea
                  id="description"
                  {...register("description")}
                  className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                  rows={3}
                  disabled={isSubmitting}
                />
              </div>
            </div>

            {/* --- Footer with Buttons --- */}
            <DialogFooter className="mt-4">
                {/* Explicit Close Button */}
                <DialogClose asChild>
                   <Button type="button" variant="outline" onClick={onClose} className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">
                      Cancel
                   </Button>
                </DialogClose>
                 {/* Submit Button */}
                 <Button type="submit" disabled={isSubmitting} className="dark:bg-green-600 dark:hover:bg-green-700 dark:text-white">
                     {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Record')}
                 </Button>
            </DialogFooter>
        </form>

      </DialogContent>
    </Dialog>
  );
}
