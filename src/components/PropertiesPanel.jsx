import { IoMdClose } from "react-icons/io";
import { TbTrash } from "react-icons/tb";

export default function PropertiesPanel({
  show,
  onClose,
  brushSize,
  setBrushSize,
  fontSize,
  setFontSize,
  onDelete
}) {
  if (!show) return null;

  return (
    <div className="absolute top-4 right-4 bg-base-200 p-4 rounded-lg shadow-xl w-64 max-h-96 overflow-y-auto z-10">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold">Properties</h3>
        <button onClick={onClose} className="btn btn-xs btn-circle">
          <IoMdClose />
        </button>
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="label text-xs">Brush Size</label>
          <input
            type="range"
            min="1"
            max="20"
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
            className="range range-xs"
          />
          <span className="text-xs">{brushSize}px</span>
        </div>

        <div>
          <label className="label text-xs">Font Size</label>
          <input
            type="range"
            min="12"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(Number(e.target.value))}
            className="range range-xs"
          />
          <span className="text-xs">{fontSize}px</span>
        </div>

        <button onClick={onDelete} className="btn btn-error btn-sm w-full gap-2">
          <TbTrash /> Delete
        </button>
      </div>
    </div>
  );
}