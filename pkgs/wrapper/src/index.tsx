import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./global";
import App from "./comps/App";
import "./default.css";

const root = ReactDOM.createRoot(document.getElementById("capacitor-root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
