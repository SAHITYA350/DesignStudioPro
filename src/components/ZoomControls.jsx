import { TbZoomIn, TbZoomOut, TbZoomReset } from "react-icons/tb";

export default function ZoomControls({ zoom, zoomIn, zoomOut, resetZoom }) {
  return (
    <div className="fixed bottom-4 right-4 bg-base-100/90 backdrop-blur-sm rounded-full shadow-xl z-40">
      <div className="flex items-center gap-2 p-2">
        <button
          className="btn btn-circle btn-sm"
          onClick={zoomOut}
          title="Zoom Out"
        >
          <TbZoomOut size={20} />
        </button>
        
        <div className="px-3 py-1 bg-base-200 rounded-full">
          <span className="font-medium text-sm">{Math.round(zoom * 100)}%</span>
        </div>
        
        <button
          className="btn btn-circle btn-sm"
          onClick={zoomIn}
          title="Zoom In"
        >
          <TbZoomIn size={20} />
        </button>
        
        <div className="divider divider-horizontal mx-1"></div>
        
        <button
          className="btn btn-circle btn-sm"
          onClick={resetZoom}
          title="Reset Zoom"
        >
          <TbZoomReset size={20} />
        </button>
      </div>
    </div>
  );
}