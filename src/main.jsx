import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

// The dashboard was written against the claude.ai artifact storage API
// (window.storage); back it with localStorage when running locally.
if (!window.storage) {
  window.storage = {
    async get(key) {
      const value = localStorage.getItem(key);
      return value === null ? null : { value };
    },
    async set(key, value) {
      localStorage.setItem(key, value);
    },
    async delete(key) {
      localStorage.removeItem(key);
    },
  };
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
