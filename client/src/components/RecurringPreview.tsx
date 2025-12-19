import { trpc } from "@/lib/trpc";

interface RecurringPreviewProps {
  startDate?: string;
  frequency?: "daily" | "weekly" | "monthly";
  interval?: number;
  daysOfWeek?: number[];
  endDate?: string;
  occurrences?: number;
}

export function RecurringPreview({
  startDate,
  frequency,
  interval = 1,
  daysOfWeek,
  endDate,
  occurrences,
}: RecurringPreviewProps) {
  const { data: preview, isLoading } = trpc.events.previewRecurring.useQuery(
    {
      startDate: startDate ? new Date(startDate) : new Date(),
      recurrencePattern: frequency
        ? {
            frequency,
            interval,
            daysOfWeek,
            endDate: endDate ? new Date(endDate) : undefined,
            occurrences,
          }
        : undefined,
    },
    {
      enabled: !!startDate && !!frequency,
    }
  );

  if (!startDate || !frequency) {
    return (
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">📅 Preview</p>
        <p className="text-sm text-muted-foreground">
          Select frequency and start date to see preview
        </p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">📅 Preview</p>
        <p className="text-sm text-muted-foreground">Loading preview...</p>
      </div>
    );
  }

  if (!preview || preview.length === 0) {
    return (
      <div className="bg-muted/30 p-4 rounded-lg">
        <p className="text-sm font-medium mb-2">📅 Preview</p>
        <p className="text-sm text-destructive">
          No events will be generated with these settings. Please adjust your recurrence pattern.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-muted/30 p-4 rounded-lg">
      <p className="text-sm font-medium mb-2">
        📅 Preview ({preview.length} event{preview.length !== 1 ? "s" : ""})
      </p>
      <div className="space-y-2">
        <div className="flex flex-wrap gap-2">
          {preview.slice(0, 10).map((date: string, index: number) => (
            <span
              key={index}
              className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
            >
              {new Date(date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          ))}
          {preview.length > 10 && (
            <span className="text-xs text-muted-foreground px-2 py-1">
              +{preview.length - 10} more
            </span>
          )}
        </div>
        {preview.length > 10 && (
          <p className="text-xs text-muted-foreground mt-2">
            Showing first 10 of {preview.length} events
          </p>
        )}
      </div>
    </div>
  );
}
