
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
import { ArrowLeftRight, X } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

type FormatType = "OCA" | "ProcivisOne";

const TranslationDashboard = () => {
  const [specification, setSpecification] = useState<DesignSpecification>(defaultSpecification);
  const [data, setData] = useState<OwnerData>(defaultData);
  const [formatType, setFormatType] = useState<FormatType>("OCA");
  const [procivisSpec, setProcivisSpec] = useState<ProcivisOneSchema>(defaultProcivisOneSchema);
  const [showBothPreviews, setShowBothPreviews] = useState(false);
  const [convertedJson, setConvertedJson] = useState<string | null>(null);
  const [activeEditorJSON, setActiveEditorJSON] = useState<object>(defaultSpecification);
  
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
    // Update the active editor JSON to show the correct format
    setActiveEditorJSON(newFormat === "OCA" ? specification : procivisSpec);
    // Clear any previously converted JSON
    setConvertedJson(null);
  };
  
  const handleSpecificationUpdate = (newSpec: object) => {
    if (formatType === "OCA") {
      const typedSpec = newSpec as DesignSpecification;
      setSpecification(typedSpec);
      // Update the active editor JSON
      setActiveEditorJSON(typedSpec);
      // Update the Procivis spec to match the new OCA spec
      setProcivisSpec(convertOCAToProcivisOne(typedSpec));
    } else {
      const typedSpec = newSpec as ProcivisOneSchema;
      setProcivisSpec(typedSpec);
      // Update the active editor JSON
      setActiveEditorJSON(typedSpec);
      // Convert the Procivis spec to OCA format
      setSpecification(convertProcivisOneToOCA(typedSpec));
    }
    // Clear any previously converted JSON
    setConvertedJson(null);
  };
  
  const handleConvertToOCA = () => {
    const convertedSpec = convertProcivisOneToOCA(procivisSpec);
    setSpecification(convertedSpec);
    setFormatType("OCA");
    // Update the active editor JSON to the converted format
    setActiveEditorJSON(convertedSpec);
    // Set the converted JSON text
    setConvertedJson(JSON.stringify(convertedSpec, null, 2));
  };
  
  const handleConvertToProcivisOne = () => {
    const convertedSpec = convertOCAToProcivisOne(specification);
    setProcivisSpec(convertedSpec);
    setFormatType("ProcivisOne");
    // Update the active editor JSON to the converted format
    setActiveEditorJSON(convertedSpec);
    // Set the converted JSON text
    setConvertedJson(JSON.stringify(convertedSpec, null, 2));
  };
  
  const handleCloseJsonOutput = () => {
    setConvertedJson(null);
  };
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Design Translation Tool</h1>
      
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-muted-foreground">Design Basis:</span>
          <ToggleGroup type="single" value={formatType} onValueChange={(value) => value && handleFormatToggle(value as FormatType)}>
            <ToggleGroupItem value="OCA">OCA Format</ToggleGroupItem>
            <ToggleGroupItem value="ProcivisOne">Procivis One Format</ToggleGroupItem>
          </ToggleGroup>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            size="sm"
            onClick={() => setShowBothPreviews(!showBothPreviews)}
          >
            {showBothPreviews ? "Single Preview" : "Show Both Previews"}
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
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
                  Edit the JSON specification for your {formatType === "OCA" ? "OCA" : "Procivis One"} design
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JsonEditor 
                  initialJson={activeEditorJSON} 
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
        
        <div className="flex flex-col space-y-6">
          {showBothPreviews ? (
            <>
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>OCA Preview</CardTitle>
                      <CardDescription>
                        Visualization of the OCA format
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleConvertToProcivisOne}
                      title="Convert to Procivis One"
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      To Procivis One
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <PetPermit
                    title={metaOverlay?.name || "SWIYU"}
                    primaryField={primaryField}
                    backgroundColor={brandingOverlay?.primary_background_color || "#2C75E3"}
                    logo={brandingOverlay?.logo}
                    data={data}
                  />
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Procivis One Preview</CardTitle>
                      <CardDescription>
                        Visualization of the Procivis One format
                      </CardDescription>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={handleConvertToOCA}
                      title="Convert to OCA"
                    >
                      <ArrowLeftRight className="h-4 w-4 mr-2" />
                      To OCA
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="flex justify-center p-6">
                  <ProcivisOneCard
                    title={procivisPreview.title}
                    primaryText={procivisPreview.primaryText}
                    secondaryText={procivisPreview.secondaryText}
                    backgroundColor={procivisPreview.backgroundColor}
                    logo={procivisPreview.logo}
                  />
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>
                      Visualization of the design based on the specification and data
                    </CardDescription>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={formatType === "OCA" ? handleConvertToProcivisOne : handleConvertToOCA}
                    title={formatType === "OCA" ? "Convert to Procivis One" : "Convert to OCA"}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    {formatType === "OCA" ? "To Procivis One" : "To OCA"}
                  </Button>
                </div>
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
          )}
        </div>
      </div>
      
      {convertedJson && (
        <div className="mt-8">
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Converted {formatType} Format</CardTitle>
                  <CardDescription>
                    JSON representation of the converted format
                  </CardDescription>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={handleCloseJsonOutput}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-80 overflow-y-auto whitespace-pre">
                {convertedJson}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TranslationDashboard;
