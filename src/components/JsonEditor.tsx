
import { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { FileJson, Check } from "lucide-react";

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
      <div className="bg-[#252A38] rounded-lg border border-[#3D4154] overflow-hidden">
        <div className="flex items-center p-2 bg-[#1E2230] border-b border-[#3D4154]">
          <FileJson className="h-4 w-4 text-[#9b87f5] mr-2" />
          <span className="text-xs text-gray-400">JSON</span>
        </div>
        <Textarea
          className="font-mono h-80 text-sm bg-[#252A38] border-0 text-gray-200 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          value={jsonText}
          onChange={(e) => setJsonText(e.target.value)}
          spellCheck={false}
        />
      </div>
      <Button 
        onClick={handleUpdate} 
        className="bg-[#9b87f5] hover:bg-[#7E69AB] text-white flex items-center gap-2"
      >
        <Check className="h-4 w-4" />
        Update
      </Button>
    </div>
  );
};

export default JsonEditor;
