// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize jsPDF
    const { jsPDF } = window.jspdf;
    
    // DOM elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectFilesBtn = document.getElementById('selectFiles');
    const fileInfo = document.getElementById('fileInfo');
    const convertBtn = document.getElementById('convertBtn');
    const clearBtn = document.getElementById('clearBtn');
    const previewContainer = document.getElementById('previewContainer');
    const generatePreviewBtn = document.getElementById('generatePreview');
    
    // Options elements
    const pageSizeSelect = document.getElementById('pageSize');
    const customSizeGroup = document.getElementById('customSizeGroup');
    const customWidth = document.getElementById('customWidth');
    const customHeight = document.getElementById('customHeight');
    const pageOrientation = document.getElementById('pageOrientation');
    const pageLayout = document.getElementById('pageLayout');
    const marginSize = document.getElementById('marginSize');
    const customMarginGroup = document.getElementById('customMarginGroup');
    const customMargin = document.getElementById('customMargin');
    const borderStyle = document.getElementById('borderStyle');
    const borderColor = document.getElementById('borderColor');
    const imageFit = document.getElementById('imageFit');
    const compression = document.getElementById('compression');
    const outputName = document.getElementById('outputName');
    
    // Store uploaded files
    let uploadedFiles = [];
    
    // Event listeners
    selectFilesBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    dropZone.addEventListener('dragover', handleDragOver);
    dropZone.addEventListener('drop', handleDrop);
    convertBtn.addEventListener('click', convertToPDF);
    clearBtn.addEventListener('click', clearAll);
    generatePreviewBtn.addEventListener('click', generatePreview);
    
    // Option change listeners
    pageSizeSelect.addEventListener('change', toggleCustomSize);
    marginSize.addEventListener('change', toggleCustomMargin);
    
    // Initialize UI
    toggleCustomSize();
    toggleCustomMargin();
    
    // Functions
    function handleFileSelect(e) {
        const files = e.target.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    function handleDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.backgroundColor = 'rgba(74, 107, 255, 0.1)';
    }
    
    function handleDrop(e) {
        e.preventDefault();
        e.stopPropagation();
        dropZone.style.backgroundColor = 'white';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }
    
    function processFiles(files) {
        const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'));
        
        if (imageFiles.length === 0) {
            alert('Please select image files only (JPEG, PNG, etc.)');
            return;
        }
        
        uploadedFiles = [...uploadedFiles, ...imageFiles];
        updateFileInfo();
        convertBtn.disabled = false;
        generatePreview();
    }
    
    function updateFileInfo() {
        if (uploadedFiles.length === 0) {
            fileInfo.textContent = 'No files selected';
            return;
        }
        
        const fileNames = uploadedFiles.map(file => file.name).join(', ');
        fileInfo.textContent = `${uploadedFiles.length} file(s) selected: ${fileNames}`;
    }
    
    function toggleCustomSize() {
        if (pageSizeSelect.value === 'custom') {
            customSizeGroup.classList.remove('hidden');
        } else {
            customSizeGroup.classList.add('hidden');
        }
    }
    
    function toggleCustomMargin() {
        if (marginSize.value === 'custom') {
            customMarginGroup.classList.remove('hidden');
        } else {
            customMarginGroup.classList.add('hidden');
        }
    }
    
    function getPageSize() {
        const size = pageSizeSelect.value;
        
        switch(size) {
            case 'a4': return { width: 210, height: 297 };
            case 'letter': return { width: 215.9, height: 279.4 };
            case 'legal': return { width: 215.9, height: 355.6 };
            case 'a5': return { width: 148, height: 210 };
            case 'custom': return { 
                width: parseFloat(customWidth.value) || 210, 
                height: parseFloat(customHeight.value) || 297 
            };
            default: return { width: 210, height: 297 };
        }
    }
    
    function getMarginSize() {
        const size = marginSize.value;
        
       switch(size) {
    case 'small': return 5;
    case 'medium': return 10;
    case 'large': return 20;
    case 'custom': return parseFloat(customMargin.value) || 5;
    default: return 0;  // 'none' ko default banaya
}

    }
    
    function generatePreview() {
        if (uploadedFiles.length === 0) {
            previewContainer.innerHTML = '<p>Your PDF preview will appear here after adding images</p>';
            return;
        }
        
        previewContainer.innerHTML = '';
        
        // Show first few images as preview
        const previewCount = Math.min(uploadedFiles.length, 6);
        
        for (let i = 0; i < previewCount; i++) {
            const file = uploadedFiles[i];
            const reader = new FileReader();
            
            reader.onload = function(e) {
                const img = document.createElement('img');
                img.src = e.target.result;
                img.className = 'preview-image';
                img.alt = `Preview ${i + 1}`;
                img.title = file.name;
                previewContainer.appendChild(img);
            };
            
            reader.readAsDataURL(file);
        }
        
        if (uploadedFiles.length > previewCount) {
            const moreText = document.createElement('p');
            moreText.textContent = `+ ${uploadedFiles.length - previewCount} more images...`;
            moreText.style.width = '100%';
            moreText.style.textAlign = 'center';
            previewContainer.appendChild(moreText);
        }
    }
    
    function clearAll() {
        uploadedFiles = [];
        fileInput.value = '';
        updateFileInfo();
        convertBtn.disabled = true;
        previewContainer.innerHTML = '<p>Your PDF preview will appear here after adding images</p>';
    }
    
    async function convertToPDF() {
        if (uploadedFiles.length === 0) {
            alert('Please select at least one image file');
            return;
        }
        
        convertBtn.disabled = true;
        convertBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
        
        try {
            // Get settings
            const pageSize = getPageSize();
            const margin = getMarginSize();
            const orientation = pageOrientation.value;
            const layout = pageLayout.value;
            const border = borderStyle.value;
            const color = borderColor.value;
            const fit = imageFit.value;
            const compress = compression.value;
            const pdfName = outputName.value || 'output.pdf';
            
            // Create PDF
            const pdf = new jsPDF({
                orientation: orientation === 'landscape' ? 'landscape' : 'portrait',
                unit: 'mm',
                format: [pageSize.width, pageSize.height]
            });
            
            // Process each image
            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                const imgData = await readFileAsDataURL(file);
                
                // Add new page for each image (except first)
                if (i > 0 && layout === 'single') {
                    pdf.addPage([pageSize.width, pageSize.height], orientation === 'landscape' ? 'landscape' : 'portrait');
                }
                
                // Calculate dimensions based on layout
                let imgWidth, imgHeight, x, y;
                
                // For simplicity, this example implements single image per page layout
                // Advanced layouts would require more complex calculations
                
                if (fit === 'fill') {
                    imgWidth = pageSize.width - (margin * 2);
                    imgHeight = pageSize.height - (margin * 2);
                    x = margin;
                    y = margin;
                } else if (fit === 'fit') {
                    // Calculate to fit maintaining aspect ratio
                    const img = await loadImage(imgData);
                    const aspectRatio = img.width / img.height;
                    
                    let maxWidth = pageSize.width - (margin * 2);
                    let maxHeight = pageSize.height - (margin * 2);
                    
                    if (maxWidth / maxHeight > aspectRatio) {
                        imgHeight = maxHeight;
                        imgWidth = imgHeight * aspectRatio;
                    } else {
                        imgWidth = maxWidth;
                        imgHeight = imgWidth / aspectRatio;
                    }
                    
                    x = margin + (maxWidth - imgWidth) / 2;
                    y = margin + (maxHeight - imgHeight) / 2;
                } else if (fit === 'stretch') {
                    imgWidth = pageSize.width - (margin * 2);
                    imgHeight = pageSize.height - (margin * 2);
                    x = margin;
                    y = margin;
                } else { // original
                    const img = await loadImage(imgData);
                    // Convert pixels to mm (assuming 96dpi)
                    imgWidth = (img.width * 25.4) / 96;
                    imgHeight = (img.height * 25.4) / 96;
                    
                    // Center on page
                    x = (pageSize.width - imgWidth) / 2;
                    y = (pageSize.height - imgHeight) / 2;
                }
                
                // Add border if selected
                if (border !== 'none') {
                    pdf.setDrawColor(color);
                    
                    if (border === 'dashed') {
                        pdf.setLineDashPattern([3, 3]);
                    } else if (border === 'dotted') {
                        pdf.setLineDashPattern([1, 2]);
                    } else {
                        pdf.setLineDashPattern([]);
                    }
                    
                    // Add shadow effect
                    if (border === 'shadow') {
                        pdf.setFillColor(200, 200, 200);
                        pdf.rect(x + 2, y + 2, imgWidth, imgHeight, 'F');
                    }
                    
                    pdf.rect(x, y, imgWidth, imgHeight);
                    pdf.setLineDashPattern([]);
                }
                
                // Add image to PDF
                pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
                
                // Add new page for grid layouts if needed
                // (This is simplified - actual implementation would need to handle multiple images per page)
            }
            
            // Save PDF
            pdf.save(pdfName);
            
        } catch (error) {
            console.error('Error creating PDF:', error);
            alert('An error occurred while creating the PDF. Please try again.');
        } finally {
            convertBtn.disabled = false;
            convertBtn.innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
        }
    }
    
    function readFileAsDataURL(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }
    
    function loadImage(src) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.onload = () => resolve(img);
            img.onerror = reject;
            img.src = src;
        });
    }
});