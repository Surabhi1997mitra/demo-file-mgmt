# CIMBA Real-Time File Editor

A powerful web-based file editor that lets you upload text files and edit them with changes saved directly to your original files on your device in real-time.

## Features

- **Real-Time Auto-Save**: Changes are automatically saved to your original files as you type (500ms debounce)
- **File Upload**: Upload individual `.txt` files or entire folders
- **Folder Support**: Organize files by folder structure in the sidebar
- **Loading Indicators**: Visual feedback ("⏳ Loading...") during file operations
- **Error Handling**: Red error messages displayed when operations fail
- **Save Status Tracking**: View when each file was last edited and whether changes are saved
- **User-Friendly Interface**: Clean two-panel layout (sidebar + editor)
- **No Backend Required**: Uses File System Access API for direct device file access (browser-native)

## Tech Stack

- **Frontend**: React 18 with Hooks
- **State Management**: Redux Toolkit + react-redux
- **File Access**: Browser File System Access API (native)
- **Styling**: Inline CSS with Poppins font family
- **Backend**: Express.js (minimal, for serving static files)
- **Development**: Create React App

## Project Structure

```
cimba-interview/
├── BACKEND_SETUP.md           # Backend configuration guide
├── README.md                   # This file
├── package.json               # Root dependencies
├── backend/
│   ├── package.json
│   └── server.js             # Express server
├── public/                    # Static assets
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
└── src/                       # React application
    ├── App.js                # Main router component
    ├── index.js              # App entry point with Redux Provider
    ├── hook/
    │   └── useDebounce.js   # Custom 500ms debounce hook
    ├── pages/
    │   ├── Home.js          # Landing page
    │   └── Upload.js        # Main file editor interface
    ├── redux/
    │   ├── fileSlice.js     # Redux state + reducers
    │   └── store.js         # Redux store configuration
    └── services/
        └── syncFileService.js  # File operations service
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:

```bash
cd c:\Users\surab\Desktop\cimba-interview
```

2. Install root dependencies:

```bash
npm install
```

3. Start the development server:

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000).

## Usage Guide

### Uploading Files

1. Click the **Upload File** button to select individual `.txt` files
2. Or click **Upload Folder** to upload an entire folder structure
3. Files appear in the left sidebar organized by folder

### Editing Files

1. Click on any file in the sidebar to open it in the editor
2. Make changes in the textarea
3. Changes are automatically saved every 500ms (debounced)
4. Look for the "✓ Saved" indicator or "⊙ Unsaved" status

### Understanding Status Indicators

- **⏳ Loading...** - File is being read or saved
- **Error: {message}** - Red text showing what went wrong (click file to retry)
- **✓ Saved** - All changes have been saved
- **⊙ Unsaved** - File has unsaved changes (will auto-save shortly)
- **Last edited: {time}** - Timestamp of last edit during this session

## Redux State Structure

The app uses Redux Toolkit to manage file state. Each file object contains:

```javascript
{
  name: string,           // File name
  folderName: string,     // Parent folder (empty if root)
  lastEdited: string,     // Last edit timestamp
  isSaved: boolean,       // Whether all changes are saved
  isLoading: boolean,     // Currently reading/writing file
  error: null | string    // Error message if operation failed
}
```

**Redux State Shape:**

```javascript
{
  files: {
    files: [],            // Array of file objects
    selectedFile: null,   // Currently selected file name
    editorText: ""        // Content of selected file
  }
}
```

**Available Actions:**

- `addFile`, `addFiles` - Add file(s) to state
- `selectFile` - Switch to different file
- `setEditorText` - Update file content
- `markFileAsUnsaved` - Mark file with pending changes
- `markFileAsSaved` - Mark file as saved
- `setFileLoading` - Set loading state for a file
- `setFileError` - Set error message for a file
- `clearFiles` - Remove all files from state

## File System Access API

This project uses the modern **File System Access API** (supported in Chrome, Edge, Opera) instead of a server-based approach:

- **One-time Permission**: User grants permission via browser dialog on first save only
- **Direct Access**: Files are written directly to the location on the user's device
- **No Server Upload**: No file data passes through a server
- **Real-Time Saving**: Uses `FileSystemFileHandle.createWritable()` for atomic writes

**API Usage in Upload.js:**

```javascript
// File picker
const [handle] = await window.showOpenFilePicker();

// Folder picker
const dirHandle = await window.showDirectoryPicker();

// File write
const writable = await handle.createWritable();
await writable.write(newContent);
await writable.close();
```

## Edge Cases Handled

1. **Duplicate Files**: When uploading a folder containing a file already uploaded individually, the file's `folderName` is updated instead of creating a duplicate
2. **Auto-Debounced Saves**: 500ms debounce prevents excessive writes while typing
3. **Last Character Loss Prevention**: Debounced save function receives text as parameter, not from stale state
4. **Non-Serializable Redux State**: File handles stored in React ref (`fileHandlesRef`) instead of Redux to avoid serialization warnings
5. **Error Recovery**: Failed reads/writes set error state (red message) but keep file in list for retry
6. **Permission Caching**: Browser handles permission caching; users don't see multiple permission prompts for the same file

## How Auto-Save Works

1. User types in textarea → `onChangeEditedText()` called with new text
2. Redux state updates immediately with new content
3. Debounced `saveEditedText(newText)` is triggered (500ms wait)
4. If user continues typing within 500ms, timer resets
5. When 500ms passes without input, save operation runs:
   - Dispatch `setFileLoading({ name, true })`
   - Get file handle from ref
   - Write content via File System Access API
   - Dispatch `markFileAsSaved()` on success
   - Dispatch `setFileError()` and `markFileAsUnsaved()` on failure
   - Dispatch `setFileLoading({ name, false })` in finally block

## Available Scripts

### `npm start`

Runs the app in development mode at [http://localhost:3000](http://localhost:3000). Page reloads on changes.

### `npm run build`

Creates an optimized production build in the `build` folder.

### `npm test`

Launches the test runner in interactive watch mode.

## Browser Compatibility

- **Chrome/Chromium**: Full support (File System Access API)
- **Edge**: Full support
- **Firefox**: Partial support (API in development)
- **Safari**: Partial support (API in development)

## Troubleshooting

**"Permission denied" error when saving**

- Your browser doesn't have permission to write to that file
- Try uploading the file again to re-grant permission

**File doesn't save**

- Check browser console for error messages
- Ensure the file isn't open in another program
- Try refreshing the page and uploading the file again

**Duplicate files appearing**

- This is expected behavior when uploading a folder with files you already uploaded individually
- The app merges them into a single file entry with the new folder name

## Future Enhancements

- Export/download edited files
- Support for more file types (.json, .html, .css, etc.)
- File search and filtering
- Undo/Redo functionality
- Multi-file diff viewer
- Dark mode theme
- File backup system
- Collaboration features

## License

This project is part of the CIMBA interview assessment.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
