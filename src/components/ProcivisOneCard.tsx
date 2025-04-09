
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
    <div className="w-full max-w-md shadow-lg rounded-2xl overflow-hidden">
      {/* Header section with logo and title */}
      <div className="bg-gray-100 p-4">
        <div className="flex items-center">
          {logo && (
            <div className="mr-4 rounded-md overflow-hidden" style={{ backgroundColor }}>
              <img src={logo} alt="Logo" className="w-12 h-12" />
            </div>
          )}
          <div>
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className="flex items-center gap-2 text-gray-700">
              <span>{primaryText}</span>
              <span className="font-bold">•</span>
              <span>{secondaryText}</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main card body */}
      <div
        className="p-8 flex flex-col min-h-[300px] relative"
        style={{ backgroundColor }}
      >
        {/* Content would go here */}
      </div>
    </div>
  );
};

export default ProcivisOneCard;
