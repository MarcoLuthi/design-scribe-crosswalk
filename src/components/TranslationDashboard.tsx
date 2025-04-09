
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultData, defaultSpecification } from "@/data/default-specification";
import JsonEditor from "./JsonEditor";
import PetPermit from "./PetPermit";
import { formatPrimaryField, getBrandingOverlay, getMetaOverlay } from "@/utils/design-parser";
import { DesignSpecification, OwnerData } from "@/types/design-spec";
import { Code2 } from "lucide-react";

const TranslationDashboard = () => {
  const [specification, setSpecification] = useState<DesignSpecification>(defaultSpecification);
  const [data, setData] = useState<OwnerData>(defaultData);
  
  // Extract branding and meta information
  const brandingOverlay = getBrandingOverlay(specification);
  const metaOverlay = getMetaOverlay(specification);
  
  // Format the primary field with the data
  const primaryField = brandingOverlay 
    ? formatPrimaryField(brandingOverlay.primary_field, data)
    : "";
  
  return (
    <div className="container mx-auto py-8 bg-[#1A1F2C] text-gray-200 min-h-screen">
      <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
        <Code2 className="h-8 w-8 text-[#9b87f5]" />
        <span className="bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] bg-clip-text text-transparent">
          Design Translation Tool - SWIYU
        </span>
      </h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Configuration */}
        <Tabs defaultValue="specification" className="space-y-4">
          <TabsList className="grid grid-cols-2 bg-[#2C3140] border border-[#3D4154]">
            <TabsTrigger value="specification" className="data-[state=active]:bg-[#3D4154] data-[state=active]:text-white">
              Design Specification
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-[#3D4154] data-[state=active]:text-white">
              Data
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="specification">
            <Card className="bg-[#2C3140] border-[#3D4154] shadow-lg">
              <CardHeader className="border-b border-[#3D4154]">
                <CardTitle className="text-white">Design Specification</CardTitle>
                <CardDescription className="text-gray-400">
                  Edit the JSON specification for your design
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonEditor 
                  initialJson={specification} 
                  onJsonUpdate={(json) => setSpecification(json as DesignSpecification)} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card className="bg-[#2C3140] border-[#3D4154] shadow-lg">
              <CardHeader className="border-b border-[#3D4154]">
                <CardTitle className="text-white">Data</CardTitle>
                <CardDescription className="text-gray-400">
                  Edit the JSON data that will be displayed in your design
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4">
                <JsonEditor 
                  initialJson={data} 
                  onJsonUpdate={(json) => setData(json as OwnerData)} 
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Right side: Visualization */}
        <div className="flex flex-col space-y-6">
          <Card className="bg-[#2C3140] border-[#3D4154] shadow-lg">
            <CardHeader className="border-b border-[#3D4154]">
              <CardTitle className="text-white">Preview</CardTitle>
              <CardDescription className="text-gray-400">
                Visualization of the design based on the specification and data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6 bg-[#252A38]">
              <PetPermit
                title={metaOverlay?.name || "Permit"}
                primaryField={primaryField}
                backgroundColor={brandingOverlay?.primary_background_color || "#2C75E3"}
                logo={brandingOverlay?.logo}
                data={data}
              />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TranslationDashboard;
