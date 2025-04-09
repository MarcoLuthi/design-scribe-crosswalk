
import { useState, useEffect } from "react";
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
import { ArrowLeftRight, X, PlusCircle, ChevronDown, ChevronUp } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type FormatType = "OCA" | "ProcivisOne";

const TranslationDashboard = () => {
  const [specification, setSpecification] = useState<DesignSpecification>(defaultSpecification);
  const [data, setData] = useState<OwnerData>(defaultData);
  const [formatType, setFormatType] = useState<FormatType>("OCA");
  const [procivisSpec, setProcivisSpec] = useState<ProcivisOneSchema>(defaultProcivisOneSchema);
  const [showBothPreviews, setShowBothPreviews] = useState(false);
  const [convertedJson, setConvertedJson] = useState<string | null>(null);
  const [activeEditorJSON, setActiveEditorJSON] = useState<object>(defaultSpecification);
  const [showAdvancedDataEdit, setShowAdvancedDataEdit] = useState(false);
  
  const brandingOverlay = getBrandingOverlay(specification);
  const metaOverlay = getMetaOverlay(specification);
  
  const primaryField = brandingOverlay 
    ? formatPrimaryField(brandingOverlay.primary_field, data)
    : "";
  
  const procivisPreview = formatProcivisOnePreview(procivisSpec, data);
  
  // Detect what data fields are needed based on the active specification
  const [dataFields, setDataFields] = useState<string[]>([]);
  
  useEffect(() => {
    const fields: string[] = [];
    
    if (formatType === "OCA") {
      // Extract fields from OCA specification
      specification.overlays.forEach(overlay => {
        if (overlay.type === "extend/overlays/data_source/1.0") {
          const dataSourceOverlay = overlay as any;
          Object.values(dataSourceOverlay.attribute_sources).forEach(path => {
            const cleanPath = (path as string).replace(/\$\./g, "").split("[")[0];
            if (!fields.includes(cleanPath) && cleanPath !== "pets") {
              fields.push(cleanPath);
            }
          });
        }
      });
    } else {
      // Extract fields from Procivis One specification
      const extractFields = (claims: any[], prefix = "") => {
        claims.forEach(claim => {
          if (claim.datatype === "OBJECT" && claim.array && claim.key === "Pets") {
            // Handle nested pet claims
            if (claim.claims && claim.claims.length > 0) {
              extractFields(claim.claims, "pets.");
            }
          } else if (claim.datatype !== "OBJECT") {
            const fieldPath = prefix + claim.key.toLowerCase();
            if (!fields.includes(fieldPath)) {
              fields.push(fieldPath);
            }
          }
        });
      };
      
      if (procivisSpec.claims) {
        extractFields(procivisSpec.claims);
      }
    }
    
    // Add standard fields if not already included
    const standardFields = ["firstname", "lastname", "address.street", "address.city", "address.country"];
    standardFields.forEach(field => {
      if (!fields.includes(field)) {
        fields.push(field);
      }
    });
    
    setDataFields(fields);
  }, [specification, procivisSpec, formatType]);
  
  const handleFormatToggle = (newFormat: FormatType) => {
    if (newFormat === formatType) return;
    
    setFormatType(newFormat);
    setActiveEditorJSON(newFormat === "OCA" ? specification : procivisSpec);
    setConvertedJson(null);
  };
  
  const handleSpecificationUpdate = (newSpec: object) => {
    if (formatType === "OCA") {
      const typedSpec = newSpec as DesignSpecification;
      setSpecification(typedSpec);
      setActiveEditorJSON(typedSpec);
      setProcivisSpec(convertOCAToProcivisOne(typedSpec));
    } else {
      const typedSpec = newSpec as ProcivisOneSchema;
      setProcivisSpec(typedSpec);
      setActiveEditorJSON(typedSpec);
      setSpecification(convertProcivisOneToOCA(typedSpec));
    }
    setConvertedJson(null);
  };
  
  const handleConvertToOCA = () => {
    const convertedSpec = convertProcivisOneToOCA(procivisSpec);
    setSpecification(convertedSpec);
    setFormatType("OCA");
    setActiveEditorJSON(convertedSpec);
    setConvertedJson(JSON.stringify(convertedSpec, null, 2));
  };
  
  const handleConvertToProcivisOne = () => {
    const convertedSpec = convertOCAToProcivisOne(specification);
    setProcivisSpec(convertedSpec);
    setFormatType("ProcivisOne");
    setActiveEditorJSON(convertedSpec);
    setConvertedJson(JSON.stringify(convertedSpec, null, 2));
  };
  
  const handleCloseJsonOutput = () => {
    setConvertedJson(null);
  };
  
  // Update a specific data field
  const updateDataField = (fieldPath: string, value: string) => {
    const newData = { ...data };
    const parts = fieldPath.split('.');
    
    // Handle nested properties
    if (parts.length > 1) {
      let current: any = newData;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!current[parts[i]]) {
          current[parts[i]] = {};
        }
        current = current[parts[i]];
      }
      current[parts[parts.length - 1]] = value;
    } else {
      (newData as any)[fieldPath] = value;
    }
    
    setData(newData as OwnerData);
  };
  
  // Handle adding a new pet
  const addPet = () => {
    const newData = { ...data };
    newData.pets = [...(newData.pets || []), { name: "", race: "" }];
    setData(newData);
  };
  
  // Handle updating a pet
  const updatePet = (index: number, field: string, value: string) => {
    const newData = { ...data };
    if (!newData.pets) {
      newData.pets = [];
    }
    newData.pets[index] = { ...newData.pets[index], [field]: value };
    setData(newData);
  };
  
  // Handle removing a pet
  const removePet = (index: number) => {
    const newData = { ...data };
    newData.pets = newData.pets.filter((_, i) => i !== index);
    setData(newData);
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
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Data</CardTitle>
                    <CardDescription>
                      Edit the data that will be displayed in your design
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAdvancedDataEdit(!showAdvancedDataEdit)}
                  >
                    {showAdvancedDataEdit ? "Simple Editor" : "Advanced Editor"}
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {showAdvancedDataEdit ? (
                  <JsonEditor 
                    initialJson={data} 
                    onJsonUpdate={(json) => setData(json as OwnerData)} 
                  />
                ) : (
                  <div className="space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Person Information</h3>
                      <div className="space-y-3">
                        {dataFields.filter(f => !f.includes('.')).map(field => (
                          <div key={field} className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm font-medium text-right capitalize">
                              {field}:
                            </label>
                            <input
                              type="text"
                              className="col-span-2 px-3 py-2 border rounded-md"
                              value={(data as any)[field] || ""}
                              onChange={(e) => updateDataField(field, e.target.value)}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-base font-medium">Address</h3>
                      <div className="space-y-3">
                        {dataFields.filter(f => f.startsWith('address.')).map(field => {
                          const fieldName = field.split('.')[1];
                          return (
                            <div key={field} className="grid grid-cols-3 items-center gap-4">
                              <label className="text-sm font-medium text-right capitalize">
                                {fieldName}:
                              </label>
                              <input
                                type="text"
                                className="col-span-2 px-3 py-2 border rounded-md"
                                value={data.address?.[fieldName as keyof typeof data.address] || ""}
                                onChange={(e) => updateDataField(field, e.target.value)}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-base font-medium">Pets</h3>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={addPet}
                        >
                          <PlusCircle className="h-4 w-4 mr-1" />
                          Add Pet
                        </Button>
                      </div>
                      
                      {data.pets && data.pets.length > 0 ? (
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>Name</TableHead>
                              <TableHead>Race</TableHead>
                              <TableHead className="w-20">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {data.pets.map((pet, index) => (
                              <TableRow key={index}>
                                <TableCell>
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 border rounded-md"
                                    value={pet.name}
                                    onChange={(e) => updatePet(index, 'name', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <input
                                    type="text"
                                    className="w-full px-2 py-1 border rounded-md"
                                    value={pet.race}
                                    onChange={(e) => updatePet(index, 'race', e.target.value)}
                                  />
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removePet(index)}
                                    className="h-7 w-7 text-destructive"
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      ) : (
                        <div className="text-center p-4 border border-dashed rounded-md text-muted-foreground">
                          No pets added yet. Click "Add Pet" to add one.
                        </div>
                      )}
                    </div>
                  </div>
                )}
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
                        {!procivisPreview.backgroundImage && (
                          <span className="block text-xs text-amber-600 mt-1">
                            Note: Procivis One supports background images, but none is specified in this schema
                          </span>
                        )}
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
                    backgroundImage={procivisPreview.backgroundImage}
                    logo={procivisPreview.logo}
                    logoFontColor={procivisPreview.logoFontColor}
                    logoBackgroundColor={procivisPreview.logoBackgroundColor}
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
                      {formatType === "ProcivisOne" && !procivisPreview.backgroundImage && (
                        <span className="block text-xs text-amber-600 mt-1">
                          Note: Procivis One supports background images, but none is specified in this schema
                        </span>
                      )}
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
                    backgroundImage={procivisPreview.backgroundImage}
                    logo={procivisPreview.logo}
                    logoFontColor={procivisPreview.logoFontColor}
                    logoBackgroundColor={procivisPreview.logoBackgroundColor}
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
