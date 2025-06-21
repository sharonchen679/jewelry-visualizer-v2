# Jewelry Visualizer Widget

A modern, responsive jewelry stone visualizer with accurate sizing using CSS mm units and optional calibration features.

## Features

- **Accurate Sizing**: Uses CSS mm units for real-world size representation
- **Calibration System**: Optional credit card calibration for precise sizing
- **Admin Interface**: Secret password system for admin access
- **Dynamic Assets**: Loads stone data from configurable text files
- **Responsive Design**: Works on desktop and mobile devices

## Project Structure

```
jewelry-visualizer/
├── widget/
│   ├── index.html          # Main widget interface
│   ├── style.css           # Widget styling with CSS mm units
│   ├── script.js           # Core functionality
│   └── config.js           # Configuration settings
├── admin/
│   ├── index.html          # Admin interface (coming soon)
│   ├── admin.js            # Admin functionality (coming soon)
│   ├── admin.css           # Admin styling (coming soon)
│   └── upload-handler.php  # Asset upload handler (coming soon)
├── assets/
│   ├── center-stones/      # Center stone images
│   ├── side-stones/        # Side stone images
│   ├── info/               # Stone size data files
│   └── manifest.json       # Asset manifest (coming soon)
└── README.md
```

## Setup Instructions

1. **Place stone images** in the appropriate asset folders:
   - Center stones: `assets/center-stones/`
   - Side stones: `assets/side-stones/`

2. **Configure stone data** in the info files:
   - `assets/info/center-stones-sizes.txt`
   - `assets/info/side-stones-sizes.txt`

3. **Serve the files** from a web server (required for asset loading)

## Stone Data Format

### Center Stones (`center-stones-sizes.txt`)
```
title: width | heights (various sizes)
Oval: 3.2 | 4.6, 5.3, 6.3, 6.7
Round Brilliant: 3.0 | 4.0, 4.5, 5.0, 5.5, 6.0
```

### Side Stones (`side-stones-sizes.txt`)
```
title: height | widths (various sizes)
Round: 2.1 | 4.0, 4.3, 4.7, 4.9
Baguette: 2.5 | 3.0, 3.5, 4.0, 4.5
```

## Admin Access

- **Default Password**: `secret`
- **Access Method**: Click letters in "Select Center Stone" title to spell password
- **Features**: Change password, reset calibration, manage assets
- **Security**: Admin interface content is injected only after successful authentication

## Calibration

- **Default**: CSS mm units (1mm = 1mm on screen)
- **Manual Calibration**: Use credit card reference for precise sizing
- **Precision Controls**: ±0.1mm adjustments with up/down arrows
- **Auto-save**: Calibration settings saved per device

## Browser Compatibility

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 16+

## Development Status

**Part 1 Complete**: ✅
- Core structure with CSS mm units
- Calibration system with credit card reference
- Password system foundation
- Asset loading infrastructure

**Coming Next**:
- Part 2: Complete asset management
- Part 3: Slider display system
- Part 4: Admin interface
- Part 5: Mobile optimization 