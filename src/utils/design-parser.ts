
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

export function getBrandingOverlay(specification: DesignSpecification): BrandingOverlay | undefined {
  return specification.overlays.find(
    overlay => overlay.type === "aries/overlays/branding/1.1"
  ) as BrandingOverlay | undefined;
}

export function getMetaOverlay(specification: DesignSpecification): MetaOverlay | undefined {
  return specification.overlays.find(
    overlay => overlay.type === "spec/overlays/meta/1.0"
  ) as MetaOverlay | undefined;
}

export function getDataSourceOverlays(specification: DesignSpecification): DataSourceOverlay[] {
  return specification.overlays.filter(
    overlay => overlay.type === "extend/overlays/data_source/1.0"
  ) as DataSourceOverlay[];
}

export function getLabelOverlays(specification: DesignSpecification): LabelOverlay[] {
  return specification.overlays.filter(
    overlay => overlay.type === "spec/overlays/label/1.0"
  ) as LabelOverlay[];
}

export function getClusterOrderingOverlays(specification: DesignSpecification): ClusterOrderingOverlay[] {
  return specification.overlays.filter(
    overlay => overlay.type === "extend/overlays/cluster_ordering/1.0"
  ) as ClusterOrderingOverlay[];
}

export function getCaptureBaseById(specification: DesignSpecification, id: string): CaptureBase | undefined {
  return specification.capture_bases.find(base => base.digest === id);
}

export function getAttributeLabel(specification: DesignSpecification, baseId: string, attributeName: string): string {
  const labelOverlays = getLabelOverlays(specification);
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
  const processedTemplate = template.replace(/{{(\w+)\.(\w+)}}/g, (match, obj, prop) => {
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
