
import { DesignSpecification, OwnerData } from "../types/design-spec";
import { ProcivisOneSchema, ProcivisOneClaim } from "../types/procivis-one-spec";
import { getBrandingOverlay, getMetaOverlay, getLabelOverlays } from "./design-parser";

export function convertOCAToProcivisOne(specification: DesignSpecification): ProcivisOneSchema {
  const metaOverlay = getMetaOverlay(specification);
  const brandingOverlay = getBrandingOverlay(specification);
  const labelOverlays = getLabelOverlays(specification);
  
  const claims = specification.capture_bases.flatMap(base => {
    const baseLabelOverlay = labelOverlays.find(overlay => overlay.capture_base === base.digest);
    
    return Object.entries(base.attributes).map(([key, type]) => {
      if (key === "pets") {
        const petBaseLabelOverlay = labelOverlays.find(
          overlay => overlay.capture_base === "IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j"
        );
        
        const petBase = specification.capture_bases.find(
          base => base.digest === "IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j"
        );
        
        const petClaims = petBase ? Object.entries(petBase.attributes).map(([petKey, petType]) => {
          const label = petBaseLabelOverlay?.attribute_labels[petKey] || petKey;
          
          return {
            id: "",
            createdDate: "",
            lastModified: "",
            key: label,
            datatype: "STRING" as const,
            required: true,
            array: false,
            claims: []
          };
        }) : [];
        
        return {
          id: "",
          createdDate: "",
          lastModified: "",
          key: baseLabelOverlay?.attribute_labels[key] || key,
          datatype: "OBJECT" as const,
          required: true,
          array: true,
          claims: petClaims
        };
      }
      
      return {
        id: "",
        createdDate: "",
        lastModified: "",
        key: baseLabelOverlay?.attribute_labels[key] || key,
        datatype: "STRING" as const,
        required: true,
        array: false,
        claims: []
      };
    });
  });

  return {
    id: "",
    createdDate: "",
    lastModified: "",
    name: metaOverlay?.name || "Unnamed Schema",
    format: "SD_JWT",
    revocationMethod: "NONE",
    organisationId: "",
    claims,
    walletStorageType: "SOFTWARE",
    schemaId: "",
    schemaType: "ProcivisOneSchema2024",
    importedSourceUrl: "",
    layoutType: "CARD",
    layoutProperties: {
      background: {
        color: brandingOverlay?.primary_background_color || "#2C75E3"
      },
      logo: {
        image: brandingOverlay?.logo || "",
        fontColor: "#fff",
        backgroundColor: brandingOverlay?.primary_background_color || "#2C75E3"
      },
      primaryAttribute: "Firstname",
      secondaryAttribute: "Lastname"
    },
    allowSuspension: false,
    externalSchema: false
  };
}

export function convertProcivisOneToOCA(schema: ProcivisOneSchema): DesignSpecification {
  const ownerCaptureBase = {
    type: "spec/capture_base/1.0",
    digest: "IH9w8JN_ZE4maSfcs27R33JdV_ClH7jilM9mnlS9j_0j",
    attributes: {} as Record<string, string>
  };
  
  const petCaptureBase = {
    type: "spec/capture_base/1.0",
    digest: "IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j",
    attributes: {} as Record<string, string>
  };
  
  const ownerLabelMap: Record<string, string> = {};
  const petLabelMap: Record<string, string> = {};
  const ownerDataSourceMap: Record<string, string> = {};
  const petDataSourceMap: Record<string, string> = {};
  
  const groupedAttributes: Record<string, string[]> = {};
  
  const primaryAttr = schema.layoutProperties.primaryAttribute.toLowerCase();
  const secondaryAttr = schema.layoutProperties.secondaryAttribute?.toLowerCase() || "";
  let primaryFieldTemplate = "";
  
  schema.claims.forEach(claim => {
    const claimKey = claim.key.toLowerCase().replace(/\s+/g, "_");
    
    if (claim.key === "Pets" && claim.array && claim.datatype === "OBJECT") {
      claim.claims.forEach(petClaim => {
        const petKey = petClaim.key.toLowerCase().replace(/\s+/g, "_");
        petCaptureBase.attributes[petKey] = "Text";
        petLabelMap[petKey] = petClaim.key;
        petDataSourceMap[petKey] = `$.pets[*].${petKey}`;
      });
      
      ownerCaptureBase.attributes["pets"] = "Array[refs:IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j]";
      ownerDataSourceMap["pets"] = "$.pets";
    } else if (claim.datatype === "OBJECT" && !claim.array) {
      const groupKey = claimKey;
      groupedAttributes[groupKey] = [];
      
      claim.claims.forEach(nestedClaim => {
        const nestedKey = nestedClaim.key.toLowerCase().replace(/\s+/g, "_");
        const fullKey = `${groupKey}_${nestedKey}`;
        
        ownerCaptureBase.attributes[fullKey] = "Text";
        ownerLabelMap[fullKey] = nestedClaim.key;
        ownerDataSourceMap[fullKey] = `$.${groupKey}.${nestedKey}`;
        groupedAttributes[groupKey].push(nestedKey);
      });
    } else {
      ownerCaptureBase.attributes[claimKey] = "Text";
      ownerLabelMap[claimKey] = claim.key;
      ownerDataSourceMap[claimKey] = `$.${claimKey}`;
    }
  });
  
  if (primaryAttr === "firstname" && secondaryAttr === "lastname") {
    primaryFieldTemplate = "{{firstname}} {{lastname}} from {{address_country}}";
  } else if (primaryAttr === "lastname" && secondaryAttr === "firstname") {
    primaryFieldTemplate = "{{lastname}}, {{firstname}} from {{address_country}}";
  } else {
    primaryFieldTemplate = `{{${primaryAttr}}}${secondaryAttr ? ` {{${secondaryAttr}}}` : ""} from {{address_country}}`;
  }
  
  let backgroundColor = schema.layoutProperties.background?.color || "#2C75E3";
  
  if ((!backgroundColor || backgroundColor === "") && schema.layoutProperties.background?.image) {
    backgroundColor = "#2C75E3";
  }
  
  const specification: DesignSpecification = {
    capture_bases: [ownerCaptureBase, petCaptureBase],
    overlays: [
      {
        type: "extend/overlays/data_source/1.0",
        capture_base: ownerCaptureBase.digest,
        format: "json",
        attribute_sources: ownerDataSourceMap
      },
      {
        type: "extend/overlays/data_source/1.0",
        capture_base: petCaptureBase.digest,
        format: "json",
        attribute_sources: petDataSourceMap
      },
      {
        type: "aries/overlays/branding/1.1",
        capture_base: ownerCaptureBase.digest,
        language: "en",
        theme: "light",
        logo: schema.layoutProperties.logo.image,
        primary_background_color: backgroundColor,
        primary_field: primaryFieldTemplate
      },
      {
        type: "spec/overlays/meta/1.0",
        capture_base: ownerCaptureBase.digest,
        language: "en",
        name: schema.name
      },
      {
        capture_base: ownerCaptureBase.digest,
        type: "spec/overlays/label/1.0",
        language: "en",
        attribute_labels: ownerLabelMap
      },
      {
        capture_base: petCaptureBase.digest,
        type: "spec/overlays/label/1.0",
        language: "en",
        attribute_labels: petLabelMap
      }
    ]
  };
  
  return specification;
}

