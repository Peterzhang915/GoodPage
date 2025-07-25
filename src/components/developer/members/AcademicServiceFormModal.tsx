'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { type AcademicServiceFormData } from '@/app/actions/academicServiceActions'; // Assuming type is exported
import type { AcademicService } from '@prisma/client'; // Import base type if needed for initialData
import { Switch } from '@/components/ui/switch';

// Zod schema for client-side validation (can be the same as server-side if preferred)
const AcademicServiceFormSchema = z.object({
    organization: z.string().min(1, "Organization cannot be empty."),
    role: z.string().min(1, "Role cannot be empty."),
    startYear: z.coerce.number().int().positive("Start year must be a positive number.").optional().nullable(),
    endYear: z.coerce.number().int().positive("End year must be a positive number.").optional().nullable(),
    description: z.string().optional().nullable(),
    isFeatured: z.boolean().optional(),
}).refine(data => !data.startYear || !data.endYear || data.endYear >= data.startYear, {
    message: "End year cannot be before start year.",
    path: ["endYear"],
});

interface AcademicServiceFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: AcademicServiceFormData, serviceId?: number) => Promise<void>;
    initialData?: Partial<AcademicService> | null; // Use base AcademicService type for initialData
    memberId: string; // Needed for context, though not directly part of the form
}

export function AcademicServiceFormModal({ isOpen, onClose, onSubmit, initialData, memberId }: AcademicServiceFormModalProps) {
    const isEditing = !!initialData?.id;

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<AcademicServiceFormData>({
        resolver: zodResolver(AcademicServiceFormSchema),
        defaultValues: {
            organization: initialData?.organization ?? '',
            role: initialData?.role ?? '',
            startYear: initialData?.start_year ?? null,
            endYear: initialData?.end_year ?? null,
            description: initialData?.description ?? '',
            isFeatured: initialData?.isFeatured ?? false,
        },
    });

    // Reset form when initialData changes (e.g., opening modal for different item)
    useEffect(() => {
        if (isOpen) {
            reset({
                organization: initialData?.organization ?? '',
                role: initialData?.role ?? '',
                startYear: initialData?.start_year ?? null,
                endYear: initialData?.end_year ?? null,
                description: initialData?.description ?? '',
                isFeatured: initialData?.isFeatured ?? false,
            });
        }
    }, [initialData, isOpen, reset]);

    const handleFormSubmit = async (data: AcademicServiceFormData) => {
        await onSubmit(data, initialData?.id);
        // onSubmit should handle closing the modal on success
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] dark:bg-gray-850 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">{isEditing ? 'Edit' : 'Add'} Academic Service</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="organization" className="text-right dark:text-gray-300">Organization</Label>
                        <Input
                            id="organization"
                            {...register("organization")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            aria-invalid={errors.organization ? "true" : "false"}
                        />
                        {errors.organization && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.organization.message}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="role" className="text-right dark:text-gray-300">Role</Label>
                        <Input
                            id="role"
                            {...register("role")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            aria-invalid={errors.role ? "true" : "false"}
                         />
                         {errors.role && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.role.message}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startYear" className="text-right dark:text-gray-300">Start Year</Label>
                        <Input
                            id="startYear"
                            type="number"
                            {...register("startYear")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            aria-invalid={errors.startYear ? "true" : "false"}
                        />
                         {errors.startYear && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.startYear.message}</p>}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endYear" className="text-right dark:text-gray-300">End Year</Label>
                        <Input
                            id="endYear"
                            type="number"
                            {...register("endYear")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            aria-invalid={errors.endYear ? "true" : "false"}
                        />
                         {errors.endYear && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.endYear.message}</p>}
                    </div>
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right dark:text-gray-300">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 resize-y min-h-[60px]"
                            rows={3}
                        />
                        {/* No explicit error display for description unless needed */}
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="isFeatured" className="text-right dark:text-gray-300">Featured?</Label>
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
                                    aria-label="Mark as featured service"
                                />
                            )}
                        />
                    </div>
                    {errors.isFeatured && <p className="text-sm text-red-500 dark:text-red-400 mt-1 min-h-[1.25em] leading-tight break-all whitespace-normal col-span-4">{errors.isFeatured.message}</p>}

                    <DialogFooter>
                         <DialogClose asChild>
                             <Button type="button" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
                         </DialogClose>
                         <Button type="submit" disabled={isSubmitting} className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white">
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Service')}
                         </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 