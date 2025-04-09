
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useEffect, useState } from "react";

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
  const [averageColor, setAverageColor] = useState<string | null>(null);

  // Calculate average color from background image if it exists and no backgroundColor is provided
  useEffect(() => {
    if (backgroundImage && (!backgroundColor || backgroundColor === "")) {
      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        if (!context) return;

        // Scale down image for faster processing
        const maxSize = 50;
        const width = Math.min(img.width, maxSize);
        const height = Math.min(img.height, maxSize);
        canvas.width = width;
        canvas.height = height;
        
        // Draw image to canvas
        context.drawImage(img, 0, 0, width, height);
        
        // Get image data
        const imageData = context.getImageData(0, 0, width, height);
        const data = imageData.data;
        
        // Calculate average RGB
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        
        // Average RGB values
        if (count > 0) {
          r = Math.floor(r / count);
          g = Math.floor(g / count);
          b = Math.floor(b / count);
          setAverageColor(`rgb(${r}, ${g}, ${b})`);
        }
      };
      
      img.src = backgroundImage;
    } else {
      // Reset average color when background image changes or is removed
      setAverageColor(null);
    }
  }, [backgroundImage, backgroundColor]);

  // Use average color as fallback if available and no backgroundColor is provided
  const effectiveBackgroundColor = backgroundColor || averageColor || "#2C75E3";
  const effectiveLogoBackgroundColor = logoBackgroundColor || effectiveBackgroundColor;

  // Check if secondary text is empty, undefined, or just whitespace
  const hasSecondaryText = secondaryText && secondaryText.trim() !== "";

  return (
    <div className="w-full max-w-xl shadow-lg rounded-2xl overflow-hidden bg-slate-50">
      {/* Header section with logo/avatar and title */}
      <div className="p-4 flex items-center gap-4">
        <div 
          className="w-14 h-14 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: effectiveLogoBackgroundColor }}
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
            {hasSecondaryText && (
              <>
                <span className="text-xs">•</span>
                <span className="text-sm">{secondaryText}</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Main card body with aspect ratio */}
      <AspectRatio ratio={1.64} className="w-full">
        <div
          className="w-full h-full"
          style={
            backgroundImage 
              ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }
              : { backgroundColor: effectiveBackgroundColor }
          }
        >
          {/* Card content would go here */}
        </div>
      </AspectRatio>
    </div>
  );
};

export default ProcivisOneCard;
