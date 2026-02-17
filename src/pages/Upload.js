import React, { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import useDebounce from "../hook/useDebounce";
import {
  addFile,
  addFiles,
  selectFile,
  setEditorText,
  markFileAsUnsaved,
  markFileAsSaved,
  setFileLoading,
  setFileError,
} from "../redux/fileSlice";

const styles = {
  container: {
    display: "flex",
    height: "100vh",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#f0f0f0",
  },
  sidebar: {
    width: "300px",
    backgroundColor: "white",
    borderRight: "1px solid #e0e0e0",
    display: "flex",
    flexDirection: "column",
    padding: "20px",
    overflowY: "auto",
  },
  backButton: {
    padding: "10px 15px",
    backgroundColor: "#0c4e6e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
    marginBottom: "20px",
  },
  sidebarTitle: {
    fontSize: "18px",
    fontWeight: "600",
    color: "#0c4e6e",
    marginBottom: "15px",
  },
  uploadButtonsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
    marginBottom: "20px",
  },
  uploadButton: {
    padding: "10px 15px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "14px",
    fontFamily: "Poppins, sans-serif",
  },
  fileList: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    flex: 1,
  },
  folderItem: {
    padding: "12px",
    backgroundColor: "#e8f4f8",
    border: "1px solid #0c4e6e",
    borderRadius: "4px",
    fontSize: "14px",
    fontWeight: "600",
    color: "#0c4e6e",
    marginBottom: "8px",
  },
  nestedFilesList: {
    display: "flex",
    flexDirection: "column",
    gap: "6px",
    paddingLeft: "20px",
    marginBottom: "12px",
  },
  fileItem: {
    padding: "10px",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "13px",
    color: "#333",
    transition: "all 0.2s",
  },
  fileItemActive: {
    backgroundColor: "#0c4e6e",
    color: "white",
    borderColor: "#0c4e6e",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    padding: "40px",
    justifyContent: "center",
    alignItems: "center",
  },
  editorContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    width: "100%",
  },
  editorTitle: {
    fontSize: "20px",
    fontWeight: "600",
    color: "#0c4e6e",
    marginBottom: "15px",
  },
  textarea: {
    width: "100%",
    height: "100%",
    padding: "15px",
    border: "2px solid #a8d8f0",
    borderRadius: "4px",
    fontFamily: "monospace",
    fontSize: "14px",
    resize: "none",
    boxShadow: "0 2px 8px rgba(168, 216, 240, 0.15)",
  },
  emptyState: {
    textAlign: "center",
    color: "#999",
  },
  emptyStateTitle: {
    fontSize: "24px",
    fontWeight: "500",
    marginBottom: "10px",
  },
  hiddenInput: {
    display: "none",
  },
};

