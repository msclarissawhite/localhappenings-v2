import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, CheckCircle2, XCircle, AlertCircle } from "lucide-react";
import { trpc } from "@/lib/trpc";
import JSZip from "jszip";

interface ParsedEvent {
  name: string;
  description: string;
  province: string;
  municipality: string;
  neighborhoodCommunity?: string;
  venue?: string;
  address?: string;
  startDate: string;
  endDate?: string;
  timeOfDay?: "morning" | "afternoon" | "evening" | "all-day";
  isRecurring: boolean;
  recurrenceType?: "one-time" | "weekly" | "monthly" | "seasonal";
  isFree: boolean;
  costMin?: number;
  costMax?: number;
  costType?: "fixed" | "range" | "donation" | "pay-what-you-can" | "sliding-scale";
  kidsFree: boolean;
  freeCompanion: boolean;
  allAges: boolean;
  familyFriendly: boolean;
  youngChildren: boolean;
  kids: boolean;
  teens: boolean;
  adultsOnly: boolean;
  seniors: boolean;
  isIndoor: boolean;
  isOutdoor: boolean;
  shortDuration: boolean;
  dropIn: boolean;
  canReenter: boolean;
  accessibility: string;
  organizerName?: string;
  organizerType?: "business" | "nonprofit" | "community" | "municipality" | "school-library" | "other";
  organizerEmail?: string;
  organizerPhone?: string;
  organizerWebsite?: string;
  displayOrganizerInfo: boolean;
  notes?: string;
  imageUrl?: string;
  imageFileName?: string; // For ZIP uploads
  imageData?: string; // Base64 image data from ZIP
}

