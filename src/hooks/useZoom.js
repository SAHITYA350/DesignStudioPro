import { useState, useCallback } from "react";

export function useZoom(initialZoom = 1) {
  const [zoom, setZoom] = useState(initialZoom);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const zoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev + 0.25, 3));
  }, []);

  const zoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev - 0.25, 0.25));
  }, []);

  const resetZoom = useCallback(() => {
    setZoom(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  const setZoomLevel = useCallback((level) => {
    setZoom(Math.max(0.25, Math.min(level, 3)));
  }, []);

  const pan = useCallback((dx, dy) => {
    setPosition(prev => ({
      x: prev.x + dx,
      y: prev.y + dy
    }));
  }, []);

  return {
    zoom,
    position,
    zoomIn,
    zoomOut,
    resetZoom,
    setZoomLevel,
    pan,
    setZoom,
    setPosition
  };
}