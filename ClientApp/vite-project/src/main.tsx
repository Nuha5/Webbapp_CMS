import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import "./components/kanban/kanban.css"; // global color themes and kanban styles

document.documentElement.setAttribute("data-react-ready", "1");


// Apply saved theme immediately on page load (so refresh keeps the same theme everywhere)
const stored = localStorage.getItem("taskapp-theme") as "light" | "dark" | null;
const theme = stored === "light" ? "light" : "dark";
document.documentElement.setAttribute("data-theme", theme);

createRoot(document.getElementById('root')!).render(<App />);
