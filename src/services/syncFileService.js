// Backend sync service to save file contents
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export const syncFileService = {
  /**
   * Save file contents to the backend
   * @param {string} filePath - The path of the uploaded file
   * @param {string} content - The new content to save
   * @returns {Promise} Response from the backend
   */
  saveFileContent: async (filePath, content) => {
    try {
      const response = await fetch(`${API_BASE_URL}/files/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          filePath,
          content,
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save file: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("File saved successfully:", data);
      return data;
    } catch (error) {
      console.error("Error saving file:", error);
      throw error;
    }
  },

  /**
   * Get file contents from the backend
   * @param {string} filePath - The path of the file to retrieve
   * @returns {Promise} File content from the backend
   */
  getFileContent: async (filePath) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/files/content?filePath=${encodeURIComponent(filePath)}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch file: ${response.statusText}`);
      }

      const data = await response.json();
      return data.content;
    } catch (error) {
      console.error("Error fetching file:", error);
      throw error;
    }
  },

  /**
   * Sync file contents with debounce
   * @param {string} filePath - The path of the file
   * @param {string} content - The content to save
   * @param {Function} debounceFunc - Debounce function to use
   * @returns {Promise} Response from the backend
   */
  syncWithDebounce: async (filePath, content) => {
    return syncFileService.saveFileContent(filePath, content);
  },
};

export default syncFileService;
