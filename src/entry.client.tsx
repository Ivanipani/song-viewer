import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import "./index.css";

// ReactDOM.hydrateRoot(
//   document,
//   <React.StrictMode>
//     <HydratedRouter />
//   </React.StrictMode>,
// );
// Use createRoot for client-side only rendering (ssr: false)
const root = document.getElementById("root");
if (root) {
  ReactDOM.createRoot(root).render(
    <React.StrictMode>
      <HydratedRouter />
    </React.StrictMode>,
  );
}
