import { useState } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Image as ImageIcon, Check } from "lucide-react";

interface ImageLibraryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectImage: (imageUrl: string) => void;
}

export function ImageLibraryModal({
  open,
  onOpenChange,
  onSelectImage,
}: ImageLibraryModalProps) {
  const [selectedImageUrl, setSelectedImageUrl] = useState<string | null>(null);
  const { data: images = [], isLoading } = trpc.imageLibrary.list.useQuery(
    undefined,
    { enabled: open }
  );

  const handleSelect = () => {
    if (selectedImageUrl) {
      onSelectImage(selectedImageUrl);
      onOpenChange(false);
      setSelectedImageUrl(null);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    setSelectedImageUrl(null);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Choose from My Images</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading your images...</p>
          </div>
        ) : images.length === 0 ? (
          <div className="text-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">
              No images in your library yet
            </p>
            <p className="text-sm text-muted-foreground">
              Upload images to your library from the "My Images" tab in your
              dashboard
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {images.map((image) => (
                <Card
                  key={image.id}
                  className={`overflow-hidden cursor-pointer transition-all ${
                    selectedImageUrl === image.url
                      ? "ring-2 ring-primary"
                      : "hover:ring-2 hover:ring-muted"
                  }`}
                  onClick={() => setSelectedImageUrl(image.url)}
                >
                  <div className="aspect-video relative">
                    <img
                      src={image.url}
                      alt={image.fileName}
                      className="w-full h-full object-cover"
                    />
                    {selectedImageUrl === image.url && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary text-primary-foreground rounded-full p-2">
                          <Check className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs font-medium truncate">
                      {image.fileName}
                    </p>
                  </div>
                </Card>
              ))}
            </div>

            <div className="flex gap-2 justify-end mt-4">
              <Button variant="outline" onClick={handleCancel}>
                Cancel
              </Button>
              <Button onClick={handleSelect} disabled={!selectedImageUrl}>
                Use Selected Image
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
