
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check } from "lucide-react";

interface ProcivisOneCardProps {
  title: string;
  primaryText: string;
  secondaryText: string;
  backgroundColor: string;
  backgroundImage?: string;
  logo?: string;
  logoFontColor?: string;
  logoBackgroundColor?: string;
}

const ProcivisOneCard = ({
  title,
  primaryText,
  secondaryText,
  backgroundColor,
  backgroundImage,
  logo,
  logoFontColor = "#fff",
  logoBackgroundColor = backgroundColor
}: ProcivisOneCardProps) => {
  // Get the first letter of the title for the fallback avatar display
  const firstLetter = title && title.length > 0 ? title.charAt(0).toUpperCase() : "C";

  return (
    <div className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden bg-slate-50">
      {/* Header section with logo/avatar and title */}
      <div className="p-4 flex items-center gap-4">
        <Avatar 
          className="w-16 h-16 rounded-md"
          style={{ backgroundColor: logoBackgroundColor }}
        >
          {logo ? (
            <AvatarImage 
              src={logo} 
              alt={`${title} logo`}
              className="p-2"
            />
          ) : (
            <AvatarFallback 
              className="text-xl font-bold rounded-md"
              style={{ 
                color: logoFontColor,
                backgroundColor: logoBackgroundColor 
              }}
            >
              {firstLetter}
            </AvatarFallback>
          )}
        </Avatar>
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-base">{primaryText}</span>
            {secondaryText && (
              <>
                <span className="text-sm">•</span>
                <span className="text-base">{secondaryText}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main card body with aspect ratio */}
      <AspectRatio ratio={16/8} className="w-full">
        <div
          className="w-full h-full"
          style={
            backgroundImage 
              ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { backgroundColor }
          }
        >
          {/* Card content would go here */}
        </div>
      </AspectRatio>
    </div>
  );
};

export default ProcivisOneCard;
