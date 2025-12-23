import { Badge, Bell, BookOpen, Briefcase, Calendar, CheckCircle, ChevronRight } from "lucide-react";
import { useUser } from "../../context/UserContext";
const BRAND = {
    primary: "bg-red-700", // EWU Red branding
    primaryText: "text-red-700",
    secondary: "bg-gray-900",
    accent: "text-red-600"
};

const Card = ({ children, className = "" }) => (
    <div className={`bg-white rounded-xl border border-gray-100 shadow-sm ${className}`}>
        {children}
    </div>
);

const DefaultPage = () => {
    const { appUser, token } = useUser();
    return (
    <div >
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Welcome back, {appUser?.displayName || 'Invalid User'}! 👋</h1>
                <p className="text-gray-500 mt-1">Track your applied learning progress and upcoming career events.</p>
            </div>
            <div className="flex space-x-3">
                <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                    <Bell size={24} />
                    <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                </button>
            </div>
        </div>

        {/* Quick Stats Grid [cite: 53] */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 border-l-4 border-l-red-600">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Applied Learning</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">2 Active</h3>
                        <p className="text-sm text-gray-500 mt-1">1 Internship, 1 Service Learning</p>
                    </div>
                    <div className="p-3 bg-red-50 rounded-lg text-red-600">
                        <BookOpen size={24} />
                    </div>
                </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-blue-600">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Volunteer Hours</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">24.5</h3>
                        <p className="text-sm text-gray-500 mt-1">Hours verified this semester</p>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                        <CheckCircle size={24} />
                    </div>
                </div>
            </Card>

            <Card className="p-6 border-l-4 border-l-amber-500">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm font-medium text-gray-500 uppercase">Job Applications</p>
                        <h3 className="text-3xl font-bold text-gray-900 mt-2">5</h3>
                        <p className="text-sm text-gray-500 mt-1">2 Interviews Scheduled</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
                        <Briefcase size={24} />
                    </div>
                </div>
            </Card>
        </div>

        {/* Applied Learning Types Tracker  */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold text-gray-900">Applied Learning Experiences</h2>
                    <button className={`text-sm font-medium ${BRAND.accent} hover:underline`}>
                        + Request New Experience
                    </button>
                </div>

                <div className="space-y-4">
                    {[
                        { title: "Software Engineering Intern", org: "Avista Corp", type: "INTERNSHIP", status: "APPROVED", date: "Jun 2026" },
                        { title: "Community Garden Project", org: "Cheney Food Bank", type: "SERVICE_LEARNING", status: "PENDING", date: "Mar 2026" },
                        { title: "Chemistry Lab Assistant", org: "EWU Science Dept", type: "STUDENT_EMPLOYMENT", status: "DRAFT", date: "TBD" }
                    ].map((item, idx) => (
                        <Card key={idx} className="p-5 hover:shadow-md transition-shadow cursor-pointer group">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className={`w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center ${BRAND.primaryText}`}>
                                        <Briefcase size={20} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900 group-hover:text-red-700 transition-colors">
                                            {item.title}
                                        </h4>
                                        <p className="text-sm text-gray-500 flex items-center gap-2">
                                            {item.org} • <span className="text-xs uppercase tracking-wider font-semibold bg-gray-100 px-2 py-0.5 rounded text-gray-600">{item.type.replace('_', ' ')}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-4">
                                    <span className="text-sm text-gray-500 hidden sm:block">{item.date}</span>
                                    <Badge status={item.status} />
                                    <ChevronRight size={16} className="text-gray-400" />
                                </div>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>

            {/* Upcoming Events / Calendar Widget  */}
            <div className="space-y-6">
                <h2 className="text-lg font-bold text-gray-900">Upcoming Events</h2>
                <Card className="p-0 overflow-hidden">
                    <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                        <span className="font-semibold text-gray-700">January 2026</span>
                        <Calendar size={18} className="text-gray-400" />
                    </div>
                    <div className="divide-y divide-gray-100">
                        {[
                            { day: "09", month: "JAN", title: "RFP Submission Deadline", time: "3:00 PM" },
                            { day: "14", month: "JAN", title: "STEM Career Fair", time: "10:00 AM" },
                            { day: "20", month: "JAN", title: "Resume Workshop", time: "2:00 PM" }
                        ].map((event, i) => (
                            <div key={i} className="p-4 flex items-center space-x-4 hover:bg-gray-50 cursor-pointer">
                                <div className="flex-shrink-0 text-center w-12 bg-gray-100 rounded-lg py-2">
                                    <div className="text-xs font-bold text-gray-500">{event.month}</div>
                                    <div className={`text-lg font-bold ${BRAND.primaryText}`}>{event.day}</div>
                                </div>
                                <div>
                                    <h5 className="font-semibold text-gray-900 text-sm">{event.title}</h5>
                                    <p className="text-xs text-gray-500">{event.time} • tawanka Hall</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 text-center border-t border-gray-100">
                        <button className={`text-sm font-medium ${BRAND.accent}`}>View Full Calendar</button>
                    </div>
                </Card>
            </div>
        </div>
    </div>
)};

export default DefaultPage;