export function createDefaultDataFromSchema(schema: ProcivisOneSchema): OwnerData {
  const data: Partial<OwnerData> = {
    firstname: "",
    lastname: "",
    address: {
      street: "",
      city: "",
      country: ""
    },
    pets: []
  };
  
  schema.claims.forEach(claim => {
    const key = claim.key.toLowerCase().replace(/\s+/g, "_");
    
    if (claim.datatype === "OBJECT" && claim.array) {
      if (key === "pets") {
        data.pets = [];
      } else {
        (data as any)[key] = [];
      }
    } else if (claim.datatype === "OBJECT" && !claim.array) {
      (data as any)[key] = {};
      
      claim.claims.forEach(nestedClaim => {
        const nestedKey = nestedClaim.key.toLowerCase().replace(/\s+/g, "_");
        ((data as any)[key] as any)[nestedKey] = "";
      });
    } else {
      if (claim.datatype === "STRING") {
        if (key === "firstname" || key === "lastname" || key === "id" || 
            typeof (data as any)[key] === 'string') {
          (data as any)[key] = "";
        }
      }
    }
  });
  
  return data as OwnerData;
}

export function formatProcivisOnePreview(schema: ProcivisOneSchema, data: OwnerData): {
  title: string;
  primaryText: string;
  secondaryText: string;
  backgroundColor: string;
  backgroundImage?: string;
  logo?: string;
  logoFontColor?: string;
  logoBackgroundColor?: string;
} {
  if (!schema || !schema.layoutProperties) {
    console.warn('Schema or layoutProperties is undefined, using default values');
    return {
      title: schema?.name || 'Untitled',
      primaryText: data?.firstname || '',
      secondaryText: '',
      backgroundColor: '#2C75E3',
      logo: '',
      logoFontColor: '#fff',
      logoBackgroundColor: '#2C75E3'
    };
  }
  
  const primaryAttr = schema.layoutProperties.primaryAttribute || "Firstname";
  const secondaryAttr = schema.layoutProperties.secondaryAttribute || "";
  
  let primaryText = '';
  let secondaryText = '';
  
  if (primaryAttr && primaryAttr.toLowerCase() === "firstname") {
    primaryText = data?.firstname || '';
  } else if (primaryAttr && primaryAttr.toLowerCase() === "lastname") {
    primaryText = data?.lastname || '';
  } else if (data && primaryAttr) {
    const key = primaryAttr.toLowerCase();
    const potentialValue = (data as any)[key];
    
    if (typeof potentialValue === 'string') {
      primaryText = potentialValue;
    }
  }
  
  if (secondaryAttr) {
    if (secondaryAttr.toLowerCase() === "firstname") {
      secondaryText = data?.firstname || '';
    } else if (secondaryAttr.toLowerCase() === "lastname") {
      secondaryText = data?.lastname || '';
    } else if (data) {
      const key = secondaryAttr.toLowerCase();
      const potentialValue = (data as any)[key];
      
      if (typeof potentialValue === 'string') {
        secondaryText = potentialValue;
      }
    }
  }
  
  const backgroundImage = schema.layoutProperties.background?.image;
  const logoFontColor = schema.layoutProperties.logo?.fontColor || '#fff';
  const logoBackgroundColor = schema.layoutProperties.logo?.backgroundColor || schema.layoutProperties.background?.color || '#2C75E3';
  
  return {
    title: schema.name || 'Untitled',
    primaryText,
    secondaryText,
    backgroundColor: schema.layoutProperties.background?.color || '',
    backgroundImage,
    logo: schema.layoutProperties.logo?.image || '',
    logoFontColor,
    logoBackgroundColor
  };
}
