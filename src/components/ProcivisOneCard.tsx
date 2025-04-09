
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Check } from "lucide-react";

interface ProcivisOneCardProps {
  title: string;
  primaryText: string;
  secondaryText: string;
  backgroundColor: string;
  logo?: string;
}

const ProcivisOneCard = ({
  title,
  primaryText,
  secondaryText,
  backgroundColor,
  logo
}: ProcivisOneCardProps) => {
  return (
    <div className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden bg-slate-50">
      {/* Header section with logo and title */}
      <div className="p-4 flex items-center gap-4">
        {logo && (
          <div 
            className="w-16 h-16 rounded-md overflow-hidden flex items-center justify-center" 
            style={{ backgroundColor }}
          >
            <img 
              src={logo} 
              alt="Logo" 
              className="w-10 h-10 object-contain"
            />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-bold text-gray-800">{title}</h2>
          <div className="flex items-center gap-2 text-gray-600">
            <span className="text-base">{primaryText}</span>
            <span className="text-sm">•</span>
            <span className="text-base">{secondaryText}</span>
          </div>
        </div>
      </div>
      
      {/* Main card body with aspect ratio */}
      <AspectRatio ratio={16/8} className="w-full">
        <div
          className="w-full h-full"
          style={{ backgroundColor }}
        >
          {/* Content would go here */}
        </div>
      </AspectRatio>
    </div>
  );
};

export default ProcivisOneCard;
