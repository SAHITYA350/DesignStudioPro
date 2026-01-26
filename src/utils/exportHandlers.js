export function handleImageExport(stageRef, format = 'png') {
  const uri = stageRef.current.toDataURL();
  const link = document.createElement("a");
  link.download = `design.${format}`;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export async function handlePDFExport(stageRef) {
  // This is a placeholder - install jsPDF for real PDF functionality
  const uri = stageRef.current.toDataURL();
  const link = document.createElement("a");
  link.download = "design.png";
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function handleImageUpload(file, setImages, saveToHistory) {
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const img = new window.Image();
    img.src = event.target.result;
    img.onload = () => {
      const id = crypto.randomUUID();
      setImages((prev) => [...prev, {
        id,
        image: img,
        x: 100,
        y: 100,
        width: img.width > 400 ? 400 : img.width,
        height: img.height > 400 ? 400 : img.height,
      }]);
      saveToHistory();
    };
  };
  reader.readAsDataURL(file);
}