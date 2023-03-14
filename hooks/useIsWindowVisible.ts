import { useCallback, useEffect, useState } from "react";

/**
 * Returns whether the window is currently visible to the user.
 */
export default function useIsWindowVisible(): boolean {
  const [isWindowVisible, setIsWindowVisible] = useState<boolean>(true);
  const [focused, setFocused] = useState<boolean>(isWindowVisible);
  const listener = useCallback(() => {
    setFocused(isWindowVisible);
  }, [setFocused, isWindowVisible]);

  useEffect(() => {
    const VISIBILITY_STATE_SUPPORTED = "visibilityState" in document;
    setIsWindowVisible(
      !VISIBILITY_STATE_SUPPORTED || document.visibilityState !== "hidden"
    );

    if (!VISIBILITY_STATE_SUPPORTED) return undefined;

    document.addEventListener("visibilitychange", listener);
    return () => {
      document.removeEventListener("visibilitychange", listener);
    };
  }, [listener]);

  return focused;
}
