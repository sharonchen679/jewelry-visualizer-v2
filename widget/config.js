// Jewelry Visualizer Configuration
const CONFIG = {
    // Default sizing - CSS mm units (1mm = 1mm on screen)
    sizing: {
        useMMUnits: true,
        defaultCalibrationRatio: 1.0,
        calibrationStorageKey: 'jewelry-visualizer-calibration'
    },

    // Credit card dimensions for calibration (in mm)
    creditCard: {
        width: 85.6,
        height: 53.98,
        minSize: 20, // minimum size in mm
        maxSize: 200 // maximum size in mm
    },

    // Precision adjustment step (in mm)
    precisionStep: 0.1,

    // Admin settings
    admin: {
        defaultPassword: 'secret', // Default password for first access
        passwordStorageKey: 'jewelry-visualizer-admin-password',
        sessionStorageKey: 'jewelry-visualizer-admin-session'
    },

    assets: {
        // Asset paths (GitHub Pages - relative to repository root)
        // production code
        typeSelection: '/jewelry-visualizer-v2/assets/center-stones/type-selection/',
        diamonds: '/jewelry-visualizer-v2/assets/center-stones/diamonds/',
        gems: '/jewelry-visualizer-v2/assets/center-stones/gems/',
        sideStones: '/jewelry-visualizer-v2/assets/side-stones/',
        longSideStones: '/jewelry-visualizer-v2/assets/long-side-stones/',
        info: '/jewelry-visualizer-v2/assets/info/',
        manifest: '/jewelry-visualizer-v2/assets/manifest.json'

        // Asset paths (Localhost development - relative to server root)
        // local code - should be commented out for production
        // typeSelection: '/assets/center-stones/type-selection/',
        // diamonds: '/assets/center-stones/diamonds/',
        // gems: '/assets/center-stones/gems/',
        // sideStones: '/assets/side-stones/',
        // longSideStones: '/assets/long-side-stones/',
        // info: '/assets/info/',
        // manifest: '/assets/manifest.json'

    },

    // Info file names
    infoFiles: {
        diamonds: 'diamond-sizes.txt',
        emerald: 'emerald-sizes.txt',
        sapphire: 'sapphire-sizes.txt',
        ruby: 'ruby-sizes.txt',
        sideStones: 'side-stones-sizes.txt',
        longSideStones: 'long-side-stones-sizes.txt'
    },

    // Stone types configuration
    stoneTypes: {
        diamonds: {
            name: 'Diamonds',
            path: 'diamonds',
            infoFile: 'diamond-sizes.txt'
        },
        emerald: {
            name: 'Emerald',
            path: 'gems/emerald',
            infoFile: 'emerald-sizes.txt'
        },
        sapphire: {
            name: 'Sapphire',
            path: 'gems/sapphire',
            infoFile: 'sapphire-sizes.txt'
        },
        ruby: {
            name: 'Ruby',
            path: 'gems/ruby',
            infoFile: 'ruby-sizes.txt'
        }
    },

    // UI settings
    ui: {
        animationDuration: 300,
        snapThreshold: 20, // pixels for slider snapping
        touchEnabled: true
    },

    // Error messages
    messages: {
        loadError: 'Failed to load stone data',
        assetError: 'Stone image not found',
        calibrationError: 'Calibration failed',
        adminError: 'Admin access denied'
    }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG;
} 