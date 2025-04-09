
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultData, defaultSpecification } from "@/data/default-specification";
import { defaultProcivisOneSchema } from "@/data/default-procivis-spec";
import JsonEditor from "./JsonEditor";
import PetPermit from "./PetPermit";
import { formatPrimaryField, getBrandingOverlay, getMetaOverlay } from "@/utils/design-parser";
import { DesignSpecification, OwnerData } from "@/types/design-spec";
import { ProcivisOneSchema } from "@/types/procivis-one-spec";
import { convertOCAToProcivisOne, convertProcivisOneToOCA, formatProcivisOnePreview } from "@/utils/format-converter";
import { Button } from "@/components/ui/button";
import ProcivisOneCard from "./ProcivisOneCard";

type FormatType = "OCA" | "ProcivisOne";

const TranslationDashboard = () => {
  const [specification, setSpecification] = useState<DesignSpecification>(defaultSpecification);
  const [data, setData] = useState<OwnerData>(defaultData);
  const [formatType, setFormatType] = useState<FormatType>("OCA");
  const [procivisSpec, setProcivisSpec] = useState<ProcivisOneSchema>(defaultProcivisOneSchema);
  
  // Extract branding and meta information for OCA format
  const brandingOverlay = getBrandingOverlay(specification);
  const metaOverlay = getMetaOverlay(specification);
  
  // Format the primary field with the data for OCA
  const primaryField = brandingOverlay 
    ? formatPrimaryField(brandingOverlay.primary_field, data)
    : "";
  
  // Format the preview data for Procivis One
  const procivisPreview = formatProcivisOnePreview(procivisSpec, data);
  
  const handleFormatToggle = (newFormat: FormatType) => {
    if (newFormat === formatType) return;
    
    setFormatType(newFormat);
  };
  
  const handleSpecificationUpdate = (newSpec: object) => {
    if (formatType === "OCA") {
      const typedSpec = newSpec as DesignSpecification;
      setSpecification(typedSpec);
      // Update the Procivis spec to match the new OCA spec
      setProcivisSpec(convertOCAToProcivisOne(typedSpec));
    } else {
      const typedSpec = newSpec as ProcivisOneSchema;
      setProcivisSpec(typedSpec);
    }
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Design Translation Tool</h1>
      
      <div className="mb-6 flex gap-4">
        <Button 
          variant={formatType === "OCA" ? "default" : "outline"} 
          onClick={() => handleFormatToggle("OCA")}
        >
          OCA Format
        </Button>
        <Button 
          variant={formatType === "ProcivisOne" ? "default" : "outline"} 
          onClick={() => handleFormatToggle("ProcivisOne")}
        >
          Procivis One Format
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left side: Configuration */}
        <Tabs defaultValue="specification" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="specification">Design Specification</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specification">
            <Card>
              <CardHeader>
                <CardTitle>Design Specification</CardTitle>
                <CardDescription>
                  Edit the JSON specification for your design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JsonEditor 
                  initialJson={formatType === "OCA" ? specification : procivisSpec} 
                  onJsonUpdate={handleSpecificationUpdate} 
                />
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="data">
            <Card>
              <CardHeader>
                <CardTitle>Data</CardTitle>
                <CardDescription>
                  Edit the JSON data that will be displayed in your design
                </CardDescription>
              </CardHeader>
              <CardContent>
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
          <Card>
            <CardHeader>
              <CardTitle>Preview</CardTitle>
              <CardDescription>
                Visualization of the design based on the specification and data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              {formatType === "OCA" ? (
                <PetPermit
                  title={metaOverlay?.name || "SWIYU"}
                  primaryField={primaryField}
                  backgroundColor={brandingOverlay?.primary_background_color || "#2C75E3"}
                  logo={brandingOverlay?.logo}
                  data={data}
                />
              ) : (
                <ProcivisOneCard
                  title={procivisPreview.title}
                  primaryText={procivisPreview.primaryText}
                  secondaryText={procivisPreview.secondaryText}
                  backgroundColor={procivisPreview.backgroundColor}
                  logo={procivisPreview.logo}
                />
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TranslationDashboard;
