"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TicketPriority, TicketCategory } from "@prisma/client";
import { createTicketSchema, CreateTicketInput } from "@/lib/validations/ticket";
import { createTicket } from "@/actions/ticket";
import { Ticket, ArrowLeft, Loader2, AlertCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function CreateTicketPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateTicketInput>({
    resolver: zodResolver(createTicketSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: TicketPriority.MEDIUM,
      category: TicketCategory.IT_SUPPORT,
    },
  });

  const onSubmit = async (data: CreateTicketInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const result = await createTicket(data);
      if (!result.success) {
        setServerError(result.error || "Failed to create support ticket.");
      } else {
        router.push("/tickets");
        router.refresh();
      }
    } catch (err) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-8">
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Back Link */}
        <Link
          href="/tickets"
          className="inline-flex items-center gap-2 text-xs font-medium text-slate-400 hover:text-slate-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Back to Ticket List
        </Link>

        {/* Page Card */}
        <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
              New Ticket Request
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">
              Submit Support Ticket
            </h1>
            <p className="text-xs text-slate-400">
              Provide complete details regarding the issue to route it to the appropriate team.
            </p>
          </div>

          {serverError && (
            <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{serverError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Issue Title *</Label>
              <Input
                id="title"
                placeholder="e.g. Cannot connect to office printer or network drive"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-xs text-red-400">{errors.title.message}</p>
              )}
            </div>

            {/* Category & Priority Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Category Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  {...register("category")}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={TicketCategory.IT_SUPPORT}>IT Support</option>
                  <option value={TicketCategory.FACILITIES}>Facilities</option>
                  <option value={TicketCategory.HR}>HR</option>
                  <option value={TicketCategory.OTHER}>Other</option>
                </select>
                {errors.category && (
                  <p className="text-xs text-red-400">{errors.category.message}</p>
                )}
              </div>

              {/* Priority Dropdown */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <select
                  id="priority"
                  {...register("priority")}
                  className="flex h-10 w-full rounded-md border border-slate-800 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500"
                >
                  <option value={TicketPriority.LOW}>Low</option>
                  <option value={TicketPriority.MEDIUM}>Medium</option>
                  <option value={TicketPriority.HIGH}>High</option>
                  <option value={TicketPriority.CRITICAL}>Critical</option>
                </select>
                {errors.priority && (
                  <p className="text-xs text-red-400">{errors.priority.message}</p>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Detailed Description *</Label>
              <textarea
                id="description"
                rows={5}
                placeholder="Describe what happened, error codes, steps to reproduce, and affected devices..."
                {...register("description")}
                className="flex w-full rounded-md border border-slate-800 bg-slate-900/80 p-3 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
              />
              {errors.description && (
                <p className="text-xs text-red-400">{errors.description.message}</p>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <Link href="/tickets">
                <Button type="button" variant="outline" className="border-slate-800 text-slate-300">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting Ticket...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Ticket
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
