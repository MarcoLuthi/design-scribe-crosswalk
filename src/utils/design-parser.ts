
import { 
  BrandingOverlay, 
  CaptureBase, 
  ClusterOrderingOverlay, 
  DataSourceOverlay, 
  DesignSpecification, 
  LabelOverlay, 
  MetaOverlay, 
  OwnerData
} from "../types/design-spec";

export function getBrandingOverlay(specification: DesignSpecification, language?: string): BrandingOverlay | undefined {
  if (language) {
    return specification.overlays.find(
      overlay => overlay.type === "aries/overlays/branding/1.1" && 'language' in overlay && overlay.language === language
    ) as BrandingOverlay | undefined;
  }
  
  return specification.overlays.find(
    overlay => overlay.type === "aries/overlays/branding/1.1"
  ) as BrandingOverlay | undefined;
}

export function getMetaOverlay(specification: DesignSpecification, language?: string): MetaOverlay | undefined {
  if (language) {
    return specification.overlays.find(
      overlay => overlay.type === "spec/overlays/meta/1.0" && 'language' in overlay && overlay.language === language
    ) as MetaOverlay | undefined;
  }
  
  return specification.overlays.find(
    overlay => overlay.type === "spec/overlays/meta/1.0"
  ) as MetaOverlay | undefined;
}

export function getDataSourceOverlays(specification: DesignSpecification): DataSourceOverlay[] {
  return specification.overlays.filter(
    overlay => overlay.type === "extend/overlays/data_source/1.0"
  ) as DataSourceOverlay[];
}

export function getLabelOverlays(specification: DesignSpecification, language?: string): LabelOverlay[] {
  if (language) {
    return specification.overlays.filter(
      overlay => overlay.type === "spec/overlays/label/1.0" && 'language' in overlay && overlay.language === language
    ) as LabelOverlay[];
  }
  
  return specification.overlays.filter(
    overlay => overlay.type === "spec/overlays/label/1.0"
  ) as LabelOverlay[];
}

export function getClusterOrderingOverlays(specification: DesignSpecification): ClusterOrderingOverlay[] {
  return specification.overlays.filter(
    overlay => overlay.type === "extend/overlays/cluster_ordering/1.0"
  ) as ClusterOrderingOverlay[];
}

export function getAvailableLanguages(specification: DesignSpecification): string[] {
  const languages = new Set<string>();
  
  specification.overlays.forEach(overlay => {
    if ('language' in overlay && typeof overlay.language === 'string') {
      languages.add(overlay.language);
    }
  });
  
  return Array.from(languages);
}

export function getCaptureBaseById(specification: DesignSpecification, id: string): CaptureBase | undefined {
  return specification.capture_bases.find(base => base.digest === id);
}

export function getAttributeLabel(specification: DesignSpecification, baseId: string, attributeName: string, language?: string): string {
  const labelOverlays = getLabelOverlays(specification, language);
  for (const overlay of labelOverlays) {
    if (overlay.capture_base === baseId && overlay.attribute_labels[attributeName]) {
      return overlay.attribute_labels[attributeName];
    }
  }
  return attributeName;
}

export function formatPrimaryField(template: string, data: OwnerData): string {
  if (!template) return "";
  
  // First process any nested properties like address.country
  const processedTemplate = template.replace(/{{(\w+)_(\w+)}}/g, (match, obj, prop) => {
    if (obj === 'address' && data.address && data.address[prop as keyof typeof data.address]) {
      return data.address[prop as keyof typeof data.address];
    }
    return match; // Return unmodified if not found
  });
  
  // Then process simple properties
  return processedTemplate.replace(/{{(\w+)}}/g, (match, key) => {
    if (key === 'firstname' && data.firstname) return data.firstname;
    if (key === 'lastname' && data.lastname) return data.lastname;
    if (key in data) {
      const value = data[key as keyof typeof data];
      // Only return if it's a string value
      if (typeof value === 'string') return value;
    }
    return match; // Return unmodified if not found
  });
}

