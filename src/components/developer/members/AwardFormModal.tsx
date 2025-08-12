"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler, Controller } from "react-hook-form";
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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import type { Award } from "@prisma/client";
import { AwardLevel } from "@prisma/client";
import type { AwardFormData } from "@/app/actions/awardActions";

// --- Zod Schema for Award Validation ---
const awardSchema = z.object({
  content: z.string().min(1, "Award content/description is required"),
  year: z
    .number({ invalid_type_error: "Year must be a number" })
    .int()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 5, "Invalid year")
    .optional()
    .nullable(),
  // Use nativeEnum for level
  level: z.nativeEnum(AwardLevel).optional().nullable(), // Allow null initially, map to default later if needed
  link_url: z
    .string()
    .url("Invalid URL format")
    .optional()
    .or(z.literal(""))
    .nullable(), // 允许空字符串或有效URL
  // display_order remains number, allow null/undefined from form
  display_order: z.number().int().optional().nullable(),
  isFeatured: z.boolean().optional(),
});

// --- Infer type from Zod schema ---
// Note: Zod inference might make level `AwardLevel | null | undefined`
type AwardFormValues = z.infer<typeof awardSchema>;

// --- Component Props ---
interface AwardFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: AwardFormData, awardId?: number) => Promise<void>;
  initialData?: Partial<Award> | null;
  memberId: string;
}

// --- Helper to format AwardLevel Enum for display ---
const formatAwardLevelLabel = (level: AwardLevel): string => {
  switch (level) {
    case AwardLevel.GOLD:
      return "Gold";
    case AwardLevel.SILVER:
      return "Silver";
    case AwardLevel.BRONZE:
      return "Bronze";
    case AwardLevel.OTHER:
      return "Other / Not Specified";
    default:
      return level; // Fallback
  }
};

