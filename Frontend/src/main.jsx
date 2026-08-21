import { Agentation } from "agentation";

import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";
import { store } from "./store/store.js";

import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "var(--surface)",
              color: "var(--text)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-xl)",
              boxShadow: "var(--shadow)",
              fontSize: "14px",
            },
            success: {
              iconTheme: {
                primary: "var(--success)",
                secondary: "var(--surface)",
              },
            },
            error: {
              iconTheme: {
                primary: "var(--error)",
                secondary: "var(--surface)",
              },
            },
          }}
        />

        <App />
      </BrowserRouter>
    </Provider>
    {import.meta.env.DEV && <Agentation />}
  </React.StrictMode>,
);
