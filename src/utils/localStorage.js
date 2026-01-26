const STORAGE_KEY = 'figmaCloneProjects';

// Helper function to serialize images
function serializeImages(images) {
  return images.map(img => {
    // Convert the image to base64 data URL
    if (img.image && img.image instanceof HTMLImageElement) {
      return {
        ...img,
        imageSrc: img.image.src, // Store the source URL
        image: undefined // Remove the HTMLImageElement
      };
    }
    return img;
  });
}

// Helper function to deserialize images
async function deserializeImages(images) {
  return Promise.all(images.map(async (img) => {
    if (img.imageSrc && !img.image) {
      // Load image from source
      const imageElement = new window.Image();
      imageElement.src = img.imageSrc;
      
      await new Promise((resolve, reject) => {
        imageElement.onload = resolve;
        imageElement.onerror = reject;
      });
      
      return {
        ...img,
        image: imageElement
      };
    }
    return img;
  }));
}

export function saveProject(projectId, data) {
  try {
    
    // Get existing projects
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const existingIndex = projects.findIndex(p => p.id === projectId);
    
    // Serialize images before saving
    const serializedImages = serializeImages(data.images || []);
    
    // Prepare project data with proper structure
    const projectData = {
      id: projectId,
      name: data.name || `Project ${Date.now()}`,
      lastModified: new Date().toISOString(),
      data: {
        rectangles: Array.isArray(data.rectangles) ? data.rectangles : [],
        circles: Array.isArray(data.circles) ? data.circles : [],
        triangles: Array.isArray(data.triangles) ? data.triangles : [],
        stars: Array.isArray(data.stars) ? data.stars : [],
        hexagons: Array.isArray(data.hexagons) ? data.hexagons : [],
        arrows: Array.isArray(data.arrows) ? data.arrows : [],
        scribbles: Array.isArray(data.scribbles) ? data.scribbles : [],
        texts: Array.isArray(data.texts) ? data.texts : [],
        images: serializedImages,
        comments: Array.isArray(data.comments) ? data.comments : []
      }
    };
    
    // Preserve createdAt date if project exists
    if (existingIndex >= 0 && projects[existingIndex].createdAt) {
      projectData.createdAt = projects[existingIndex].createdAt;
    } else {
      projectData.createdAt = new Date().toISOString();
    }
    
    // Update or add project
    if (existingIndex >= 0) {
      projects[existingIndex] = projectData;
    } else {
      projects.push(projectData);
    }
    
    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    
    return true;
  } catch (error) {
    console.error('Error saving project:', error);
    return false;
  }
}

export async function loadProject(projectId) {
  try {
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    
    const project = projects.find(p => p.id === projectId);
    
    if (project) {
      
      // Deserialize images
      const deserializedImages = await deserializeImages(project.data?.images || []);
      
      // Return with proper data structure
      return {
        ...project,
        data: {
          rectangles: project.data?.rectangles || [],
          circles: project.data?.circles || [],
          triangles: project.data?.triangles || [],
          stars: project.data?.stars || [],
          hexagons: project.data?.hexagons || [],
          arrows: project.data?.arrows || [],
          scribbles: project.data?.scribbles || [],
          texts: project.data?.texts || [],
          images: deserializedImages,
          comments: project.data?.comments || []
        }
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error loading project:', error);
    return null;
  }
}

export function listProjects() {
  try {
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    return projects;
  } catch (error) {
    console.error('Error listing projects:', error);
    return [];
  }
}

export function deleteProject(projectId) {
  try {
    const projects = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    const filtered = projects.filter(p => p.id !== projectId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    return true;
  } catch (error) {
    console.error('Error deleting project:', error);
    return false;
  }
}

// Auto-save function
export function autoSave(projectId, data, interval = 5000) {
  let timeoutId;
  
  const save = () => {
    if (projectId && data) {
      saveProject(projectId, data);
    }
    timeoutId = setTimeout(save, interval);
  };
  
  save();
  
  return () => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  };
}