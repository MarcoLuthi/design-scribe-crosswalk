
import { Check } from "lucide-react";
import { OwnerData } from "../types/design-spec";
import { cn } from "@/lib/utils";

interface PetPermitProps {
  title: string;
  primaryField: string;
  backgroundColor: string;
  logo?: string;
  data: OwnerData;
}

const PetPermit = ({
  title,
  primaryField,
  backgroundColor,
  logo,
  data
}: PetPermitProps) => {
  // Check if we need to display some pet information
  const hasPets = data.pets && data.pets.length > 0;
  
  return (
    <div 
      className="w-full max-w-md rounded-3xl overflow-hidden shadow-lg"
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
        <p className="text-white text-2xl mb-8">{primaryField}</p>
        
        {/* Pet Information (if available) */}
        {hasPets && (
          <div className="bg-white/10 p-4 rounded-lg mb-8">
            <h3 className="text-white text-xl mb-2">Registered Pets:</h3>
            <ul className="space-y-2">
              {data.pets.map((pet, index) => (
                <li key={index} className="text-white">
                  <strong>{pet.name}</strong>: {pet.race}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {/* Bottom validation section */}
        <div className="mt-auto">
          <div className="inline-flex items-center gap-2 border-2 border-white text-white px-6 py-2 rounded-full">
            <Check className="w-5 h-5" />
            <span className="text-xl">valid</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PetPermit;