export default function Upload({ onBack }) {
  const fileInputRef = useRef(null);
  const folderInputRef = useRef(null);
  const fileHandlesRef = useRef({}); // Map of filename to FileSystemFileHandle

  // Redux hooks
  const dispatch = useDispatch();
  // const files = useSelector((state) => state.files.files);
  // const selectedFile = useSelector((state) => state.files.selectedFile);
  // const editorText = useSelector((state) => state.files.editorText);
  const entireState = useSelector((state) => state.files);
  const { files, selectedFile, editorText } = entireState;
  console.log("entireState", entireState);

  const handleUploadFile = async () => {
    try {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          { description: "Text Files", accept: { "text/plain": [".txt"] } },
        ],
      });

      const file = await fileHandle.getFile();
      dispatch(setFileLoading({ name: file.name, isLoading: true }));
      const content = await file.text();

      // Check if file already exists
      const fileExists = files.some((f) => f.name === file.name);

      if (fileExists) {
        try {
          // File already exists, just select it
          dispatch(selectFile(file.name));
          dispatch(setEditorText(content));
          console.log("File already exists, opening from app:", file.name);
        } finally {
          dispatch(setFileLoading({ name: file.name, isLoading: false }));
        }
      } else {
        try {
          // Add new file to Redux (only serializable data)
          dispatch(addFile({ name: file.name, folderName: null }));
          fileHandlesRef.current[file.name] = fileHandle;

          // Select the file
          dispatch(selectFile(file.name));
          dispatch(setEditorText(content));
          console.log("File uploaded:", file.name);
        } finally {
          dispatch(setFileLoading({ name: file.name, isLoading: false }));
        }
      }
    } catch (error) {
      if (error && error.name === "AbortError") return;
      console.error("Error selecting file:", error);
      // set error in redux if we have filename
      if (error && error.fileName) {
        dispatch(setFileError({ name: error.fileName, error: error.message }));
      }
    }
  };

  const handleUploadFolder = async () => {
    try {
      const dirHandle = await window.showDirectoryPicker();
      const uploadedFiles = [];
      const folderName = dirHandle.name;

      // Iterate through all files in the folder
      for await (const [name, handle] of dirHandle.entries()) {
        if (handle.kind === "file" && name.endsWith(".txt")) {
          const file = await handle.getFile();
          uploadedFiles.push({ name: file.name, folderName });
          fileHandlesRef.current[file.name] = handle;
        }
      }

      if (uploadedFiles.length > 0) {
        // Add all files to Redux (only serializable data)
        dispatch(addFiles(uploadedFiles));

        // Auto-select the first file and load its content
        if (!selectedFile) {
          const firstFile = uploadedFiles[0];
          const handle = fileHandlesRef.current[firstFile.name];
          dispatch(selectFile(firstFile.name));
          try {
            dispatch(setFileLoading({ name: firstFile.name, isLoading: true }));
            const content = await handle.getFile().then((f) => f.text());
            dispatch(setEditorText(content));
          } catch (err) {
            console.error("Error reading first file from folder:", err);
            dispatch(
              setFileError({
                name: firstFile.name,
                error: err.message || String(err),
              }),
            );
          } finally {
            dispatch(
              setFileLoading({ name: firstFile.name, isLoading: false }),
            );
          }
        }

        console.log("Folder uploaded with", uploadedFiles.length, "files");
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        console.error("Error selecting folder:", error);
      }
    }
  };

  const handleFileSelect = async (fileName) => {
    dispatch(selectFile(fileName));
    const handle = fileHandlesRef.current[fileName];

    if (handle) {
      try {
        dispatch(setFileLoading({ name: fileName, isLoading: true }));
        const file = await handle.getFile();
        const content = await file.text();
        dispatch(setEditorText(content));
      } catch (error) {
        console.error("Error reading file:", error);
        dispatch(
          setFileError({
            name: fileName,
            error: error.message || String(error),
          }),
        );
      } finally {
        dispatch(setFileLoading({ name: fileName, isLoading: false }));
      }
    }
  };

  const onChangeEditedText = (event) => {
    const newText = event.target.value;
    dispatch(setEditorText(newText));
    dispatch(markFileAsUnsaved(selectedFile));
    saveEditedText(newText);
  };

  const saveEditedText = useDebounce(async (textToSave) => {
    if (!selectedFile) return;

    const handle = fileHandlesRef.current[selectedFile];
    if (!handle) return;

    try {
      dispatch(setFileLoading({ name: selectedFile, isLoading: true }));
      const writable = await handle.createWritable();
      await writable.write(textToSave);
      await writable.close();
      dispatch(markFileAsSaved(selectedFile));
      console.log("File saved:", selectedFile);
    } catch (error) {
      console.error("Error saving file:", error);
      dispatch(
        setFileError({
          name: selectedFile,
          error: error.message || String(error),
        }),
      );
    } finally {
      dispatch(setFileLoading({ name: selectedFile, isLoading: false }));
    }
  }, 500);

  return (
    <div style={styles.container}>
      {/* Sidebar */}
      <div style={styles.sidebar}>
        <button style={styles.backButton} onClick={onBack}>
          ← Back
        </button>

        <h2 style={styles.sidebarTitle}>Files</h2>

        <div style={styles.uploadButtonsContainer}>
          <button style={styles.uploadButton} onClick={handleUploadFile}>
            + Upload File
          </button>
          <button style={styles.uploadButton} onClick={handleUploadFolder}>
            + Upload Folder
          </button>
        </div>

        <div style={styles.fileList}>
          {files.length === 0 ? (
            <p style={{ color: "#999", fontSize: "14px" }}>
              No files uploaded yet
            </p>
          ) : (
            <>
              {/* Display files without folder */}
              {files
                .filter((file) => !file.folderName)
                .map((file) => (
                  <div
                    key={file.name}
                    style={{
                      ...styles.fileItem,
                      ...(selectedFile === file.name
                        ? styles.fileItemActive
                        : {}),
                    }}
                    onClick={() => handleFileSelect(file.name)}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <span>📄 {file.name}</span>
                      <span style={{ fontSize: "11px", opacity: 0.7 }}>
                        {file.isLoading
                          ? "⏳ Loading..."
                          : file.isSaved
                            ? "✓ Saved"
                            : "⊙ Unsaved"}
                      </span>
                    </div>
                    {file.lastEdited && (
                      <div
                        style={{
                          fontSize: "11px",
                          opacity: 0.6,
                          marginTop: "4px",
                        }}
                      >
                        Edited: {file.lastEdited}
                      </div>
                    )}
                    {file.error && (
                      <div
                        style={{
                          color: "#c53030",
                          fontSize: "12px",
                          marginTop: "6px",
                        }}
                      >
                        Error: {file.error}
                      </div>
                    )}
                  </div>
                ))}

              {/* Display folders with nested files */}
              {Array.from(
                new Map(
                  files
                    .filter((file) => file.folderName)
                    .map((file) => [file.folderName, file]),
                ).entries(),
              ).map(([folderName, _]) => (
                <div key={folderName}>
                  <div style={styles.folderItem}>📁 {folderName}</div>
                  <div style={styles.nestedFilesList}>
                    {files
                      .filter((file) => file.folderName === folderName)
                      .map((file) => (
                        <div
                          key={file.name}
                          style={{
                            ...styles.fileItem,
                            ...(selectedFile === file.name
                              ? styles.fileItemActive
                              : {}),
                          }}
                          onClick={() => handleFileSelect(file.name)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <span>📄 {file.name}</span>
                            <span style={{ fontSize: "11px", opacity: 0.7 }}>
                              {file.isSaved ? "✓ Saved" : "⊙ Unsaved"}
                            </span>
                          </div>
                          {file.lastEdited && (
                            <div
                              style={{
                                fontSize: "11px",
                                opacity: 0.6,
                                marginTop: "4px",
                              }}
                            >
                              Edited: {file.lastEdited}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div style={styles.mainContent}>
        {selectedFile ? (
          <div style={styles.editorContainer}>
            <h2 style={styles.editorTitle}>Editing: {selectedFile}</h2>
            <textarea
              style={styles.textarea}
              value={editorText}
              onChange={onChangeEditedText}
              placeholder="Start typing..."
            />
          </div>
        ) : (
          <div style={styles.emptyState}>
            <p style={styles.emptyStateTitle}>👈 Upload or select a file</p>
            <p>Click "Upload File" or "Upload Folder" to get started</p>
          </div>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        style={styles.hiddenInput}
      />
      <input
        ref={folderInputRef}
        type="file"
        webkitdirectory="true"
        accept=".txt"
        style={styles.hiddenInput}
      />
    </div>
  );
}
