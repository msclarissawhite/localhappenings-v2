import { useEffect, useState } from "react";
import { Check } from "lucide-react";

interface FormSection {
  id: string;
  title: string;
  stepNumber: number;
}

interface FormProgressIndicatorProps {
  sections: FormSection[];
}

export function FormProgressIndicator({ sections }: FormProgressIndicatorProps) {
  const [activeSection, setActiveSection] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      // Get all section elements
      const sectionElements = sections.map(section => 
        document.querySelector(`[data-section-id="${section.id}"]`)
      );

      // Find which section is currently in view
      const scrollPosition = window.scrollY + window.innerHeight / 3;
      
      for (let i = sectionElements.length - 1; i >= 0; i--) {
        const element = sectionElements[i];
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          
          if (scrollPosition >= elementTop) {
            setActiveSection(i);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener("scroll", handleScroll);
  }, [sections]);

  const scrollToSection = (index: number) => {
    const section = sections[index];
    const element = document.querySelector(`[data-section-id="${section.id}"]`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div className="sticky top-20 bg-background/95 backdrop-blur-sm border-b border-border shadow-sm z-40">
      <div className="container py-3">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
          {sections.map((section, index) => {
            const isActive = index === activeSection;
            const isCompleted = index < activeSection;

            return (
              <button
                key={section.id}
                onClick={() => scrollToSection(index)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : isCompleted
                    ? "bg-primary/10 text-primary hover:bg-primary/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                <div
                  className={`flex items-center justify-center w-5 h-5 rounded-full text-xs font-semibold ${
                    isActive
                      ? "bg-primary-foreground text-primary"
                      : isCompleted
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-foreground"
                  }`}
                >
                  {isCompleted ? <Check className="w-3 h-3" /> : section.stepNumber}
                </div>
                <span className="hidden md:inline">{section.title}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
