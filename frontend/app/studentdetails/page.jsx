import MultiStepForm from "@/components/MultiStepForm";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <ProtectedRoute>
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 text-black dark:text-white">
        <div className="absolute top-4 right-4"><ThemeToggle /></div> 
      <MultiStepForm />
    </div>
    </ProtectedRoute>
  );
}
