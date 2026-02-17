# Backend Setup Guide

## Overview
This backend server handles file upload and sync operations for the Cimba application.

## Installation

### 1. Navigate to the backend directory
```bash
cd backend
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create environment file
```bash
cp .env.example .env
```

### 4. Start the server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:5000`

## API Endpoints

### 1. Health Check
- **Endpoint:** `GET /health`
- **Description:** Check if the backend server is running
- **Response:**
  ```json
  {
    "message": "Backend server is running!"
  }
  ```

### 2. Save File Content
- **Endpoint:** `POST /api/files/save`
- **Description:** Save file content to the server
- **Request Body:**
  ```json
  {
    "filePath": "filename.txt",
    "content": "file content here",
    "timestamp": "2024-01-01T00:00:00Z"  // optional
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "File saved successfully",
    "filePath": "filename.txt",
    "timestamp": "2024-01-01T00:00:00Z"
  }
  ```

### 3. Get File Content
- **Endpoint:** `GET /api/files/content?filePath=filename.txt`
- **Description:** Retrieve the content of an uploaded file
- **Query Parameters:**
  - `filePath` (required): Name of the file
- **Response:**
  ```json
  {
    "success": true,
    "filePath": "filename.txt",
    "content": "file content here",
    "timestamp": "2024-01-01T00:00:00Z"
  }
  ```

### 4. List All Files
- **Endpoint:** `GET /api/files/list`
- **Description:** Get a list of all uploaded files with metadata
- **Response:**
  ```json
  {
    "success": true,
    "files": [
      {
        "name": "file1.txt",
        "size": 1024,
        "createdAt": "2024-01-01T00:00:00Z",
        "modifiedAt": "2024-01-01T00:00:00Z"
      }
    ],
    "total": 1
  }
  ```

### 5. Delete File
- **Endpoint:** `DELETE /api/files/delete`
- **Description:** Delete a file from the server
- **Request Body:**
  ```json
  {
    "filePath": "filename.txt"
  }
  ```
- **Response:**
  ```json
  {
    "success": true,
    "message": "File deleted successfully",
    "filePath": "filename.txt",
    "timestamp": "2024-01-01T00:00:00Z"
  }
  ```

## Directory Structure

```
backend/
├── server.js          # Main server file
├── package.json       # Dependencies
├── .env.example       # Environment variables template
├── .gitignore         # Git ignore rules
└── uploads/           # Directory where files are saved (auto-created)
```

## Technologies Used

- **Express.js** - Web framework
- **CORS** - Cross-Origin Resource Sharing
- **fs-extra** - File system utilities
- **dotenv** - Environment variable management
- **nodemon** (dev) - Auto-reload during development

## Security Notes

1. **File Path Sanitization:** File paths are sanitized to prevent directory traversal attacks
2. **CORS Enabled:** Configure CORS origin as needed in production
3. **File Size Limit:** Currently set to 50MB
4. **Environment Variables:** Store sensitive data in `.env` file

## Troubleshooting

### Port already in use
Change the PORT in `.env` file:
```
PORT=5001
```

### Uploads directory permission error
Ensure the backend folder has write permissions:
```bash
chmod -R 755 backend/
```

### Module not found
Reinstall dependencies:
```bash
rm -rf node_modules
npm install
```

## Frontend Integration

To connect the frontend to this backend, update the `.env` file in the `src/` directory:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Or use the default `http://localhost:5000/api` (already configured in `syncFileService.js`)
