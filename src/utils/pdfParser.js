/**
 * Extracts text content from a PDF file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const parsePdf = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const pdfjsLib = window.pdfjsLib;
        if (!pdfjsLib) {
          throw new Error("PDF parsing engine is not loaded. Please ensure you are connected to the internet.");
        }
        
        const typedarray = new Uint8Array(event.target.result);
        const loadingTask = pdfjsLib.getDocument({ data: typedarray });
        const pdf = await loadingTask.promise;
        let fullText = '';
        
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items.map(item => item.str).join(' ');
          fullText += pageText + '\n';
        }
        resolve(fullText);
      } catch (error) {
        console.error("PDF Parsing Error:", error);
        reject(new Error(error.message || "Failed to parse PDF file. Ensure it is not password-protected or corrupted."));
      }
    };
    reader.onerror = (error) => {
      console.error("FileReader Error:", error);
      reject(new Error("Failed to read file."));
    };
    reader.readAsArrayBuffer(file);
  });
};

/**
 * Extracts text content from a TXT file.
 * @param {File} file 
 * @returns {Promise<string>}
 */
export const parseTxt = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      resolve(event.target.result);
    };
    reader.onerror = (error) => {
      console.error("FileReader Error:", error);
      reject(new Error("Failed to read text file."));
    };
    reader.readAsText(file);
  });
};
