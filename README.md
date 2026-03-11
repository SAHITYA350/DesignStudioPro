# 🎨 DesignStudioPro

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite)](https://vitejs.dev/)
[![TailwindCSS](https://img.shields.io/badge/Tailwind-4-06B6D4?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Konva](https://img.shields.io/badge/Konva-10-EC5E40?style=for-the-badge&logo=canvas)](https://konvajs.org/)

**DesignStudioPro** is a sophisticated, high-performance web-based graphic design application. Inspired by industry leaders like Figma, it provides a powerful yet intuitive canvas for creating vector shapes, freehand art, and professional layouts directly in the browser.

---

## 🚀 Key Features

### 🛠️ Advanced Canvas Engine
Powered by **Konva.js**, the application handles complex rendering with ease:
- **Geometric Shapes**: Create Rectangles, Circles, Triangles, Stars, and Hexagons.
- **Smart Transformers**: Real-time scaling, rotation, and skewing using professional-grade handles.
- **Layer Management**: Intuitive selection and manipulation of canvas elements.

### 🖌️ Creative Tools
- **Freehand Pen & Brush**: Smooth, high-fidelity drawing with adjustable sizes and tension.
- **Multi-Shape Support**: Dedicated tools for complex polygons and stars.
- **Integrated Text Support**: Professional typography controls with font family and size customization.

### 🖼️ Rich Media & Export
- **Image Integration**: Upload and manipulate images with real-time filters (brightness, contrast, opacity).
- **Pro Exporting**: High-fidelity downloads available in **PNG** and **PDF** formats.
- **Local Persistence**: Automatic project saving to LocalStorage, ensuring your work is never lost.

### 🌓 Premium Aesthetics
- **30+ UI Themes**: Switch between a vast array of professionally curated themes (Cyberpunk, Dracula, Luxury, etc.) powered by **DaisyUI**.
- **Dark/Light Mode**: Seamless transition between light and dark environments.
- **Responsive Mastery**: Tailored layouts for mobile and desktop, including orientation-aware prompts.

---

## 📦 Project Structure & Tech Stack

### Technology Matrix
| Category | Technology |
| :--- | :--- |
| **Framework** | React 19 (Vite) |
| **Canvas** | Konva & react-konva |
| **Styling** | Tailwind CSS 4, DaisyUI 5, Styled Components |
| **State/Logic** | React Hooks, UUID, Date-fns |
| **Exporting** | jspdf, html2canvas |
| **UX/UI** | react-hot-toast, react-icons (Tb, Io, Gi, Fi) |

### 📁 File Analysis
- **`src/App.jsx`**: The core orchestrator managing state, canvas logic, and the Undo/Redo history system.
- **`src/components/Canvas.jsx`**: The presentation layer for the Konva stage and layers.
- **`src/hooks/`**: Specialized logic for Zoom, LocalStorage, History, and Orientation.
- **`src/utils/`**: Heavy-lifting logic for PDF generation, project serialization, and canvas handlers.

---

## 💎 What Makes It Unique?

1. **State-of-the-Art Undo/Redo**: A robust history management system that snapshots the entire canvas state, allowing for complex creative experimentation with a safety net.
2. **Extreme Customizability**: Unlike static design tools, DesignStudioPro allows users to completely reskin their workspace with dozens of high-end themes.
3. **Hybrid Performance**: Combines the declarative nature of React with the high-performance imperativeness of Konva, resulting in a lag-free design experience even with hundreds of nodes.
4. **Professional Export Pipeline**: Built-in support for multiple formats including vectorized PDF output, bridging the gap between web prototypes and production assets.

---

## 🛠️ Development

### Prerequisites
- Node.js (Latest stable version)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone [repository-url]

# Install dependencies
npm install

# Start the dev server
npm run dev
```

### Building for Production
```bash
npm run build
```

---

Built with ❤️ by Developers for Designers.
