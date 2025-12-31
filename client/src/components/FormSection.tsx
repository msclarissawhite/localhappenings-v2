import { Card } from "@/components/ui/card";
import { ReactNode } from "react";

interface FormSectionProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}

export function FormSection({
  stepNumber,
  title,
  description,
  children,
  className = "",
  highlight = false,
}: FormSectionProps) {
  return (
    <Card className={`p-6 ${highlight ? "border-2 border-primary/20" : ""} ${className}`}>
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
            {stepNumber}
          </div>
          <h2 className="text-xl font-semibold">{title}</h2>
        </div>
        {description && (
          <p className="text-sm text-muted-foreground ml-11">{description}</p>
        )}
      </div>
      <div className="space-y-4">
        {children}
      </div>
    </Card>
  );
}
