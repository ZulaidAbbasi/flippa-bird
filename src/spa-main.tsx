import { createRoot } from "react-dom/client";
import { RouterProvider } from "@tanstack/react-router";
import { getRouter } from "./router";
import "./styles.css";

const router = getRouter();

// Full client-side render (no SSR hydration)
const root = createRoot(document.getElementById("root")!);
root.render(<RouterProvider router={router} />);
