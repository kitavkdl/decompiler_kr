import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Easter egg
console.log(
  "%cDecompiler: Access Granted. Welcome, Future Member.",
  "color: #FF00FF; font-size: 16px; font-weight: bold; text-shadow: 0 0 10px #8A2BE2;"
);

createRoot(document.getElementById("root")!).render(<App />);
