import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { AuthProvider } from "./features/auth";
import { initializeApp } from "./utils/startup";
import "./index.css";

// Initialize app before rendering
initializeApp().then(() => {
  createRoot(document.getElementById("root")!).render(
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}).catch((error) => {
  console.error('Failed to initialize app:', error);
  // Show error page or fallback UI
  document.getElementById("root")!.innerHTML = `
    <div style="padding: 20px; text-align: center; font-family: Arial, sans-serif;">
      <h1>🚫 App Initialization Failed</h1>
      <p>Please check your environment configuration and try again.</p>
      <p>Error: ${error.message}</p>
    </div>
  `;
});
