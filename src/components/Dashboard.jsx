import { useState, useEffect } from "react";
import { TbPlus, TbFolder, TbCalendar, TbClock } from "react-icons/tb";
import { FiSun, FiMoon } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { saveProject, listProjects } from "../utils/localStorage";

// Theme color mapping for preview
const themeColors = {
  light: { primary: '#570df8', secondary: '#f000b8', accent: '#1dcdbc', neutral: '#ffffff' },
  dark: { primary: '#661AE6', secondary: '#D926AA', accent: '#1FB2A5', neutral: '#2a303c' },
  cupcake: { primary: '#65c3c8', secondary: '#ef9fbc', accent: '#eeaf3a', neutral: '#faf7f5' },
  bumblebee: { primary: '#e0a82e', secondary: '#f9d72f', accent: '#181830', neutral: '#ffffff' },
  emerald: { primary: '#66cc8a', secondary: '#377cfb', accent: '#ea5234', neutral: '#ffffff' },
  corporate: { primary: '#4b6bfb', secondary: '#7b92b2', accent: '#67cba0', neutral: '#ffffff' },
  synthwave: { primary: '#e779c1', secondary: '#58c7f3', accent: '#f9cb28', neutral: '#1a103c' },
  retro: { primary: '#ef9995', secondary: '#a4cbb4', accent: '#EBDC99', neutral: '#f4f0e8' },
  cyberpunk: { primary: '#ff7598', secondary: '#75d1f0', accent: '#c398eb', neutral: '#f0f0f0' },
  valentine: { primary: '#e96d7b', secondary: '#a991f7', accent: '#88dbdd', neutral: '#f0d6e8' },
  halloween: { primary: '#f28c18', secondary: '#6d3a9c', accent: '#51a800', neutral: '#212121' },
  garden: { primary: '#5c7f67', secondary: '#ecf4e7', accent: '#5c7f67', neutral: '#ffffff' },
  forest: { primary: '#1eb854', secondary: '#1db88e', accent: '#1db8ab', neutral: '#171212' },
  aqua: { primary: '#09ecf3', secondary: '#966fb3', accent: '#fbbf24', neutral: '#ffffff' },
  lofi: { primary: '#0D0D0D', secondary: '#1A1919', accent: '#0D0D0D', neutral: '#ffffff' },
  pastel: { primary: '#d1c1d7', secondary: '#f6cbd1', accent: '#b4e9d6', neutral: '#fafbf9' },
  fantasy: { primary: '#6e0b75', secondary: '#007ebd', accent: '#f471b5', neutral: '#ffffff' },
  wireframe: { primary: '#b8b8b8', secondary: '#b8b8b8', accent: '#b8b8b8', neutral: '#ffffff' },
  black: { primary: '#373737', secondary: '#373737', accent: '#373737', neutral: '#000000' },
  luxury: { primary: '#ffffff', secondary: '#152747', accent: '#513448', neutral: '#0c0e14' },
  dracula: { primary: '#ff79c6', secondary: '#bd93f9', accent: '#ffb86c', neutral: '#282a36' },
  cmyk: { primary: '#45AEEE', secondary: '#E8488A', accent: '#FFF232', neutral: '#ffffff' },
  autumn: { primary: '#8C0327', secondary: '#D85251', accent: '#e6b667', neutral: '#f1e4cd' },
  business: { primary: '#1C4E80', secondary: '#7C909A', accent: '#EA6947', neutral: '#ffffff' },
  acid: { primary: '#ff00f4', secondary: '#ff7400', accent: '#ffee00', neutral: '#ffffff' },
  lemonade: { primary: '#519903', secondary: '#e9e92f', accent: '#bf95f9', neutral: '#ffffff' },
  night: { primary: '#38bdf8', secondary: '#818cf8', accent: '#f471b5', neutral: '#0f1729' },
  coffee: { primary: '#DB924B', secondary: '#263E3F', accent: '#10576D', neutral: '#362706' },
  winter: { primary: '#047AFF', secondary: '#463AA2', accent: '#C148AC', neutral: '#ffffff' },
  dim: { primary: '#9333ea', secondary: '#f97316', accent: '#0ea5e9', neutral: '#1e293b' },
  nord: { primary: '#5E81AC', secondary: '#81A1C1', accent: '#88C0D0', neutral: '#2e3440' },
  sunset: { primary: '#f97316', secondary: '#e11d48', accent: '#8b5cf6', neutral: '#fed7aa' }
};

