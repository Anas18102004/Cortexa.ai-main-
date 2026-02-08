import { useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProject } from "@/contexts/ProjectContext";

type ShortcutHandler = () => void;

interface KeyboardShortcutsOptions {
  onCommandPalette?: ShortcutHandler;
  onShowShortcuts?: ShortcutHandler;
  onToggleTerminal?: ShortcutHandler;
  onSave?: ShortcutHandler;
  onApproveAll?: ShortcutHandler;
  onRejectAll?: ShortcutHandler;
  onQuickOpen?: ShortcutHandler;
  disabled?: boolean;
}

export function useKeyboardShortcuts(options: KeyboardShortcutsOptions = {}) {
  const navigate = useNavigate();
  const { approveAllChanges, rejectAllChanges } = useProject();

  const {
    onCommandPalette,
    onShowShortcuts,
    onToggleTerminal,
    onSave,
    onApproveAll,
    onRejectAll,
    onQuickOpen,
    disabled = false,
  } = options;

  // Track pressed keys for multi-key shortcuts
  const pressedKeys = new Set<string>();
  let lastKeyTime = 0;
  let pendingKey: string | null = null;

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (disabled) return;

    const isMac = navigator.platform.toUpperCase().indexOf("MAC") >= 0;
    const cmdKey = isMac ? e.metaKey : e.ctrlKey;
    const shiftKey = e.shiftKey;
    const key = e.key.toLowerCase();

    // Skip if focused on input/textarea (unless specifically handling)
    const activeElement = document.activeElement;
    const isInputFocused = 
      activeElement instanceof HTMLInputElement ||
      activeElement instanceof HTMLTextAreaElement ||
      activeElement?.getAttribute("contenteditable") === "true";

    // Cmd+K - Command Palette (works everywhere)
    if (cmdKey && key === "k") {
      e.preventDefault();
      onCommandPalette?.();
      return;
    }

    // Cmd+/ - Show shortcuts
    if (cmdKey && key === "/") {
      e.preventDefault();
      onShowShortcuts?.();
      return;
    }

    // Skip other shortcuts if in input
    if (isInputFocused) return;

    // Cmd+` - Toggle terminal
    if (cmdKey && key === "`") {
      e.preventDefault();
      onToggleTerminal?.();
      return;
    }

    // Cmd+S - Save
    if (cmdKey && key === "s" && !shiftKey) {
      e.preventDefault();
      onSave?.();
      return;
    }

    // Cmd+P - Quick open file
    if (cmdKey && key === "p" && !shiftKey) {
      e.preventDefault();
      onQuickOpen?.();
      return;
    }

    // Cmd+Enter - Approve all changes
    if (cmdKey && key === "enter" && !shiftKey) {
      e.preventDefault();
      if (onApproveAll) {
        onApproveAll();
      } else {
        approveAllChanges();
      }
      return;
    }

    // Cmd+Backspace - Reject all changes
    if (cmdKey && key === "backspace" && !shiftKey) {
      e.preventDefault();
      if (onRejectAll) {
        onRejectAll();
      } else {
        rejectAllChanges();
      }
      return;
    }

    // G-key navigation shortcuts (two-key combos)
    const now = Date.now();
    if (pendingKey === "g" && now - lastKeyTime < 500) {
      switch (key) {
        case "p":
          e.preventDefault();
          navigate("/projects");
          break;
        case "n":
          e.preventDefault();
          navigate("/projects/new");
          break;
        case "m":
          e.preventDefault();
          navigate("/marketplace");
          break;
      }
      pendingKey = null;
      return;
    }

    // Start G-key combo
    if (key === "g" && !cmdKey && !shiftKey) {
      pendingKey = "g";
      lastKeyTime = now;
      return;
    }

    // Esc - Clear pending key
    if (key === "escape") {
      pendingKey = null;
    }
  }, [
    disabled,
    navigate,
    onCommandPalette,
    onShowShortcuts,
    onToggleTerminal,
    onSave,
    onQuickOpen,
    onApproveAll,
    onRejectAll,
    approveAllChanges,
    rejectAllChanges,
  ]);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [handleKeyDown]);
}

// Hook to listen for custom events from command palette
export function useCommandPaletteEvents(handlers: {
  onToggleTerminal?: () => void;
  onShowShortcuts?: () => void;
}) {
  useEffect(() => {
    const handleToggleTerminal = () => handlers.onToggleTerminal?.();
    const handleShowShortcuts = () => handlers.onShowShortcuts?.();

    window.addEventListener("toggle-terminal", handleToggleTerminal);
    window.addEventListener("show-shortcuts", handleShowShortcuts);

    return () => {
      window.removeEventListener("toggle-terminal", handleToggleTerminal);
      window.removeEventListener("show-shortcuts", handleShowShortcuts);
    };
  }, [handlers.onToggleTerminal, handlers.onShowShortcuts]);
}
