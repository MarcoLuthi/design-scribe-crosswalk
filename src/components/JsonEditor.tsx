
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JsonEditorProps {
  initialJson: object;
  onJsonUpdate: (json: object) => void;
  height?: string;
  label?: string;
  description?: string;
}

const JsonEditor = ({ 
  initialJson, 
  onJsonUpdate, 
  height = "h-80", 
  label,
  description
}: JsonEditorProps) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(initialJson, null, 2));
  const [syntaxError, setSyntaxError] = useState<string | null>(null);
  
  // Update jsonText when initialJson changes
  useEffect(() => {
    setJsonText(JSON.stringify(initialJson, null, 2));
    setSyntaxError(null);
  }, [initialJson]);
  
  const handleUpdate = () => {
    try {
      const parsedJson = JSON.parse(jsonText);
      setSyntaxError(null);
      onJsonUpdate(parsedJson);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Invalid JSON format";
      setSyntaxError(errorMessage);
      toast.error(errorMessage);
    }
  };
  
  return (
    <div className="space-y-4">
      {label && (
        <div className="mb-2">
          <h3 className="text-base font-medium">{label}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
      )}
      <Textarea
        className={`font-mono ${height} text-sm ${syntaxError ? 'border-red-500' : ''}`}
        value={jsonText}
        onChange={(e) => {
          setJsonText(e.target.value);
          setSyntaxError(null);
        }}
      />
      {syntaxError && (
        <p className="text-sm text-red-500 mt-1">{syntaxError}</p>
      )}
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
};

export default JsonEditor;