export function validateSpecification(spec: any): { valid: boolean; error: string | null } {
  // Check if capture_bases and overlays exist and are arrays
  if (!spec.capture_bases || !Array.isArray(spec.capture_bases)) {
    return { valid: false, error: "Missing or invalid 'capture_bases' array" };
  }
  
  if (!spec.overlays || !Array.isArray(spec.overlays)) {
    return { valid: false, error: "Missing or invalid 'overlays' array" };
  }
  
  // Check each capture base
  for (let i = 0; i < spec.capture_bases.length; i++) {
    const base = spec.capture_bases[i];
    
    if (!base.type || typeof base.type !== 'string') {
      return { valid: false, error: `Capture base at index ${i} is missing 'type' field` };
    }
    
    if (!base.digest || typeof base.digest !== 'string') {
      return { valid: false, error: `Capture base at index ${i} is missing 'digest' field` };
    }
    
    if (!base.attributes || typeof base.attributes !== 'object') {
      return { valid: false, error: `Capture base at index ${i} is missing 'attributes' object` };
    }
  }
  
  // Check for required overlay types
  let hasBranding = false;
  let hasMeta = false;
  let hasDataSource = false;
  
  for (const overlay of spec.overlays) {
    if (!overlay.type || typeof overlay.type !== 'string') {
      return { valid: false, error: "Overlay missing 'type' field" };
    }
    
    if (!overlay.capture_base || typeof overlay.capture_base !== 'string') {
      return { valid: false, error: `Overlay of type '${overlay.type}' is missing 'capture_base' field` };
    }
    
    // Check if the referenced capture_base exists
    const baseExists = spec.capture_bases.some((base: any) => base.digest === overlay.capture_base);
    if (!baseExists) {
      return { valid: false, error: `Overlay references non-existent capture_base: '${overlay.capture_base}'` };
    }
    
    // Track required overlay types
    if (overlay.type === "aries/overlays/branding/1.1") {
      hasBranding = true;
    } else if (overlay.type === "spec/overlays/meta/1.0") {
      hasMeta = true;
    } else if (overlay.type === "extend/overlays/data_source/1.0") {
      hasDataSource = true;
    }
    
    // Specific validation for different overlay types
    if (overlay.type === "extend/overlays/data_source/1.0") {
      if (!overlay.format || typeof overlay.format !== 'string') {
        return { valid: false, error: "Data source overlay missing 'format' field" };
      }
      if (!overlay.attribute_sources || typeof overlay.attribute_sources !== 'object') {
        return { valid: false, error: "Data source overlay missing 'attribute_sources' object" };
      }
    } else if (overlay.type === "aries/overlays/branding/1.1") {
      if (!overlay.language || typeof overlay.language !== 'string') {
        return { valid: false, error: "Branding overlay missing 'language' field" };
      }
      if (!overlay.primary_background_color || typeof overlay.primary_background_color !== 'string') {
        return { valid: false, error: "Branding overlay missing 'primary_background_color' field" };
      }
    } else if (overlay.type === "spec/overlays/meta/1.0") {
      if (!overlay.language || typeof overlay.language !== 'string') {
        return { valid: false, error: "Meta overlay missing 'language' field" };
      }
      if (!overlay.name || typeof overlay.name !== 'string') {
        return { valid: false, error: "Meta overlay missing 'name' field" };
      }
    }
  }
  
  // Check if required overlay types are present
  if (!hasBranding) {
    return { valid: false, error: "Required branding overlay (aries/overlays/branding/1.1) is missing" };
  }
  
  if (!hasMeta) {
    return { valid: false, error: "Required meta overlay (spec/overlays/meta/1.0) is missing" };
  }
  
  if (!hasDataSource) {
    return { valid: false, error: "Required data source overlay (extend/overlays/data_source/1.0) is missing" };
  }
  
  return { valid: true, error: null };
}
