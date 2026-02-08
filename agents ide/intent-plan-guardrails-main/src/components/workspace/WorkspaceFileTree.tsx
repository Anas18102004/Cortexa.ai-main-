import { useProject } from "@/contexts/ProjectContext";
import type { ProjectFile } from "@/types/project";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { ChevronRight, ChevronDown, File, Folder, FolderOpen } from "lucide-react";
import { useState } from "react";

export function WorkspaceFileTree() {
  const { currentProject, currentFile, openFile } = useProject();
  
  if (!currentProject) return null;
  
  return (
    <div className="h-full flex flex-col bg-card/20 border-r border-border">
      {/* Header */}
      <div className="p-3 border-b border-border">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          Explorer
        </h3>
      </div>
      
      {/* File Tree */}
      <ScrollArea className="flex-1">
        <div className="p-2">
          {currentProject.files.map((file) => (
            <FileTreeNode
              key={file.id}
              file={file}
              currentFileId={currentFile?.id}
              onSelect={openFile}
              depth={0}
            />
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

interface FileTreeNodeProps {
  file: ProjectFile;
  currentFileId?: string;
  onSelect: (file: ProjectFile) => void;
  depth: number;
}

function FileTreeNode({ file, currentFileId, onSelect, depth }: FileTreeNodeProps) {
  const [isOpen, setIsOpen] = useState(depth < 2);
  const isFolder = file.type === "folder";
  const isSelected = file.id === currentFileId;
  
  const handleClick = () => {
    if (isFolder) {
      setIsOpen(!isOpen);
    } else {
      onSelect(file);
    }
  };
  
  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith(".tsx") || fileName.endsWith(".ts")) {
      return "text-blue-400";
    }
    if (fileName.endsWith(".css") || fileName.endsWith(".scss")) {
      return "text-pink-400";
    }
    if (fileName.endsWith(".json")) {
      return "text-yellow-400";
    }
    if (fileName.endsWith(".md")) {
      return "text-gray-400";
    }
    return "text-muted-foreground";
  };
  
  return (
    <div>
      <button
        onClick={handleClick}
        className={cn(
          "flex items-center gap-1.5 w-full px-2 py-1 rounded text-sm transition-colors text-left",
          isSelected
            ? "bg-primary/10 text-primary"
            : "hover:bg-muted/50 text-foreground",
          file.isModified && "font-medium"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
      >
        {/* Chevron for folders */}
        {isFolder ? (
          isOpen ? (
            <ChevronDown className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )
        ) : (
          <span className="w-3.5" />
        )}
        
        {/* Icon */}
        {isFolder ? (
          isOpen ? (
            <FolderOpen className="w-4 h-4 text-amber-400 flex-shrink-0" />
          ) : (
            <Folder className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )
        ) : (
          <File className={cn("w-4 h-4 flex-shrink-0", getFileIcon(file.name))} />
        )}
        
        {/* Name */}
        <span className="truncate flex-1">{file.name}</span>
        
        {/* Modified indicator */}
        {file.isModified && (
          <span className={cn(
            "w-2 h-2 rounded-full flex-shrink-0",
            file.modifiedBy === "agent" ? "bg-success" : "bg-primary"
          )} />
        )}
      </button>
      
      {/* Children */}
      {isFolder && isOpen && file.children && (
        <div>
          {file.children.map((child) => (
            <FileTreeNode
              key={child.id}
              file={child}
              currentFileId={currentFileId}
              onSelect={onSelect}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
