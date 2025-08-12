"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Loader2, Save, XCircle } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PublicationType } from "@prisma/client";

// Zod验证模式 - 完全按照old版本PublicationForm.tsx
const publicationFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required." }),
  year: z.coerce
    .number()
    .int()
    .min(1900, { message: "Year must be 1900 or later." })
    .max(new Date().getFullYear() + 5, {
      message: "Year seems too far in the future.",
    }),
  venue: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  ccf_rank: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  authors_full_string: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  pdf_url: z
    .string()
    .url({ message: "Please enter a valid URL." })
    .nullable()
    .optional()
    .transform((val) => (val === "" ? null : val)),
  type: z.nativeEnum(PublicationType).optional(),
});

// 推断TypeScript类型
export type PublicationFormData = z.infer<typeof publicationFormSchema>;

// 组件属性定义
interface PublicationFormProps {
  initialData?: Partial<PublicationFormData> & { id?: number };
  onSubmit: (data: PublicationFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

/**
 * 出版物表单组件
 * 完全按照old版本PublicationForm.tsx的功能实现
 * 使用shadcn/ui组件和react-hook-form
 */
export const PublicationForm: React.FC<PublicationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading: isSubmitting = false,
}) => {
  // 设置react-hook-form，使用明确的类型和简化的默认值
  const form = useForm<PublicationFormData>({
    resolver: zodResolver(publicationFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      year: initialData?.year || new Date().getFullYear(),
      venue: initialData?.venue ?? null,
      ccf_rank: initialData?.ccf_rank ?? null,
      authors_full_string: initialData?.authors_full_string ?? null,
      pdf_url: initialData?.pdf_url ?? null,
      type: initialData?.type ?? PublicationType.CONFERENCE,
    },
  });

  const handleFormSubmit = async (data: PublicationFormData) => {
    await onSubmit(data);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* 标题字段（必填） */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>
                Title <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter publication title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 年份字段（必填） */}
        <FormField
          control={form.control}
          name="year"
          render={({ field }) => {
            const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
              const value = e.target.value;
              // 允许临时空输入，Zod会强制转换和验证
              field.onChange(value === "" ? "" : parseInt(value, 10));
            };
            return (
              <FormItem>
                <FormLabel>
                  Year <span className="text-red-500">*</span>
                </FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder="e.g., 2024"
                    {...field}
                    value={field.value ?? ""} // 如果为null/undefined则渲染空字符串
                    onChange={handleChange}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            );
          }}
        />

        {/* 场所字段（可选） */}
        <FormField
          control={form.control}
          name="venue"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Venue</FormLabel>
              <FormControl>
                <Input
                  placeholder="e.g., ICSE 2024, IEEE TSE"
                  {...field}
                  value={field.value ?? ""} // 如果为null则渲染空字符串
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.value
                    )
                  } // 处理空字符串为null
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* CCF 等级字段（可选） */}
        <FormField
          control={form.control}
          name="ccf_rank"
          render={({ field }) => (
            <FormItem>
              <FormLabel>CCF Rank</FormLabel>
              <Select
                onValueChange={(value) =>
                  field.onChange(value === "none" ? null : value)
                }
                value={field.value ?? "none"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select CCF Rank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="none">other</SelectItem>
                  <SelectItem value="A">CCF A</SelectItem>
                  <SelectItem value="B">CCF B</SelectItem>
                  <SelectItem value="C">CCF C</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 作者完整字符串（可选） */}
        <FormField
          control={form.control}
          name="authors_full_string"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Authors (Full String for Display)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., John Doe*, Jane Smith (Equal Contribution)"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* PDF URL字段（可选） */}
        <FormField
          control={form.control}
          name="pdf_url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>PDF URL</FormLabel>
              <FormControl>
                <Input
                  type="url"
                  placeholder="https://example.com/paper.pdf"
                  {...field}
                  value={field.value ?? ""}
                  onChange={(e) =>
                    field.onChange(
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 类型字段（可选，默认：CONFERENCE） */}
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Type</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value ?? PublicationType.CONFERENCE}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select publication type" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {Object.values(PublicationType).map((typeValue) => (
                    <SelectItem key={typeValue} value={typeValue}>
                      {/* 简单格式化：首字母大写，其余小写 */}
                      {typeValue.charAt(0) +
                        typeValue.slice(1).toLowerCase().replace(/_/g, " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 操作按钮 */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-700">
          {/* 取消按钮 - 与提交按钮相同样式（实心蓝色） */}
          <Button
            type="button"
            onClick={onCancel}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <XCircle size={16} className="mr-2" /> Cancel
          </Button>
          {/* 提交按钮（目标样式） */}
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isSubmitting ? (
              <Loader2 size={16} className="mr-2 animate-spin" />
            ) : (
              <Save size={16} className="mr-2" />
            )}
            {initialData?.id ? "Save Changes" : "Add Publication"}
          </Button>
        </div>
      </form>
    </Form>
  );
};
