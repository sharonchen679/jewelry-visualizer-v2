// Jewelry Visualizer Main Script
// Using CSS mm units for accurate sizing

class JewelryVisualizer {
    constructor() {
        this.calibrationRatio = this.loadCalibrationRatio();
        this.isAdminMode = false;
        this.centerStones = [];
        this.sideStones = [];
        this.longSideStones = [];
        this.selectedCenterStone = null;
        this.selectedCenterStoneSize = null;
        this.selectedSideStone = null;
        this.loadingCenterStones = false;
        this.loadingLongSideStones = false;
        
        // Stone type selection
        this.allStoneData = {}; // Store all loaded stone types
        this.selectedStoneType = null; // 'diamonds' or 'gems'
        this.selectedGemType = null; // 'emerald', 'sapphire', 'ruby'
        
        // Initialize admin module
        this.admin = new JewelryVisualizerAdmin(this);
        
        this.init();
    }

    async init() {
        try {
            this.setupCalibration();
            this.admin.setupPasswordSystem();
            await this.loadStoneData();
            this.renderStoneTypeSelection();
            this.setupEventListeners();
        } catch (error) {
            this.showError('Failed to initialize visualizer: ' + error.message);
        }
    }

    // Calibration System
    setupCalibration() {
        this.updateCalibrationDisplay();
        
        const toggle = document.getElementById('calibration-toggle');
        const panel = document.getElementById('calibration-panel');
        const resetBtn = document.getElementById('reset-calibration');
        const precisionBtns = document.querySelectorAll('.precision-btn');

        toggle.addEventListener('click', () => {
            panel.classList.toggle('collapsed');
        });

        resetBtn.addEventListener('click', () => {
            this.resetCalibration();
        });

        // Precision adjustment buttons (only up/down as specified)
        precisionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const direction = btn.dataset.direction;
                this.adjustCalibrationPrecision(direction);
            });
        });

        // Drag functionality for credit card
        this.setupCreditCardDrag();
        
        // Setup click-outside-to-close for calibration panel
        this.setupCalibrationClickOutside();
    }

    setupCreditCardDrag() {
        const creditCard = document.getElementById('credit-card');
        let isDragging = false;
        let startY = 0;
        let startHeight = 0;

        creditCard.addEventListener('mousedown', (e) => {
            isDragging = true;
            startY = e.clientY;
            startHeight = parseFloat(getComputedStyle(creditCard).height);
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaY = e.clientY - startY;
            const newHeight = startHeight + deltaY;
            
            // Calculate new ratio based on height change
            const defaultHeight = 53.98; // mm
            const newRatio = newHeight / (defaultHeight * 3.7795275591); // Convert mm to pixels approximation
            
            // Constrain ratio within reasonable bounds
            const constrainedRatio = Math.max(0.5, Math.min(3.0, newRatio));
            
            this.setCalibrationRatio(constrainedRatio);
        });

        document.addEventListener('mouseup', () => {
            if (isDragging) {
                isDragging = false;
                this.saveCalibrationRatio();
            }
        });
    }

    adjustCalibrationPrecision(direction) {
        const step = CONFIG.precisionStep / 53.98; // Convert 0.1mm to ratio step
        let newRatio = this.calibrationRatio;

        if (direction === 'up') {
            newRatio += step;
        } else if (direction === 'down') {
            newRatio -= step;
        }

        // Constrain ratio
        newRatio = Math.max(0.5, Math.min(3.0, newRatio));
        
        this.setCalibrationRatio(newRatio);
        this.saveCalibrationRatio();
    }

    setCalibrationRatio(ratio) {
        this.calibrationRatio = ratio;
        document.documentElement.style.setProperty('--calibration-ratio', ratio);
        this.updateCalibrationDisplay();
        this.updateStoneSizes();
    }

    updateCalibrationDisplay() {
        const ratioDisplay = document.getElementById('calibration-ratio');
        if (ratioDisplay) {
            ratioDisplay.textContent = this.calibrationRatio.toFixed(6);
        }
    }

    resetCalibration() {
        this.setCalibrationRatio(CONFIG.sizing.defaultCalibrationRatio);
        this.saveCalibrationRatio();
    }

    loadCalibrationRatio() {
        const saved = localStorage.getItem(CONFIG.sizing.calibrationStorageKey);
        return saved ? parseFloat(saved) : CONFIG.sizing.defaultCalibrationRatio;
    }

    saveCalibrationRatio() {
        localStorage.setItem(CONFIG.sizing.calibrationStorageKey, this.calibrationRatio.toString());
    }

    // Stone Data Loading
    async loadStoneData() {
        try {
            await Promise.all([
                this.loadCenterStones(),
                this.loadSideStones(),
                this.loadLongSideStones()
            ]);
        } catch (error) {
            throw new Error('Failed to load stone data: ' + error.message);
        }
    }

    async loadCenterStones() {
        // Load all stone types using CONFIG.stoneTypes
        const loadPromises = Object.keys(CONFIG.stoneTypes).map(async (stoneType) => {
            const config = CONFIG.stoneTypes[stoneType];
            const response = await fetch(CONFIG.assets.info + config.infoFile);
            const text = await response.text();
            
            this.loadingCenterStones = true;
            const stones = this.parseStoneData(text);
            this.loadingCenterStones = false;
            
            // Set correct image paths dynamically using config
            stones.forEach(stone => {
                stone.imagePath = CONFIG.assets[stoneType] + stone.imagePath;
            });
            
            this.allStoneData[stoneType] = stones;
        });
        
        await Promise.all(loadPromises);
    }

    async loadSideStones() {
        const response = await fetch(CONFIG.assets.info + CONFIG.infoFiles.sideStones);
        const text = await response.text();
        
        this.loadingSideStones = true; // Flag to indicate we're loading side stones
        this.sideStones = this.parseStoneData(text);
        this.loadingSideStones = false;
        
        // Set the correct image paths for side stones
        this.sideStones.forEach(stone => {
            stone.imagePath = CONFIG.assets.sideStones + stone.imagePath;
        });
    }

    async loadLongSideStones() {
        const response = await fetch(CONFIG.assets.info + CONFIG.infoFiles.longSideStones);
        const text = await response.text();
        
        this.loadingLongSideStones = true; // Flag to indicate we're loading long side stones
        this.longSideStones = this.parseStoneData(text);
        this.loadingLongSideStones = false;
        
        // Set the correct image paths for long side stones
        this.longSideStones.forEach(stone => {
            stone.imagePath = CONFIG.assets.longSideStones + stone.imagePath;
        });
    }

    parseStoneData(text) {
        const lines = text.split('\n').filter(line => line.trim());
        const stones = [];

        lines.forEach((line, index) => {
            const [title, data] = line.split(':').map(s => s.trim());
            if (!title || !data) return;

            const [dimension, sizesStr] = data.split('|').map(s => s.trim());
            const sizes = sizesStr.split(',').map(s => parseFloat(s.trim()));

            // Calculate aspect ratio consistently as width/height
            const firstSize = sizes[0];
            let aspectRatio;
            
            // Determine format based on loading type:
            // Format is always: "title: short-side | long-side, long-side1, long-side2, .."
            // - Center stones: short-side=width, long-side=height, so aspectRatio = width/height
            // - Long side stones: short-side=width, long-side=height, so aspectRatio = width/height (same as center stones)
            // - Regular side stones: short-side=height, long-side=width, so aspectRatio = width/height
            if (this.loadingCenterStones || this.loadingLongSideStones) {
                // Center stones and long side stones: dimension is width, firstSize is height
                aspectRatio = parseFloat(dimension) / firstSize; // width/height
            } else {
                // Regular side stones: dimension is height, firstSize is width
                aspectRatio = firstSize / parseFloat(dimension); // width/height
            }

            // Skip the first pair of dimensions for display purposes (internal use only)
            const displaySizes = sizes.slice(1);

            const extension = this.loadingSideStones || this.loadingLongSideStones ? '.gif' : '.png';

            stones.push({
                title,
                baseDimension: parseFloat(dimension), // width for center/long side stones, height for regular side stones
                sizes: displaySizes, // Use sizes without the first pair
                aspectRatio, // Always width/height ratio for consistency
                imagePath: this.generateImagePath(title, extension),
                isLongSideStone: this.loadingLongSideStones // Flag to distinguish long side stones
            });
        });

        return stones;
    }

    generateImagePath(title, extension) {
        // Simple: generate image path based on stone title (preserve original capitalization)
        return title.split(' ').join('-') + extension;
    }

    // UI Rendering
    renderStoneTypeSelection() {
        const container = document.getElementById('stone-type-options');
        container.innerHTML = '';

        const stoneTypes = [
            { key: 'diamonds', name: 'Diamonds', image: 'Diamonds.png' },
            { key: 'gems', name: 'Gems', image: 'Gems.png' }
        ];

        stoneTypes.forEach(stoneType => {
            const wrapper = document.createElement('div');
            wrapper.className = 'stone-wrapper';

            const title = document.createElement('div');
            title.className = 'stone-title';
            title.textContent = stoneType.name;

            const option = document.createElement('div');
            option.className = 'stone-option';
            option.dataset.stoneType = stoneType.key;
            option.style.backgroundImage = `url('${CONFIG.assets.typeSelection}${stoneType.image}')`;
            option.title = stoneType.name;

            option.addEventListener('click', () => {
                this.selectStoneType(stoneType.key);
            });

            wrapper.appendChild(title);
            wrapper.appendChild(option);
            container.appendChild(wrapper);
        });
    }

    selectStoneType(stoneType) {
        // Update UI selection
        document.querySelectorAll('#stone-type-options .stone-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-stone-type="${stoneType}"]`).classList.add('selected');

        this.selectedStoneType = stoneType;

        // Always hide the sizes section when stone type changes
        document.getElementById('center-stone-sizes').style.display = 'none';


        if (stoneType === 'diamonds') {
            // Hide gem selection if it was visible
            document.getElementById('gem-type-section').style.display = 'none';
            this.selectedGemType = null;
            this.populateCenterStones();
            this.showCenterStoneSection();
        } else if (stoneType === 'gems') {
            // Hide center stone section for gems (comes later after gem type selection)
            document.getElementById('center-stone-section').style.display = 'none';
            this.renderGemTypeSelection();
        }
    }

    renderGemTypeSelection() {
        const section = document.getElementById('gem-type-section');
        section.style.display = 'block';
        
        const container = document.getElementById('gem-type-options');
        container.innerHTML = '';

        const gemTypes = ['emerald', 'sapphire', 'ruby'];

        gemTypes.forEach(gemType => {
            const config = CONFIG.stoneTypes[gemType];
            const wrapper = document.createElement('div');
            wrapper.className = 'stone-wrapper';

            const title = document.createElement('div');
            title.className = 'stone-title';
            title.textContent = config.name;

            const option = document.createElement('div');
            option.className = 'stone-option';
            option.dataset.gemType = gemType;
            option.style.backgroundImage = `url('${CONFIG.assets.typeSelection}${config.name}.png')`;
            option.title = config.name;

            option.addEventListener('click', () => {
                this.selectGemType(gemType);
            });

            wrapper.appendChild(title);
            wrapper.appendChild(option);
            container.appendChild(wrapper);
        });
    }

    selectGemType(gemType) {
        // Update UI selection
        document.querySelectorAll('#gem-type-options .stone-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-gem-type="${gemType}"]`).classList.add('selected');

        this.selectedGemType = gemType;
        
        // Hide the sizes section when gem type is chosen
        document.getElementById('center-stone-sizes').style.display = 'none';
        
        this.populateCenterStones();
        this.showCenterStoneSection();
    }

    populateCenterStones() {
        // Populate centerStones based on selection
        if (this.selectedStoneType === 'diamonds') {
            this.centerStones = this.allStoneData.diamonds || [];
        } else if (this.selectedStoneType === 'gems' && this.selectedGemType) {
            this.centerStones = this.allStoneData[this.selectedGemType] || [];
        }
    }

    showCenterStoneSection() {
        // Show center stone section and render stones
        document.getElementById('center-stone-section').style.display = 'block';
        this.renderCenterStones();
    }

    renderCenterStones() {
        const container = document.getElementById('center-stone-options');
        container.innerHTML = '';

        this.centerStones.forEach((stone, index) => {
            // Create wrapper for stone option with title
            const stoneWrapper = document.createElement('div');
            stoneWrapper.className = 'stone-wrapper';

            // Add stone title
            const titleElement = document.createElement('div');
            titleElement.className = 'stone-title';
            titleElement.textContent = stone.title;

            // Create stone option
            const option = document.createElement('div');
            option.className = 'stone-option';
            option.dataset.centerIndex = index; // Use unique attribute for center stones
            option.style.backgroundImage = `url('${stone.imagePath}')`;
            option.title = stone.title;

            option.addEventListener('click', () => {
                this.selectCenterStone(index);
            });

            stoneWrapper.appendChild(titleElement);
            stoneWrapper.appendChild(option);
            container.appendChild(stoneWrapper);
        });
    }

    selectCenterStone(index) {
        // Update UI selection
        document.querySelectorAll('.stone-option').forEach(opt => opt.classList.remove('selected'));
        document.querySelector(`[data-center-index="${index}"]`).classList.add('selected');

        this.selectedCenterStone = this.centerStones[index];
        this.renderCenterStoneSizes();
    }

    renderCenterStoneSizes() {
        const container = document.getElementById('center-stone-sizes');
        container.innerHTML = '';

        if (!this.selectedCenterStone) return;

        // Add "Available Sizes:" title
        const sizesTitle = document.createElement('h3');
        sizesTitle.textContent = 'Available Sizes:';
        sizesTitle.className = 'sizes-title';
        container.appendChild(sizesTitle);

        const sizeGrid = document.createElement('div');
        sizeGrid.className = 'size-grid';

        this.selectedCenterStone.sizes.forEach(size => {
            const sizeItem = document.createElement('div');
            sizeItem.className = 'size-item';
            sizeItem.dataset.size = size;

            const img = document.createElement('img');
            img.src = this.selectedCenterStone.imagePath;
            img.alt = `${size}mm`;
            
            // CENTER STONES: Calculate proportional dimensions
            // Format: "width | height1, height2, ..." 
            // size = height, calculate proportional width = height * aspectRatio
            const height = size; // This is the height from sizes array
            const width = height * this.selectedCenterStone.aspectRatio; // Calculate proportional width
            
            // Use CSS mm units with calibration
            img.style.width = `calc(${width}mm * var(--calibration-ratio))`;
            img.style.height = `calc(${height}mm * var(--calibration-ratio))`;

            const label = document.createElement('div');
            label.className = 'size-label';
            label.textContent = `${size}mm`;

            sizeItem.appendChild(img);
            sizeItem.appendChild(label);
            sizeGrid.appendChild(sizeItem);

            sizeItem.addEventListener('click', () => {
                this.selectCenterStoneSize(size);
            });
        });

        container.appendChild(sizeGrid);
        container.style.display = 'block';
    }

    selectCenterStoneSize(size) {
        // Update UI selection
        document.querySelectorAll('.size-item').forEach(item => item.classList.remove('selected'));
        document.querySelector(`[data-size="${size}"]`).classList.add('selected');

        this.selectedCenterStoneSize = size;
        this.renderDisplaySection();
    }

    renderDisplaySection() {
        const container = document.querySelector('.jewelry-visualizer');
        if (!container) return;

        // Clear existing content
        container.innerHTML = '';

        // Create side stone selection section
        const sideStoneSection = document.createElement('div');
        sideStoneSection.className = 'side-stone-section';
        
        const sideStoneTitle = document.createElement('h3');
        sideStoneTitle.textContent = 'Select Side Stones';
        sideStoneSection.appendChild(sideStoneTitle);
        
        const sideStoneOptions = document.createElement('div');
        sideStoneOptions.className = 'side-stone-options';
        sideStoneSection.appendChild(sideStoneOptions);
        
        // Render side stone options
        this.renderSideStoneOptions(sideStoneOptions);
        
        // Create main display area
        const displayArea = document.createElement('div');
        displayArea.className = 'display-area';
        
        // Create slider section (left side)
        const sliderSection = document.createElement('div');
        sliderSection.className = 'slider-section';
        this.renderSlider(sliderSection);
        displayArea.appendChild(sliderSection);
        
        container.appendChild(sideStoneSection);
        container.appendChild(displayArea);
        container.classList.add('visible');
        
        // Create floating footer for large display
        this.createFloatingFooter();
        
        // Update info section with initial data
        this.updateInfoSection();
    }

    createFloatingFooter() {
        // Remove existing footer if it exists
        const existingFooter = document.getElementById('floating-footer');
        if (existingFooter) {
            existingFooter.remove();
        }

        // Create floating footer
        const footer = document.createElement('div');
        footer.id = 'floating-footer';
        footer.className = 'floating-footer';
        
        // Create footer content container
        const footerContent = document.createElement('div');
        footerContent.className = 'footer-content';
        
        // Create info section in footer (left side)
        const footerInfoSection = document.createElement('div');
        footerInfoSection.className = 'footer-info-section';
        
        const footerDetailsSection = document.createElement('div');
        footerDetailsSection.className = 'footer-details-section';
        
        const footerDetailsTitle = document.createElement('h4');
        footerDetailsTitle.textContent = 'Current Selection';
        footerDetailsSection.appendChild(footerDetailsTitle);
        
        const footerDetailsList = document.createElement('div');
        footerDetailsList.className = 'footer-details-list';
        
        // Center stone details
        const footerCenterDetails = document.createElement('div');
        footerCenterDetails.className = 'footer-detail-item';
        footerCenterDetails.innerHTML = `
            <strong>Center Stone:</strong> ${this.selectedCenterStone.title} (${this.selectedCenterStoneSize}mm)
        `;
        footerDetailsList.appendChild(footerCenterDetails);
        
        // Side stone details (will be updated when side stone is selected)
        const footerSideDetails = document.createElement('div');
        footerSideDetails.className = 'footer-detail-item';
        footerSideDetails.id = 'footer-side-stone-details';
        footerSideDetails.innerHTML = `
            <strong>Side Stones:</strong> <span id="footer-side-stone-info">${this.selectedSideStone ? `${this.selectedSideStone.title} (${this.selectedSideStone.sizes[0]}mm)` : 'Select a side stone'}</span>
        `;
        footerDetailsList.appendChild(footerSideDetails);
        
        footerDetailsSection.appendChild(footerDetailsList);
        footerInfoSection.appendChild(footerDetailsSection);
        
        // Create large display section (center)
        const footerDisplaySection = document.createElement('div');
        footerDisplaySection.className = 'footer-display-section';
        
        const footerDisplayTitle = document.createElement('h4');
        footerDisplayTitle.textContent = 'Current Match';
        footerDisplaySection.appendChild(footerDisplayTitle);
        
        const largeDisplay = document.createElement('div');
        largeDisplay.className = 'large-display';
        largeDisplay.id = 'large-display';
        
        footerDisplaySection.appendChild(largeDisplay);
        
        // Assemble footer
        footerContent.appendChild(footerInfoSection);
        footerContent.appendChild(footerDisplaySection);
        footer.appendChild(footerContent);
        
        // Add footer to body
        document.body.appendChild(footer);
    }

    updateInfoSection() {
        // Update side stone details in footer
        const footerSideStoneInfo = document.getElementById('footer-side-stone-info');
        if (footerSideStoneInfo && this.selectedSideStone) {
            // Get the selected size based on center stone position
            const selectedSize = this.getSelectedSideStoneSize();
            if (selectedSize) {
                footerSideStoneInfo.textContent = `${this.selectedSideStone.title} (${selectedSize}mm)`;
            } else {
                footerSideStoneInfo.textContent = `${this.selectedSideStone.title} (select size)`;
            }
        }
        
        // Update large display
        this.updateLargeDisplay();
    }

    getSelectedSideStoneSize() {
        if (!this.selectedSideStone || !this.selectedCenterStoneSize) return null;
        
        // Find the dot that the center stone is closest to
        const centerStone = document.querySelector('.center-stone-slider');
        if (!centerStone) return null;
        
        const dots = document.querySelectorAll('.slider-dot');
        let nearestDot = null;
        let minDistance = Infinity;
        
        const stoneRect = centerStone.getBoundingClientRect();
        const stoneCenterX = stoneRect.left + stoneRect.width / 2;
        
        dots.forEach(dot => {
            const dotRect = dot.getBoundingClientRect();
            const dotCenterX = dotRect.left + dotRect.width / 2;
            const distance = Math.abs(dotCenterX - stoneCenterX);
            
            if (distance < minDistance) {
                minDistance = distance;
                nearestDot = dot;
            }
        });
        
        if (nearestDot && minDistance < 40) { // Same threshold as snapping
            return nearestDot.dataset.size;
        }
        
        return null;
    }

    updateLargeDisplay() {
        const largeDisplay = document.getElementById('large-display');
        if (!largeDisplay) return;
        
        largeDisplay.innerHTML = '';
        
        if (!this.selectedSideStone) {
            return; // Don't show anything if no side stone is selected
        }
        
        // Create large display of current match
        const matchDisplay = document.createElement('div');
        matchDisplay.className = 'match-display';
        
        // Calculate dimensions
        const centerStoneHeight = this.selectedCenterStoneSize;
        const centerStoneWidth = centerStoneHeight * this.selectedCenterStone.aspectRatio;
        
        // Get selected side stone size
        const selectedSideStoneSize = this.getSelectedSideStoneSize() || this.selectedSideStone.sizes[0];
        
        // Calculate side stone dimensions
        let sideStoneWidth, sideStoneHeight;
        
        if (this.selectedSideStone.isLongSideStone) {
            // For long side stones: size represents height, calculate width
            sideStoneHeight = selectedSideStoneSize;
            sideStoneWidth = sideStoneHeight * this.selectedSideStone.aspectRatio;
        } else {
            // For regular side stones: size represents width, calculate height
            sideStoneWidth = selectedSideStoneSize;
            sideStoneHeight = sideStoneWidth / this.selectedSideStone.aspectRatio;
        }
        
        // Create center stone
        const centerStone = document.createElement('img');
        centerStone.src = this.selectedCenterStone.imagePath;
        centerStone.className = 'large-center-stone';
        centerStone.alt = `${this.selectedCenterStoneSize}mm`;
        centerStone.style.width = `calc(${centerStoneWidth * 4}mm * var(--calibration-ratio))`;
        centerStone.style.height = `calc(${centerStoneHeight * 4}mm * var(--calibration-ratio))`;
        
        // Create side stone containers (same approach as slider)
        const leftStoneContainer = document.createElement('div');
        leftStoneContainer.className = 'large-side-stone-container left';
        
        const rightStoneContainer = document.createElement('div');
        rightStoneContainer.className = 'large-side-stone-container right';
        
        // Create side stones
        const leftStone = document.createElement('img');
        leftStone.src = this.selectedSideStone.imagePath;
        leftStone.className = 'large-side-stone';
        leftStone.alt = `${selectedSideStoneSize}mm`;
        leftStone.style.width = `calc(${sideStoneWidth * 4}mm * var(--calibration-ratio))`;
        leftStone.style.height = `calc(${sideStoneHeight * 4}mm * var(--calibration-ratio))`;
        
        const rightStone = document.createElement('img');
        rightStone.src = this.selectedSideStone.imagePath;
        rightStone.className = 'large-side-stone';
        rightStone.alt = `${selectedSideStoneSize}mm`;
        rightStone.style.width = `calc(${sideStoneWidth * 4}mm * var(--calibration-ratio))`;
        rightStone.style.height = `calc(${sideStoneHeight * 4}mm * var(--calibration-ratio))`;
        
        // Set container dimensions (same as slider)
        const imageDisplayHeight = `calc(${sideStoneHeight * 4}mm * var(--calibration-ratio))`;
        const imageDisplayWidth = `calc(${sideStoneWidth * 4}mm * var(--calibration-ratio))`;
        
        leftStoneContainer.style.width = rightStoneContainer.style.width = imageDisplayHeight;
        leftStoneContainer.style.height = rightStoneContainer.style.height = imageDisplayWidth;
        
        // Apply rotations
        leftStone.classList.add('rotate-left');
        rightStone.classList.add('rotate-right');
        
        // Position containers (same as slider)
        const gapDistance = `calc(${centerStoneWidth * 4}mm * var(--calibration-ratio) / 2)`;
        leftStoneContainer.style.right = `calc(50% + ${gapDistance})`;
        rightStoneContainer.style.left = `calc(50% + ${gapDistance})`;
        
        // Assemble the structure
        leftStoneContainer.appendChild(leftStone);
        rightStoneContainer.appendChild(rightStone);
        
        matchDisplay.appendChild(leftStoneContainer);
        matchDisplay.appendChild(centerStone);
        matchDisplay.appendChild(rightStoneContainer);
        
        largeDisplay.appendChild(matchDisplay);
    }

    renderSideStoneOptions(container) {
        // Combine regular side stones and long side stones
        const allSideStones = [...this.sideStones, ...this.longSideStones];
        
        allSideStones.forEach((sideStone, index) => {
            const stoneWrapper = document.createElement('div');
            stoneWrapper.className = 'side-stone-wrapper';
            stoneWrapper.dataset.sideIndex = index; // Use unique attribute for side stones
            
            // Set default selection to first stone
            if (index === 0) {
                stoneWrapper.classList.add('selected');
                this.selectedSideStone = sideStone;
            }
            
            const stoneOption = document.createElement('div');
            stoneOption.className = 'side-stone-option';
            
            // Create pair of stones with small gap
            const stonePair = document.createElement('div');
            stonePair.className = 'stone-pair';
            
            const leftStone = document.createElement('img');
            leftStone.src = sideStone.imagePath;
            leftStone.alt = sideStone.title;
            
            const rightStone = document.createElement('img');
            rightStone.src = sideStone.imagePath;
            rightStone.alt = sideStone.title;
            
            stonePair.appendChild(leftStone);
            stonePair.appendChild(rightStone);
            stoneOption.appendChild(stonePair);
            
            const stoneTitle = document.createElement('div');
            stoneTitle.className = 'side-stone-title';
            stoneTitle.textContent = sideStone.title;
            
            stoneWrapper.appendChild(stoneTitle);
            stoneWrapper.appendChild(stoneOption);
            
            // Add click handler
            stoneWrapper.addEventListener('click', () => {
                this.selectSideStone(index);
            });
            
            container.appendChild(stoneWrapper);
        });
    }

    selectSideStone(index) {
        // Update UI selection
        document.querySelectorAll('.side-stone-wrapper').forEach(wrapper => wrapper.classList.remove('selected'));
        document.querySelector(`[data-side-index="${index}"]`).classList.add('selected');
        
        // Get the selected stone from the combined array
        const allSideStones = [...this.sideStones, ...this.longSideStones];
        this.selectedSideStone = allSideStones[index];
        
        this.updateSlider();
        this.updateInfoSection();
        
        // Recreate footer with updated info
        this.createFloatingFooter();
    }

    renderSlider(container) {
        if (!this.selectedSideStone) return;
        
        const sliderTitle = document.createElement('h4');
        sliderTitle.textContent = this.selectedSideStone.title;
        container.appendChild(sliderTitle);

        const sliderContainer = document.createElement('div');
        sliderContainer.className = 'slider-container';

        const sliderTrack = document.createElement('div');
        sliderTrack.className = 'slider-track';

        // Calculate center stone dimensions
        const centerStoneHeight = this.selectedCenterStoneSize;
        const centerStoneWidth = centerStoneHeight * this.selectedCenterStone.aspectRatio;
        
        // Calculate optimal spacing between dots
        const titleWidth = 50; // Width for size labels
        const minSpacing = 40; // Minimum spacing between dots (increased for comfort)
        let currentPosition = titleWidth + 20; // Start position

        // Create dots for each side stone size
        this.selectedSideStone.sizes.forEach((size, sizeIndex) => {
            const dot = document.createElement('div');
            dot.className = 'slider-dot';
            dot.dataset.size = size;

            // Calculate side stone dimensions
            let sideStoneWidth, sideStoneHeight;
            
            if (this.selectedSideStone.isLongSideStone) {
                // For long side stones: size represents height, calculate width
                sideStoneHeight = size;
                sideStoneWidth = sideStoneHeight * this.selectedSideStone.aspectRatio;
            } else {
                // For regular side stones: size represents width, calculate height
                sideStoneWidth = size;
                sideStoneHeight = sideStoneWidth / this.selectedSideStone.aspectRatio;
            }
                
            // Position dot horizontally
            dot.style.left = `${currentPosition}px`;

            // Create size title above the dot
            const sizeTitle = document.createElement('div');
            sizeTitle.className = 'side-stone-size-title';
            sizeTitle.textContent = `${size}mm`;
            sizeTitle.style.left = `${currentPosition - titleWidth/2}px`;
            sliderTrack.appendChild(sizeTitle);

            // Create side stone images on both sides
            const leftStoneContainer = document.createElement('div');
            leftStoneContainer.className = 'side-stone-container left';
            
            const rightStoneContainer = document.createElement('div');
            rightStoneContainer.className = 'side-stone-container right';

            const leftStone = document.createElement('img');
            leftStone.src = this.selectedSideStone.imagePath;
            leftStone.className = 'side-stone';
            leftStone.alt = `${size}mm`;

            const rightStone = document.createElement('img');
            rightStone.src = this.selectedSideStone.imagePath;
            rightStone.className = 'side-stone';
            rightStone.alt = `${size}mm`;

            const imageDisplayHeight = `calc(${sideStoneHeight}mm * var(--calibration-ratio))`;
            const imageDisplayWidth = `calc(${sideStoneWidth}mm * var(--calibration-ratio))`;
                
            leftStone.style.width = rightStone.style.width = imageDisplayWidth;
            leftStone.style.height = rightStone.style.height = imageDisplayHeight;
            
            leftStoneContainer.style.width = rightStoneContainer.style.width = imageDisplayHeight;
            leftStoneContainer.style.height = rightStoneContainer.style.height = imageDisplayWidth;
            
            leftStone.classList.add('rotate-left');
            rightStone.classList.add('rotate-right');
            
            // Position side stone containers - gap = center stone width / 2 (for equal spacing)
            const gapDistance = `calc(${centerStoneWidth}mm * var(--calibration-ratio) / 2)`;
            leftStoneContainer.style.right = `calc(50% + ${gapDistance})`;
            rightStoneContainer.style.left = `calc(50% + ${gapDistance})`;

            leftStoneContainer.appendChild(leftStone);
            rightStoneContainer.appendChild(rightStone);

            dot.appendChild(leftStoneContainer);
            dot.appendChild(rightStoneContainer);
            sliderTrack.appendChild(dot);
            
            // Calculate next position - use the larger of the two stones for spacing
            const nextSize = this.selectedSideStone.sizes[sizeIndex + 1];
            if (nextSize) {
                let nextStoneWidth;
                if (this.selectedSideStone.isLongSideStone) {
                    // For long side stones: nextSize represents height, calculate width
                    nextStoneWidth = nextSize * this.selectedSideStone.aspectRatio;
                } else {
                    // For regular side stones: nextSize represents width
                    nextStoneWidth = nextSize;
                }
                
                const currentStoneWidth = sideStoneWidth;
                const maxStoneWidth = Math.max(currentStoneWidth, nextStoneWidth);
                
                // Convert mm to pixels for spacing calculation
                const mmToPixelRatio = this.calibrationRatio * 3.7795275591; // Approximate mm to pixels
                const stoneWidthPx = maxStoneWidth * mmToPixelRatio;
                
                // Position for next dot: current position + half current stone + half next stone + minimum spacing
                currentPosition += (stoneWidthPx / 2) + (stoneWidthPx / 2) + minSpacing;
            }
        });
        
        // Set track width with some padding
        const trackWidth = currentPosition + 50;
        sliderTrack.style.width = `${trackWidth}px`;

        // Create draggable center stone
        const centerStone = document.createElement('img');
        centerStone.src = this.selectedCenterStone.imagePath;
        centerStone.className = 'center-stone-slider';
        centerStone.alt = `${this.selectedCenterStoneSize}mm`;
        
        centerStone.style.width = `calc(${centerStoneWidth}mm * var(--calibration-ratio))`;
        centerStone.style.height = `calc(${centerStoneHeight}mm * var(--calibration-ratio))`;
    
        // Add drag functionality
        this.setupCenterStoneDrag(centerStone, sliderTrack);

        // Add click functionality to dots
        this.setupDotClickHandlers(sliderTrack, centerStone);

        sliderContainer.appendChild(sliderTrack);
        sliderContainer.appendChild(centerStone);
        container.appendChild(sliderContainer);
        
        // Position center stone on first dot after rendering
        this.positionCenterStoneOnFirstDot(centerStone, sliderTrack);
    }

    positionCenterStoneOnFirstDot(centerStone, sliderTrack) {
        const titleWidth = 50;
        const firstDot = sliderTrack.querySelector('.slider-dot');
        if (firstDot) {
            const dotRect = firstDot.getBoundingClientRect();
            const trackRect = sliderTrack.getBoundingClientRect();
            
            // Get dot position relative to track
            const dotPositionInTrack = dotRect.left - trackRect.left;
            
            // Calculate target position that centers stone on dot
            const targetLeft = dotPositionInTrack - (centerStone.offsetWidth / 2) + (firstDot.offsetWidth / 2);
            
            // Ensure target position respects title area
            const constrainedTargetLeft = Math.max(titleWidth + 10, targetLeft);
            
            centerStone.style.left = `${constrainedTargetLeft}px`;
        }
    }

    updateSlider() {
        const sliderSection = document.querySelector('.slider-section');
        if (sliderSection) {
            sliderSection.innerHTML = '';
            this.renderSlider(sliderSection);
            
            // Ensure center stone is positioned on first dot after re-rendering
            setTimeout(() => {
                const centerStone = sliderSection.querySelector('.center-stone-slider');
                const sliderTrack = sliderSection.querySelector('.slider-track');
                if (centerStone && sliderTrack) {
                    this.positionCenterStoneOnFirstDot(centerStone, sliderTrack);
                }
            }, 0);
        }
    }

    setupCenterStoneDrag(centerStone, sliderTrack) {
        const titleWidth = 50; // Width needed for the title text (same as in renderDisplaySection)
        let isDragging = false;
        let startX = 0;
        let startLeft = 0;

        centerStone.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.clientX;
            startLeft = parseInt(centerStone.style.left) || (titleWidth + 20); // Start after titles
            // Use CSS class for transition state
            centerStone.classList.add('dragging');
            e.preventDefault();
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;

            const deltaX = e.clientX - startX;
            const newLeft = startLeft + deltaX;

            // Calculate constraints more precisely
            const minLeft = titleWidth + 10; // Keep center stone after titles with some buffer
            const maxLeft = sliderTrack.offsetWidth - centerStone.offsetWidth + 20;

            // Constrain movement
            const constrainedLeft = Math.max(minLeft, Math.min(maxLeft, newLeft));
            centerStone.style.left = `${constrainedLeft}px`;
        });

        document.addEventListener('mouseup', () => {
            if (!isDragging) return;
            
            isDragging = false;

            // Improved snapping - find nearest dot center
            const dots = sliderTrack.querySelectorAll('.slider-dot');
            let nearestDot = null;
            let minDistance = Infinity;

            // Get center X position of the dragged stone
            const stoneRect = centerStone.getBoundingClientRect();
            const stoneCenterX = stoneRect.left + stoneRect.width / 2;

            dots.forEach(dot => {
                const dotRect = dot.getBoundingClientRect();
                const dotCenterX = dotRect.left + dotRect.width / 2;
                const distance = Math.abs(dotCenterX - stoneCenterX);
                
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestDot = dot;
                }
            });

            if (nearestDot && minDistance < 40) { // Snapping threshold
                // Calculate precise target position
                const trackRect = sliderTrack.getBoundingClientRect();
                const dotRect = nearestDot.getBoundingClientRect();
                
                // Get dot position relative to track
                const dotPositionInTrack = dotRect.left - trackRect.left;
                
                // Calculate target position that centers stone on dot
                const targetLeft = dotPositionInTrack - (centerStone.offsetWidth / 2) + (nearestDot.offsetWidth / 2);
                
                // Ensure target position respects title area
                const constrainedTargetLeft = Math.max(titleWidth + 10, targetLeft);
                
                // Use CSS class for smooth snap animation
                centerStone.classList.remove('dragging');
                centerStone.classList.add('snapping');
                centerStone.style.left = `${constrainedTargetLeft}px`;
                
                // Remove transition class after animation
                setTimeout(() => {
                    centerStone.classList.remove('snapping');
                }, 300);
                
                // Update info section to reflect new selection
                this.updateInfoSection();
            } else {
                // No snapping, just remove dragging state
                centerStone.classList.remove('dragging');
            }
        });
    }

    updateStoneSizes() {
        // Update all stone sizes when calibration changes
        const stoneImages = document.querySelectorAll('.size-item img, .center-stone-slider, .side-stone');
        // Sizes will update automatically due to CSS calc() with --calibration-ratio
    }

    // Event Listeners
    setupEventListeners() {
        // Check for existing admin session via admin module
        this.admin.checkExistingSession();
    }

    // Error Handling
    showError(message) {
        const container = document.getElementById('error-container');
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.textContent = message;
        container.appendChild(errorDiv);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (errorDiv.parentNode) {
                errorDiv.parentNode.removeChild(errorDiv);
            }
        }, 5000);
    }

    measureTitleWidth(title) {
        // Create a temporary span element to measure text width
        const tempSpan = document.createElement('span');
        tempSpan.className = 'text-measurement'; // Use CSS class instead of inline styles
        tempSpan.textContent = title;
        
        // Add to DOM to measure
        document.body.appendChild(tempSpan);
        const widthPx = tempSpan.getBoundingClientRect().width;
        
        // Remove from DOM
        document.body.removeChild(tempSpan);
        
        // Convert pixels to millimeters
        // Using standard web DPI: 96 pixels per inch, 25.4mm per inch
        const widthMM = (widthPx * 25.4) / 96;
        
        return widthMM;
    }

    // Click-outside-to-close functionality
    setupCalibrationClickOutside() {
        this.calibrationClickOutsideHandler = (e) => {
            const panel = document.getElementById('calibration-panel');
            const toggle = document.getElementById('calibration-toggle');
            
            // Check if panel is open (not collapsed)
            if (!panel.classList.contains('collapsed')) {
                // Check if click is outside panel and toggle button
                if (!panel.contains(e.target) && !toggle.contains(e.target)) {
                    panel.classList.add('collapsed');
                }
            }
        };
        
        // Add listener with slight delay to avoid immediate triggering
        setTimeout(() => {
            document.addEventListener('click', this.calibrationClickOutsideHandler);
        }, 100);
    }

    setupDotClickHandlers(sliderTrack, centerStone) {
        const dots = sliderTrack.querySelectorAll('.slider-dot');
        const titleWidth = 50; // Width needed for the title text (same as in renderDisplaySection)
        
        dots.forEach(dot => {
            dot.addEventListener('click', (e) => {
                // Prevent any potential event bubbling
                e.stopPropagation();
                
                // Calculate target position to center the stone on the clicked dot
                const trackRect = sliderTrack.getBoundingClientRect();
                const dotRect = dot.getBoundingClientRect();
                
                // Get dot position relative to track
                const dotPositionInTrack = dotRect.left - trackRect.left;
                
                // Calculate target position that centers stone on dot
                const targetLeft = dotPositionInTrack - (centerStone.offsetWidth / 2) + (dot.offsetWidth / 2);
                
                // Ensure target position respects title area
                const constrainedTargetLeft = Math.max(titleWidth + 10, targetLeft);
                
                // Apply smooth animation using the same CSS classes as drag snapping
                centerStone.classList.add('snapping');
                centerStone.style.left = `${constrainedTargetLeft}px`;
                
                // Remove transition class after animation and update info
                setTimeout(() => {
                    centerStone.classList.remove('snapping');
                    // Update info section to reflect new selection
                    this.updateInfoSection();
                }, 300);
            });
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new JewelryVisualizer();
}); 