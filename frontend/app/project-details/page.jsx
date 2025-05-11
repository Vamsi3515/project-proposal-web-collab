import ThemeToggle from "@/components/ThemeToggle";
import ProjectDetails from "./projectform";
import { ProtectedRoute } from "@/components/ProtectedRoute";

export default function Home() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
        <div className="absolute top-4 right-4"><ThemeToggle /></div>
      <ProjectDetails/>
    </div>
    </ProtectedRoute>
  );
}
