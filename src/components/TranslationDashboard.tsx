
import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultData, defaultSpecification } from "@/data/default-specification";
import { defaultProcivisOneSchema } from "@/data/default-procivis-spec";
import JsonEditor from "./JsonEditor";
import PetPermit from "./PetPermit";
import { formatPrimaryField, getBrandingOverlay, getMetaOverlay, getDataSourceOverlays } from "@/utils/design-parser";
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
  const [dataStructure, setDataStructure] = useState<{
    simple: { [key: string]: string[] },
    arrays: { [key: string]: { fields: string[] } }
  }>({
    simple: {},
    arrays: {}
  });
  
  const brandingOverlay = getBrandingOverlay(specification);
  const metaOverlay = getMetaOverlay(specification);
  
  const primaryField = brandingOverlay 
    ? formatPrimaryField(brandingOverlay.primary_field, data)
    : "";
  
  const procivisPreview = formatProcivisOnePreview(procivisSpec, data);
  
  // Extract data structure from the current active specification
  useEffect(() => {
    if (formatType === "OCA") {
      extractOCADataStructure();
    } else {
      extractProcivisOneDataStructure();
    }
  }, [specification, procivisSpec, formatType]);
  
  // Extract data structure from OCA specification
  const extractOCADataStructure = () => {
    const structure: {
      simple: { [key: string]: string[] },
      arrays: { [key: string]: { fields: string[] } }
    } = {
      simple: {},
      arrays: {}
    };
    
    // Process data source overlays to determine data structure
    const dataSourceOverlays = getDataSourceOverlays(specification);
    
    dataSourceOverlays.forEach(overlay => {
      // Get the capture base for this overlay
      const captureBase = specification.capture_bases.find(base => base.digest === overlay.capture_base);
      if (!captureBase) return;
      
      Object.entries(overlay.attribute_sources).forEach(([attribute, path]) => {
        const sourcePath = path as string;
        
        // Process array attributes
        if (sourcePath.includes('[*]')) {
          // Extract the array name and field
          const arrayPathMatch = sourcePath.match(/\$\.(\w+)(?:\[\*\])(?:\.(\w+))?/);
          if (arrayPathMatch) {
            const arrayName = arrayPathMatch[1];
            const fieldName = arrayPathMatch[2];
            
            if (!structure.arrays[arrayName]) {
              structure.arrays[arrayName] = { fields: [] };
            }
            
            if (fieldName && !structure.arrays[arrayName].fields.includes(fieldName)) {
              structure.arrays[arrayName].fields.push(fieldName);
            }
          }
        } 
        // Process standard attributes
        else {
          const pathParts = sourcePath.replace(/\$\./g, '').split('.');
          
          if (pathParts.length === 1) {
            // Top-level attribute
            if (!structure.simple['root']) {
              structure.simple['root'] = [];
            }
            if (!structure.simple['root'].includes(pathParts[0])) {
              structure.simple['root'].push(pathParts[0]);
            }
          } else {
            // Nested attribute
            const group = pathParts[0];
            const field = pathParts[1];
            
            if (!structure.simple[group]) {
              structure.simple[group] = [];
            }
            
            if (!structure.simple[group].includes(field)) {
              structure.simple[group].push(field);
            }
          }
        }
      });
    });
    
    setDataStructure(structure);
  };
  
  // Extract data structure from Procivis One specification
  const extractProcivisOneDataStructure = () => {
    const structure: {
      simple: { [key: string]: string[] },
      arrays: { [key: string]: { fields: string[] } }
    } = {
      simple: {},
      arrays: {}
    };
    
    const processClaimsRecursively = (claims: any[], prefix = "", parentKey = ""): void => {
      claims.forEach(claim => {
        const key = claim.key.toLowerCase();
        
        if (claim.datatype === "OBJECT" && claim.array) {
          // Handle array of objects
          structure.arrays[key] = { fields: [] };
          
          if (claim.claims && claim.claims.length > 0) {
            claim.claims.forEach((subClaim: any) => {
              if (subClaim.datatype !== "OBJECT") {
                structure.arrays[key].fields.push(subClaim.key.toLowerCase());
              }
            });
          }
        } 
        else if (claim.datatype === "OBJECT" && !claim.array) {
          // Handle nested object (group)
          const groupKey = key;
          structure.simple[groupKey] = [];
          
          if (claim.claims && claim.claims.length > 0) {
            processClaimsRecursively(claim.claims, `${prefix}${key}.`, groupKey);
          }
        } 
        else {
          // Handle simple field
          if (parentKey) {
            if (!structure.simple[parentKey]) {
              structure.simple[parentKey] = [];
            }
            structure.simple[parentKey].push(key);
          } else {
            if (!structure.simple['root']) {
              structure.simple['root'] = [];
            }
            structure.simple['root'].push(key);
          }
        }
      });
    };
    
    if (procivisSpec.claims) {
      processClaimsRecursively(procivisSpec.claims);
    }
    
    setDataStructure(structure);
  };
  
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
  
  // Get or create nested value
  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split('.');
    let current = obj;
    
    for (let i = 0; i < parts.length; i++) {
      if (current[parts[i]] === undefined) {
        return "";
      }
      current = current[parts[i]];
    }
    
    return current;
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
  
  // Handle adding a new item to an array
  const addArrayItem = (arrayName: string) => {
    const newData = { ...data };
    if (!newData[arrayName as keyof typeof newData]) {
      newData[arrayName as keyof typeof newData] = [];
    }
    
    // Create new item with structure from dataStructure
    const newItem: Record<string, string> = {};
    if (dataStructure.arrays[arrayName]) {
      dataStructure.arrays[arrayName].fields.forEach(field => {
        newItem[field] = "";
      });
    }
    
    // Push the new item
    (newData[arrayName as keyof typeof newData] as any[]).push(newItem);
    setData(newData as OwnerData);
  };
  
  // Handle updating an array item
  const updateArrayItem = (arrayName: string, index: number, field: string, value: string) => {
    const newData = { ...data };
    if (!newData[arrayName as keyof typeof newData]) {
      newData[arrayName as keyof typeof newData] = [];
    }
    
    const array = newData[arrayName as keyof typeof newData] as any[];
    if (!array[index]) {
      array[index] = {};
    }
    
    array[index][field] = value;
    setData(newData as OwnerData);
  };
  
  // Handle removing an array item
  const removeArrayItem = (arrayName: string, index: number) => {
    const newData = { ...data };
    if (newData[arrayName as keyof typeof newData]) {
      const array = newData[arrayName as keyof typeof newData] as any[];
      newData[arrayName as keyof typeof newData] = array.filter((_, i) => i !== index) as any;
    }
    setData(newData as OwnerData);
  };
  
  // Render data editor based on the current data structure
  const renderDataEditor = () => {
    return (
      <div className="space-y-6">
        {/* Render simple fields grouped by their parent */}
        {Object.entries(dataStructure.simple).map(([group, fields]) => {
          // Skip empty groups
          if (fields.length === 0) return null;
          
          const groupLabel = group === 'root' ? 'General Information' : group.charAt(0).toUpperCase() + group.slice(1);
          
          return (
            <div key={group} className="space-y-4">
              <h3 className="text-base font-medium">{groupLabel}</h3>
              <div className="space-y-3">
                {fields.map(field => {
                  const fieldPath = group === 'root' ? field : `${group}.${field}`;
                  const fieldValue = getNestedValue(data, fieldPath);
                  
                  return (
                    <div key={fieldPath} className="grid grid-cols-3 items-center gap-4">
                      <label className="text-sm font-medium text-right capitalize">
                        {field}:
                      </label>
                      <input
                        type="text"
                        className="col-span-2 px-3 py-2 border rounded-md"
                        value={fieldValue || ""}
                        onChange={(e) => updateDataField(fieldPath, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        
        {/* Render array fields */}
        {Object.entries(dataStructure.arrays).map(([arrayName, arrayConfig]) => {
          const items = data[arrayName as keyof typeof data] as any[] || [];
          
          return (
            <div key={arrayName} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium capitalize">{arrayName}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(arrayName)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add {arrayName.slice(0, -1)}
                </Button>
              </div>
              
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {arrayConfig.fields.map(field => (
                        <TableHead key={field} className="capitalize">{field}</TableHead>
                      ))}
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow key={index}>
                        {arrayConfig.fields.map(field => (
                          <TableCell key={field}>
                            <input
                              type="text"
                              className="w-full px-2 py-1 border rounded-md"
                              value={item[field] || ""}
                              onChange={(e) => updateArrayItem(arrayName, index, field, e.target.value)}
                            />
                          </TableCell>
                        ))}
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeArrayItem(arrayName, index)}
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
                  No {arrayName} added yet. Click "Add {arrayName.slice(0, -1)}" to add one.
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
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
                  renderDataEditor()
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
