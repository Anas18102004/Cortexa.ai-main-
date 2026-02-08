import { useState } from "react";
import { useWorkforce } from "@/contexts/WorkforceContext";
import { AuditEntryRow } from "@/components/audit/AuditEntryRow";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, Download, Filter, FileText } from "lucide-react";

export default function AuditLog() {
  const { auditLog, agents, getRole } = useWorkforce();
  const [searchQuery, setSearchQuery] = useState("");
  const [actionFilter, setActionFilter] = useState<string>("all");
  const [agentFilter, setAgentFilter] = useState<string>("all");

  // Filter audit entries
  const filteredEntries = auditLog.filter((entry) => {
    const matchesSearch =
      searchQuery === "" ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.agentRole.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesAction = actionFilter === "all" || entry.action === actionFilter;
    const matchesAgent = agentFilter === "all" || entry.agentId === agentFilter;

    return matchesSearch && matchesAction && matchesAgent;
  });

  // Get unique action types
  const actionTypes = Array.from(new Set(auditLog.map((e) => e.action)));

  return (
    <div className="p-6 lg:p-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1>Audit Log</h1>
          <p className="text-muted-foreground">
            Complete history of all agent actions and approvals
          </p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search audit entries..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select value={actionFilter} onValueChange={setActionFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by action" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            {actionTypes.map((action) => (
              <SelectItem key={action} value={action}>
                {action.replace(/_/g, " ")}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={agentFilter} onValueChange={setAgentFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by agent" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Agents</SelectItem>
            {agents.map((agent) => {
              const role = getRole(agent.roleId);
              return (
                <SelectItem key={agent.id} value={agent.id}>
                  {agent.customName || role?.name || agent.id}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      {/* Entries Count */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredEntries.length} of {auditLog.length} entries
      </div>

      {/* Audit Entries */}
      <div className="border border-border rounded-lg overflow-hidden">
        {filteredEntries.length > 0 ? (
          <div className="divide-y divide-border">
            {filteredEntries.map((entry) => (
              <AuditEntryRow key={entry.id} entry={entry} />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No Entries Found</h3>
            <p className="text-sm text-muted-foreground">
              {searchQuery || actionFilter !== "all" || agentFilter !== "all"
                ? "Try adjusting your filters"
                : "Audit entries will appear as agents perform actions"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
