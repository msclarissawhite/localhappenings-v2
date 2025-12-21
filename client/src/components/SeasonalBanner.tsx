import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Sun, Leaf, Snowflake, Heart, Star, Gift, Music, Camera, Calendar } from "lucide-react";
import { trpc } from "@/lib/trpc";

// Icon mapping
const ICON_MAP: Record<string, React.ReactNode> = {
  Snowflake: <Snowflake className="h-5 w-5" />,
  Sparkles: <Sparkles className="h-5 w-5" />,
  Sun: <Sun className="h-5 w-5" />,
  Leaf: <Leaf className="h-5 w-5" />,
  Heart: <Heart className="h-5 w-5" />,
  Star: <Star className="h-5 w-5" />,
  Gift: <Gift className="h-5 w-5" />,
  Music: <Music className="h-5 w-5" />,
  Camera: <Camera className="h-5 w-5" />,
  Calendar: <Calendar className="h-5 w-5" />,
};



export function SeasonalBanner() {
  const [, setLocation] = useLocation();
  const { data: banners = [] } = trpc.banner.getActive.useQuery();

  if (banners.length === 0) return null;

  const handleClick = (banner: any) => {
    // Build query string from banner filters
    const params = new URLSearchParams();
    if (banner.eventTypeIds && banner.eventTypeIds.length > 0) {
      banner.eventTypeIds.forEach((id: number) => params.append('tagId', id.toString()));
    }
    if (banner.provinces && banner.provinces.length > 0) {
      params.set('province', banner.provinces[0]);
    }
    if (banner.municipalities && banner.municipalities.length > 0) {
      params.set('municipality', banner.municipalities[0]);
    }
    setLocation(`/browse?${params.toString()}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {banners.map((banner: any) => {
        const icon = banner.icon && ICON_MAP[banner.icon] ? ICON_MAP[banner.icon] : ICON_MAP.Snowflake;
        
        return (
          <div
            key={banner.id}
            className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${banner.bgGradient} p-6 cursor-pointer transition-transform hover:scale-[1.02]`}
            onClick={() => handleClick(banner)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleClick(banner);
              }
            }}
          >
            <div className="relative z-10 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className={`${banner.textColor}`}>{icon}</div>
                <div>
                  <h3 className={`text-lg font-semibold ${banner.textColor}`}>
                    {banner.title}
                  </h3>
                  <p className={`text-sm ${banner.textColor} opacity-90`}>
                    {banner.description}
                  </p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="shrink-0"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClick(banner);
                }}
              >
                Explore Events
              </Button>
            </div>

            {/* Decorative background pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white blur-3xl" />
              <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white blur-2xl" />
            </div>
          </div>
        );
      })}
    </div>
  );
}
