
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