export function BulkUpload({ onComplete }: { onComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedEvents, setParsedEvents] = useState<ParsedEvent[]>([]);
  const [parseErrors, setParseErrors] = useState<string[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{ success: number[]; failed: { index: number; error: string }[] } | null>(null);

  const bulkImportMutation = trpc.events.bulkImport.useMutation();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Check if it's a ZIP file
    if (selectedFile.name.endsWith(".zip")) {
      await parseZIP(selectedFile);
    } else if (selectedFile.type === "text/csv" || selectedFile.name.endsWith(".csv")) {
      await parseCSV(selectedFile);
    } else {
      alert("Please select a valid CSV or ZIP file");
    }
  };

  const parseZIP = async (file: File) => {
    try {
      const zip = new JSZip();
      const contents = await zip.loadAsync(file);
      
      // Find CSV file in ZIP
      let csvFile: JSZip.JSZipObject | null = null;
      const imageFiles: { [key: string]: JSZip.JSZipObject } = {};
      
      contents.forEach((relativePath, zipEntry) => {
        if (relativePath.endsWith(".csv") && !csvFile) {
          csvFile = zipEntry;
        } else if (relativePath.match(/\.(jpg|jpeg|png|webp)$/i)) {
          // Store images by filename (without path)
          const filename = relativePath.split("/").pop() || relativePath;
          imageFiles[filename.toLowerCase()] = zipEntry;
        }
      });

      if (!csvFile) {
        setParseErrors(["No CSV file found in ZIP archive"]);
        return;
      }

      // Parse CSV content
      const csvText = await csvFile.async("text");
      await parseCSVContent(csvText, imageFiles);
    } catch (error) {
      console.error("ZIP parsing error:", error);
      setParseErrors(["Failed to parse ZIP file. Please ensure it's a valid ZIP archive."]);
    }
  };

  const parseCSV = async (file: File) => {
    const text = await file.text();
    await parseCSVContent(text, {});
  };

  const parseCSVContent = async (text: string, imageFiles: { [key: string]: JSZip.JSZipObject }) => {
    const lines = text.split("\n").filter(line => line.trim());
    
    if (lines.length < 2) {
      setParseErrors(["CSV file is empty or has no data rows"]);
      return;
    }

    const headers = lines[0].split(",").map(h => h.trim());
    const events: ParsedEvent[] = [];
    const errors: string[] = [];

    for (let i = 1; i < lines.length; i++) {
      try {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || "";
        });

        // Parse accessibility JSON
        let accessibility = {};
        try {
          if (row.accessibility) {
            accessibility = JSON.parse(row.accessibility);
          }
        } catch {
          errors.push(`Row ${i}: Invalid accessibility JSON`);
          continue;
        }

        const event: ParsedEvent = {
          name: row.name,
          description: row.description,
          province: row.province,
          municipality: row.municipality,
          neighborhoodCommunity: row.neighborhoodCommunity || undefined,
          venue: row.venue || undefined,
          address: row.address || undefined,
          startDate: row.startDate,
          endDate: row.endDate || undefined,
          timeOfDay: row.timeOfDay as any || undefined,
          isRecurring: row.isRecurring === "true" || row.isRecurring === "1",
          recurrenceType: row.recurrenceType as any || "one-time",
          isFree: row.isFree === "true" || row.isFree === "1",
          costMin: row.costMin ? parseInt(row.costMin) : undefined,
          costMax: row.costMax ? parseInt(row.costMax) : undefined,
          costType: row.costType as any || undefined,
          kidsFree: row.kidsFree === "true" || row.kidsFree === "1",
          freeCompanion: row.freeCompanion === "true" || row.freeCompanion === "1",
          allAges: row.allAges === "true" || row.allAges === "1",
          familyFriendly: row.familyFriendly === "true" || row.familyFriendly === "1",
          youngChildren: row.youngChildren === "true" || row.youngChildren === "1",
          kids: row.kids === "true" || row.kids === "1",
          teens: row.teens === "true" || row.teens === "1",
          adultsOnly: row.adultsOnly === "true" || row.adultsOnly === "1",
          seniors: row.seniors === "true" || row.seniors === "1",
          isIndoor: row.isIndoor === "true" || row.isIndoor === "1",
          isOutdoor: row.isOutdoor === "true" || row.isOutdoor === "1",
          shortDuration: row.shortDuration === "true" || row.shortDuration === "1",
          dropIn: row.dropIn === "true" || row.dropIn === "1",
          canReenter: row.canReenter === "true" || row.canReenter === "1",
          accessibility: JSON.stringify(accessibility),
          organizerName: row.organizerName || undefined,
          organizerType: row.organizerType as any || undefined,
          organizerEmail: row.organizerEmail || undefined,
          organizerPhone: row.organizerPhone || undefined,
          organizerWebsite: row.organizerWebsite || undefined,
          displayOrganizerInfo: row.displayOrganizerInfo === "true" || row.displayOrganizerInfo === "1",
          notes: row.notes || undefined,
          imageUrl: row.imageUrl || undefined,
          imageFileName: row.imageFileName || undefined,
        } as ParsedEvent & { imageFileName?: string };

        // Basic validation
        if (!event.name || !event.description || !event.province || !event.municipality || !event.startDate) {
          errors.push(`Row ${i}: Missing required fields (name, description, province, municipality, startDate)`);
          continue;
        }

        events.push(event);
      } catch (error) {
        errors.push(`Row ${i}: ${error instanceof Error ? error.message : "Parse error"}`);
      }
    }

    // Process images from ZIP if available
    if (Object.keys(imageFiles).length > 0) {
      for (const event of events) {
        if (event.imageFileName) {
          const imageKey = event.imageFileName.toLowerCase();
          const imageFile = imageFiles[imageKey];
          
          if (imageFile) {
            try {
              // Extract image as base64
              const imageBlob = await imageFile.async("blob");
              const reader = new FileReader();
              
              await new Promise<void>((resolve, reject) => {
                reader.onload = () => {
                  event.imageData = reader.result as string;
                  resolve();
                };
                reader.onerror = reject;
                reader.readAsDataURL(imageBlob);
              });
            } catch (error) {
              console.error(`Failed to process image ${event.imageFileName}:`, error);
              errors.push(`Image ${event.imageFileName} could not be processed`);
            }
          } else {
            errors.push(`Image ${event.imageFileName} not found in ZIP`);
          }
        }
      }
    }

    setParsedEvents(events);
    setParseErrors(errors);
  };

  const parseCSVLine = (line: string): string[] => {
    const values: string[] = [];
    let current = "";
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        values.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    
    values.push(current.trim());
    return values;
  };

  const handleImport = async () => {
    if (parsedEvents.length === 0) return;

    setImporting(true);
    try {
      const result = await bulkImportMutation.mutateAsync({ events: parsedEvents });
      setImportResult(result);
      
      if (result.failed.length === 0) {
        setTimeout(() => {
          onComplete();
        }, 2000);
      }
    } catch (error) {
      alert("Failed to import events: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setImporting(false);
    }
  };

  const handleReset = () => {
    setFile(null);
    setParsedEvents([]);
    setParseErrors([]);
    setImportResult(null);
  };

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Bulk Upload Events from CSV or ZIP</h2>

      {!file && (
        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg mb-4">Upload a CSV file or ZIP archive with images</p>
          <input
            type="file"
            accept=".csv,.zip"
            onChange={handleFileChange}
            className="hidden"
            id="csv-upload"
          />
          <label htmlFor="csv-upload">
            <Button asChild>
              <span>Choose CSV or ZIP File</span>
            </Button>
          </label>
          <p className="text-sm text-muted-foreground mt-4">
            CSV only: Use event_upload_template.csv<br />
            ZIP with images: Include CSV + image files (reference images by filename in imageFileName column)
          </p>
        </div>
      )}

      {file && !importResult && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">
                {parsedEvents.length} events ready to import
              </p>
            </div>
            <Button variant="outline" onClick={handleReset}>
              Choose Different File
            </Button>
          </div>

          {parseErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive mb-2">Parse Errors ({parseErrors.length})</p>
                  <ul className="text-sm space-y-1">
                    {parseErrors.slice(0, 5).map((error, i) => (
                      <li key={i}>{error}</li>
                    ))}
                    {parseErrors.length > 5 && (
                      <li className="text-muted-foreground">... and {parseErrors.length - 5} more</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {parsedEvents.length > 0 && (
            <div className="border rounded-lg overflow-hidden">
              <div className="bg-muted p-4 font-medium">Preview (first 5 events)</div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {parsedEvents.slice(0, 5).map((event, i) => (
                  <div key={i} className="p-4">
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.municipality}, {event.province} • {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <Button
              onClick={handleImport}
              disabled={parsedEvents.length === 0 || importing}
              className="flex-1"
            >
              {importing ? "Importing..." : `Import ${parsedEvents.length} Events`}
            </Button>
          </div>
        </div>
      )}

      {importResult && (
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-lg font-medium">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            Import Complete
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Card className="p-4 bg-green-50 dark:bg-green-950">
              <p className="text-2xl font-bold text-green-600">{importResult.success.length}</p>
              <p className="text-sm text-muted-foreground">Successfully imported</p>
            </Card>
            {importResult.failed.length > 0 && (
              <Card className="p-4 bg-red-50 dark:bg-red-950">
                <p className="text-2xl font-bold text-red-600">{importResult.failed.length}</p>
                <p className="text-sm text-muted-foreground">Failed</p>
              </Card>
            )}
          </div>

          {importResult.failed.length > 0 && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-4">
              <div className="flex items-start gap-2">
                <XCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-destructive mb-2">Failed Imports</p>
                  <ul className="text-sm space-y-1">
                    {importResult.failed.map((fail, i) => (
                      <li key={i}>Row {fail.index + 1}: {fail.error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <Button onClick={handleReset} className="w-full">
            Upload Another File
          </Button>
        </div>
      )}
    </Card>
  );
}
