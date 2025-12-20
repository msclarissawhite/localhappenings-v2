import { Card } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { Heart, Loader2, Repeat } from "lucide-react";
import { formatPrice } from "../../../shared/products";

export default function DonorWall() {
  const { data: donations, isLoading } = trpc.donations.getDonorWall.useQuery();

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-5xl py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-primary fill-primary" />
          <h1 className="text-4xl font-bold mb-4">Our Supporters</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thank you to everyone who helps keep Local Happenings accessible and free for all families.
          </p>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {/* Donations List */}
        {!isLoading && donations && donations.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">
              Be the first to support Local Happenings!
            </p>
          </Card>
        )}

        {!isLoading && donations && donations.length > 0 && (
          <div className="grid gap-6">
            {donations.map((donation) => (
              <Card key={donation.id} className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-lg">
                        {donation.donorName || "Anonymous Supporter"}
                      </h3>
                      {donation.isRecurring === 1 && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          <Repeat className="w-3 h-3" />
                          Monthly Supporter
                        </span>
                      )}
                    </div>

                    {donation.message && (
                      <p className="text-muted-foreground mb-2 italic">
                        "{donation.message}"
                      </p>
                    )}

                    <p className="text-sm text-muted-foreground">
                      {formatDate(donation.createdAt)}
                    </p>
                  </div>

                  {donation.amount !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {formatPrice(donation.amount)}
                      </div>
                      {donation.isRecurring === 1 && (
                        <div className="text-xs text-muted-foreground">per month</div>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
