import { DesignSpecification, OwnerData } from "../types/design-spec";
import { ProcivisOneSchema, ProcivisOneClaim } from "../types/procivis-one-spec";
import { getBrandingOverlay, getMetaOverlay, getLabelOverlays } from "./design-parser";

export function convertOCAToProcivisOne(specification: DesignSpecification): ProcivisOneSchema {
  const metaOverlay = getMetaOverlay(specification);
  const brandingOverlay = getBrandingOverlay(specification);
  const labelOverlays = getLabelOverlays(specification);
  
  // Generate claims from capture bases and label overlays
  const claims = specification.capture_bases.flatMap(base => {
    const baseLabelOverlay = labelOverlays.find(overlay => overlay.capture_base === base.digest);
    
    return Object.entries(base.attributes).map(([key, type]) => {
      // Handle nested pets
      if (key === "pets") {
        const petBaseLabelOverlay = labelOverlays.find(
          overlay => overlay.capture_base === "IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j"
        );
        
        // Find the pet capture base
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
      
      // Standard claim
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
  // Base capture base for owner information
  const ownerCaptureBase = {
    type: "spec/capture_base/1.0",
    digest: "IH9w8JN_ZE4maSfcs27R33JdV_ClH7jilM9mnlS9j_0j",
    attributes: {} as Record<string, string>
  };
  
  // Base capture base for pet information
  const petCaptureBase = {
    type: "spec/capture_base/1.0",
    digest: "IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j",
    attributes: {} as Record<string, string>
  };
  
  // Process claims and separate owner vs pet attributes
  const ownerLabelMap: Record<string, string> = {};
  const petLabelMap: Record<string, string> = {};
  
  // Find primary and secondary attribute names to use in the primary field template
  const primaryAttr = schema.layoutProperties.primaryAttribute.toLowerCase();
  const secondaryAttr = schema.layoutProperties.secondaryAttribute?.toLowerCase() || "";
  let primaryFieldTemplate = "";
  
  schema.claims.forEach(claim => {
    if (claim.key === "Pets" && claim.array && claim.datatype === "OBJECT") {
      // Process pet attributes
      claim.claims.forEach(petClaim => {
        petCaptureBase.attributes[petClaim.key.toLowerCase()] = "Text";
        petLabelMap[petClaim.key.toLowerCase()] = petClaim.key;
      });
      
      // Add pets to owner attributes
      ownerCaptureBase.attributes["pets"] = "Array[refs:IKLvtGx1NU0007DUTTmI_6Zw-hnGRFicZ5R4vAxg4j2j]";
    } else {
      // Process owner attributes
      const attrKey = claim.key.toLowerCase().replace(/\s+/g, "_");
      ownerCaptureBase.attributes[attrKey] = "Text";
      ownerLabelMap[attrKey] = claim.key;
    }
  });
  
  // Create a primary field template based on the Procivis One primary and secondary attributes
  if (primaryAttr === "firstname" && secondaryAttr === "lastname") {
    primaryFieldTemplate = "{{firstname}} {{lastname}} from {{address_country}}";
  } else if (primaryAttr === "lastname" && secondaryAttr === "firstname") {
    primaryFieldTemplate = "{{lastname}}, {{firstname}} from {{address_country}}";
  } else {
    // Fallback to a generic template using the attributes from the schema
    primaryFieldTemplate = `{{${primaryAttr}}}${secondaryAttr ? ` {{${secondaryAttr}}}` : ""} from {{address_country}}`;
  }
  
  // Create the OCA specification
  const specification: DesignSpecification = {
    capture_bases: [ownerCaptureBase, petCaptureBase],
    overlays: [
      // Data source overlay for owner
      {
        type: "extend/overlays/data_source/1.0",
        capture_base: ownerCaptureBase.digest,
        format: "json",
        attribute_sources: {
          firstname: "$.firstname",
          lastname: "$.lastname",
          address_street: "$.address.street",
          address_city: "$.address.city",
          address_country: "$.address.country",
          pets: "$.pets"
        }
      },
      // Data source overlay for pets
      {
        type: "extend/overlays/data_source/1.0",
        capture_base: petCaptureBase.digest,
        format: "json",
        attribute_sources: {
          name: "$.pets[*].name",
          race: "$.pets[*].race"
        }
      },
      // Branding overlay
      {
        type: "aries/overlays/branding/1.1",
        capture_base: ownerCaptureBase.digest,
        language: "en",
        theme: "light",
        logo: schema.layoutProperties.logo.image,
        primary_background_color: schema.layoutProperties.background.color,
        primary_field: primaryFieldTemplate
      },
      // Meta overlay
      {
        type: "spec/overlays/meta/1.0",
        capture_base: ownerCaptureBase.digest,
        language: "en",
        name: schema.name
      },
      // Label overlay for owner
      {
        capture_base: ownerCaptureBase.digest,
        type: "spec/overlays/label/1.0",
        language: "en",
        attribute_labels: ownerLabelMap
      },
      // Label overlay for pet
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

export function formatProcivisOnePreview(schema: ProcivisOneSchema, data: OwnerData): {
  title: string;
  primaryText: string;
  secondaryText: string;
  backgroundColor: string;
  backgroundImage?: string;
  logo?: string;
} {
  // Add null checks for schema and its properties
  if (!schema || !schema.layoutProperties) {
    console.warn('Schema or layoutProperties is undefined, using default values');
    return {
      title: schema?.name || 'Untitled',
      primaryText: data?.firstname || '',
      secondaryText: data?.lastname || '',
      backgroundColor: '#2C75E3', // Default blue color
      logo: ''
    };
  }
  
  const primaryAttr = schema.layoutProperties.primaryAttribute || "Firstname";
  const secondaryAttr = schema.layoutProperties.secondaryAttribute || "Lastname";
  
  // Extract primary and secondary text based on attribute names
  let primaryText = data.firstname || "";
  let secondaryText = data.lastname || "";
  
  if (primaryAttr.toLowerCase() === "firstname") {
    primaryText = data.firstname;
  } else if (primaryAttr.toLowerCase() === "lastname") {
    primaryText = data.lastname;
  }
  
  if (secondaryAttr.toLowerCase() === "firstname") {
    secondaryText = data.firstname;
  } else if (secondaryAttr.toLowerCase() === "lastname") {
    secondaryText = data.lastname;
  }
  
  // Extract background image if available
  const backgroundImage = schema.layoutProperties.background?.image;
  
  return {
    title: schema.name || 'Untitled',
    primaryText,
    secondaryText,
    backgroundColor: schema.layoutProperties.background?.color || '#2C75E3',
    backgroundImage,
    logo: schema.layoutProperties.logo?.image
  };
}
