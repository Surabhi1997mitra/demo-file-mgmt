import { useState } from "react";
import Home from "./pages/Home";
import Upload from "./pages/Upload";

function App() {
  const [currentPage, setCurrentPage] = useState("home");

  return (
    <div className="App">
      {currentPage === "home" ? (
        <Home onNavigateToUpload={() => setCurrentPage("upload")} />
      ) : (
        <Upload onBack={() => setCurrentPage("home")} />
      )}
    </div>
  );
}

export default App;
