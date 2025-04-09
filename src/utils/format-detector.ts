
import { DesignSpecification } from "../types/design-spec";
import { ProcivisOneSchema } from "../types/procivis-one-spec";

export type FormatType = "OCA" | "ProcivisOne" | "Unknown";

/**
 * Detects the format type of a JSON object
 * @param json The JSON object to detect
 * @returns The detected format type
 */
export function detectFormatType(json: any): FormatType {
  if (!json || typeof json !== 'object') {
    return "Unknown";
  }

  // Check for OCA Format
  if (
    Array.isArray(json.capture_bases) && 
    Array.isArray(json.overlays) &&
    json.overlays.some((overlay: any) => 
      overlay.type === "spec/overlays/meta/1.0" || 
      overlay.type === "aries/overlays/branding/1.1" ||
      overlay.type === "spec/overlays/label/1.0"
    )
  ) {
    return "OCA";
  }

  // Check for Procivis One Format
  if (
    typeof json.name === 'string' &&
    json.format === "SD_JWT" &&
    Array.isArray(json.claims) &&
    json.schemaType === "ProcivisOneSchema2024" &&
    json.layoutProperties && 
    json.layoutProperties.background &&
    json.layoutProperties.logo
  ) {
    return "ProcivisOne";
  }

  return "Unknown";
}

/**
 * Validates if the JSON object can be converted to the specified format
 * @param json The JSON object to validate
 * @param targetFormat The target format to convert to
 * @returns Whether the JSON object can be converted
 */
export function isConvertibleFormat(json: any, targetFormat: FormatType): boolean {
  const sourceFormat = detectFormatType(json);
  
  if (sourceFormat === "Unknown") {
    return false;
  }
  
  if (sourceFormat === targetFormat) {
    return true; // Already in the correct format
  }
  
  // We currently only support conversion between OCA and ProcivisOne
  return (sourceFormat === "OCA" && targetFormat === "ProcivisOne") || 
         (sourceFormat === "ProcivisOne" && targetFormat === "OCA");
}
