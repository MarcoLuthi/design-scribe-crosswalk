
import { AspectRatio } from "@/components/ui/aspect-ratio";

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
    <div className="w-full max-w-xl shadow-lg rounded-2xl overflow-hidden bg-slate-50">
      {/* Header section with logo/avatar and title */}
      <div className="p-4 flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: logoBackgroundColor }}
        >
          {logo ? (
            <img 
              src={logo} 
              alt={`${title} logo`}
              className="w-full h-full p-2 object-contain"
            />
          ) : (
            <span 
              className="text-3xl font-bold"
              style={{ color: logoFontColor }}
            >
              {firstLetter}
            </span>
          )}
        </div>
        
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-sm">{primaryText}</span>
            {secondaryText && (
              <>
                <span className="text-xs">•</span>
                <span className="text-sm">{secondaryText}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main card body with aspect ratio */}
      <AspectRatio ratio={16/9} className="w-full">
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
