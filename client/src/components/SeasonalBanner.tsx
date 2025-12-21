import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sparkles, Sun, Leaf, Snowflake } from "lucide-react";

interface SeasonalTag {
  id: number;
  name: string;
  icon: React.ReactNode;
  gradient: string;
  textColor: string;
  description: string;
}

// Map months to seasonal tags
const getSeasonalTag = (): SeasonalTag | null => {
  const month = new Date().getMonth(); // 0-11

  // December: Festive Holidays
  if (month === 11) {
    return {
      id: 30027,
      name: "Festive Holidays",
      icon: <Snowflake className="h-5 w-5" />,
      gradient: "from-red-500 to-green-600",
      textColor: "text-white",
      description: "Celebrate the season with festive events happening now!",
    };
  }

  // October: Halloween Events
  if (month === 9) {
    return {
      id: 30028,
      name: "Halloween Events",
      icon: <Sparkles className="h-5 w-5" />,
      gradient: "from-orange-500 to-purple-600",
      textColor: "text-white",
      description: "Spooky fun for all ages this Halloween season!",
    };
  }

  // March-April: Easter Events
  if (month === 2 || month === 3) {
    return {
      id: 30030,
      name: "Easter Events",
      icon: <Sparkles className="h-5 w-5" />,
      gradient: "from-pink-400 to-purple-500",
      textColor: "text-white",
      description: "Spring celebrations and Easter activities for families!",
    };
  }

  // June-August: Summer Activities
  if (month >= 5 && month <= 7) {
    return {
      id: 30031,
      name: "Summer Activities",
      icon: <Sun className="h-5 w-5" />,
      gradient: "from-yellow-400 to-orange-500",
      textColor: "text-white",
      description: "Make the most of summer with outdoor fun and events!",
    };
  }

  // December-February: Winter Activities
  if (month === 0 || month === 1 || month === 11) {
    return {
      id: 30032,
      name: "Winter Activities",
      icon: <Snowflake className="h-5 w-5" />,
      gradient: "from-blue-400 to-cyan-500",
      textColor: "text-white",
      description: "Embrace winter with skating, skiing, and seasonal fun!",
    };
  }

  // September-November: Fall/Autumn (Festivals & Fairs)
  if (month >= 8 && month <= 10) {
    return {
      id: 30024,
      name: "Festivals & Fairs",
      icon: <Leaf className="h-5 w-5" />,
      gradient: "from-amber-500 to-red-600",
      textColor: "text-white",
      description: "Enjoy harvest festivals and fall celebrations!",
    };
  }

  // July 1: Canada Day Events
  const today = new Date();
  if (month === 6 && today.getDate() <= 7) {
    return {
      id: 30029,
      name: "Canada Day Events",
      icon: <Sparkles className="h-5 w-5" />,
      gradient: "from-red-600 to-white",
      textColor: "text-red-700",
      description: "Celebrate Canada Day with community events and fireworks!",
    };
  }

  return null;
};

export function SeasonalBanner() {
  const [, setLocation] = useLocation();
  const seasonalTag = getSeasonalTag();

  if (!seasonalTag) return null;

  const handleClick = () => {
    setLocation(`/browse?tagId=${seasonalTag.id}`);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-lg bg-gradient-to-r ${seasonalTag.gradient} p-6 cursor-pointer transition-transform hover:scale-[1.02]`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleClick();
        }
      }}
    >
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`${seasonalTag.textColor}`}>{seasonalTag.icon}</div>
          <div>
            <h3 className={`text-lg font-semibold ${seasonalTag.textColor}`}>
              {seasonalTag.name}
            </h3>
            <p className={`text-sm ${seasonalTag.textColor} opacity-90`}>
              {seasonalTag.description}
            </p>
          </div>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            handleClick();
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
}
