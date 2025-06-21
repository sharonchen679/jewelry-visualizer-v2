# Jewelry Visualizer Widget

🔗 **Live Demo**: https://sharonchen679.github.io/jewelry-visualizer-v2/widget/

A modern, responsive jewelry stone visualizer with accurate sizing using CSS mm units and optional calibration features. Perfect for jewelry designers and customers to visualize stone combinations with precise measurements.

## Features

- **Accurate Sizing**: Uses CSS mm units for real-world size representation
- **Calibration System**: Optional credit card calibration for precise sizing
- **Admin Interface**: Secret password system for admin access
- **Dynamic Assets**: Loads stone data from configurable text files
- **Responsive Design**: Works on desktop and mobile devices
- **Interactive Slider**: Drag and drop interface for stone matching
- **Multiple Stone Types**: Supports center stones, regular side stones, and long side stones
- **Precise Proportions**: Internal dimension pairs for accurate stone proportions

## Project Structure

```
jewelry-visualizer/
├── widget/
│   ├── index.html          # Main widget interface
│   ├── style.css           # Widget styling with CSS mm units
│   ├── script.js           # Core functionality
│   └── config.js           # Configuration settings
├── admin/
│   ├── admin.html          # Admin interface
│   ├── admin.js            # Admin functionality
│   └── admin.css           # Admin styling
├── assets/
│   ├── center-stones/      # Center stone images
│   ├── side-stones/        # Regular side stone images
│   ├── long-side-stones/   # Long side stone images
│   ├── info/               # Stone size data files
│   └── manifest.json       # Asset manifest (coming soon)
└── README.md
```

## Setup Instructions

1. **Place stone images** in the appropriate asset folders:
   - Center stones: `assets/center-stones/`
   - Regular side stones: `assets/side-stones/`
   - Long side stones: `assets/long-side-stones/`

2. **Configure stone data** in the info files:
   - `assets/info/center-stones-sizes.txt`
   - `assets/info/side-stones-sizes.txt`
   - `assets/info/long-side-stones-sizes.txt`

3. **Serve the files** from a web server (required for asset loading)

## Stone Data Format

The system supports three types of stones with different measurement formats:

### Center Stones (`center-stones-sizes.txt`)
Format: `title: width | height, height1, height2, ...`
```
Round: 4 | 4, 5, 5.8, 6.5
Emerald: 3.2 | 4.6, 5.3, 6.3, 6.7
Oval: 3.6 | 5.2, 6.7, 7, 8
```

### Regular Side Stones (`side-stones-sizes.txt`)
Format: `title: height | width, width1, width2, ...`
```
Cadi: 0.229 | 0.404, 4.1, 4.4, 4.7, 5, 5.3, 5.5, 5.7, 6.2, 6.4
Long Cadi: 0.439 | 0.922, 5, 5.3, 5.5, 6, 6.5, 7, 7.5, 8
Hexa: 0.357 | 0.310, 4, 5, 6
```

### Long Side Stones (`long-side-stones-sizes.txt`)
Format: `title: width | height, height1, height2, ...`
```
Bullet: 0.386 | 0.555, 4.1, 4.7, 5.1, 5.4
Lozounge: 0.424 | 0.743, 5.5, 6, 6.5, 7, 7.5, 8, 8.5
Long Hexa: 0.352 | 0.713, 5, 5.5, 6, 6.5, 7, 7.5
```

### Important Notes:
- **First pair**: The first dimension pair (e.g., `0.386 | 0.555`) is used only for internal proportion calculations and is hidden from the UI
- **Display sizes**: Only the subsequent sizes (e.g., `4.1, 4.7, 5.1, 5.4`) appear in the sliders for user selection
- **Format consistency**: 
  - Center stones and long side stones use width-based format
  - Regular side stones use height-based format
  - This reflects how the stones are oriented relative to the center stone

## How It Works

1. **Stone Selection**: Users first select a center stone and size
2. **Side Stone Matching**: Users can then select from regular side stones or long side stones
3. **Interactive Slider**: A vertical slider shows different size options for the selected side stone
4. **Drag & Drop**: Users can drag the center stone up and down the slider to match with different side stone sizes
5. **Real-time Preview**: A large display shows the current stone combination
6. **Accurate Sizing**: All measurements use CSS mm units with optional calibration

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