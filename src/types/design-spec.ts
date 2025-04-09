
export interface CaptureBase {
  type: string;
  digest: string;
  attributes: Record<string, string>;
}

export interface DataSourceOverlay {
  type: string;
  capture_base: string;
  format: string;
  attribute_sources: Record<string, string>;
}

export interface BrandingOverlay {
  type: string;
  capture_base: string;
  language: string;
  theme: string;
  logo: string;
  primary_background_color: string;
  primary_field: string;
}

export interface MetaOverlay {
  type: string;
  capture_base: string;
  language: string;
  name: string;
}

export interface ClusterOrderingOverlay {
  capture_base: string;
  type: string;
  language: string;
  cluster_order: Record<string, number>;
  cluster_labels: Record<string, string>;
  attribute_cluster_order: Record<string, Record<string, number>>;
}

export interface LabelOverlay {
  capture_base: string;
  type: string;
  language: string;
  attribute_labels: Record<string, string>;
}

export interface DesignSpecification {
  capture_bases: CaptureBase[];
  overlays: Array<
    | DataSourceOverlay
    | BrandingOverlay
    | MetaOverlay
    | ClusterOrderingOverlay
    | LabelOverlay
  >;
}

export interface PetData {
  name: string;
  race: string;
}

export interface OwnerData {
  firstname: string;
  lastname: string;
  address: {
    street: string;
    city: string;
    country: string;
  };
  pets: PetData[];
}
