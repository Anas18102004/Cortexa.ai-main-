import { useProject } from "@/contexts/ProjectContext";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { X, Circle, Save, RotateCcw } from "lucide-react";
import { useTheme } from "next-themes";

export function WorkspaceCodeEditor() {
  const { 
    currentProject, 
    currentFile, 
    openFiles, 
    openFile, 
    closeFile,
    updateFileContent,
  } = useProject();
  const { theme } = useTheme();
  
  if (!currentProject) return null;
  
  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.id, value, "user");
    }
  };
  
  return (
    <div className="h-full flex flex-col bg-background">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-border bg-card/50 overflow-x-auto">
        <div className="flex items-center">
          {openFiles.map((file) => {
            const isActive = file.id === currentFile?.id;
            
            return (
              <div
                key={file.id}
                className={cn(
                  "group flex items-center gap-2 px-3 py-2 border-r border-border cursor-pointer transition-colors",
                  isActive
                    ? "bg-background text-foreground"
                    : "bg-card/30 text-muted-foreground hover:bg-card/50"
                )}
                onClick={() => openFile(file)}
              >
                {/* Modified indicator */}
                {file.isModified ? (
                  <Circle className={cn(
                    "w-2 h-2 fill-current",
                    file.modifiedBy === "agent" ? "text-success" : "text-primary"
                  )} />
                ) : (
                  <span className="w-2" />
                )}
                
                <span className="text-sm truncate max-w-[150px]">{file.name}</span>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    closeFile(file.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-muted"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
        
        {/* Actions */}
        {currentFile && (
          <div className="ml-auto flex items-center gap-1 px-2">
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
              <Save className="w-3.5 h-3.5" />
              Save
            </Button>
            <Button variant="ghost" size="sm" className="h-7 text-xs gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </Button>
          </div>
        )}
      </div>
      
      {/* Editor */}
      <div className="flex-1">
        {currentFile ? (
          <Editor
            height="100%"
            language={getLanguage(currentFile.name)}
            value={currentFile.content || ""}
            theme={theme === "dark" ? "vs-dark" : "light"}
            onChange={handleEditorChange}
            options={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: false },
              scrollBeyondLastLine: false,
              lineNumbers: "on",
              glyphMargin: true,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: "line",
              scrollbar: {
                verticalScrollbarSize: 10,
                horizontalScrollbarSize: 10,
              },
              padding: { top: 16 },
            }}
          />
        ) : (
          <div className="h-full flex items-center justify-center text-muted-foreground">
            <div className="text-center">
              <p className="text-sm">Select a file to edit</p>
              <p className="text-xs mt-1">or let an agent start working</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function getLanguage(fileName: string): string {
  if (fileName.endsWith(".tsx")) return "typescript";
  if (fileName.endsWith(".ts")) return "typescript";
  if (fileName.endsWith(".jsx")) return "javascript";
  if (fileName.endsWith(".js")) return "javascript";
  if (fileName.endsWith(".json")) return "json";
  if (fileName.endsWith(".css")) return "css";
  if (fileName.endsWith(".scss")) return "scss";
  if (fileName.endsWith(".html")) return "html";
  if (fileName.endsWith(".md")) return "markdown";
  return "plaintext";
}