const getThemeColor = (themeName, colorType) => {
  return themeColors[themeName]?.[colorType] || '#999999';
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('theme') || 'light';
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("modified");

  const filteredAndSortedProjects = 
    projects.filter(project => 
      project.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      switch(sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'created':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'modified':
        default:
          return new Date(b.lastModified) - new Date(a.lastModified);
      }
    });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    // Load projects from window.storage
    const loadProjectsAsync = async () => {
      const savedProjects = await listProjects();
      setProjects(savedProjects);
    };
    
    loadProjectsAsync();

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Create new project
  const createNewProject = async () => {
    const projectId = `project_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newProjectName = `Project ${projects.length + 1}`;
    
    // Create initial project data
    const initialData = {
      name: newProjectName,
      rectangles: [],
      circles: [],
      triangles: [],
      stars: [],
      hexagons: [],
      arrows: [],
      scribbles: [],
      texts: [],
      images: [],
      comments: []
    };
        
    // Save to window.storage
    await saveProject(projectId, initialData);
    
    // Reload projects to update UI
    const savedProjects = await listProjects();
    setProjects(savedProjects);
    
    // Navigate to editor
    navigate(`/editor/${projectId}`);
  };

  const openProject = (projectId) => {
    navigate(`/editor/${projectId}`);
  };

 const handleDeleteProject = async (projectId, e) => {
  e.stopPropagation();
  
  // Show confirmation dialog
  const modal = document.getElementById('deleteConfirmationModal');
  if (modal) {
    modal.showModal();
    
    // Wait for user response
    const response = await new Promise((resolve) => {
      const yesBtn = document.getElementById('confirmDeleteYes');
      const noBtn = document.getElementById('confirmDeleteNo');
      
      const handleYesClick = () => {
        cleanup();
        resolve(true);
      };
      
      const handleNoClick = () => {
        cleanup();
        resolve(false);
      };
      
      const handleEscape = (e) => {
        if (e.key === 'Escape') {
          cleanup();
          resolve(false);
        }
      };
      
      const cleanup = () => {
        yesBtn?.removeEventListener('click', handleYesClick);
        noBtn?.removeEventListener('click', handleNoClick);
        document.removeEventListener('keydown', handleEscape);
        modal.close();
      };
      
      yesBtn?.addEventListener('click', handleYesClick, { once: true });
      noBtn?.addEventListener('click', handleNoClick, { once: true });
      document.addEventListener('keydown', handleEscape, { once: true });
    });
    
    if (!response) {
      return;
    }
  }
  
  // If user confirms, delete the project
  // Get current projects from localStorage
  const projectsList = JSON.parse(localStorage.getItem('figmaCloneProjects') || '[]');
  const filtered = projectsList.filter(p => p.id !== projectId);
  localStorage.setItem('figmaCloneProjects', JSON.stringify(filtered));
  
  // Update state
  setProjects(prev => prev.filter(p => p.id !== projectId));
};

  return (
    <div className="min-h-screen bg-linear-to-br from-base-100 to-base-200 p-3 md:p-4 lg:p-6 xl:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        {/* Mobile Optimized Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 md:gap-4 mb-6 md:mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold truncate">Design Studio Pro</h1>
            <p className="text-base-content/70 text-sm md:text-base mt-1 md:mt-2 truncate">
              Professional design tool for creators
            </p>
          </div>
          
          {/* Controls Container */}
          <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {/* Theme Selector - Mobile Optimized */}
            <details className="dropdown dropdown-bottom dropdown-end">
              <summary tabIndex={0} className="btn btn-ghost btn-sm md:btn-md gap-1 md:gap-2 px-2 md:px-3 w-full xs:w-auto">
                <div className="flex items-center gap-1 md:gap-2">
                  {theme === 'dark' ? <FiMoon size={16} /> : <FiSun size={16} />}
                  <span className="sm:hidden">Theme</span>
                  <span className="hidden sm:inline">Theme</span>
                </div>
              </summary>
              <ul tabIndex={0} className="dropdown-content menu p-2 shadow-2xl bg-base-100 rounded-box w-56 md:w-64 max-h-72 md:max-h-96 overflow-y-auto z-50 scrollbar-thin">
                {Object.keys(themeColors).map((t) => (
                  <li key={t}>
                    <a 
                      onClick={() => {
                        setTheme(t);
                        localStorage.setItem('theme', t);
                      }} 
                      className={`flex items-center justify-between gap-2 md:gap-3 px-2 py-1.5 md:px-3 md:py-2 ${theme === t ? "active" : ""}`}
                    >
                      <span className="text-xs md:text-sm capitalize font-medium truncate">{t}</span>
                      {/* Color Preview */}
                      <div className="flex gap-0.5 md:gap-1 shrink-0">
                        <div 
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-base-content/20"
                          style={{ backgroundColor: getThemeColor(t, 'primary') }}
                          title="Primary"
                        ></div>
                        <div 
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-base-content/20"
                          style={{ backgroundColor: getThemeColor(t, 'secondary') }}
                          title="Secondary"
                        ></div>
                        <div 
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-base-content/20"
                          style={{ backgroundColor: getThemeColor(t, 'accent') }}
                          title="Accent"
                        ></div>
                        <div 
                          className="w-3 h-3 md:w-4 md:h-4 rounded-full border border-base-content/20"
                          style={{ backgroundColor: getThemeColor(t, 'neutral') }}
                          title="Neutral"
                        ></div>
                      </div>
                    </a>
                  </li>
                ))}
              </ul>
            </details>
            
            {/* Date & Time - Mobile Optimized */}
            <div className="flex items-center justify-between xs:justify-center gap-2 md:gap-3 bg-base-200 p-2 md:p-3 rounded-lg md:rounded-xl text-xs md:text-sm lg:text-base">
              <div className="flex items-center gap-1 md:gap-2">
                <TbCalendar className="shrink-0" size={14} />
                <span className="font-medium truncate">{format(currentTime, 'dd MMM yyyy')}</span>
              </div>
              <div className="divider divider-horizontal mx-1 h-4 md:h-5"></div>
              <div className="flex items-center gap-1 md:gap-2">
                <TbClock className="shrink-0" size={14} />
                <span className="font-medium truncate">{format(currentTime, 'hh:mm a')}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions - Responsive Grid */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4 lg:gap-6 mb-6 md:mb-8">
          {/* Create New Project Card */}
          <div 
            className="card bg-base-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer border-2 border-dashed border-primary/20 hover:border-primary xs:col-span-2 lg:col-span-1"
            onClick={createNewProject}
          >
            <div className="card-body p-4 md:p-6 items-center text-center">
              <TbPlus className="text-4xl md:text-5xl lg:text-6xl text-primary mb-2 md:mb-3 lg:mb-4" />
              <h2 className="card-title text-lg md:text-xl lg:text-2xl">Create New Project</h2>
              <p className="text-sm md:text-base text-base-content/70">Start a new design from scratch</p>
              <div className="card-actions mt-3 md:mt-4">
                <button className="btn btn-primary btn-sm md:btn-md">Get Started</button>
              </div>
            </div>
          </div>

          {/* Quick Templates Card */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title text-lg md:text-xl">
                <TbFolder className="mr-2" />
                Quick Templates
              </h2>
              <div className="space-y-1 md:space-y-2">
                <button className="btn btn-ghost btn-sm md:btn-md w-full justify-start px-2">Social Media Post</button>
                <button className="btn btn-ghost btn-sm md:btn-md w-full justify-start px-2">Presentation Slide</button>
                <button className="btn btn-ghost btn-sm md:btn-md w-full justify-start px-2">Infographic</button>
                <button className="btn btn-ghost btn-sm md:btn-md w-full justify-start px-2">Logo Design</button>
              </div>
            </div>
          </div>

          {/* Recent Features Card */}
          <div className="card bg-base-100 shadow-lg">
            <div className="card-body p-4 md:p-6">
              <h2 className="card-title text-lg md:text-xl">Recent Features</h2>
              <ul className="space-y-1.5 md:space-y-2">
                <li className="flex items-center gap-2">
                  <div className="badge badge-primary badge-xs"></div>
                  <span className="text-sm md:text-base">20+ Theme Options</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="badge badge-secondary badge-xs"></div>
                  <span className="text-sm md:text-base">Advanced Text Editor</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="badge badge-accent badge-xs"></div>
                  <span className="text-sm md:text-base">Multiple Shape Tools</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="badge badge-info badge-xs"></div>
                  <span className="text-sm md:text-base">Professional Export Options</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Recent Projects with Search & Filter - Fully Responsive */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4 md:p-6">
            {/* Header with Search and Sort - Mobile Optimized */}
            <div className="flex flex-col xs:flex-row gap-3 md:gap-4 mb-4">
              <h2 className="card-title text-xl md:text-2xl shrink-0">Recent Projects</h2>
              
              {/* Search Bar with Clear Button */}
              <div className="flex-1 min-w-0">
                <div className="form-control">
                  <div className="input-group w-full">
                    <input
                      type="text"
                      placeholder="Search projects..."
                      className="input input-bordered w-full text-sm md:text-base"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    {searchQuery && (
                      <button 
                        className="btn btn-square btn-sm md:btn-md"
                        onClick={() => setSearchQuery("")}
                        aria-label="Clear search"
                      >
                        <span className="text-lg">×</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Sort Dropdown - Mobile Friendly */}
              <div className="dropdown dropdown-end">
                <label tabIndex={0} className="btn btn-outline btn-sm md:btn-md gap-1 md:gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="w-3 h-3 md:w-4 md:h-4 stroke-current">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"></path>
                  </svg>
                  <span className="hidden xs:inline">
                    Sort: {sortBy === 'modified' ? 'Modified' : sortBy === 'created' ? 'Created' : 'Name'}
                  </span>
                  <span className="xs:hidden">Sort</span>
                </label>
                <ul tabIndex={0} className="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-48 md:w-52 z-50">
                  <li><a onClick={() => setSortBy('modified')} className={`text-sm md:text-base ${sortBy === 'modified' ? 'active' : ''}`}>Last Modified</a></li>
                  <li><a onClick={() => setSortBy('created')} className={`text-sm md:text-base ${sortBy === 'created' ? 'active' : ''}`}>Date Created</a></li>
                  <li><a onClick={() => setSortBy('name')} className={`text-sm md:text-base ${sortBy === 'name' ? 'active' : ''}`}>Name (A-Z)</a></li>
                </ul>
              </div>
            </div>

            {/* Results Count */}
            {searchQuery && (
              <div className="text-xs md:text-sm text-base-content/70 mb-2 md:mb-3 px-1">
                Found {filteredAndSortedProjects.length} project{filteredAndSortedProjects.length !== 1 ? 's' : ''}
                <button 
                  className="btn btn-xs btn-ghost ml-2"
                  onClick={() => setSearchQuery("")}
                >
                  Clear
                </button>
              </div>
            )}

            {/* Projects Grid or Empty State */}
            {filteredAndSortedProjects.length === 0 ? (
              <div className="text-center py-8 md:py-12">
                <TbFolder className="text-5xl md:text-6xl text-base-content/30 mx-auto mb-3 md:mb-4" />
                <p className="text-base-content/60 text-sm md:text-base">
                  {searchQuery ? `No projects found matching "${searchQuery}"` : 'No projects yet. Create your first project!'}
                </p>
                
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 md:gap-4">
                {filteredAndSortedProjects.map((project) => (
                  <div 
                    key={project.id}
                    className="card bg-base-200 hover:bg-base-300 transition-colors cursor-pointer"
                    onClick={() => openProject(project.id)}
                  >
                    <div className="card-body p-3 md:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="card-title text-sm md:text-base lg:text-lg line-clamp-2 flex-1 min-w-0">
                          {project.name}
                        </h3>
                        <button 
                          className="btn btn-xs btn-ghost text-error shrink-0 ml-2"
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          aria-label="Delete project"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="space-y-1">
                        <p className="text-xs md:text-sm text-base-content/70">
                          Created: {format(new Date(project.createdAt), 'dd MMM yyyy')}
                        </p>
                        <p className="text-xs md:text-sm text-base-content/70">
                          Modified: {format(new Date(project.lastModified), 'dd MMM, hh:mm a')}
                        </p>

                      </div>
                      <div className="card-actions justify-end mt-2">
                        <button className="btn btn-xs md:btn-sm btn-primary">Open</button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer - Responsive */}
        <div className="mt-6 md:mt-8 text-center text-base-content/60">
          <p className="text-base md:text-lg font-semibold mb-1 md:mb-2">Design Studio Pro - Premium Edition</p>
          <p className="text-base md:text-lg font-semibold mb-1 md:mb-2">Sahitya Ghosh || 8777099335</p>
          <p className="text-sm md:text-base">© {new Date().getFullYear()} • All rights reserved</p>
          <p className="text-xs md:text-sm mt-1 md:mt-2">
            Auto-saves every 3 seconds • Unlimited undo/redo • Professional export options
          </p>
        </div>
      </div>
      {/* Delete Confirmation Modal */}
<dialog id="deleteConfirmationModal" className="modal">
  <div className="modal-box">
    <h3 className="font-bold text-lg">Delete Project</h3>
    <p className="py-4">Are you sure you want to delete this project? This action cannot be undone.</p>
    <div className="modal-action">
      <form method="dialog" className="flex gap-2">
        <button 
          id="confirmDeleteNo" 
          className="btn btn-ghost"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('deleteConfirmationModal')?.close();
          }}
        >
          Cancel
        </button>
        <button 
          id="confirmDeleteYes" 
          className="btn btn-error"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById('confirmDeleteYes')?.click();
          }}
        >
          Yes, Delete
        </button>
      </form>
    </div>
  </div>
  <form method="dialog" className="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
    </div>
  );
}