// --- The Modal Component ---
export function AwardFormModal({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  memberId,
}: AwardFormModalProps) {
  const isEditing = !!initialData?.id;

  const {
    register,
    handleSubmit,
    reset,
    control, // Get control from useForm for Controller component
    formState: { errors, isSubmitting },
  } = useForm<AwardFormValues>({
    resolver: zodResolver(awardSchema),
    defaultValues: {
      content: initialData?.content ?? "",
      year: initialData?.year ?? undefined,
      level: initialData?.level ?? undefined, // Use undefined to allow placeholder/default selection
      link_url: initialData?.link_url ?? "",
      display_order: initialData?.display_order ?? undefined,
      isFeatured: initialData?.isFeatured ?? false,
    },
  });

  // Reset form when initialData changes or when modal closes/opens
  useEffect(() => {
    if (isOpen) {
      reset({
        content: initialData?.content ?? "",
        year: initialData?.year ?? undefined,
        level: initialData?.level ?? undefined,
        link_url: initialData?.link_url ?? "",
        display_order: initialData?.display_order ?? undefined,
        isFeatured: initialData?.isFeatured ?? false,
      });
    } else {
      // reset(); // Optionally reset fully on close
    }
  }, [initialData, isOpen, reset]);

  // --- Form Submission Handler ---
  const handleFormSubmit: SubmitHandler<AwardFormValues> = async (data) => {
    console.log("Award Form Data Submitted (from Zod):", data);

    // Prepare data matching the AwardFormData type expected by the action
    const processedData: AwardFormData = {
      content: data.content,
      year: data.year ? Number(data.year) : null,
      // If level is not provided, use the DB default 'OTHER'
      level: data.level ?? AwardLevel.OTHER,
      link_url: data.link_url || null, // Ensure null if empty string
      // If display_order is not provided, use the DB default 0
      display_order: data.display_order ?? 0,
      isFeatured: data.isFeatured ?? false,
    };

    console.log("Data passed to onSubmit:", processedData);
    await onSubmit(processedData, initialData?.id);
  };

  // --- Render ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] dark:bg-gray-850 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="dark:text-green-400">
            {isEditing ? "Edit Award Record" : "Add Award Record"}
          </DialogTitle>
          <DialogDescription className="dark:text-gray-400">
            Enter the details for the award or honor received.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="grid gap-4 py-4"
        >
          {/* Content (Required) - Using Textarea */}
          <div className="grid grid-cols-4 items-start gap-4">
            <Label
              htmlFor="content"
              className="text-right pt-2 dark:text-gray-300"
            >
              Award/Honor <span className="text-red-500">*</span>
            </Label>
            <Textarea
              id="content"
              {...register("content")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              rows={3} // Slightly smaller default rows
              disabled={isSubmitting}
              placeholder="e.g., Best Paper Award, National Scholarship"
            />
          </div>
          {errors.content && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">
              {errors.content.message}
            </p>
          )}

          {/* Year (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="year" className="text-right dark:text-gray-300">
              Year
            </Label>
            <Input
              id="year"
              type="number"
              {...register("year", {
                setValueAs: (v) => {
                  if (v === "" || v === undefined || v === null)
                    return undefined;
                  const n = Number(v);
                  return isNaN(n) ? undefined : n;
                },
              })}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="YYYY (Optional)"
            />
          </div>
          {errors.year && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">
              {errors.year.message}
            </p>
          )}

          {/* Level (Optional Enum) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="level" className="text-right dark:text-gray-300">
              Level
            </Label>
            <Controller
              name="level"
              control={control}
              render={({ field }) => (
                <Select
                  onValueChange={field.onChange} // Use Controller's onChange
                  value={field.value ?? ""} // Handle undefined/null for Select value
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                    <SelectValue placeholder="Select level (Optional)" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                    {/* Add an explicit option to clear/select default if needed */}
                    {/* <SelectItem value="">-- Select Level --</SelectItem> */}
                    {Object.values(AwardLevel).map((levelValue) => (
                      <SelectItem
                        key={levelValue}
                        value={levelValue}
                        className="dark:hover:bg-gray-700 dark:focus:bg-gray-700"
                      >
                        {formatAwardLevelLabel(levelValue)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          {errors.level && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">
              {errors.level.message}
            </p>
          )}

          {/* Link URL (Optional) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="link_url" className="text-right dark:text-gray-300">
              Link URL
            </Label>
            <Input
              id="link_url"
              type="url"
              {...register("link_url")}
              className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
              disabled={isSubmitting}
              placeholder="https://example.com (Optional)"
            />
          </div>
          {errors.link_url && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">
              {errors.link_url.message}
            </p>
          )}

          {/* Display Order (Optional - Maybe hide this initially?) */}
          {/* Consider if this should be editable via drag-and-drop in the main list instead */}
          {/* <div className="grid grid-cols-4 items-center gap-4">
                 <Label htmlFor="display_order" className="text-right dark:text-gray-300">Display Order</Label>
                 <Input
                     id="display_order"
                     type="number"
                     {...register("display_order", { valueAsNumber: true })}
                     className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                     disabled={isSubmitting}
                     placeholder="Lower numbers first (Optional)"
                 />
             </div>
             {errors.display_order && <p className="col-start-2 col-span-3 text-sm text-red-500 dark:text-red-400">{errors.display_order.message}</p>} */}

          {/* isFeatured (Optional Boolean - Switch) */}
          <div className="grid grid-cols-4 items-center gap-4">
            <Label
              htmlFor="isFeatured"
              className="text-right dark:text-gray-300"
            >
              Featured?
            </Label>
            <Controller
              name="isFeatured"
              control={control}
              render={({ field }) => (
                <Switch
                  id="isFeatured"
                  checked={field.value ?? false}
                  onCheckedChange={field.onChange}
                  disabled={isSubmitting}
                  className="col-span-3"
                  aria-label="Mark as featured award"
                />
              )}
            />
          </div>
          {errors.isFeatured && (
            <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal">
              {errors.isFeatured.message}
            </p>
          )}

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
                  : "Add Award"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
