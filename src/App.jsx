import React from "react";
import Konva from "konva";
import { useRef, useState, useEffect } from "react";
import { Stage, Layer, Rect, Circle, Arrow, Line, Transformer, Image as KonvaImage, Text, RegularPolygon, Star } from "react-konva";
import { v4 as uuidv4 } from "uuid";
import { 
  TbRectangle, TbCircle, TbArrowRight, TbPencil, TbEraser, 
  TbTypography, TbDownload, TbUpload, TbTrash, TbBrush, TbDeviceMobile,
  TbHome, TbTriangle, TbStar, TbHexagon, TbMessageCircle
} from "react-icons/tb";
import { IoMdUndo, IoMdRedo, IoMdClose, IoMdSave } from "react-icons/io";
import { GiArrowCursor } from "react-icons/gi";
import { FiSun, FiMoon } from "react-icons/fi";
import { format } from "date-fns";
import toast, { Toaster } from 'react-hot-toast';
import TextEditor from "./components/TextEditor";
import ImageProperties from "./components/ImageProperties";
import ZoomControls from "./components/ZoomControls";
import { useZoom } from "./hooks/useZoom";
import { useLocalStorage } from "./hooks/useLocalStorage";
import { exportToPDF } from "./utils/pdfExporter";
import { saveProject, loadProject } from "./utils/localStorage";
import { useParams, useNavigate } from "react-router-dom";
import EnhancedLoader from "./components/EnhancedLoader";


const ACTIONS = {
  SELECT: "SELECT",
  RECTANGLE: "RECTANGLE",
  CIRCLE: "CIRCLE",
  TRIANGLE: "TRIANGLE",
  STAR: "STAR",
  HEXAGON: "HEXAGON",
  SCRIBBLE: "SCRIBBLE",
  ARROW: "ARROW",
  TEXT: "TEXT",
  ERASER: "ERASER",
  BRUSH: "BRUSH",
  COMMENT: "COMMENT"
};

const THEMES = [
  "light", "dark", "cupcake", "bumblebee", "emerald", "corporate", 
  "synthwave", "retro", "cyberpunk", "valentine", "halloween", 
  "garden", "forest", "aqua", "lofi", "pastel", "fantasy", 
  "wireframe", "black", "luxury", "dracula",
  "cmyk", "autumn", "business", "acid", "lemonade", "night", 
  "coffee", "winter",
  "dim", "sunset"
];

