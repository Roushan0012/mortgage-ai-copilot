import React from "react";
import Link from "next/link";
import { Clock, Video, Phone, Users, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Meeting } from "@/types";
import { StatusBadge } from "./StatusBadge";
import { Button } from "./Button";

interface MeetingCardProps {
  meeting: Meeting;
  isNextMeeting?: boolean;
  className?: string;
}

export function MeetingCard({
  meeting,
  isNextMeeting = false,
  className,
}: MeetingCardProps) {
  const isLive = meeting.status === "in_progress";
  const isCompleted = meeting.status === "completed";

  const channelIcon = {
    video_call: <Video className="h-3.5 w-3.5 text-slate-400" />,
    phone_call: <Phone className="h-3.5 w-3.5 text-slate-400" />,
    in_person: <Users className="h-3.5 w-3.5 text-slate-400" />,
  }[meeting.meetingChannel] || <Video className="h-3.5 w-3.5 text-slate-400" />;

  return (
    <div
      className={cn(
        "rounded-lg border p-4 transition-all text-left shadow-xs",
        isLive
          ? "border-rose-300 bg-rose-50/20 ring-1 ring-rose-200"
          : isNextMeeting
          ? "border-blue-300 bg-blue-50/15"
          : "border-slate-200 bg-white hover:border-slate-300",
        className
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left Info */}
        <div className="space-y-1.5 flex-1">
          {/* Top Status & Timing Row */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={meeting.status} />

            <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono font-medium">
              <Clock className="h-3.5 w-3.5 text-slate-400" />
              <span>{meeting.timeSlot || "Scheduled"}</span>
            </div>

            <div className="flex items-center space-x-1 text-xs text-slate-500">
              {channelIcon}
              <span className="capitalize">{meeting.meetingChannel.replace(/_/g, " ")}</span>
            </div>

            {isNextMeeting && (
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-900 text-white px-2 py-0.5 rounded">
                Next Up
              </span>
            )}
          </div>

          {/* Borrower Names & Purpose */}
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              {meeting.borrowerNames || meeting.title}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {meeting.purposeDescription || meeting.title}
              {meeting.targetPurchaseTimeline && (
                <span className="text-slate-500">
                  {" "}• Timeline: {meeting.targetPurchaseTimeline}
                </span>
              )}
            </p>
          </div>

          {/* Attention / Priority Tags */}
          {meeting.attentionFlags && meeting.attentionFlags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Attention:
              </span>
              {meeting.attentionFlags.map((flag) => (
                <StatusBadge key={flag} status={flag} size="sm" />
              ))}
            </div>
          )}
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-2 shrink-0 sm:self-center">
          {isLive ? (
            <>
              <Link href={`/meeting/${meeting.id}/live`}>
                <Button size="sm" className="bg-rose-600 hover:bg-rose-700 text-white flex items-center space-x-1">
                  <span>Enter Live Cockpit</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
              <Link href={`/meeting/${meeting.id}`}>
                <Button size="sm" variant="outline">
                  Briefing
                </Button>
              </Link>
            </>
          ) : isCompleted ? (
            <Link href={`/meeting/${meeting.id}/summary`}>
              <Button size="sm" variant="outline">
                View Summary
              </Button>
            </Link>
          ) : (
            <>
              <Link href={`/meeting/${meeting.id}`}>
                <Button size="sm" className="bg-slate-900 text-white flex items-center space-x-1">
                  <span>Prepare Briefing</span>
                  <ArrowRight className="h-3.5 w-3.5 ml-1" />
                </Button>
              </Link>
              <Link href={`/meeting/${meeting.id}/live`}>
                <Button size="sm" variant="outline">
                  Start Early
                </Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
