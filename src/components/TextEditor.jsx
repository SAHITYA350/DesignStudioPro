import { useState, useEffect } from "react";
import { IoMdClose } from "react-icons/io";

export default function TextEditor({ 
  show, 
  onClose, 
  textItem, 
  onUpdate,
  fillColor,
  setFillColor,
  fontSize,
  setFontSize,
  fontFamily,
  setFontFamily,
  theme
}) {
  const [text, setText] = useState(textItem?.text || "");
  const [fontWeight, setFontWeight] = useState(textItem?.fontWeight || "normal");
  const [fontStyle, setFontStyle] = useState(textItem?.fontStyle || "normal");
  const [textDecoration, setTextDecoration] = useState(textItem?.textDecoration || "");
  const [textAlign, setTextAlign] = useState(textItem?.textAlign || "left");
  const [strokeColor, setStrokeColor] = useState(textItem?.strokeColor || "#000000");
  const [strokeWidth, setStrokeWidth] = useState(textItem?.strokeWidth || 0);
  const [lineHeight, setLineHeight] = useState(textItem?.lineHeight || 1.2);
 const [bgColor, setBgColor] = useState(textItem?.bgColor || "#fef3c7");
const [bgStrokeColor, setBgStrokeColor] = useState(textItem?.bgStrokeColor || "#fbbf24");

  const fonts = [
    "Arial", "Helvetica", "Times New Roman", "Georgia", 
    "Courier New", "Verdana", "Trebuchet MS", "Comic Sans MS",
    "Impact", "Palatino", "Garamond", "Bookman", "Monospace",
    "Cursive", "Fantasy", "Serif", "Sans-serif", "Roboto", "Open Sans", "Lato", "Raleway"
  ];

useEffect(() => {
  if (textItem) {
    setText(textItem.text || "");
    setFontWeight(textItem.fontWeight || "normal");
    setFontStyle(textItem.fontStyle || "normal");
    setTextDecoration(textItem.textDecoration || "");
    setTextAlign(textItem.textAlign || "left");
    setFillColor(textItem.fillColor || (theme === 'dark' ? '#ffffff' : '#000000'));
    setFontSize(textItem.fontSize || 24);
    setFontFamily(textItem.fontFamily || "Arial");
    setStrokeColor(textItem.strokeColor || "#000000");
    setStrokeWidth(textItem.strokeWidth || 0);
    setLineHeight(textItem.lineHeight || 1.2);
    setBgColor(textItem.bgColor || "#fef3c7");
    setBgStrokeColor(textItem.bgStrokeColor || "#fbbf24");
  }
}, [setFillColor, setFontFamily, setFontSize, textItem, theme]);

  const handleSave = () => {
  if (textItem) {
    const updatedText = {
      ...textItem,
      text,
      fillColor,
      fontSize,
      fontFamily,
      fontWeight,
      fontStyle,
      textDecoration,
      textAlign,
      strokeColor,
      strokeWidth,
      lineHeight,
      bgColor,
      bgStrokeColor
    };
    onUpdate(updatedText);
  }
  onClose();
};

  if (!show) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-bold text-2xl">Text Editor</h3>
          <button onClick={onClose} className="btn btn-circle btn-sm">
            <IoMdClose size={20} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Text Input */}
          <div>
            <label className="label">
              <span className="label-text font-semibold">Text Content</span>
            </label>
            <textarea
              className="textarea textarea-bordered w-full h-32 text-lg"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type your text here..."
              autoFocus
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight,
                fontStyle,
                textDecoration,
                textAlign,
                color: fillColor,
                lineHeight: lineHeight
              }}
            />
          </div>

          {/* Font Properties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">
                <span className="label-text">Font Family</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={fontFamily}
                onChange={(e) => setFontFamily(e.target.value)}
                style={{ fontFamily }}
              >
                {fonts.map(font => (
                  <option key={font} value={font} style={{ fontFamily: font }}>{font}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">
                <span className="label-text">Font Size: {fontSize}px</span>
              </label>
              <input
                type="range"
                min="8"
                max="120"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="range range-primary"
              />
            </div>
          </div>

          {/* Text Style */}
          <div>
            <label className="label">
              <span className="label-text">Text Style</span>
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                className={`btn btn-sm ${fontWeight === 'bold' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFontWeight(fontWeight === 'bold' ? 'normal' : 'bold')}
              >
                <span className="font-bold">B</span>
              </button>
              <button
                className={`btn btn-sm ${fontStyle === 'italic' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFontStyle(fontStyle === 'italic' ? 'normal' : 'italic')}
              >
                <span className="italic">I</span>
              </button>
              <button
                className={`btn btn-sm ${textDecoration === 'underline' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTextDecoration(textDecoration === 'underline' ? '' : 'underline')}
              >
                <span className="underline">U</span>
              </button>
              <button
                className={`btn btn-sm ${textDecoration === 'line-through' ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setTextDecoration(textDecoration === 'line-through' ? '' : 'line-through')}
              >
                <span className="line-through">S</span>
              </button>
            </div>
            
            <div className="mt-2">
              <label className="label">
                <span className="label-text">Line Height: {lineHeight}</span>
              </label>
              <input
                type="range"
                min="1"
                max="3"
                step="0.1"
                value={lineHeight}
                onChange={(e) => setLineHeight(Number(e.target.value))}
                className="range range-sm"
              />
            </div>
          </div>

           {/* Color and Alignment */}
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  <div>
    <label className="label">
      <span className="label-text">Text Color</span>
    </label>
    <input
      type="color"
      value={fillColor}
      onChange={(e) => setFillColor(e.target.value)}
      className="w-full h-12 rounded cursor-pointer"
    />
  </div>

  <div>
    <label className="label">
      <span className="label-text">Stroke Color</span>
    </label>
    <input
      type="color"
      value={strokeColor}
      onChange={(e) => setStrokeColor(e.target.value)}
      className="w-full h-12 rounded cursor-pointer"
    />
    <label className="label">
      <span className="label-text">Stroke Width: {strokeWidth}px</span>
    </label>
    <input
      type="range"
      min="0"
      max="5"
      value={strokeWidth}
      onChange={(e) => setStrokeWidth(Number(e.target.value))}
      className="range range-sm"
    />
  </div>
</div>

{/* Background Color - Only for Comments */}
{textItem?.width && (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t pt-4">
    <div>
      <label className="label">
        <span className="label-text">Background Color</span>
      </label>
      <input
        type="color"
        value={bgColor}
        onChange={(e) => setBgColor(e.target.value)}
        className="w-full h-12 rounded cursor-pointer"
      />
    </div>
    
    <div>
      <label className="label">
        <span className="label-text">Background Stroke</span>
      </label>
      <input
        type="color"
        value={bgStrokeColor}
        onChange={(e) => setBgStrokeColor(e.target.value)}
        className="w-full h-12 rounded cursor-pointer"
      />
    </div>
  </div>
)}

          {/* Alignment */}
          <div>
            <label className="label">
              <span className="label-text">Text Alignment</span>
            </label>
            <div className="flex gap-2">
              {[
                { value: 'left', icon: '←' },
                { value: 'center', icon: '↔' },
                { value: 'right', icon: '→' },
                { value: 'justify', icon: '⇔' }
              ].map(({ value, icon }) => (
                <button
                  key={value}
                  className={`btn btn-sm ${textAlign === value ? 'btn-primary' : 'btn-ghost'}`}
                  onClick={() => setTextAlign(value)}
                >
                  {icon} {value.charAt(0).toUpperCase() + value.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="border rounded-lg p-4 bg-base-200">
            <label className="label">
              <span className="label-text font-semibold">Preview</span>
            </label>
            <div 
              className="p-4 bg-base-100 rounded min-h-20"
              style={{
                fontFamily,
                fontSize: `${fontSize}px`,
                fontWeight,
                fontStyle,
                textDecoration,
                textAlign,
                color: fillColor,
                textShadow: strokeWidth > 0 ? 
                  `${strokeWidth}px ${strokeWidth}px ${strokeWidth}px ${strokeColor}` : 'none',
                lineHeight: lineHeight
              }}
            >
              {text || "Preview text will appear here"}
            </div>
          </div>
        </div>

       <div className="modal-action justify-between">
        <button 
          className="btn btn-error gap-2" 
          onClick={() => {
            if (textItem) {
              onUpdate({ ...textItem, _delete: true });
              onClose();
            }
          }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/>
          </svg>
          Delete
        </button>
        
        <div className="flex gap-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
      </div>
    </div>
  );
}