export default function App() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  
  const stageRef = useRef();
  const transformerRef = useRef();
  const fileInputRef = useRef();
  const isPainting = useRef(false);
  const currentShapeId = useRef();
  const lastPointerPosition = useRef({ x: 0, y: 0 });

  const [action, setAction] = useState(ACTIONS.SELECT);
  const [fillColor, setFillColor] = useState("#ffffff"); // Changed to white
  const [strokeColor, setStrokeColor] = useState("#ffffff");
  const [rectangles, setRectangles] = useState([]);
  const [circles, setCircles] = useState([]);
  const [triangles, setTriangles] = useState([]);
  const [stars, setStars] = useState([]);
  const [hexagons, setHexagons] = useState([]);
  const [arrows, setArrows] = useState([]);
  const [scribbles, setScribbles] = useState([]);
  const [texts, setTexts] = useState([]);
  const [images, setImages] = useState([]);
  const [comments, setComments] = useState([]);
  const [history, setHistory] = useState([]);
  const [historyStep, setHistoryStep] = useState(0);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedType, setSelectedType] = useState(null);
  const [showEditPanel, setShowEditPanel] = useState(false);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [showImageProperties, setShowImageProperties] = useState(false);
  const [theme, setTheme] = useLocalStorage("theme", "light");
  const [exportFormat, setExportFormat] = useState("png");
  const [showExportModal, setShowExportModal] = useState(false);
  const [brushSize, setBrushSize] = useState(5);
  const [penSize, setPenSize] = useState(2);
  const [fontSize, setFontSize] = useState(24);
  const [fontFamily, setFontFamily] = useState("Arial");
  const [showOrientationPrompt, setShowOrientationPrompt] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [projectName, setProjectName] = useState("Untitled Project");

  const { zoom, position, zoomIn, zoomOut, resetZoom } = useZoom();
  const isDraggable = action === ACTIONS.SELECT;

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const themeDropdownRef = useRef(null);
 const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const timer = setTimeout(() => {
    setIsLoading(false);
  }, 1800);

  return () => clearTimeout(timer);
}, []);


  // Handle theme changes
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Initialize colors based on theme on first render
  useEffect(() => {
  const initialFillColor = "#3b82f6"; // Always white initially
  const initialStrokeColor = "#ffffff"; // Always white initially
  
  setFillColor(initialFillColor);
  setStrokeColor(initialStrokeColor);
}, []); 

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Load project data
  useEffect(() => {
  if (projectId) {
    const loadProjectData = async () => {
      const project = await loadProject(projectId); 
      console.log("Loaded project:", project);
      
      if (project) {
        setTimeout(() => {
          setProjectName(project.name || "Untitled Project");
          setRectangles(project.data?.rectangles || []);
          setCircles(project.data?.circles || []);
          setTriangles(project.data?.triangles || []);
          setStars(project.data?.stars || []);
          setHexagons(project.data?.hexagons || []);
          setArrows(project.data?.arrows || []);
          setScribbles(project.data?.scribbles || []);
          setTexts(project.data?.texts || []);
          setImages(project.data?.images || []);
          setComments(project.data?.comments || []);
          
          const initialState = {
            rectangles: project.data?.rectangles || [],
            circles: project.data?.circles || [],
            triangles: project.data?.triangles || [],
            stars: project.data?.stars || [],
            hexagons: project.data?.hexagons || [],
            arrows: project.data?.arrows || [],
            scribbles: project.data?.scribbles || [],
            texts: project.data?.texts || [],
            images: project.data?.images || [],
            comments: project.data?.comments || []
          };
          setHistory([initialState]);
          setHistoryStep(0);
        }, 0);
      }
    };
    
    loadProjectData();
  }
}, [projectId]);


  // Auto-save project
  useEffect(() => {
  if (projectId) {
    const data = {
      rectangles,
      circles,
      triangles,
      stars,
      hexagons,
      arrows,
      scribbles,
      texts,
      images,
      comments,
      name: projectName
    };
    
    // Use async function for window.storage
    const saveData = async () => {
      await saveProject(projectId, data);
    };
    
    const timer = setTimeout(saveData, 3000); // Auto-save after 3 seconds
    
    return () => clearTimeout(timer);
  }
}, [rectangles, circles, triangles, stars, hexagons, arrows, scribbles, texts, images, comments, projectName, projectId]);

  // Check orientation for mobile
  useEffect(() => {
    const checkOrientation = () => {
      const isMobile = window.innerWidth < 768;
      const isPortrait = window.innerHeight > window.innerWidth;
      setShowOrientationPrompt(isMobile && isPortrait);
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  // Save to history - simplified without useCallback for React Compiler
  const saveToHistory = () => {
    const currentState = {
      rectangles,
      circles,
      triangles,
      stars,
      hexagons,
      arrows,
      scribbles,
      texts,
      images,
      comments
    };
    
    // Don't save if nothing changed
    if (historyStep > 0 && JSON.stringify(history[historyStep]) === JSON.stringify(currentState)) {
      return;
    }
    
    const newHistory = history.slice(0, historyStep + 1);
    setHistory([...newHistory, currentState]);
    setHistoryStep(newHistory.length);
  };

  // Undo function - simplified
  const undo = () => {
    if (historyStep > 0) {
      const prevState = history[historyStep - 1];
      // Batch all state updates
      setRectangles(prevState.rectangles || []);
      setCircles(prevState.circles || []);
      setTriangles(prevState.triangles || []);
      setStars(prevState.stars || []);
      setHexagons(prevState.hexagons || []);
      setArrows(prevState.arrows || []);
      setScribbles(prevState.scribbles || []);
      setTexts(prevState.texts || []);
      setImages(prevState.images || []);
      setComments(prevState.comments || []);
      setHistoryStep(historyStep - 1);
      toast.success('Undo successful');
    }
  };

  // Redo function - simplified
  const redo = () => {
    if (historyStep < history.length - 1) {
      const nextState = history[historyStep + 1];
      // Batch all state updates
      setRectangles(nextState.rectangles || []);
      setCircles(nextState.circles || []);
      setTriangles(nextState.triangles || []);
      setStars(nextState.stars || []);
      setHexagons(nextState.hexagons || []);
      setArrows(nextState.arrows || []);
      setScribbles(nextState.scribbles || []);
      setTexts(nextState.texts || []);
      setImages(nextState.images || []);
      setComments(nextState.comments || []);
      setHistoryStep(historyStep + 1);
      toast.success('Redo successful');
    }
  };

  const handleSaveProject = async () => {
  if (projectId) {
    const data = {
      rectangles,
      circles,
      triangles,
      stars,
      hexagons,
      arrows,
      scribbles,
      texts,
      images,
      comments,
      name: projectName
    };
    const success = await saveProject(projectId, data);
    if (success) {
      toast.success('Project saved successfully');
    } else {
      toast.error('Failed to save project');
    }
  }
};

useEffect(() => {
  const handleClickOutside = (event) => {
    if (themeDropdownRef.current && !themeDropdownRef.current.contains(event.target)) {
      setDropdownOpen(false);
    }
  };

  document.addEventListener('mousedown', handleClickOutside);
  return () => {
    document.removeEventListener('mousedown', handleClickOutside);
  };
}, []);

        const handleClearAll = () => {
          if (confirm('⚠️ Are you sure you want to clear everything? This action cannot be undone!')) {
            // Clear all shapes and elements
            setRectangles([]);
            setCircles([]);
            setTriangles([]);
            setStars([]);
            setHexagons([]);
            setArrows([]);
            setScribbles([]);
            setTexts([]);
            setImages([]);
            setComments([]);
            
            // Reset selection
            setSelectedId(null);
            setSelectedType(null);
            transformerRef.current.nodes([]);
            
            // Clear history
            setHistory([]);
            setHistoryStep(0);
            
            // Show success message
            toast.success('Canvas cleared successfully! 🎨');
            
            // Save empty state
            setTimeout(saveToHistory, 0);
          }
        };

  function onPointerDown(e) {
    if (action === ACTIONS.SELECT) return;
    
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const x = pos.x / zoom - position.x;
    const y = pos.y / zoom - position.y;
    const id = uuidv4();

    currentShapeId.current = id;
    isPainting.current = true;
    lastPointerPosition.current = { x, y };

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((prev) => [...prev, { 
          id, 
          x: x, // Start from cursor
          y: y, 
          height: 0, 
          width: 0, 
          fillColor, 
          strokeColor, 
          strokeWidth: 2 
        }]);
        break;
      case ACTIONS.CIRCLE:
        setCircles((prev) => [...prev, { 
          id, 
          x, 
          y, 
          radius: 0, 
          fillColor, 
          strokeColor, 
          strokeWidth: 2 
        }]);
        break;
      case ACTIONS.TRIANGLE:
        setTriangles((prev) => [...prev, { 
          id, 
          x, 
          y, 
          sides: 3,
          radius: 0,
          fillColor, 
          strokeColor, 
          strokeWidth: 2 
        }]);
        break;
      case ACTIONS.STAR:
        setStars((prev) => [...prev, { 
          id, 
          x, 
          y, 
          numPoints: 5,
          innerRadius: 0,
          outerRadius: 0,
          fillColor, 
          strokeColor, 
          strokeWidth: 2 
        }]);
        break;
      case ACTIONS.HEXAGON:
        setHexagons((prev) => [...prev, { 
          id, 
          x, 
          y, 
          sides: 6,
          radius: 0,
          fillColor, 
          strokeColor, 
          strokeWidth: 2 
        }]);
        break;
      case ACTIONS.ARROW:
        setArrows((prev) => [...prev, { 
          id, 
          points: [x, y, x, y], 
          strokeColor, 
          strokeWidth: 2,
          fill: strokeColor
        }]);
        break;
      case ACTIONS.SCRIBBLE:
        setScribbles((prev) => [...prev, { 
          id, 
          points: [x, y], 
          strokeColor,
          strokeWidth: penSize,
          lineCap: 'round',
          lineJoin: 'round'
        }]);
        break;
      case ACTIONS.BRUSH:
        setScribbles((prev) => [...prev, { 
          id, 
          points: [x, y], 
          strokeColor: fillColor,
          strokeWidth: brushSize,
          lineCap: 'round',
          lineJoin: 'round',
          tension: 0.5
        }]);
        break;
      case ACTIONS.TEXT:
        { 
          const newText = {
            id,
            x,
            y,
            text: "Double click to edit",
            fillColor: theme === 'dark' ? '#ffffff' : '#000000',
            fontSize,
            fontFamily,
            draggable: true,
            strokeColor: theme === 'dark' ? '#000000' : '#ffffff',
            strokeWidth: 0
          };
          setTexts((prev) => [...prev, newText]);
          setSelectedId(id);
          setSelectedType('text');
          setShowTextEditor(true);
          setTimeout(saveToHistory, 0);
          break; 
        }
     case ACTIONS.COMMENT:
        { 
          const newComment = {
            id,
            x,
            y,
            text: "Type your comment here...",
            fillColor: '#000000',
            bgColor: '#fef3c7',
            bgStrokeColor: '#fbbf24',
            strokeColor: '#000000',
            strokeWidth: 0,
            fontSize: 14,
            fontFamily: "Arial",
            fontWeight: "normal",
            fontStyle: "normal",
            textDecoration: "",
            textAlign: "left",
            lineHeight: 1.2,
            width: 200,
            height: 100
          };
          setComments((prev) => [...prev, newComment]);
          setSelectedId(id);
          setSelectedType('comment');
          setShowTextEditor(true);
          setTimeout(saveToHistory, 0);
          break; 
        }
    }
  }

  function onPointerMove(e) {
    if (!isPainting.current) return;
    
    const stage = stageRef.current;
    const pos = stage.getPointerPosition();
    const x = pos.x / zoom - position.x;
    const y = pos.y / zoom - position.y;

    switch (action) {
      case ACTIONS.RECTANGLE:
        setRectangles((prev) =>
          prev.map((rect) =>
            rect.id === currentShapeId.current
              ? { 
                  ...rect, 
                  width: Math.abs(x - rect.x),
                  height: Math.abs(y - rect.y)
                }
              : rect
          )
        );
        break;
      case ACTIONS.CIRCLE:
        setCircles((prev) =>
          prev.map((circle) =>
            circle.id === currentShapeId.current
              ? { 
                  ...circle, 
                  radius: Math.sqrt((y - circle.y) ** 2 + (x - circle.x) ** 2) 
                }
              : circle
          )
        );
        break;
      case ACTIONS.TRIANGLE:
        setTriangles((prev) =>
          prev.map((triangle) =>
            triangle.id === currentShapeId.current
              ? { 
                  ...triangle, 
                  radius: Math.sqrt((y - triangle.y) ** 2 + (x - triangle.x) ** 2) 
                }
              : triangle
          )
        );
        break;
      case ACTIONS.STAR:
        setStars((prev) =>
          prev.map((star) =>
            star.id === currentShapeId.current
              ? { 
                  ...star, 
                  innerRadius: Math.sqrt((y - star.y) ** 2 + (x - star.x) ** 2) * 0.5,
                  outerRadius: Math.sqrt((y - star.y) ** 2 + (x - star.x) ** 2)
                }
              : star
          )
        );
        break;
      case ACTIONS.HEXAGON:
        setHexagons((prev) =>
          prev.map((hexagon) =>
            hexagon.id === currentShapeId.current
              ? { 
                  ...hexagon, 
                  radius: Math.sqrt((y - hexagon.y) ** 2 + (x - hexagon.x) ** 2) 
                }
              : hexagon
          )
        );
        break;
      case ACTIONS.ARROW:
        setArrows((prev) =>
          prev.map((arrow) =>
            arrow.id === currentShapeId.current
              ? { 
                  ...arrow, 
                  points: [arrow.points[0], arrow.points[1], x, y] 
                }
              : arrow
          )
        );
        break;
      case ACTIONS.SCRIBBLE:
      case ACTIONS.BRUSH:
        setScribbles((prev) =>
          prev.map((scribble) =>
            scribble.id === currentShapeId.current
              ? { 
                  ...scribble, 
                  points: [...scribble.points, x, y] 
                }
              : scribble
          )
        );
        break;
      case ACTIONS.ERASER:
        { 
          const threshold = 20 / zoom;
          // Erase scribbles
          setScribbles((prev) => prev.filter(s => {
            for (let i = 0; i < s.points.length; i += 2) {
              const distance = Math.sqrt(
                Math.pow(s.points[i] - x, 2) + 
                Math.pow(s.points[i + 1] - y, 2)
              );
              if (distance < threshold) {
                return false;
              }
            }
            return true;
          }));
          // Erase texts
          setTexts((prev) => prev.filter(t => {
            const distance = Math.sqrt(
              Math.pow(t.x - x, 2) + 
              Math.pow(t.y - y, 2)
            );
            return distance > threshold * 2;
          }));
          // Erase comments
          setComments((prev) => prev.filter(c => {
            const distance = Math.sqrt(
              Math.pow(c.x - x, 2) + 
              Math.pow(c.y - y, 2)
            );
            return distance > threshold * 2;
          }));
          break; 
        }
    }
  }

  function onPointerUp() {
    if (isPainting.current && currentShapeId.current) {
      setTimeout(saveToHistory, 0);
    }
    isPainting.current = false;
    currentShapeId.current = null;
  }

  function onClick(e, id, type) {
    if (action !== ACTIONS.SELECT) return;
    
    e.cancelBubble = true;
    setSelectedId(id);
    setSelectedType(type);
    
    const target = e.target;
    transformerRef.current.nodes([target]);
    
    // Show appropriate properties panel
    if (type === 'text' || type === 'comment') {
      setShowEditPanel(false);
      setShowImageProperties(false);
      setShowTextEditor(true);
    } else if (type === 'image') {
      setShowEditPanel(false);
      setShowTextEditor(false);
      setShowImageProperties(true);
    } else {
      setShowEditPanel(true);
      setShowTextEditor(false);
      setShowImageProperties(false);
    }
  }

  const handleBackgroundClick = () => {
    transformerRef.current.nodes([]);
    setSelectedId(null);
    setSelectedType(null);
    setShowEditPanel(false);
    setShowTextEditor(false);
    setShowImageProperties(false);
  };

  const deleteSelected = () => {
    if (!selectedId || !selectedType) return;
    
    switch (selectedType) {
      case 'rectangle':
        setRectangles(prev => prev.filter(r => r.id !== selectedId));
        break;
      case 'circle':
        setCircles(prev => prev.filter(c => c.id !== selectedId));
        break;
      case 'triangle':
        setTriangles(prev => prev.filter(t => t.id !== selectedId));
        break;
      case 'star':
        setStars(prev => prev.filter(s => s.id !== selectedId));
        break;
      case 'hexagon':
        setHexagons(prev => prev.filter(h => h.id !== selectedId));
        break;
      case 'arrow':
        setArrows(prev => prev.filter(a => a.id !== selectedId));
        break;
      case 'scribble':
        setScribbles(prev => prev.filter(s => s.id !== selectedId));
        break;
      case 'text':
        setTexts(prev => prev.filter(t => t.id !== selectedId));
        break;
      case 'image':
        setImages(prev => prev.filter(i => i.id !== selectedId));
        break;
      case 'comment':
        setComments(prev => prev.filter(c => c.id !== selectedId));
        break;
    }
    
    setSelectedId(null);
    setSelectedType(null);
    transformerRef.current.nodes([]);
    setTimeout(saveToHistory, 0);
    toast.success('Deleted successfully');
  };

   const updateText = (updatedText) => {
  if (updatedText._delete) {
    // Handle deletion
    if (selectedType === 'text') {
      setTexts(prev => prev.filter(t => t.id !== updatedText.id));
    } else if (selectedType === 'comment') {
      setComments(prev => prev.filter(c => c.id !== updatedText.id));
    }
    setSelectedId(null);
    setSelectedType(null);
    transformerRef.current.nodes([]);
    toast.success('Deleted successfully');
  } else {
    // Handle update
    if (selectedType === 'text') {
      setTexts(prev => prev.map(t => 
        t.id === updatedText.id ? updatedText : t
      ));
    } else if (selectedType === 'comment') {
      setComments(prev => prev.map(c => 
        c.id === updatedText.id ? updatedText : c
      ));
    }
  }
  setTimeout(saveToHistory, 0);
};

  const updateImage = (updatedImage) => {
    setImages(prev => prev.map(i => 
      i.id === updatedImage.id ? updatedImage : i
    ));
    setTimeout(saveToHistory, 0);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target.result;
      img.onload = () => {
        const id = uuidv4();
        const newImage = {
          id,
          image: img,
          x: 100,
          y: 100,
          width: img.width > 400 ? 400 : img.width,
          height: img.height > 400 ? 400 : img.height,
          brightness: 100,
          contrast: 100,
          blur: 0,
          opacity: 100,
          rotation: 0,
          scaleX: 1,
          scaleY: 1
        };
        setImages((prev) => [...prev, newImage]);
        setSelectedId(id);
        setSelectedType('image');
        setShowImageProperties(true);
        setTimeout(saveToHistory, 0);
        toast.success('Image uploaded successfully');
      };
    };
    reader.readAsDataURL(file);
  };

  const handleExport = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const link = document.createElement("a");
    link.download = `${projectName}.${exportFormat}`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setShowExportModal(false);
    toast.success('Exported successfully');
  };

  const handleExportPDF = async () => {
    try {
      await exportToPDF(stageRef, `${projectName}.pdf`);
      toast.success('PDF exported successfully');
    } catch (error) {
      toast.error('Failed to export PDF', error);
    }
    setShowExportModal(false);
  };

  const selectedText = texts.find(t => t.id === selectedId);
  const selectedComment = comments.find(c => c.id === selectedId);
  const selectedImage = images.find(i => i.id === selectedId);

   if (isLoading) {
  return (
    <div className="flex items-center justify-center h-screen w-screen bg-base-100">
      <EnhancedLoader />
    </div>
  );
}

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-base-100">
      <Toaster position="top-right" />
      
      {/* Orientation Prompt */}
      {showOrientationPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-6">
          <div className="text-center text-white">
            <TbDeviceMobile className="mx-auto mb-4 animate-bounce" size={80} />
            <h2 className="text-2xl font-bold mb-2">Rotate Your Device</h2>
            <p className="text-lg">Please rotate your device to landscape mode for the best experience</p>
          </div>
        </div>
      )}

      {/* Top Toolbar */}
      <div className="navbar bg-base-200 shadow-lg px-2 md:px-4 min-h-16">
        <div className="flex-1 gap-2">
          <button 
            className="btn btn-ghost btn-sm gap-2"
            onClick={() => navigate('/')}
            title="Back to Dashboard"
          >
            <TbHome size={18} />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          
          <div className="divider divider-horizontal"></div>
          
          <input
            type="text"
            value={projectName}
            onChange={(e) => {
              const newName = e.target.value;
              setProjectName(newName);
              // Auto-save name change
              if (projectId) {
                setTimeout(() => {
                  const data = {
                    rectangles,
                    circles,
                    triangles,
                    stars,
                    hexagons,
                    arrows,
                    scribbles,
                    texts,
                    images,
                    comments,
                    name: newName
                  };
                  saveProject(projectId, data);
                }, 500);
              }
            }}
            className="input input-sm input-bordered max-w-xs"
            placeholder="Project name"
          />
          
          {/* Theme Dropdown - Updated */}
            <div className="dropdown dropdown-bottom dropdown-end" ref={themeDropdownRef}>
              <label 
                tabIndex={0} 
                className="btn btn-sm btn-ghost gap-2 min-w-25"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {theme === 'dark' ? <FiMoon size={18} /> : <FiSun size={18} />}
                <span className="hidden md:inline capitalize">{theme}</span>
                <span className="md:hidden">Theme</span>
              </label>
              <ul 
                tabIndex={0} 
                className={`dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-box w-64 md:w-72 max-h-[70vh] overflow-y-auto z-50 scrollbar-thin ${dropdownOpen ? 'block' : 'hidden'}`}
              >
                <li className="menu-title">
                  <span className="text-xs uppercase">Select Theme</span>
                </li>
                {THEMES.map((t) => (
                  <li key={t}>
                    <a 
                      onClick={() => {
                        setTheme(t);
                        setDropdownOpen(false);
                      }} 
                      className={`flex items-center justify-between gap-2 ${theme === t ? "active" : ""}`}
                    >
                      <span className="capitalize font-medium">{t}</span>
                      {theme === t && (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

          <div className="btn-group">
            <button 
              className="btn btn-sm" 
              onClick={undo} 
              disabled={historyStep === 0}
              title="Undo (Ctrl+Z)"
            >
              <IoMdUndo size={18} />
            </button>
            <button 
              className="btn btn-sm" 
              onClick={redo} 
              disabled={historyStep === history.length - 1}
              title="Redo (Ctrl+Y)"
            >
              <IoMdRedo size={18} />
            </button>
          </div>

          <button 
            className="btn btn-sm btn-success gap-2"
            onClick={handleSaveProject}
            title="Save Project"
          >
            <IoMdSave size={18} />
            <span className="hidden md:inline">Save</span>
          </button>

          <button 
            className="btn btn-sm btn-error gap-2"
            onClick={handleClearAll}
            title="Clear All Canvas"
          >
            <TbTrash size={18} />
            <span className="hidden md:inline">Clear All</span>
          </button>

        </div>

        <div className="flex-none gap-2">
          <div className="text-sm text-base-content/70 hidden md:block">
            {format(currentTime, 'dd MMM yyyy • hh:mm:ss a')}
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <button 
            className="btn btn-sm btn-primary gap-2" 
            onClick={() => fileInputRef.current.click()}
          >
            <TbUpload size={18} />
            <span className="hidden md:inline">Upload</span>
          </button>
          <button 
            className="btn btn-sm btn-secondary gap-2" 
            onClick={() => setShowExportModal(true)}
          >
            <TbDownload size={18} />
            <span className="hidden md:inline">Export</span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Tools Sidebar - Professional Responsive Design */}
<div className="bg-base-200 shadow-lg flex flex-col w-16 md:w-20 overflow-hidden">
  {/* Tool Buttons Container with vertical scroll only */}
  <div className="flex flex-col gap-1 p-2 overflow-y-auto overflow-x-hidden scrollbar-thin">
    {/* Select Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.SELECT ? "btn-primary" : "btn-ghost"}`}
        onClick={() => {
          setAction(ACTIONS.SELECT);
          if (window.innerWidth < 768) {
            setShowEditPanel(false);
            setShowTextEditor(false);
            setShowImageProperties(false);
          }
        }}
        aria-label="Select tool"
        title="Select"
      >
        <GiArrowCursor size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Select (V)
      </div>
    </div>
    
    {/* Rectangle Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.RECTANGLE ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.RECTANGLE)}
        aria-label="Rectangle tool"
        title="Rectangle"
      >
        <TbRectangle size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Rectangle (R)
      </div>
    </div>
    
    {/* Circle Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.CIRCLE ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.CIRCLE)}
        aria-label="Circle tool"
        title="Circle"
      >
        <TbCircle size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Circle (C)
      </div>
    </div>
    
    {/* Triangle Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.TRIANGLE ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.TRIANGLE)}
        aria-label="Triangle tool"
        title="Triangle"
      >
        <TbTriangle size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Triangle
      </div>
    </div>
    
    {/* Star Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.STAR ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.STAR)}
        aria-label="Star tool"
        title="Star"
      >
        <TbStar size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Star
      </div>
    </div>
    
    {/* Hexagon Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.HEXAGON ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.HEXAGON)}
        aria-label="Hexagon tool"
        title="Hexagon"
      >
        <TbHexagon size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Hexagon
      </div>
    </div>
    
    {/* Arrow Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.ARROW ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.ARROW)}
        aria-label="Arrow tool"
        title="Arrow"
      >
        <TbArrowRight size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Arrow (A)
      </div>
    </div>
    
    {/* Text Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.TEXT ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.TEXT)}
        aria-label="Text tool"
        title="Text"
      >
        <TbTypography size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Text (T)
      </div>
    </div>
    
    {/* Comment Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.COMMENT ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.COMMENT)}
        aria-label="Comment tool"
        title="Comment"
      >
        <TbMessageCircle size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Comment
      </div>
    </div>
    
    {/* Pencil Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.SCRIBBLE ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.SCRIBBLE)}
        aria-label="Pencil tool"
        title="Pencil"
      >
        <TbPencil size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Pencil (P)
      </div>
    </div>
    
    {/* Brush Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.BRUSH ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.BRUSH)}
        aria-label="Brush tool"
        title="Brush"
      >
        <TbBrush size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Brush (B)
      </div>
    </div>
    
    {/* Eraser Tool */}
    <div className="relative group">
      <button
        className={`btn btn-sm w-full aspect-square ${action === ACTIONS.ERASER ? "btn-primary" : "btn-ghost"}`}
        onClick={() => setAction(ACTIONS.ERASER)}
        aria-label="Eraser tool"
        title="Eraser"
      >
        <TbEraser size={18} />
      </button>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Eraser (E)
      </div>
    </div>
    
    <div className="divider my-1"></div>
    
    {/* Brush Color Picker */}
    <div className="relative group">
      <label className="block cursor-pointer w-full">
        <div className="w-full aspect-square rounded-lg border-2 border-base-300 overflow-hidden hover:border-primary transition-colors relative">
          <input
            type="color"
            value={fillColor}
            onChange={(e) => setFillColor(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            aria-label="Brush color"
          />
          <div 
            className="w-full h-full relative"
            style={{ backgroundColor: fillColor }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <TbBrush size={14} className="text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </label>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Brush Color
      </div>
    </div>
    
    {/* Pen Color Picker */}
    <div className="relative group">
      <label className="block cursor-pointer w-full">
        <div className="w-full aspect-square rounded-lg border-2 border-base-300 overflow-hidden hover:border-primary transition-colors relative">
          <input
            type="color"
            value={strokeColor}
            onChange={(e) => setStrokeColor(e.target.value)}
            className="absolute inset-0 w-full h-full cursor-pointer opacity-0"
            aria-label="Pen color"
          />
          <div 
            className="w-full h-full relative"
            style={{ backgroundColor: strokeColor }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              <TbPencil size={14} className="text-white drop-shadow-lg" />
            </div>
          </div>
        </div>
      </label>
      <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 px-3 py-2 bg-base-100 text-base-content rounded-lg shadow-xl border border-base-300 whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none z-50 hidden md:block">
        Pen Color
      </div>
    </div>
    
    {/* Size Controls */}
    {action === ACTIONS.SCRIBBLE && (
      <div className="w-full px-1 mt-2">
        <div className="text-[10px] text-center mb-1 truncate font-semibold">Pen Size</div>
        <input
          type="range"
          min="1"
          max="10"
          value={penSize}
          onChange={(e) => setPenSize(Number(e.target.value))}
          className="range range-xs range-primary w-full"
          aria-label="Pen size"
        />
        <div className="text-[9px] text-center mt-1 font-medium">{penSize}px</div>
      </div>
    )}
    
    {action === ACTIONS.BRUSH && (
      <div className="w-full px-1 mt-2">
        <div className="text-[10px] text-center mb-1 truncate font-semibold">Brush Size</div>
        <input
          type="range"
          min="5"
          max="30"
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="range range-xs range-primary w-full"
          aria-label="Brush size"
        />
        <div className="text-[9px] text-center mt-1 font-medium">{brushSize}px</div>
      </div>
    )}
  </div>
</div>

        {/* Canvas Area */}
        <div className="flex-1 relative overflow-hidden">
          <Stage
            ref={stageRef}
            width={window.innerWidth - 80}
            height={window.innerHeight - 64}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            scaleX={zoom}
            scaleY={zoom}
            x={position.x}
            y={position.y}
            draggable={action === ACTIONS.SELECT}
            className="bg-base-100 cursor-crosshair"
          >
            <Layer>
              <Rect
                x={0}
                y={0}
                height={window.innerHeight - 64}
                width={window.innerWidth - 80}
                fill={theme === 'dark' ? '#1f2937' : '#ffffff'}
                onClick={handleBackgroundClick}
              />

              {rectangles.map((rect) => (
                <Rect
                  key={rect.id}
                  {...rect}
                  stroke={rect.strokeColor}
                  strokeWidth={rect.strokeWidth || 2}
                  fill={rect.fillColor}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, rect.id, 'rectangle')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setRectangles(prev => prev.map(r => 
                      r.id === rect.id ? {
                        ...r,
                        x: node.x(),
                        y: node.y(),
                        width: node.width() * node.scaleX(),
                        height: node.height() * node.scaleY(),
                        rotation: node.rotation()
                      } : r
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {circles.map((circle) => (
                <Circle
                  key={circle.id}
                  {...circle}
                  stroke={circle.strokeColor}
                  strokeWidth={circle.strokeWidth || 2}
                  fill={circle.fillColor}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, circle.id, 'circle')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setCircles(prev => prev.map(c => 
                      c.id === circle.id ? {
                        ...c,
                        x: node.x(),
                        y: node.y(),
                        radius: node.radius() * node.scaleX()
                      } : c
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {triangles.map((triangle) => (
                <RegularPolygon
                  key={triangle.id}
                  {...triangle}
                  stroke={triangle.strokeColor}
                  strokeWidth={triangle.strokeWidth || 2}
                  fill={triangle.fillColor}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, triangle.id, 'triangle')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setTriangles(prev => prev.map(t => 
                      t.id === triangle.id ? {
                        ...t,
                        x: node.x(),
                        y: node.y(),
                        radius: node.radius() * node.scaleX()
                      } : t
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {stars.map((star) => (
                <Star
                  key={star.id}
                  {...star}
                  stroke={star.strokeColor}
                  strokeWidth={star.strokeWidth || 2}
                  fill={star.fillColor}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, star.id, 'star')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setStars(prev => prev.map(s => 
                      s.id === star.id ? {
                        ...s,
                        x: node.x(),
                        y: node.y(),
                        innerRadius: node.innerRadius() * node.scaleX(),
                        outerRadius: node.outerRadius() * node.scaleX()
                      } : s
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {hexagons.map((hexagon) => (
                <RegularPolygon
                  key={hexagon.id}
                  {...hexagon}
                  stroke={hexagon.strokeColor}
                  strokeWidth={hexagon.strokeWidth || 2}
                  fill={hexagon.fillColor}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, hexagon.id, 'hexagon')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setHexagons(prev => prev.map(h => 
                      h.id === hexagon.id ? {
                        ...h,
                        x: node.x(),
                        y: node.y(),
                        radius: node.radius() * node.scaleX()
                      } : h
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {arrows.map((arrow) => (
                <Arrow
                  key={arrow.id}
                  {...arrow}
                  stroke={arrow.strokeColor}
                  strokeWidth={arrow.strokeWidth || 2}
                  fill={arrow.strokeColor}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, arrow.id, 'arrow')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setArrows(prev => prev.map(a => 
                      a.id === arrow.id ? {
                        ...a,
                        points: [
                          node.points()[0],
                          node.points()[1],
                          node.points()[2],
                          node.points()[3]
                        ]
                      } : a
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {scribbles.map((scribble) => (
                <Line
                  key={scribble.id}
                  points={scribble.points}
                  lineCap="round"
                  lineJoin="round"
                  stroke={scribble.strokeColor}
                  strokeWidth={scribble.strokeWidth || 2}
                  tension={scribble.tension || 0}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, scribble.id, 'scribble')}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setScribbles(prev => prev.map(s => 
                      s.id === scribble.id ? {
                        ...s,
                        points: node.points()
                      } : s
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {texts.map((text) => (
                <Text
                  key={text.id}
                  x={text.x}
                  y={text.y}
                  text={text.text}
                  fill={text.fillColor}
                  fontSize={text.fontSize}
                  fontFamily={text.fontFamily}
                  fontStyle={text.fontStyle || 'normal'}
                  fontVariant={text.fontWeight === 'bold' ? 'bold' : 'normal'}
                  textDecoration={text.textDecoration || ''}
                  align={text.textAlign || 'left'}
                  stroke={text.strokeColor}
                  strokeWidth={text.strokeWidth || 0}
                  lineHeight={text.lineHeight || 1.2}
                  width={text.width}
                  rotation={text.rotation}
                  scaleX={text.scaleX}
                  scaleY={text.scaleY}
                  draggable={isDraggable}
                  onClick={(e) => onClick(e, text.id, 'text')}
                  onDblClick={() => {
                    setSelectedId(text.id);
                    setSelectedType('text');
                    setShowTextEditor(true);
                  }}
                  onDragEnd={(e) => {
                    const node = e.target;
                    setTexts(prev => prev.map(t => 
                      t.id === text.id ? {
                        ...t,
                        x: node.x(),
                        y: node.y()
                      } : t
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                  onTransformEnd={(e) => {
                    const node = e.target;
                    setTexts(prev => prev.map(t => 
                      t.id === text.id ? {
                        ...t,
                        x: node.x(),
                        y: node.y(),
                        scaleX: node.scaleX(),
                        scaleY: node.scaleY(),
                        rotation: node.rotation()
                      } : t
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
              ))}

              {comments.map((comment) => (
              <React.Fragment key={comment.id}>
              <Rect
              x={comment.x}
              y={comment.y}
              width={comment.width}
              height={comment.height}
              fill={comment.bgColor || '#fef3c7'}
              stroke={comment.bgStrokeColor || '#fbbf24'}
              strokeWidth={2}
              cornerRadius={5}
              draggable={isDraggable}
                  onClick={(e) => onClick(e, comment.id, 'comment')}
                  onDragEnd={(e) => {
                    const node = e.target;
                    setComments(prev => prev.map(c => 
                      c.id === comment.id ? {
                        ...c,
                        x: node.x(),
                        y: node.y()
                      } : c
                    ));
                    setTimeout(saveToHistory, 0);
                  }}
                />
                <Text
                text={comment.text}
                x={comment.x + 10}
                y={comment.y + 10}
                width={comment.width - 20}
                fontSize={comment.fontSize || 14}
                fontFamily={comment.fontFamily || "Arial"}
                fontStyle={comment.fontStyle || 'normal'}
                fontVariant={comment.fontWeight === 'bold' ? 'bold' : 'normal'}
                textDecoration={comment.textDecoration || ''}
                align={comment.textAlign || 'left'}
                fill={comment.fillColor || '#000000'}
                stroke={comment.strokeColor || '#000000'}
                strokeWidth={comment.strokeWidth || 0}
                lineHeight={comment.lineHeight || 1.2}
                wrap="word"
                listening={false}
              />
              </React.Fragment>
            ))}

             {images.map((img) => {
  // Check if image is loaded
  if (!img.image) {
    return null;
  }
  
  return (
    <KonvaImage
      key={img.id}
      image={img.image}
      x={img.x}
      y={img.y}
      width={img.width * (img.scaleX || 1)}
      height={img.height * (img.scaleY || 1)}
      rotation={img.rotation || 0}
      opacity={(img.opacity || 100) / 100}
      filters={[
        Konva.Filters.Brighten,
        Konva.Filters.Blur
      ]}
      brightness={((img.brightness || 100) - 100) / 100}
      blurRadius={img.blur || 0}
      cache={true}  // Enable caching for filters
      draggable={isDraggable}
      onClick={(e) => onClick(e, img.id, 'image')}
      onDragEnd={(e) => {
        const node = e.target;
        setImages(prev => prev.map(i => 
          i.id === img.id ? {
            ...i,
            x: node.x(),
            y: node.y()
          } : i
        ));
        setTimeout(saveToHistory, 0);
      }}
      onTransformEnd={(e) => {
        const node = e.target;
        
        const newScaleX = node.scaleX();
        const newScaleY = node.scaleY();
        
        const newWidth = img.width * (img.scaleX || 1) * newScaleX;
        const newHeight = img.height * (img.scaleY || 1) * newScaleY;
        
        setImages(prev => prev.map(i => 
          i.id === img.id ? {
            ...i,
            x: node.x(),
            y: node.y(),
            width: newWidth,
            height: newHeight,
            scaleX: 1,
            scaleY: 1,
            rotation: node.rotation()
          } : i
        ));
        
        node.scaleX(1);
        node.scaleY(1);
        
        setTimeout(saveToHistory, 0);
      }}
      ref={(node) => {
        if (node) {
          // Re-cache whenever brightness or blur changes
          node.cache();
          node.getLayer()?.batchDraw();
        }
      }}
    />
  );
})}

              <Transformer ref={transformerRef} />
            </Layer>
          </Stage>

          {/* Zoom Controls */}
          <ZoomControls 
            zoom={zoom} 
            zoomIn={zoomIn} 
            zoomOut={zoomOut} 
            resetZoom={resetZoom}
          />

          {/* Properties Panel for Shapes */}
          {showEditPanel && selectedId && selectedType && 
           selectedType !== 'text' && selectedType !== 'image' && selectedType !== 'comment' && (
            <div className="absolute top-4 right-4 bg-base-200 p-4 rounded-lg shadow-xl w-64 z-10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold">Properties</h3>
                <button onClick={() => setShowEditPanel(false)} className="btn btn-xs btn-circle">
                  <IoMdClose />
                </button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="label">
                    <span className="label-text">Fill Color</span>
                  </label>
                  <input
                    type="color"
                    value={fillColor}
                    onChange={(e) => {
                      const newFillColor = e.target.value;
                      setFillColor(newFillColor);
                      
                      // Update selected shape
                      switch (selectedType) {
                        case 'rectangle':
                          setRectangles(prev => prev.map(r => 
                            r.id === selectedId ? {...r, fillColor: newFillColor} : r
                          ));
                          break;
                        case 'circle':
                          setCircles(prev => prev.map(c => 
                            c.id === selectedId ? {...c, fillColor: newFillColor} : c
                          ));
                          break;
                        case 'triangle':
                          setTriangles(prev => prev.map(t => 
                            t.id === selectedId ? {...t, fillColor: newFillColor} : t
                          ));
                          break;
                        case 'star':
                          setStars(prev => prev.map(s => 
                            s.id === selectedId ? {...s, fillColor: newFillColor} : s
                          ));
                          break;
                        case 'hexagon':
                          setHexagons(prev => prev.map(h => 
                            h.id === selectedId ? {...h, fillColor: newFillColor} : h
                          ));
                          break;
                        case 'arrow':
                          setArrows(prev => prev.map(a => 
                            a.id === selectedId ? {...a, fill: newFillColor} : a
                          ));
                          break;
                      }
                      setTimeout(saveToHistory, 0);
                    }}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <div>
                  <label className="label">
                    <span className="label-text">Stroke Color</span>
                  </label>
                  <input
                    type="color"
                    value={strokeColor}
                    onChange={(e) => {
                      const newStrokeColor = e.target.value;
                      setStrokeColor(newStrokeColor);
                      
                      // Update selected shape
                      switch (selectedType) {
                        case 'rectangle':
                          setRectangles(prev => prev.map(r => 
                            r.id === selectedId ? {...r, strokeColor: newStrokeColor} : r
                          ));
                          break;
                        case 'circle':
                          setCircles(prev => prev.map(c => 
                            c.id === selectedId ? {...c, strokeColor: newStrokeColor} : c
                          ));
                          break;
                        case 'triangle':
                          setTriangles(prev => prev.map(t => 
                            t.id === selectedId ? {...t, strokeColor: newStrokeColor} : t
                          ));
                          break;
                        case 'star':
                          setStars(prev => prev.map(s => 
                            s.id === selectedId ? {...s, strokeColor: newStrokeColor} : s
                          ));
                          break;
                        case 'hexagon':
                          setHexagons(prev => prev.map(h => 
                            h.id === selectedId ? {...h, strokeColor: newStrokeColor} : h
                          ));
                          break;
                        case 'arrow':
                          setArrows(prev => prev.map(a => 
                            a.id === selectedId ? {...a, strokeColor: newStrokeColor} : a
                          ));
                          break;
                      }
                      setTimeout(saveToHistory, 0);
                    }}
                    className="w-full h-10 rounded cursor-pointer"
                  />
                </div>

                <button onClick={deleteSelected} className="btn btn-error btn-sm w-full gap-2">
                  <TbTrash size={18} /> Delete Selected
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Text Editor Modal */}
      {showTextEditor && (selectedText || selectedComment) && (
        <TextEditor
          show={showTextEditor}
          onClose={() => setShowTextEditor(false)}
          textItem={selectedText || selectedComment}
          onUpdate={updateText}
          fillColor={fillColor}
          setFillColor={setFillColor}
          fontSize={fontSize}
          setFontSize={setFontSize}
          fontFamily={fontFamily}
          setFontFamily={setFontFamily}
          theme={theme}
        />
      )}

      {/* Image Properties Panel */}
      {showImageProperties && selectedImage && (
        <ImageProperties
          show={showImageProperties}
          onClose={() => setShowImageProperties(false)}
          imageItem={selectedImage}
          onUpdate={updateImage}
          onDelete={deleteSelected}
        />
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Export Your Design</h3>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Select Format</span>
              </label>
              <select
                className="select select-bordered w-full"
                value={exportFormat}
                onChange={(e) => setExportFormat(e.target.value)}
              >
                <option value="png">PNG Image (.png)</option>
                <option value="jpg">JPG Image (.jpg)</option>
                <option value="pdf">PDF Document (.pdf)</option>
                <option value="svg">SVG Vector (.svg)</option>
              </select>
            </div>
            <div className="modal-action">
              <button className="btn btn-ghost" onClick={() => setShowExportModal(false)}>
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={exportFormat === 'pdf' ? handleExportPDF : handleExport}
              >
                <TbDownload size={18} /> Export
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
