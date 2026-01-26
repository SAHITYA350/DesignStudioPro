import jsPDF from 'jspdf';

export async function exportToPDF(stageRef, fileName = 'design.pdf') {
  const stage = stageRef.current;
  const uri = stage.toDataURL({ pixelRatio: 2 });
  
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [stage.width(), stage.height()]
  });
  
  pdf.addImage(uri, 'PNG', 0, 0, stage.width(), stage.height());
  pdf.save(fileName);
  
  return pdf;
}

export async function exportWithLayers(stageRef, layers, fileName = 'design-layered.pdf') {
  const pdf = new jsPDF({
    orientation: 'landscape',
    unit: 'px',
    format: [stageRef.current.width(), stageRef.current.height()]
  });
  
  // Export each layer separately
  for (let i = 0; i < layers.length; i++) {
    const uri = stageRef.current.toDataURL({ 
      pixelRatio: 2,
      mimeType: 'image/png',
      quality: 1
    });
    
    pdf.addImage(uri, 'PNG', 0, 0, 
      stageRef.current.width(), 
      stageRef.current.height()
    );
    
    if (i < layers.length - 1) {
      pdf.addPage();
    }
  }
  
  pdf.save(fileName);
  return pdf;
}