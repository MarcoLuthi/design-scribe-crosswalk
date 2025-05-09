
import { useState, useEffect, useMemo } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { defaultData, defaultSpecification } from "@/data/default-specification";
import { defaultProcivisOneSchema } from "@/data/default-procivis-spec";
import JsonEditor from "./JsonEditor";
import PetPermit from "./PetPermit";
import { 
  formatPrimaryField, 
  getBrandingOverlay, 
  getMetaOverlay, 
  getDataSourceOverlays, 
  getAvailableLanguages,
  getAttributeLabel,
  getLabelOverlays,
  validateSpecification
} from "@/utils/design-parser";
import { DesignSpecification, OwnerData, PetData } from "@/types/design-spec";
import { ProcivisOneSchema } from "@/types/procivis-one-spec";
import { 
  convertOCAToProcivisOne, 
  convertProcivisOneToOCA, 
  formatProcivisOnePreview,
  createDefaultDataFromSchema 
} from "@/utils/format-converter";
import { Button } from "@/components/ui/button";
import ProcivisOneCard from "./ProcivisOneCard";
import { ArrowLeftRight, X, PlusCircle, ChevronDown, ChevronUp, Copy, Check, AlertTriangle } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormatType = "OCA" | "ProcivisOne";
type LanguageOption = "en" | "de" | "fr" | "it";

