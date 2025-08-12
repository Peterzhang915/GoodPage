"use client";

import React from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { Education } from "@prisma/client";
import { X, Loader2, Save, AlertTriangle } from "lucide-react";

// Define the shape of the form data for Education
type EducationFormData = Partial<
  Omit<Education, "id" | "member_id" | "member">
>;

interface EducationModalProps {
  isOpen: boolean;
  onClose: () => void;
  memberId: string;
  educationId: number | null; // null for adding, number for editing
  onSuccess: () => void; // Callback to refresh the list
}

const EducationModal: React.FC<EducationModalProps> = ({
  isOpen,
  onClose,
  memberId,
  educationId,
  onSuccess,
}) => {
  const [isLoadingData, setIsLoadingData] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);
  const [apiError, setApiError] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<EducationFormData>();

  // --- Fetch existing data if editing ---
  React.useEffect(() => {
    if (isOpen && educationId !== null) {
      const fetchEducationData = async () => {
        setIsLoadingData(true);
        setApiError(null);
        try {
          const res = await fetch(
            `/api/members/${memberId}/education/${educationId}`
          );
          if (!res.ok) throw new Error("Failed to fetch education data");
          const result = await res.json();
          if (result.success && result.data) {
            reset(result.data); // Populate form with existing data
          } else {
            throw new Error(
              result.error?.message || "Failed to parse education data"
            );
          }
        } catch (err) {
          console.error("Fetch education error:", err);
          setApiError(
            err instanceof Error ? err.message : "Error loading data"
          );
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchEducationData();
    } else if (isOpen && educationId === null) {
      // Reset form for adding new entry
      reset({
        degree: "",
        field: "",
        school: "",
        start_year: undefined,
        end_year: undefined,
        thesis_title: "",
        description: "",
        display_order: 0,
      });
      setApiError(null);
      setIsLoadingData(false);
    }
  }, [isOpen, educationId, memberId, reset]);

  // --- Handle form submission (Create or Update) ---
  const onSubmit: SubmitHandler<EducationFormData> = async (data) => {
    setIsSaving(true);
    setApiError(null);
    const url =
      educationId !== null
        ? `/api/members/${memberId}/education/${educationId}` // Update URL
        : `/api/members/${memberId}/education`; // Create URL
    const method = educationId !== null ? "PATCH" : "POST";

    try {
      // Ensure year fields are numbers or null
      const payload: EducationFormData = {
        ...data,
        start_year: data.start_year ? Number(data.start_year) : null,
        end_year: data.end_year ? Number(data.end_year) : null,
        display_order: data.display_order ? Number(data.display_order) : 0, // Ensure display_order is a number
      };

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        let errorMsg = `Failed to save education (Status: ${res.status})`;
        try {
          const errorData = await res.json();
          if (errorData?.error?.message) errorMsg = errorData.error.message;
        } catch (e) {
          /*ignore*/
        }
        throw new Error(errorMsg);
      }
      const result = await res.json();
      if (result.success) {
        onSuccess(); // Call the success callback (e.g., refresh list)
        onClose(); // Close the modal
      } else {
        throw new Error(
          result.error?.message || "Failed to save education data."
        );
      }
    } catch (err) {
      console.error("Save education error:", err);
      setApiError(err instanceof Error ? err.message : "Error saving data");
    } finally {
      setIsSaving(false);
    }
  };

  // Basic Modal Structure (replace with your actual modal component if using a library)
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-2xl border border-gray-700 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex justify-between items-center mb-4 border-b border-gray-700 pb-3">
          <h3 className="text-xl font-semibold text-green-400">
            {educationId !== null
              ? "Edit Education Record"
              : "Add Education Record"}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        {isLoadingData ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-6 w-6 text-indigo-400 animate-spin" />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Degree */}
            <div>
              <label
                htmlFor="degree"
                className="block text-sm font-medium text-gray-300"
              >
                Degree *
              </label>
              <input
                type="text"
                id="degree"
                {...register("degree", { required: "Degree is required" })}
                className={`mt-1 block w-full input-style ${errors.degree ? "border-red-500" : "border-gray-600"}`}
                disabled={isSaving}
              />
              {errors.degree && (
                <p className="error-message">{errors.degree.message}</p>
              )}
            </div>
            {/* School */}
            <div>
              <label
                htmlFor="school"
                className="block text-sm font-medium text-gray-300"
              >
                School *
              </label>
              <input
                type="text"
                id="school"
                {...register("school", { required: "School is required" })}
                className={`mt-1 block w-full input-style ${errors.school ? "border-red-500" : "border-gray-600"}`}
                disabled={isSaving}
              />
              {errors.school && (
                <p className="error-message">{errors.school.message}</p>
              )}
            </div>
            {/* Field */}
            <div>
              <label
                htmlFor="field"
                className="block text-sm font-medium text-gray-300"
              >
                Field of Study
              </label>
              <input
                type="text"
                id="field"
                {...register("field")}
                className={`mt-1 block w-full input-style ${errors.field ? "border-red-500" : "border-gray-600"}`}
                disabled={isSaving}
              />
              {errors.field && (
                <p className="error-message">{errors.field.message}</p>
              )}
            </div>
            {/* Start Year / End Year (inline) */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="start_year"
                  className="block text-sm font-medium text-gray-300"
                >
                  Start Year
                </label>
                <input
                  type="number"
                  id="start_year"
                  {...register("start_year", {
                    valueAsNumber: true,
                    min: 1950,
                  })}
                  className={`mt-1 block w-full input-style ${errors.start_year ? "border-red-500" : "border-gray-600"}`}
                  disabled={isSaving}
                  placeholder="YYYY"
                />
                {errors.start_year && (
                  <p className="error-message">{errors.start_year.message}</p>
                )}
              </div>
              <div>
                <label
                  htmlFor="end_year"
                  className="block text-sm font-medium text-gray-300"
                >
                  End Year
                </label>
                <input
                  type="number"
                  id="end_year"
                  {...register("end_year", { valueAsNumber: true, min: 1950 })}
                  className={`mt-1 block w-full input-style ${errors.end_year ? "border-red-500" : "border-gray-600"}`}
                  disabled={isSaving}
                  placeholder="YYYY (or leave blank)"
                />
                {errors.end_year && (
                  <p className="error-message">{errors.end_year.message}</p>
                )}
              </div>
            </div>
            {/* Thesis Title */}
            <div>
              <label
                htmlFor="thesis_title"
                className="block text-sm font-medium text-gray-300"
              >
                Thesis Title
              </label>
              <input
                type="text"
                id="thesis_title"
                {...register("thesis_title")}
                className={`mt-1 block w-full input-style ${errors.thesis_title ? "border-red-500" : "border-gray-600"}`}
                disabled={isSaving}
              />
              {errors.thesis_title && (
                <p className="error-message">{errors.thesis_title.message}</p>
              )}
            </div>
            {/* Description */}
            <div>
              <label
                htmlFor="description"
                className="block text-sm font-medium text-gray-300"
              >
                Description
              </label>
              <textarea
                id="description"
                rows={3}
                {...register("description")}
                className={`mt-1 block w-full input-style resize-y ${errors.description ? "border-red-500" : "border-gray-600"}`}
                disabled={isSaving}
              ></textarea>
              {errors.description && (
                <p className="error-message">{errors.description.message}</p>
              )}
            </div>
            {/* Display Order (Optional, maybe hidden or for admin only later) */}
            <div>
              <label
                htmlFor="display_order"
                className="block text-sm font-medium text-gray-300"
              >
                Display Order
              </label>
              <input
                type="number"
                id="display_order"
                defaultValue={0}
                {...register("display_order", { valueAsNumber: true })}
                className={`mt-1 block w-full input-style ${errors.display_order ? "border-red-500" : "border-gray-600"}`}
                disabled={isSaving}
              />
              {errors.display_order && (
                <p className="error-message">{errors.display_order.message}</p>
              )}
            </div>

            {/* API Error Display */}
            {apiError && (
              <div className="text-red-400 text-sm flex items-center">
                <AlertTriangle size={16} className="mr-1" /> Error: {apiError}
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving || !isDirty || isLoadingData}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500 disabled:opacity-50 flex items-center disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />{" "}
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} className="mr-2" /> Save Education
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
      {/* Add helper classes for shared styles */}
      <style jsx>{`
        .input-style {
          background-color: #374151; /* bg-gray-700 */
          border-width: 1px;
          border-radius: 0.375rem; /* rounded-md */
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
          color: #d1d5db; /* text-gray-200 */
          padding: 0.5rem 0.75rem; /* px-3 py-2 */
          font-size: 0.875rem; /* sm:text-sm */
          line-height: 1.25rem; /* sm:text-sm */
        }
        .input-style:focus {
          outline: none;
          --tw-ring-offset-shadow: var(--tw-ring-inset) 0 0 0
            var(--tw-ring-offset-width) var(--tw-ring-offset-color);
          --tw-ring-shadow: var(--tw-ring-inset) 0 0 0
            calc(1px + var(--tw-ring-offset-width)) var(--tw-ring-color);
          box-shadow:
            var(--tw-ring-offset-shadow), var(--tw-ring-shadow),
            var(--tw-shadow, 0 0 #0000);
          border-color: #6366f1; /* focus:border-indigo-500 */
          --tw-ring-color: #6366f1; /* focus:ring-indigo-500 */
        }
        .input-style:disabled {
          opacity: 0.5;
        }
        .error-message {
          margin-top: 0.25rem; /* mt-1 */
          font-size: 0.75rem; /* text-xs */
          color: #f87171; /* text-red-400 */
        }
      `}</style>
    </div>
  );
};

export default EducationModal;
