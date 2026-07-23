"use client";

import { ActionType, TicketStatus } from "@prisma/client";
import {
  MessageSquare,
  UserCheck,
  RefreshCw,
  Play,
  CheckCircle2,
  Lock,
  PlusCircle,
  Clock,
  Shield,
} from "lucide-react";

interface ActivityTimelineProps {
  activities: any[];
}

export default function TicketActivityTimeline({ activities }: ActivityTimelineProps) {
  if (!activities || activities.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 space-y-2">
        <Clock className="h-8 w-8 text-slate-600 mx-auto" />
        <p className="text-xs text-slate-400">No activity recorded for this ticket yet.</p>
      </div>
    );
  }

  const getSystemIcon = (act: any) => {
    if (act.actionType === ActionType.ASSIGNMENT) {
      return <UserCheck className="h-4 w-4 text-purple-400" />;
    }
    switch (act.newStatus) {
      case TicketStatus.OPEN:
        return <PlusCircle className="h-4 w-4 text-blue-400" />;
      case TicketStatus.ASSIGNED:
        return <UserCheck className="h-4 w-4 text-purple-400" />;
      case TicketStatus.IN_PROGRESS:
        return <Play className="h-4 w-4 text-blue-400" />;
      case TicketStatus.RESOLVED:
        return <CheckCircle2 className="h-4 w-4 text-emerald-400" />;
      case TicketStatus.CLOSED:
        return <Lock className="h-4 w-4 text-slate-400" />;
      default:
        return <RefreshCw className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 className="font-bold text-sm text-slate-200 tracking-tight flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-400" /> Activity Timeline & Discussion
        </h3>
        <span className="text-xs font-mono text-slate-500">{activities.length} Events</span>
      </div>

      <div className="space-y-4">
        {activities.map((act) => {
          const isComment = act.actionType === ActionType.COMMENT;

          if (isComment) {
            // Render User Chat Bubble for Comments
            return (
              <div key={act.id} className="flex items-start gap-3 group">
                <div className="h-9 w-9 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-bold text-xs shrink-0 mt-1">
                  {act.user?.name ? act.user.name[0].toUpperCase() : act.user?.email[0].toUpperCase()}
                </div>

                <div className="flex-1 p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 shadow-md space-y-1.5 backdrop-blur-md group-hover:border-slate-700 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-200">
                        {act.user?.name || act.user?.email}
                      </span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-bold bg-slate-800 text-slate-400 uppercase">
                        {act.user?.role}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {new Date(act.createdAt).toLocaleString(undefined, {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-wrap">{act.text}</p>
                </div>
              </div>
            );
          }

          // Render System Status Change / Assignment Event Line
          return (
            <div key={act.id} className="flex items-center gap-3 my-3">
              <div className="h-0.5 flex-1 bg-slate-800/60" />
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-400 shadow-sm backdrop-blur-md">
                {getSystemIcon(act)}
                <span className="font-medium text-slate-300">{act.user?.name || act.user?.email}</span>
                <span>{act.text}</span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(act.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
              <div className="h-0.5 flex-1 bg-slate-800/60" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
