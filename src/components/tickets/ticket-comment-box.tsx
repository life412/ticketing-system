"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addCommentSchema, AddCommentInput } from "@/lib/validations/ticket";
import { addComment } from "@/actions/ticket";
import { MessageSquare, Send, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CommentBoxProps {
  ticketId: string;
}

export default function TicketCommentBox({ ticketId }: CommentBoxProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AddCommentInput>({
    resolver: zodResolver(addCommentSchema),
    defaultValues: {
      ticketId,
      text: "",
    },
  });

  const onSubmit = async (data: AddCommentInput) => {
    setIsSubmitting(true);
    setServerError(null);

    try {
      const res = await addComment(data);
      if (!res.success) {
        setServerError(res.error || "Failed to post comment.");
      } else {
        reset({ ticketId, text: "" });
        window.location.reload();
      }
    } catch (err) {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800/80 shadow-xl space-y-4 backdrop-blur-md">
      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-blue-400" /> Post a Comment or Response
      </h4>

      {serverError && (
        <div className="flex items-center gap-2 p-3 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 text-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{serverError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <input type="hidden" {...register("ticketId")} value={ticketId} />

        <div className="space-y-1">
          <textarea
            rows={3}
            placeholder="Type your comment, update, or question..."
            {...register("text")}
            className="flex w-full rounded-xl border border-slate-800 bg-slate-950/80 p-3 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-blue-500"
          />
          {errors.text && <p className="text-xs text-red-400">{errors.text.message}</p>}
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                Posting...
              </>
            ) : (
              <>
                <Send className="h-3.5 w-3.5" />
                Post Comment
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
