import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import store from "./store/store.js";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import ErrorBoundary from "./components/ErrorBoundary";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <Router>
          <ErrorBoundary>
            <App />
          </ErrorBoundary>
        </Router>
      </HelmetProvider>
    </Provider>
  </StrictMode>
);

// Removed redundant SW registration (moved to index.html)
