import React from "react";
import { cn } from "@/lib/utils";
import { Button } from "./Button";

interface ActionButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon?: React.ReactNode;
  label: string;
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md";
  shortcut?: string;
}

export function ActionButton({
  icon,
  label,
  variant = "outline",
  size = "sm",
  shortcut,
  className,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      variant={variant}
      size={size}
      className={cn("flex items-center space-x-1.5 font-medium cursor-pointer", className)}
      {...props}
    >
      {icon}
      <span>{label}</span>
      {shortcut && (
        <kbd className="ml-1.5 px-1.5 py-0.2 text-[9px] bg-slate-100 text-slate-500 rounded font-mono border border-slate-200">
          {shortcut}
        </kbd>
      )}
    </Button>
  );
}
