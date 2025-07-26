'use client';

import React, { useEffect } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from "@/components/ui/button";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import type { ProjectFormData } from '@/app/actions/projectActions'; // Import the type
// Import Prisma types directly from @prisma/client
import type { Project, ProjectMember } from '@prisma/client';

// Define the Zod schema again here or import if preferred and possible
// For simplicity, defining again, ensure it matches the Action's schema
const ProjectFormSchema = z.object({
    title: z.string().min(1, 'Project title is required'),
    description: z.string().optional(),
    // Refined year handling for better type inference with react-hook-form
    start_year: z.string().optional()
      .refine(val => val === undefined || val === '' || /^\d+$/.test(val), {
        message: "Year must be a number",
      })
      .refine(val => {
          if (val === undefined || val === '') return true;
          const num = Number(val);
          return num >= 1900 && num <= new Date().getFullYear() + 5;
      }, { message: `Invalid year (must be 1900-${new Date().getFullYear() + 5})`}),
    end_year: z.string().optional()
      .refine(val => val === undefined || val === '' || /^\d+$/.test(val), {
        message: "Year must be a number",
      })
       .refine(val => {
          if (val === undefined || val === '') return true;
          const num = Number(val);
          return !isNaN(num) && num >= 1900 && num <= new Date().getFullYear() + 10;
      }, { message: `Invalid year (must be 1900-${new Date().getFullYear() + 10})`}),
    url: z.string().url({ message: "Invalid URL format" }).or(z.literal('')).nullable().optional(),
    role: z.string().optional(),
    tags: z.string().optional(),
}).refine(data => {
    const start = data.start_year ? Number(data.start_year) : null;
    const end = data.end_year ? Number(data.end_year) : null;
    return end === null || start === null || end >= start;
}, {
    message: "End year must be >= start year",
    path: ["end_year"],
});

// Define the type based on this schema (years will be string | undefined)
type ProjectFormValues = z.infer<typeof ProjectFormSchema>;

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData, projectId?: number) => Promise<void>; // Updated onSubmit prop
  initialData?: Project & { memberRole?: string }; // Pass full project data and optionally the member's role
  memberId: string; // Needed potentially if adding new project needs it directly (though action handles it)
}

export function ProjectFormModal({ isOpen, onClose, onSubmit, initialData, memberId }: ProjectFormModalProps) {
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectFormSchema),
    // Adjust default values to match the expected input type (string for years initially)
    defaultValues: { 
        title: initialData?.title ?? '',
        description: initialData?.description ?? '',
        start_year: initialData?.start_year?.toString() ?? '', // Year input expects string
        end_year: initialData?.end_year?.toString() ?? '',   // Year input expects string
        url: initialData?.url ?? '',
        role: initialData?.memberRole ?? '', 
        tags: initialData?.tags ?? '',
    },
  });

  // Reset form when initialData changes (adjust for string years)
  useEffect(() => {
    if (initialData) {
      reset({
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        start_year: initialData.start_year?.toString() ?? '',
        end_year: initialData.end_year?.toString() ?? '',
        url: initialData.url ?? '',
        role: initialData.memberRole ?? '',
        tags: initialData.tags ?? '',
      });
    } else {
      reset({ 
        title: '',
        description: '',
        start_year: '',
        end_year: '',
        url: '',
        role: '',
        tags: '',
      });
    }
  }, [initialData, reset]);

  const handleFormSubmit: SubmitHandler<ProjectFormValues> = async (values) => {
    // Convert year strings to number | null before sending to action
    const dataForAction: ProjectFormData = {
      ...values,
      start_year: values.start_year ? Number(values.start_year) : null,
      end_year: values.end_year ? Number(values.end_year) : null,
      url: values.url === '' ? null : values.url,
    };
    await onSubmit(dataForAction, initialData?.id);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[525px] dark:bg-gray-850 dark:border-gray-700">
        <DialogHeader>
          <DialogTitle className="text-green-600 dark:text-green-400 text-xl font-semibold">
            {initialData ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title" className="dark:text-gray-300">
              Title <span className="text-red-500">*</span>
            </Label>
            <Input id="title" {...register("title")} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            {errors.title && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.title.message}</p>}
          </div>

          <div>
            <Label htmlFor="description" className="dark:text-gray-300">Description</Label>
            <Textarea id="description" {...register("description")} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" rows={3} />
            {errors.description && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.description.message}</p>}
          </div>

           <div className="grid grid-cols-2 gap-4">
             <div>
                <Label htmlFor="start_year" className="dark:text-gray-300">Start Year</Label>
                <Input id="start_year" type="number" {...register("start_year")} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                {errors.start_year && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.start_year.message}</p>}
              </div>
              <div>
                 <Label htmlFor="end_year" className="dark:text-gray-300">End Year</Label>
                 <Input id="end_year" type="number" {...register("end_year")} className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
                 {errors.end_year && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.end_year.message}</p>}
              </div>
           </div>

          <div>
            <Label htmlFor="url" className="dark:text-gray-300">Project URL</Label>
            <Input id="url" {...register("url")} placeholder="https://..." className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
            {errors.url && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.url.message}</p>}
          </div>

           <div>
             <Label htmlFor="role" className="dark:text-gray-300">Your Role (in this project)</Label>
             <Input id="role" {...register("role")} placeholder="e.g., PI, Main Developer, Participant" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
             {errors.role && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.role.message}</p>}
           </div>

           <div>
             <Label htmlFor="tags" className="dark:text-gray-300">Technologies / Tags</Label>
             <Input id="tags" {...register("tags")} placeholder="Comma-separated, e.g., React, AI, NLP" className="dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100" />
             {errors.tags && <p className="text-sm text-red-500 dark:text-red-400 mt-1">{errors.tags.message}</p>}
           </div>

          <DialogFooter className="mt-4">
            <DialogClose asChild>
              <Button type="button" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white">
              {isSubmitting ? 'Saving...' : (initialData ? 'Save Changes' : 'Add Project')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 