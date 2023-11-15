import * as React from "react";
import * as ReactDOM from "react-dom/client";
import App from "./comps/App";
import "./default.css";
import "./global";
import { siteCache } from "./utils/cache-site";

siteCache();

const root = ReactDOM.createRoot(document.getElementById("capacitor-root")!);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
