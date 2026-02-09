import { useEffect, useCallback, useRef } from 'react';

/**
 * Keyboard shortcut configuration
 */
export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  description: string;
  handler: () => void;
  preventDefault?: boolean;
}

/**
 * Custom hook to manage keyboard shortcuts.
 * Automatically handles registration and cleanup of keyboard event listeners.
 *
 * @param shortcuts - Array of keyboard shortcut configurations
 * @param enabled - Whether shortcuts are enabled (default: true)
 *
 * @example
 * useKeyboardShortcuts([
 *   {
 *     key: 'n',
 *     description: 'Create new task',
 *     handler: () => setShowForm(true),
 *   },
 *   {
 *     key: '/',
 *     description: 'Focus search',
 *     handler: () => searchInputRef.current?.focus(),
 *     preventDefault: true,
 *   },
 *   {
 *     key: 's',
 *     ctrlKey: true,
 *     description: 'Save',
 *     handler: handleSave,
 *     preventDefault: true,
 *   },
 * ]);
 */
export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  const shortcutsRef = useRef(shortcuts);

  // Update ref when shortcuts change
  useEffect(() => {
    shortcutsRef.current = shortcuts;
  }, [shortcuts]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    const isInputField =
      target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable;

    // Allow '/' to focus search even in input fields
    if (isInputField && event.key !== '/') {
      return;
    }

    // Find matching shortcut
    const matchingShortcut = shortcutsRef.current.find((shortcut) => {
      const keyMatches = event.key.toLowerCase() === shortcut.key.toLowerCase();
      const ctrlMatches = shortcut.ctrlKey ? event.ctrlKey : !event.ctrlKey;
      const shiftMatches = shortcut.shiftKey ? event.shiftKey : !event.shiftKey;
      const altMatches = shortcut.altKey ? event.altKey : !event.altKey;
      const metaMatches = shortcut.metaKey ? event.metaKey : !event.metaKey;

      return keyMatches && ctrlMatches && shiftMatches && altMatches && metaMatches;
    });

    if (matchingShortcut) {
      if (matchingShortcut.preventDefault) {
        event.preventDefault();
      }
      matchingShortcut.handler();
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled, handleKeyDown]);
}

/**
 * Hook to get all registered shortcuts for display in help modal
 */
export function useShortcutsList(shortcuts: KeyboardShortcut[]) {
  return shortcuts.map((shortcut) => {
    const keys: string[] = [];

    if (shortcut.ctrlKey) keys.push('Ctrl');
    if (shortcut.shiftKey) keys.push('Shift');
    if (shortcut.altKey) keys.push('Alt');
    if (shortcut.metaKey) keys.push('Cmd');
    keys.push(shortcut.key.toUpperCase());

    return {
      keys: keys.join(' + '),
      description: shortcut.description,
    };
  });
}

export default useKeyboardShortcuts;
