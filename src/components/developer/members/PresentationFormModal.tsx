'use client';

import React, { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { type PresentationFormData } from '@/app/actions/presentationActions';
import type { Presentation } from '@prisma/client';

// Replicate Zod schema or import if possible and needed for client-side feedback
const PresentationFormSchema = z.object({
    title: z.string().min(1, "Presentation title cannot be empty."),
    eventName: z.string().optional().nullable(),
    conferenceUrl: z.string().url("Invalid URL format for conference link.").optional().or(z.literal('')).nullable(),
    location: z.string().optional().nullable(),
    year: z.coerce.number().int().positive("Year must be a positive integer.").optional().nullable(),
    url: z.string().url("Invalid URL format for slides/video link.").optional().or(z.literal('')).nullable(),
    isInvited: z.boolean(),
});

interface PresentationFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: PresentationFormData, presentationId?: number) => Promise<void>;
    initialData?: Partial<Presentation> | null;
    memberId: string;
}

export function PresentationFormModal({ isOpen, onClose, onSubmit, initialData, memberId }: PresentationFormModalProps) {
    const isEditing = !!initialData?.id;

    const { register, handleSubmit, control, formState: { errors, isSubmitting }, reset } = useForm<PresentationFormData>({
        resolver: zodResolver(PresentationFormSchema),
        defaultValues: {
            title: initialData?.title ?? '',
            eventName: initialData?.event_name ?? '',
            conferenceUrl: initialData?.conference_url ?? '',
            location: initialData?.location ?? '',
            year: initialData?.year ?? null,
            url: initialData?.url ?? '',
            isInvited: Boolean(initialData?.is_invited),
        },
    });

    useEffect(() => {
        if (isOpen) {
            reset({
                title: initialData?.title ?? '',
                eventName: initialData?.event_name ?? '',
                conferenceUrl: initialData?.conference_url ?? '',
                location: initialData?.location ?? '',
                year: initialData?.year ?? null,
                url: initialData?.url ?? '',
                isInvited: Boolean(initialData?.is_invited),
            });
        }
    }, [initialData, isOpen, reset]);

    const handleFormSubmit = async (data: PresentationFormData) => {
        await onSubmit(data, initialData?.id);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md dark:bg-gray-850 dark:border-gray-700">
                <DialogHeader>
                    <DialogTitle className="dark:text-gray-100">{isEditing ? 'Edit' : 'Add'} Presentation</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit(handleFormSubmit)} className="grid gap-4 py-4">
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

                    {/* Event Name */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="eventName" className="text-right dark:text-gray-300">Event Name</Label>
                        <Input
                            id="eventName"
                            {...register("eventName")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                    </div>

                    {/* Conference URL */}
                     <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="conferenceUrl" className="text-right dark:text-gray-300">Conf. URL</Label>
                        <Input
                            id="conferenceUrl"
                            type="url"
                            {...register("conferenceUrl")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                             placeholder="https://..."
                             aria-invalid={errors.conferenceUrl ? "true" : "false"}
                        />
                         {errors.conferenceUrl && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.conferenceUrl.message}</p>}
                    </div>

                    {/* Location */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="location" className="text-right dark:text-gray-300">Location</Label>
                        <Input
                            id="location"
                            {...register("location")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                        />
                    </div>

                    {/* Year */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="year" className="text-right dark:text-gray-300">Year</Label>
                        <Input
                            id="year"
                            type="number"
                            {...register("year")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                             aria-invalid={errors.year ? "true" : "false"}
                        />
                        {errors.year && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.year.message}</p>}
                    </div>

                    {/* Slides/Video URL */}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="url" className="text-right dark:text-gray-300">Slides/Video URL</Label>
                        <Input
                            id="url"
                            type="url"
                            {...register("url")}
                            className="col-span-3 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                            placeholder="https://..."
                            aria-invalid={errors.url ? "true" : "false"}
                        />
                        {errors.url && <p className="col-span-4 text-sm text-red-500 dark:text-red-400 text-right">{errors.url.message}</p>}
                    </div>

                    {/* Is Invited Checkbox */}
                    <div className="grid grid-cols-4 items-center gap-4">
                       <Label htmlFor="isInvited" className="text-right dark:text-gray-300 col-span-1">Invited Talk</Label>
                       <div className="col-span-3 flex items-center">
                           <Controller
                                name="isInvited"
                                control={control}
                                render={({ field }) => (
                                    <Checkbox
                                        id="isInvited"
                                        checked={field.value}
                                        onCheckedChange={field.onChange}
                                        className="dark:border-gray-600 data-[state=checked]:dark:bg-indigo-600 data-[state=checked]:dark:text-white"
                                    />
                                )}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                         <DialogClose asChild>
                             <Button type="button" variant="outline" className="dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700">Cancel</Button>
                         </DialogClose>
                         <Button type="submit" disabled={isSubmitting} className="dark:bg-indigo-600 dark:hover:bg-indigo-700 dark:text-white">
                            {isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Add Presentation')}
                         </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
} 