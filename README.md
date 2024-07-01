# SVG to PNG Converter

A web application for converting SVG images to PNG format. This app allows you to select an SVG file, resize it while maintaining aspect ratio, and download the result as a PNG image. 

## Features

- **SVG to PNG Conversion**: Upload your SVG file, and it gets converted to PNG format.
- **Resizable Output**: Adjust the width and height of the output PNG while optionally maintaining the original aspect ratio.
- **Aspect Ratio Syncing**: Toggle aspect ratio syncing to preserve the SVG's original dimensions.
- **Size Calculation**: Displays the file size of the resulting PNG image.

## Installation

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher) or yarn

### Steps

1. Clone the repository:

    ```bash
    git clone https://github.com/Danushka-Madushan/SVG-2-PNG.git
    cd SVG-2-PNG
    ```

2. Install dependencies:

    ```bash
    npm install
    ```

    or

    ```bash
    yarn install
    ```

3. Start the development server:

    ```bash
    npm run dev
    ```

    or

    ```bash
    yarn dev
    ```

4. Open your browser and navigate to `http://localhost:5173/`.

## Usage

1. **Select an SVG**: Click the "Select SVG" button to choose your SVG file.
2. **Resize the Image**: Adjust the width and height in the input fields. Toggle "Sync Aspect-Ratio" to maintain or ignore the aspect ratio.
3. **Convert and Download**: Once the SVG is loaded and resized, click "Download PNG" to save the PNG image.

## Code Overview

### Main Components

- **State Management**: Utilizes React's `useState` for managing the dimensions, aspect ratio, data URLs, and other parameters.
- **File Input**: Handles the file input and reads the SVG data using `FileReader`.
- **Canvas Rendering**: Renders the SVG onto a `<canvas>` element to create a PNG image.
- **Aspect Ratio Handling**: Syncs the aspect ratio for width and height resizing.

### Key Functions

- **getCurrentResolution**: Parses the SVG file to get its width and height.
- **onFileChange**: Handles the file input event and reads the SVG file.
- **ResizeResolution**: Adjusts the width and height based on the aspect ratio settings.
- **ConvertSVG2PNG**: Converts the SVG data into a PNG image using a canvas.

### Dependencies

- **@nextui-org/react**: UI components library for building the interface.
- **React**: Core framework for building the app.

### File Structure

```
/src
  ├── /components
  ├── /icons
  ├── App.tsx
  ├── index.tsx
  ├── ...
public
  ├── index.html
  ├── ...
```

- **App.tsx**: Main component handling the SVG to PNG conversion logic and UI.
- **index.tsx**: Entry point for rendering the React app.
- **components/**: Directory for additional reusable components (if any).
- **icons/**: Directory for SVG icons used in the app.

## Future Enhancements

- **Custom Output Formats**: Support for other image formats like JPG.
- **Batch Conversion**: Ability to convert multiple SVGs at once.
- **Advanced Resizing**: More advanced resizing options such as cropping or fitting within specific dimensions.

## Contributing

Contributions are welcome! Please fork the repository and create a pull request for any features, bug fixes, or enhancements.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
