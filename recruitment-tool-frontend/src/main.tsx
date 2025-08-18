import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import SelectedNameProvider from "./context/SelectedNameContext"; 

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <SelectedNameProvider>
        <App />
      </SelectedNameProvider>
    </BrowserRouter>
  </React.StrictMode>
);
