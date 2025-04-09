
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultData, defaultSpecification } from "@/data/default-specification";
import JsonEditor from "./JsonEditor";
import PetPermit from "./PetPermit";
import { formatPrimaryField, getBrandingOverlay, getMetaOverlay } from "@/utils/design-parser";
import { DesignSpecification, OwnerData } from "@/types/design-spec";

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
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Design Translation Tool</h1>
      
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
                  initialJson={specification} 
                  onJsonUpdate={(json) => setSpecification(json as DesignSpecification)} 
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
              <CardTitle>Preview: Pet Permit</CardTitle>
              <CardDescription>
                Visualization of the design based on the specification and data
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              <PetPermit
                title={metaOverlay?.name || "Pet Permit"}
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