const TranslationDashboard = () => {
  const [specification, setSpecification] = useState<DesignSpecification>(defaultSpecification);
  const [data, setData] = useState<OwnerData>(defaultData);
  const [formatType, setFormatType] = useState<FormatType>("OCA");
  const [procivisSpec, setProcivisSpec] = useState<ProcivisOneSchema>(defaultProcivisOneSchema);
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
  const [selectedLanguage, setSelectedLanguage] = useState<LanguageOption>("en");
  const [isCopied, setIsCopied] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  const [convertedFormat, setConvertedFormat] = useState<FormatType | null>(null);
  const [convertedData, setConvertedData] = useState<OwnerData | null>(null);
  
  const { toast } = useToast();
  const brandingOverlay = getBrandingOverlay(specification, selectedLanguage);
  const metaOverlay = getMetaOverlay(specification, selectedLanguage);
  const labelOverlays = getLabelOverlays(specification, selectedLanguage);
  
  const primaryField = brandingOverlay 
    ? formatPrimaryField(brandingOverlay.primary_field, data)
    : "";
  
  const procivisPreview = formatProcivisOnePreview(procivisSpec, data);
  
  const convertedOCAPreview = useMemo(() => {
    if (!convertedFormat || convertedFormat !== "OCA" || !convertedJson) return null;
    
    const parsedSpec = JSON.parse(convertedJson) as DesignSpecification;
    const convertedBrandingOverlay = getBrandingOverlay(parsedSpec, "en");
    const convertedMetaOverlay = getMetaOverlay(parsedSpec, "en");
    
    return {
      title: convertedMetaOverlay?.name || "SWIYU",
      primaryField: convertedBrandingOverlay?.primary_field || "",
      backgroundColor: convertedBrandingOverlay?.primary_background_color || "#2C75E3",
      logo: convertedBrandingOverlay?.logo,
      data: convertedData || data
    };
  }, [convertedFormat, convertedJson, convertedData, data]);
  
  const convertedProcivisPreview = useMemo(() => {
    if (!convertedFormat || convertedFormat !== "ProcivisOne" || !convertedJson) return null;
    
    const parsedSpec = JSON.parse(convertedJson) as ProcivisOneSchema;
    return formatProcivisOnePreview(parsedSpec, convertedData || data);
  }, [convertedFormat, convertedJson, convertedData, data]);
  
  const availableLanguages = useMemo(() => {
    if (formatType !== "OCA") return [{ value: "en" as LanguageOption, label: "English" }];
    
    const languages = getAvailableLanguages(specification);
    
    if (languages.length === 0) {
      languages.push("en");
    }
    
    return languages.map(lang => {
      const labelMap: Record<string, string> = {
        "en": "English",
        "de": "German",
        "fr": "French",
        "it": "Italian"
      };
      
      return {
        value: lang as LanguageOption,
        label: labelMap[lang] || lang
      };
    });
  }, [specification, formatType]);
  
  useEffect(() => {
    if (availableLanguages.length > 0) {
      const defaultLang = availableLanguages.find(lang => lang.value === selectedLanguage);
      if (!defaultLang) {
        const firstLangValue = availableLanguages[0].value;
        setSelectedLanguage(firstLangValue);
      }
    }
  }, [availableLanguages, selectedLanguage]);
  
  useEffect(() => {
    if (formatType === "OCA") {
      extractOCADataStructure();
    } else {
      extractProcivisOneDataStructure();
    }
  }, [specification, procivisSpec, formatType]);
  
  const extractOCADataStructure = () => {
    const structure: {
      simple: { [key: string]: string[] },
      arrays: { [key: string]: { fields: string[] } }
    } = {
      simple: {},
      arrays: {}
    };
    
    const dataSourceOverlays = getDataSourceOverlays(specification);
    
    dataSourceOverlays.forEach(overlay => {
      const captureBase = specification.capture_bases.find(base => base.digest === overlay.capture_base);
      if (!captureBase) return;
      
      Object.entries(overlay.attribute_sources).forEach(([attribute, path]) => {
        const sourcePath = path as string;
        
        if (sourcePath.includes('[*]')) {
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
        } else {
          const pathParts = sourcePath.replace(/\$\./g, '').split('.');
          
          if (pathParts.length === 1) {
            if (!structure.simple['root']) {
              structure.simple['root'] = [];
            }
            if (!structure.simple['root'].includes(pathParts[0])) {
              structure.simple['root'].push(pathParts[0]);
            }
          } else {
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
          structure.arrays[key] = { fields: [] };
          
          if (claim.claims && claim.claims.length > 0) {
            claim.claims.forEach((subClaim: any) => {
              if (subClaim.datatype !== "OBJECT") {
                structure.arrays[key].fields.push(subClaim.key.toLowerCase());
              }
            });
          }
        } else if (claim.datatype === "OBJECT" && !claim.array) {
          const groupKey = key;
          structure.simple[groupKey] = [];
          
          if (claim.claims && claim.claims.length > 0) {
            processClaimsRecursively(claim.claims, `${prefix}${key}.`, groupKey);
          }
        } else {
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
    setConvertedFormat(null);
    setConvertedData(null);
    setValidationError(null);
  };
  
  const handleSpecificationUpdate = (newSpec: object) => {
    setValidationError(null);
    
    if (formatType === "OCA") {
      try {
        const typedSpec = newSpec as DesignSpecification;
        
        // Validate the specification structure
        const validationResult = validateSpecification(typedSpec);
        if (!validationResult.valid) {
          setValidationError(validationResult.error);
          toast({
            variant: "destructive",
            title: "Invalid specification",
            description: validationResult.error
          });
          return;
        }
        
        setSpecification(typedSpec);
        setActiveEditorJSON(typedSpec);
        setProcivisSpec(convertOCAToProcivisOne(typedSpec));
        toast({
          title: "Specification updated",
          description: "OCA specification has been successfully updated."
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setValidationError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error updating specification",
          description: errorMessage
        });
      }
    } else {
      try {
        const typedSpec = newSpec as ProcivisOneSchema;
        setProcivisSpec(typedSpec);
        setActiveEditorJSON(typedSpec);
        setSpecification(convertProcivisOneToOCA(typedSpec));
        toast({
          title: "Specification updated",
          description: "Procivis One specification has been successfully updated."
        });
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
        setValidationError(errorMessage);
        toast({
          variant: "destructive",
          title: "Error updating specification",
          description: errorMessage
        });
      }
    }
    setConvertedJson(null);
    setConvertedFormat(null);
    setConvertedData(null);
  };
  
  const handleConvertToOCA = () => {
    const convertedSpec = convertProcivisOneToOCA(procivisSpec);
    
    const newData = { ...data };
    
    setConvertedJson(JSON.stringify(convertedSpec, null, 2));
    setConvertedFormat("OCA");
    setConvertedData(newData);
    
    toast({
      title: "Format converted",
      description: "Successfully converted from Procivis One to OCA format",
    });
  };
  
  const handleConvertToProcivisOne = () => {
    const convertedSpec = convertOCAToProcivisOne(specification);
    
    const newData = { ...data };
    
    setConvertedJson(JSON.stringify(convertedSpec, null, 2));
    setConvertedFormat("ProcivisOne");
    setConvertedData(newData);
    
    toast({
      title: "Format converted",
      description: "Successfully converted from OCA to Procivis One format",
    });
  };
  
  const handleCloseJsonOutput = () => {
    setConvertedJson(null);
    setConvertedFormat(null);
    setConvertedData(null);
  };
  
  const handleCopyJson = () => {
    if (convertedJson) {
      navigator.clipboard.writeText(convertedJson);
      setIsCopied(true);
      
      toast({
        title: "Copied to clipboard",
        description: "The JSON has been copied to your clipboard",
      });
      
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    }
  };
  
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
  
  const updateDataField = (fieldPath: string, value: string) => {
    const newData = { ...data };
    const parts = fieldPath.split('.');
    
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
  
  const addArrayItem = (arrayName: string) => {
    const newData = { ...data };
    
    if (!newData[arrayName as keyof typeof newData]) {
      if (arrayName === 'pets') {
        newData.pets = [] as PetData[];
      } else {
        (newData as any)[arrayName] = [];
      }
    }
    
    const newItem: Record<string, string> = {};
    if (dataStructure.arrays[arrayName]) {
      dataStructure.arrays[arrayName].fields.forEach(field => {
        newItem[field] = "";
      });
    }
    
    if (arrayName === 'pets') {
      newData.pets.push(newItem as unknown as PetData);
    } else {
      ((newData as any)[arrayName] as any[]).push(newItem);
    }
    
    setData(newData as OwnerData);
  };
  
  const updateArrayItem = (arrayName: string, index: number, field: string, value: string) => {
    const newData = { ...data };
    
    if (!newData[arrayName as keyof typeof newData]) {
      if (arrayName === 'pets') {
        newData.pets = [] as PetData[];
      } else {
        (newData as any)[arrayName] = [];
      }
    }
    
    if (arrayName === 'pets') {
      if (!newData.pets[index]) {
        newData.pets[index] = { name: '', race: '' } as PetData;
      }
      (newData.pets[index] as any)[field] = value;
    } else {
      const array = (newData as any)[arrayName] as any[];
      if (!array[index]) {
        array[index] = {};
      }
      array[index][field] = value;
    }
    
    setData(newData as OwnerData);
  };
  
  const removeArrayItem = (arrayName: string, index: number) => {
    const newData = { ...data };
    
    if (arrayName === 'pets' && newData.pets) {
      newData.pets = newData.pets.filter((_, i) => i !== index);
    } else if (newData[arrayName as keyof typeof newData]) {
      const array = newData[arrayName as keyof typeof newData] as any[];
      (newData as any)[arrayName] = array.filter((_, i) => i !== index);
    }
    
    setData(newData as OwnerData);
  };
  
  const getLocalizedFieldLabel = (field: string, group: string): string => {
    if (formatType !== "OCA") {
      return field.charAt(0).toUpperCase() + field.slice(1);
    }
    
    let captureBaseId = "";
    specification.capture_bases.forEach(base => {
      if (base.digest === "IH9w8JN_ZE4maSfcs27R33JdV_ClH7jilM9mnlS9j_0j") {
        if (group === "root" || group === "address") {
          captureBaseId = base.digest;
        }
      }
      else if (base.digest === "IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j") {
        if (group === "pets") {
          captureBaseId = base.digest;
        }
      }
    });
    
    if (!captureBaseId) return field.charAt(0).toUpperCase() + field.slice(1);
    
    const dataSourceOverlays = getDataSourceOverlays(specification);
    let attributeName = field;
    
    for (const overlay of dataSourceOverlays) {
      if (overlay.capture_base === captureBaseId) {
        for (const [attr, path] of Object.entries(overlay.attribute_sources)) {
          const sourcePath = path as string;
          if (sourcePath === `$.${field}` || 
              sourcePath === `$.${group}.${field}` ||
              sourcePath === `$.pets[*].${field}`) {
            attributeName = attr;
            break;
          }
        }
      }
    }
    
    return getAttributeLabel(specification, captureBaseId, attributeName, selectedLanguage);
  };
  
  const getLocalizedGroupLabel = (group: string): string => {
    if (group === 'root') return 'General Information';
    
    if (formatType === "OCA") {
      const clusterOrderings = specification.overlays.filter(
        overlay => overlay.type === "extend/overlays/cluster_ordering/1.0" && 
                  'language' in overlay && 
                  overlay.language === selectedLanguage
      );
      
      for (const overlay of clusterOrderings) {
        if ('cluster_labels' in overlay && overlay.cluster_labels[group]) {
          return overlay.cluster_labels[group];
        }
      }
    }
    
    return group.charAt(0).toUpperCase() + group.slice(1);
  };
  
  const renderDataEditor = () => {
    return (
      <div className="space-y-6">
        {Object.entries(dataStructure.simple).map(([group, fields]) => {
          if (fields.length === 0) return null;
          
          const groupLabel = getLocalizedGroupLabel(group);
          
          return (
            <div key={group} className="space-y-4">
              <h3 className="text-base font-medium">{groupLabel}</h3>
              <div className="space-y-3">
                {fields.map(field => {
                  const fieldPath = group === 'root' ? field : `${group}.${field}`;
                  const fieldValue = getNestedValue(data, fieldPath);
                  const fieldLabel = getLocalizedFieldLabel(field, group);
                  
                  return (
                    <div key={fieldPath} className="grid grid-cols-3 items-center gap-4">
                      <label className="text-sm font-medium text-right">
                        {fieldLabel}:
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
        
        {Object.entries(dataStructure.arrays).map(([arrayName, arrayConfig]) => {
          const items = data[arrayName as keyof typeof data] as any[] || [];
          const arrayLabel = getLocalizedGroupLabel(arrayName);
          const singularArrayName = arrayName.slice(0, -1);
          
          return (
            <div key={arrayName} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-medium">{arrayLabel}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem(arrayName)}
                >
                  <PlusCircle className="h-4 w-4 mr-1" />
                  Add {singularArrayName}
                </Button>
              </div>
              
              {items.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      {arrayConfig.fields.map(field => (
                        <TableHead key={field}>
                          {getLocalizedFieldLabel(field, arrayName)}
                        </TableHead>
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
                  No {arrayName} added yet. Click "Add {singularArrayName}" to add one.
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
      <h1 className="text-3xl font-bold mb-4">Credential Design Converter</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Tabs defaultValue="specification" className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="specification">Design Specification</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="specification">
            <Card>
              <CardHeader>
                <CardTitle>Base Design Specification</CardTitle>
                <CardDescription>
                  Paste the schema you are trying to convert.
                </CardDescription>
                <div className="mt-4">
                  <ToggleGroup className="w-full" type="single" value={formatType} onValueChange={(value) => value && handleFormatToggle(value as FormatType)}>
                    <ToggleGroupItem className="flex-1" value="OCA">SWIYU OCA Format</ToggleGroupItem>
                    <ToggleGroupItem className="flex-1" value="ProcivisOne">Procivis One Format</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </CardHeader>
              <CardContent>
                {validationError && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Validation Error</AlertTitle>
                    <AlertDescription>{validationError}</AlertDescription>
                  </Alert>
                )}
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
                      Edit the attribute values that will be displayed in your design
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
          <Card>
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Preview</CardTitle>
                  <CardDescription>
                    Visualization of the {formatType === "OCA" ? "SWIYU OCA" : "Procivis One"} format
                    {formatType === "ProcivisOne" && !procivisPreview.backgroundImage && (
                      <span className="block text-xs text-amber-600 mt-1">
                        Note: Procivis One supports background images, but none is specified in this schema
                      </span>
                    )}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {formatType === "OCA" && availableLanguages.length > 0 && (
                    <Select value={selectedLanguage} onValueChange={(value) => setSelectedLanguage(value as LanguageOption)}>
                      <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableLanguages.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={formatType === "OCA" ? handleConvertToProcivisOne : handleConvertToOCA}
                    title={formatType === "OCA" ? "Convert to Procivis One" : "Convert to OCA"}
                  >
                    <ArrowLeftRight className="h-4 w-4 mr-2" />
                    {formatType === "OCA" ? "To Procivis One" : "To OCA"}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="flex justify-center p-6">
              {formatType === "OCA" ? (
                <PetPermit
                  title={metaOverlay?.name || "SWIYU"}
                  primaryField={brandingOverlay?.primary_field || ""}
                  backgroundColor={brandingOverlay?.primary_background_color || "#2C75E3"}
                  logo={brandingOverlay?.logo}
                  data={data}
                  language={selectedLanguage}
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
        </div>
      </div>
      
      {convertedJson && (
        <>
          <div className="flex items-center my-8 max-w-full">
            <Separator className="flex-1" />
            <div className="px-4 text-lg font-semibold text-muted-foreground">Converted</div>
            <Separator className="flex-1" />
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Converted {convertedFormat} Format</CardTitle>
                    <CardDescription>
                      JSON representation of the converted format
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="secondary" 
                      size="icon"
                      onClick={handleCopyJson}
                      className="h-9 w-9"
                    >
                      {isCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={handleCloseJsonOutput}
                      className="h-9 w-9"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-[600px] overflow-y-auto whitespace-pre">
                  {convertedJson}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Converted Format Preview</CardTitle>
                <CardDescription>
                  Visualization of the converted {convertedFormat} format
                </CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center p-6">
                {convertedFormat === "OCA" && convertedOCAPreview && (
                  <PetPermit
                    title={convertedOCAPreview.title}
                    primaryField={convertedOCAPreview.primaryField}
                    backgroundColor={convertedOCAPreview.backgroundColor}
                    logo={convertedOCAPreview.logo}
                    data={data}
                    language="en"
                  />
                )}
                {convertedFormat === "ProcivisOne" && convertedProcivisPreview && (
                  <ProcivisOneCard
                    title={convertedProcivisPreview.title}
                    primaryText={convertedProcivisPreview.primaryText}
                    secondaryText={convertedProcivisPreview.secondaryText}
                    backgroundColor={convertedProcivisPreview.backgroundColor}
                    backgroundImage={convertedProcivisPreview.backgroundImage}
                    logo={convertedProcivisPreview.logo}
                    logoFontColor={convertedProcivisPreview.logoFontColor}
                    logoBackgroundColor={convertedProcivisPreview.logoBackgroundColor}
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default TranslationDashboard;
