import { Menu } from "lucide-react";
import StudentDashboard from "./StudentDashboard";
import AdminDashboard from "./AdminDashboard";

const MainPage = () => {

    // --- CONFIGURATION & MOCK DATA ---
    const BRAND = {
        primary: "bg-red-700", // EWU Red branding
        primaryText: "text-red-700",
        secondary: "bg-gray-900",
        accent: "text-red-600"
    };

    // Mock Auth State (Switch this to test different views)
    // Roles: 'STUDENT', 'STAFF', 'FACULTY', 'EMPLOYER'
    const CURRENT_USER_ROLE = 'STUDENT';


    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            {/* Main Content Area */}
            <main>
                {CURRENT_USER_ROLE === 'STUDENT' ? <StudentDashboard /> : <AdminDashboard /> }
            </main>
        </div>
    );
}
export default MainPage;