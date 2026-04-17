// ============================================
// parser.js — PDF & Text Resume Parser
// Extracts raw text from uploaded resume files
// ============================================

// ===== PDF.js SETUP =====
// Tell PDF.js where its worker file is (loaded from CDN in index.html)
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// ===== MAIN PARSER FUNCTION =====
// Accepts a File object, returns extracted text as a string
async function parseFile(file) {
  const fileName = file.name.toLowerCase();

  if (fileName.endsWith('.pdf')) {
    return await parsePDF(file);
  } else if (fileName.endsWith('.txt')) {
    return await parseTXT(file);
  } else {
    throw new Error(`Unsupported file type: ${file.name}`);
  }
}

// ===== PDF PARSER =====
// Uses PDF.js to extract text from each page of a PDF
async function parsePDF(file) {
  try {
    // Convert file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();

    // Load the PDF document
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

    let fullText = '';

    // Loop through every page and extract text
    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();

      // Join all text items on the page
      const pageText = textContent.items
        .map(item => item.str)
        .join(' ');

      fullText += pageText + '\n';
    }

    if (!fullText.trim()) {
      throw new Error('No text found in PDF. It may be a scanned image.');
    }

    return fullText.trim();

  } catch (err) {
    throw new Error(`PDF parsing failed for ${file.name}: ${err.message}`);
  }
}

// ===== TXT PARSER =====
// Simple text file reader
async function parseTXT(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const text = e.target.result;
      if (!text.trim()) {
        reject(new Error(`File ${file.name} appears to be empty.`));
      } else {
        resolve(text.trim());
      }
    };

    reader.onerror = () => {
      reject(new Error(`Could not read file: ${file.name}`));
    };

    reader.readAsText(file);
  });
}

// ===== FILE NAME CLEANER =====
// Extracts a clean candidate name from filename
// e.g. "john_doe_resume.pdf" → "John Doe"
function getNameFromFile(fileName) {
  return fileName
    .replace(/\.(pdf|txt)$/i, '')     // remove extension
    .replace(/[_\-\.]+/g, ' ')        // replace separators with space
    .replace(/resume|cv/gi, '')       // remove common words
    .trim()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
    .trim() || 'Candidate';
}

// ===== FILE VALIDATOR =====
// Checks file before parsing
function validateFile(file) {
  const validTypes = ['application/pdf', 'text/plain'];
  const validExtensions = ['.pdf', '.txt'];
  const maxSize = 5 * 1024 * 1024; // 5MB limit

  const ext = '.' + file.name.split('.').pop().toLowerCase();

  if (!validExtensions.includes(ext)) {
    return { valid: false, error: `${file.name} — Only PDF and TXT files allowed.` };
  }

  if (file.size > maxSize) {
    return { valid: false, error: `${file.name} — File too large. Max 5MB.` };
  }

  if (file.size === 0) {
    return { valid: false, error: `${file.name} — File is empty.` };
  }

  return { valid: true };
}
