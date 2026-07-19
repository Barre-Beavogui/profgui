import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

if ("serviceWorker" in navigator) {
  let refreshing = false;

  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (refreshing || sessionStorage.getItem("profgui-sw-refreshed") === "true") {
      return;
    }

    refreshing = true;
    sessionStorage.setItem("profgui-sw-refreshed", "true");
    window.location.reload();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker
      .getRegistrations()
      .then((registrations) => {
        registrations.forEach((registration) => {
          registration.update();
        });
      })
      .catch(() => {
        // Ignore service worker update failures; normal network requests still work.
      });
  });
}

createRoot(document.getElementById("root")!).render(<App />);
