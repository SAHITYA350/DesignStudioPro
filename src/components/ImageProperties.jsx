import { useState, useEffect } from "react";
import { IoMdClose, IoMdDownload, IoMdUndo, IoMdRedo } from "react-icons/io";
import { TbBrightness, TbBlur, TbShadow } from "react-icons/tb";

export default function ImageProperties({
  show,
  onClose,
  imageItem,
  onUpdate,
  onDelete
}) {
  const [properties, setProperties] = useState({
    brightness: 100,
    blur: 0,
    opacity: 100,
    rotation: 0,
    scaleX: 1,
    scaleY: 1
  });

  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Initialize properties when imageItem changes
  useEffect(() => {
    if (imageItem) {
      const initialProps = {
        brightness: imageItem.brightness || 100,
        blur: imageItem.blur || 0,
        opacity: imageItem.opacity || 100,
        rotation: imageItem.rotation || 0,
        scaleX: imageItem.scaleX || 1,
        scaleY: imageItem.scaleY || 1
      };
      setProperties(initialProps);
      setHistory([initialProps]);
      setHistoryIndex(0);
    }
  }, [imageItem, imageItem.id]); 

  const saveToHistory = (state) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(state);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setProperties(prevState);
      setHistoryIndex(historyIndex - 1);
      onUpdate({ ...imageItem, ...prevState });
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setProperties(nextState);
      setHistoryIndex(historyIndex + 1);
      onUpdate({ ...imageItem, ...nextState });
    }
  };

  const handlePropertyChange = (key, value) => {
    const newProperties = { ...properties, [key]: value };
    setProperties(newProperties);
    
    if (imageItem && onUpdate) {
      onUpdate({ ...imageItem, ...newProperties });
    }
    
    // Save to history after a short delay (debounce)
    if (window._historyTimeout) {
      clearTimeout(window._historyTimeout);
    }
    window._historyTimeout = setTimeout(() => {
      saveToHistory(newProperties);
    }, 500);
  };

  const resetFilters = () => {
    const defaultProps = {
      brightness: 100,
      blur: 0,
      opacity: 100,
      rotation: 0,
      scaleX: 1,
      scaleY: 1
    };
    setProperties(defaultProps);
    saveToHistory(defaultProps);
    onUpdate({ ...imageItem, ...defaultProps });
  };

  const handleDownload = () => {
    if (imageItem?.image) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = imageItem.width * (properties.scaleX || 1);
      canvas.height = imageItem.height * (properties.scaleY || 1);
      
      // Apply filters
      ctx.filter = `
        brightness(${properties.brightness}%)
        blur(${properties.blur}px)
      `;
      ctx.globalAlpha = properties.opacity / 100;
      ctx.drawImage(imageItem.image, 0, 0, canvas.width, canvas.height);
      
      const link = document.createElement('a');
      link.download = 'edited-image.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  if (!show || !imageItem) return null;

  return (
    <div className="absolute top-4 right-4 bg-base-200 p-4 rounded-lg shadow-2xl w-80 z-50">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Image Properties</h3>
        <div className="flex gap-2">
          <button
            className="btn btn-xs btn-ghost"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="Undo"
          >
            <IoMdUndo size={16} />
          </button>
          <button
            className="btn btn-xs btn-ghost"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="Redo"
          >
            <IoMdRedo size={16} />
          </button>
          <button onClick={onClose} className="btn btn-xs btn-circle">
            <IoMdClose />
          </button>
        </div>
      </div>

      <div className="space-y-6 max-h-96 overflow-y-auto pr-2">
        {/* Brightness */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TbBrightness className="text-primary" />
            <span className="font-medium">Brightness</span>
            <span className="ml-auto text-sm font-semibold">{properties.brightness}%</span>
          </div>
          <input
            type="range"
            min="0"
            max="200"
            value={properties.brightness}
            onChange={(e) => handlePropertyChange('brightness', Number(e.target.value))}
            className="range range-sm range-primary"
          />
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>Dark</span>
            <span>Normal</span>
            <span>Bright</span>
          </div>
        </div>

        {/* Blur */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TbBlur className="text-accent" />
            <span className="font-medium">Blur</span>
            <span className="ml-auto text-sm font-semibold">{properties.blur}px</span>
          </div>
          <input
            type="range"
            min="0"
            max="20"
            step="0.5"
            value={properties.blur}
            onChange={(e) => handlePropertyChange('blur', Number(e.target.value))}
            className="range range-sm range-accent"
          />
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>Sharp</span>
            <span>Blurred</span>
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <TbShadow className="text-info" />
            <span className="font-medium">Opacity</span>
            <span className="ml-auto text-sm font-semibold">{properties.opacity}%</span>
          </div>
          <input
            type="range"
            min="10"
            max="100"
            value={properties.opacity}
            onChange={(e) => handlePropertyChange('opacity', Number(e.target.value))}
            className="range range-sm range-info"
          />
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>Transparent</span>
            <span>Opaque</span>
          </div>
        </div>

        {/* Rotation */}
        <div>
          <label className="label">
            <span className="label-text font-medium">Rotation</span>
            <span className="label-text-alt font-semibold">{properties.rotation}°</span>
          </label>
          <input
            type="range"
            min="0"
            max="360"
            value={properties.rotation}
            onChange={(e) => handlePropertyChange('rotation', Number(e.target.value))}
            className="range range-sm range-secondary"
          />
          <div className="flex justify-between text-xs text-base-content/60 mt-1">
            <span>0°</span>
            <span>180°</span>
            <span>360°</span>
          </div>
        </div>

        {/* Scale */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">
              <span className="label-text font-medium">Width</span>
              <span className="label-text-alt font-semibold">{(properties.scaleX * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="300"
              value={properties.scaleX * 100}
              onChange={(e) => handlePropertyChange('scaleX', Number(e.target.value) / 100)}
              className="range range-sm"
            />
          </div>
          <div>
            <label className="label">
              <span className="label-text font-medium">Height</span>
              <span className="label-text-alt font-semibold">{(properties.scaleY * 100).toFixed(0)}%</span>
            </label>
            <input
              type="range"
              min="10"
              max="300"
              value={properties.scaleY * 100}
              onChange={(e) => handlePropertyChange('scaleY', Number(e.target.value) / 100)}
              className="range range-sm"
            />
          </div>
        </div>

        {/* Aspect Ratio Lock */}
        <div className="form-control">
          <label className="label cursor-pointer justify-start gap-2">
            <input
              type="checkbox"
              className="checkbox checkbox-sm checkbox-primary"
              checked={Math.abs(properties.scaleX - properties.scaleY) < 0.01}
              onChange={(e) => {
                if (e.target.checked) {
                  const avgScale = (properties.scaleX + properties.scaleY) / 2;
                  const newProps = { ...properties, scaleX: avgScale, scaleY: avgScale };
                  setProperties(newProps);
                  onUpdate({ ...imageItem, ...newProps });
                  saveToHistory(newProps);
                }
              }}
            />
            <span className="label-text font-medium">🔒 Lock Aspect Ratio</span>
          </label>
        </div>

        {/* Stats Display */}
        <div className="stats stats-vertical shadow w-full text-xs">
          <div className="stat py-2">
            <div className="stat-title text-xs">History</div>
            <div className="stat-value text-lg">{history.length}</div>
            <div className="stat-desc">Step {historyIndex + 1}</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-2 pt-4 border-t border-base-300">
          <button
            className="btn btn-primary btn-sm gap-2"
            onClick={handleDownload}
          >
            <IoMdDownload /> Download Image
          </button>
          
          <div className="flex gap-2">
            <button
              className="btn btn-secondary btn-sm flex-1"
              onClick={resetFilters}
            >
              Reset All
            </button>
            <button
              className="btn btn-error btn-sm flex-1 gap-2"
              onClick={onDelete}
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}