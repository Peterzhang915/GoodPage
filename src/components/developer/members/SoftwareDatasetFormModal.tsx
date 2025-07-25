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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; // Import Select components
import { ArtefactType } from '@prisma/client'; // Import enum for select options
import { type SoftwareDatasetFormData } from '@/app/actions/softwareDatasetActions';
import type { SoftwareDataset } from '@prisma/client';

// Client-side Zod schema
const SoftwareDatasetFormSchema = z.object({
    title: z.string().min(1, "Title cannot be empty."),
    description: z.string().optional().nullable(),
    type: z.nativeEnum(ArtefactType),
    repositoryUrl: z.string().url("Invalid URL format for repository link.").optional().or(z.literal('')).nullable(),
    projectUrl: z.string().url("Invalid URL format for project link.").optional().or(z.literal('')).nullable(),
    license: z.string().optional().nullable(),
    version: z.string().optional().nullable(),
    status: z.string().optional().nullable(),
});

interface SoftwareDatasetFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: SoftwareDatasetFormData, recordId?: number) => Promise<void>;
    initialData?: Partial<SoftwareDataset> | null;
    memberId: string;
}

export function SoftwareDatasetFormModal({ isOpen, onClose, onSubmit, initialData, memberId }: SoftwareDatasetFormModalProps) {
    const isEditing = !!initialData?.id;

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<SoftwareDatasetFormData>({
        resolver: zodResolver(SoftwareDatasetFormSchema),
        defaultValues: {
            title: initialData?.title ?? '',
            description: initialData?.description ?? '',
            type: initialData?.type ?? ArtefactType.SOFTWARE,
            repositoryUrl: initialData?.repository_url ?? '',
            projectUrl: initialData?.project_url ?? '',
            license: initialData?.license ?? '',
            version: initialData?.version ?? '',
            status: initialData?.status ?? '',
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                title: initialData?.title ?? '',
                description: initialData?.description ?? '',
                type: initialData?.type ?? ArtefactType.SOFTWARE,
                repositoryUrl: initialData?.repository_url ?? '',
                projectUrl: initialData?.project_url ?? '',
                license: initialData?.license ?? '',
                version: initialData?.version ?? '',
                status: initialData?.status ?? '',
            });
        }
    }, [initialData, isOpen, reset]);

    const handleFormSubmit = async (data: SoftwareDatasetFormData) => {
        await onSubmit(data, initialData?.id);
    };

    // Helper function to format enum keys
    const formatArtefactType = (type: ArtefactType) => {
        return type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg dark:bg-gray-850 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="text-green-600 dark:text-green-400 text-xl font-semibold">{isEditing ? 'Edit' : 'Add'} Software/Dataset</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4 max-h-[70vh] overflow-y-auto px-6">
                    {/* Title */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right dark:text-gray-300">Title*</Label>
                        <Input
                            id="title"
                            {...register("title")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            aria-invalid={errors.title ? "true" : "false"}
                        />
                        {errors.title && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.title.message}</p>}
                    </div>

                    {/* Description */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="description" className="text-right dark:text-gray-300">Description</Label>
                        <Textarea
                            id="description"
                            {...register("description")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100 resize-y min-h-[60px]"
                            rows={3}
                        />
                    </div>

                    {/* Type (Select Dropdown) */}
                    <div className="grid grid-cols-4 items-center gap-4">
                         <Label htmlFor="type" className="text-right dark:text-gray-300">Type*</Label>
                         <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} defaultValue={field.value} value={field.value}>
                                    <SelectTrigger className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100">
                                        <SelectValue placeholder="Select type..." />
                                    </SelectTrigger>
                                    <SelectContent className="dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
                                        {Object.values(ArtefactType).map(typeValue => (
                                            <SelectItem key={typeValue} value={typeValue} className="dark:hover:bg-gray-700 dark:focus:bg-gray-700">
                                                {formatArtefactType(typeValue)}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            )}
                        />
                         {errors.type && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.type.message}</p>}
                    </div>

                    {/* Repository URL */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="repositoryUrl" className="text-right dark:text-gray-300">Repo URL</Label>
                        <Input
                            id="repositoryUrl"
                            type="url"
                            {...register("repositoryUrl")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="https://github.com/..."
                            aria-invalid={errors.repositoryUrl ? "true" : "false"}
                        />
                        {errors.repositoryUrl && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.repositoryUrl.message}</p>}
                    </div>

                    {/* Project URL */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="projectUrl" className="text-right dark:text-gray-300">Project URL</Label>
                        <Input
                            id="projectUrl"
                            type="url"
                            {...register("projectUrl")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="https://project-site.com/..."
                            aria-invalid={errors.projectUrl ? "true" : "false"}
                        />
                        {errors.projectUrl && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.projectUrl.message}</p>}
                    </div>

                    {/* License */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="license" className="text-right dark:text-gray-300">License</Label>
                        <Input
                            id="license"
                            {...register("license")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="e.g., MIT, Apache 2.0"
                        />
                    </div>

                    {/* Version */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="version" className="text-right dark:text-gray-300">Version</Label>
                        <Input
                            id="version"
                            {...register("version")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="e.g., v1.0.0"
                        />
                    </div>

                     {/* Status */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="status" className="text-right dark:text-gray-300">Status</Label>
                        <Input
                            id="status"
                            {...register("status")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="e.g., Active, Beta, Archived"
                        />
                    </div>

                    <DialogFooter className="mt-4">
                         <DialogClose asChild>
                             <Button type="button" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
                         </DialogClose>
                         <Button type="submit" disabled={isSubmitting} className="bg-green-600 hover:bg-green-700 dark:bg-green-500 dark:hover:bg-green-600 dark:text-white">
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Artefact')}
                         </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 