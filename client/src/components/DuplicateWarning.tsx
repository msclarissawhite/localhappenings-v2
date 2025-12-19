import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import { format } from "date-fns";

interface DuplicateWarningProps {
  eventId: number;
  eventName: string;
  startDate: Date;
  province: string;
  municipality: string;
  venue?: string | null;
}

export function DuplicateWarning({
  eventId,
  eventName,
  startDate,
  province,
  municipality,
  venue,
}: DuplicateWarningProps) {
  const [showDetails, setShowDetails] = useState(false);

  const { data: duplicates, isLoading } = trpc.events.checkDuplicates.useQuery({
    eventId,
    name: eventName,
    startDate: new Date(startDate),
    province,
    municipality,
    venue,
  });

  if (isLoading || !duplicates || duplicates.length === 0) {
    return null;
  }

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle className="flex items-center justify-between">
        <span>⚠️ Potential Duplicate Detected</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="h-6 px-2"
        >
          {showDetails ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              Hide
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              Show {duplicates.length} similar event{duplicates.length > 1 ? "s" : ""}
            </>
          )}
        </Button>
      </AlertTitle>
      <AlertDescription>
        <p className="mb-2">
          This event may be a duplicate of existing event(s) with similar name, date, and location.
        </p>

        {showDetails && (
          <div className="mt-4 space-y-3">
            {duplicates.map((dup) => (
              <div
                key={dup.id}
                className="p-3 bg-background rounded border border-border"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm">{dup.name}</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(dup.startDate), "MMM d, yyyy")} •{" "}
                      {dup.venue || "No venue"} • {dup.municipality}, {dup.province}
                    </p>
                  </div>
                  <div className="flex gap-2 items-center ml-4">
                    <Badge
                      variant={
                        dup.status === "published"
                          ? "default"
                          : dup.status === "pending"
                          ? "secondary"
                          : "outline"
                      }
                    >
                      {dup.status}
                    </Badge>
                    <Badge variant="outline">{dup.similarity}% match</Badge>
                  </div>
                </div>
                <a
                  href={`/admin#event-${dup.id}`}
                  className="text-xs text-primary hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  View event #{dup.id} →
                </a>
              </div>
            ))}
            <p className="text-xs text-muted-foreground mt-3">
              💡 <strong>Tip:</strong> Review these events carefully before approving. If this is
              truly a duplicate, consider rejecting it and contacting the organizer.
            </p>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
