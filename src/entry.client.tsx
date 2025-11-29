/**
 * Client entry point for the React application.
 *
 * Initializes the React app with client-side rendering using React Router's HydratedRouter.
 * This is the first file executed in the browser and mounts the entire application tree.
 *
 * No data ownership - all application state is managed by child components.
 * No network calls - data fetching happens in route loaders.
 */
import React from "react";
import ReactDOM from "react-dom/client";
import { HydratedRouter } from "react-router/dom";
import '@mantine/core/styles.css';
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
