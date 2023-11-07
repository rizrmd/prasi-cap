import * as React from "react";
import * as ReactDOM from "react-dom/client";
import "./global";
import App from "./comps/App";
import "./preflight.css";
 
const root = ReactDOM.createRoot(document.getElementById("root")!);
root.render( 
  <React.StrictMode>
    <App />  
  </React.StrictMode>
);
