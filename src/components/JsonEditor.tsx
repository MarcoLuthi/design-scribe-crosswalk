
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
  
  // Update jsonText when initialJson changes
  useEffect(() => {
    setJsonText(JSON.stringify(initialJson, null, 2));
  }, [initialJson]);
  
  const handleUpdate = () => {
    try {
      const parsedJson = JSON.parse(jsonText);
      onJsonUpdate(parsedJson);
      toast.success("JSON updated successfully");
    } catch (error) {
      toast.error("Invalid JSON format");
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
        className={`font-mono ${height} text-sm`}
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
};

export default JsonEditor;
