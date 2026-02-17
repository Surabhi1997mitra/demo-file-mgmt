import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: [], // Array of {name, folderName, lastEdited, isSaved, isLoading, error}
  selectedFile: null,
  editorText: "",
};

const fileSlice = createSlice({
  name: "files",
  initialState,
  reducers: {
    // Add a new file
    addFile: (state, action) => {
      const { name, folderName } = action.payload;
      const fileExists = state.files.some((f) => f.name === name);

      if (!fileExists) {
        state.files.push({
          name,
          folderName: folderName || null,
          lastEdited: null,
          isSaved: true,
          isLoading: false,
          error: null,
        });
      }
    },

    // Add multiple files (for folder upload)
    addFiles: (state, action) => {
      const newFiles = action.payload;
      newFiles.forEach((file) => {
        const existingFile = state.files.find((f) => f.name === file.name);

        if (existingFile) {
          // File exists - update its folderName if new one has it
          if (file.folderName && !existingFile.folderName) {
            existingFile.folderName = file.folderName;
          }
        } else {
          // File doesn't exist - add it
          state.files.push({
            name: file.name,
            folderName: file.folderName || null,
            lastEdited: null,
            isSaved: true,
            isLoading: false,
            error: null,
          });
        }
      });
    },

    // Select a file for editing
    selectFile: (state, action) => {
      state.selectedFile = action.payload;
    },

    // Update editor text
    setEditorText: (state, action) => {
      state.editorText = action.payload;
    },

    // Mark file as unsaved and update last edited time
    markFileAsUnsaved: (state, action) => {
      const fileName = action.payload;
      const file = state.files.find((f) => f.name === fileName);
      if (file) {
        file.isSaved = false;
        file.lastEdited = new Date().toLocaleTimeString();
        file.error = null;
      }
    },

    // Mark file as saved
    markFileAsSaved: (state, action) => {
      const fileName = action.payload;
      const file = state.files.find((f) => f.name === fileName);
      if (file) {
        file.isSaved = true;
      }
    },

    // Set loading state for a file
    setFileLoading: (state, action) => {
      const { name, isLoading } = action.payload;
      const file = state.files.find((f) => f.name === name);
      if (file) {
        file.isLoading = isLoading;
        if (isLoading) file.error = null;
      }
    },

    // Set error for a file
    setFileError: (state, action) => {
      const { name, error } = action.payload;
      const file = state.files.find((f) => f.name === name);
      if (file) {
        file.error = error;
        file.isLoading = false;
        file.isSaved = false;
      }
    },

    // Clear all state
    clearFiles: (state) => {
      state.files = [];
      state.selectedFile = null;
      state.editorText = "";
    },
  },
});

export const {
  addFile,
  addFiles,
  selectFile,
  setEditorText,
  markFileAsUnsaved,
  markFileAsSaved,
  setFileLoading,
  setFileError,
  clearFiles,
} = fileSlice.actions;

export default fileSlice.reducer;
