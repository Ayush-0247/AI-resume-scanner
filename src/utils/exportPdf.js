import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

/**
 * Captures an HTML element and exports it as a multi-page PDF report.
 * @param {string} elementId - The ID of the container element to export.
 * @param {string} filename - The output filename.
 * @returns {Promise<void>}
 */
export const exportReportToPdf = async (elementId, filename = 'ResumeIQ_ATS_Report.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) {
    throw new Error(`Export target element "${elementId}" not found`);
  }

  // Create loading indicator or update button states in components
  try {
    // Hide components we don't want in the export (like action buttons)
    const actionButtons = element.querySelectorAll('.no-print');
    actionButtons.forEach(btn => btn.style.display = 'none');

    const canvas = await html2canvas(element, {
      scale: 2, // Enhances print quality and text crispness
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#030712', // Matches our dark mode background
      logging: false,
    });

    // Restore hidden action buttons
    actionButtons.forEach(btn => btn.style.display = '');

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgWidth = canvas.width;
    const imgHeight = canvas.height;
    
    // Scale image to fit the PDF page width
    const ratio = pdfWidth / imgWidth;
    const scaledHeight = imgHeight * ratio;
    
    let heightLeft = scaledHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight, '', 'FAST');
    heightLeft -= pdfHeight;

    // Add subsequent pages if the content overflows A4 height
    while (heightLeft > 0) {
      position = heightLeft - scaledHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, scaledHeight, '', 'FAST');
      heightLeft -= pdfHeight;
    }

    pdf.save(filename);
  } catch (error) {
    console.error("PDF generation failed:", error);
    throw new Error("Failed to generate PDF report. Please try again.");
  }
};
