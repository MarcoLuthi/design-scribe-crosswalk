
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface JsonEditorProps {
  initialJson: object;
  onJsonUpdate: (json: object) => void;
}

const JsonEditor = ({ initialJson, onJsonUpdate }: JsonEditorProps) => {
  const [jsonText, setJsonText] = useState(JSON.stringify(initialJson, null, 2));
  
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
      <Textarea
        className="font-mono h-80 text-sm"
        value={jsonText}
        onChange={(e) => setJsonText(e.target.value)}
      />
      <Button onClick={handleUpdate}>Update</Button>
    </div>
  );
};

export default JsonEditor;
