
import { Check } from "lucide-react";
import { OwnerData } from "../types/design-spec";
import { cn } from "@/lib/utils";
import { formatPrimaryField } from "../utils/design-parser";

interface PetPermitProps {
  title: string;
  primaryField: string;
  backgroundColor: string;
  logo?: string;
  data: OwnerData;
  language?: "en" | "de" | "fr" | "it";
  className?: string;
}

const PetPermit = ({
  title,
  primaryField,
  backgroundColor,
  logo,
  data,
  language = "en",
  className
}: PetPermitProps) => {
  // Format the primary field template with the actual data
  const formattedPrimaryField = formatPrimaryField(primaryField, data);
  
  return (
    <div 
      className={cn("w-full max-w-full rounded-3xl overflow-hidden shadow-lg", className)}
      style={{ backgroundColor }}
    >
      <div className="p-8 flex flex-col min-h-[600px] relative">
        {/* Logo */}
        {logo && (
          <div className="absolute top-8 right-8">
            <img src={logo} alt="Logo" className="w-12 h-12" />
          </div>
        )}
        
        {/* Title */}
        <h1 className="text-white text-3xl font-bold mb-4">{title}</h1>
        
        {/* Primary Field */}
        <p className="text-white text-2xl mb-8">{formattedPrimaryField}</p>
        
        {/* Bottom validation section */}
        <div className="mt-auto">
          <div className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-2 rounded-full">
            <Check className="w-5 h-5" />
            <span className="text-xl">
              {language === "de" ? "gültig" : 
               language === "fr" ? "valide" : 
               language === "it" ? "valido" : "valid"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetPermit;
