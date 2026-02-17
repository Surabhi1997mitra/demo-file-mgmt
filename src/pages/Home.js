import React from "react";

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontFamily: "Poppins, sans-serif",
    backgroundColor: "#f0f0f0",
    position: "relative",
    flexDirection: "column",
    gap: "20px",
  },
  uploadButton: {
    position: "absolute",
    top: "20px",
    right: "20px",
    padding: "10px 20px",
    backgroundColor: "#0c4e6e",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontSize: "16px",
    fontFamily: "Poppins, sans-serif",
  },
  welcomeText: {
    fontSize: "50px",
    fontWeight: "400",
    color: "#0c4e6e",
    margin: 0,
  },
  welcomeDesc: {
    fontSize: "20px",
    color: "#0c4e6e",
    margin: 0,
  },
};

export default function Home({ onNavigateToUpload }) {
  return (
    <div style={styles.container}>
      <button style={styles.uploadButton} onClick={onNavigateToUpload}>
        Upload Screen
      </button>
      <h1 style={styles.welcomeText}>File Management Demo.</h1>
      <p style={styles.welcomeDesc}>Start with moving to Upload Screen</p>
    </div>
  );
}
