
export interface ProcivisOneClaim {
  id: string;
  createdDate: string;
  lastModified: string;
  key: string;
  datatype: "STRING" | "NUMBER" | "BOOLEAN" | "OBJECT" | "DATE";
  required: boolean;
  array: boolean;
  claims: ProcivisOneClaim[];
}

export interface ProcivisOneBackground {
  color: string;
}

export interface ProcivisOneLogo {
  image: string;
  fontColor: string;
  backgroundColor: string;
}

export interface ProcivisOneLayoutProperties {
  background: ProcivisOneBackground;
  logo: ProcivisOneLogo;
  primaryAttribute: string;
  secondaryAttribute?: string;
}

export interface ProcivisOneSchema {
  id: string;
  createdDate: string;
  lastModified: string;
  name: string;
  format: string;
  revocationMethod: string;
  organisationId: string;
  claims: ProcivisOneClaim[];
  walletStorageType: string;
  schemaId: string;
  schemaType: string;
  importedSourceUrl: string;
  layoutType: string;
  layoutProperties: ProcivisOneLayoutProperties;
  allowSuspension: boolean;
  externalSchema: boolean;
}
