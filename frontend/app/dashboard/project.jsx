"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Menu,
  Pencil,
  X,
  Search,
  ChevronDown,
  Filter,
  CircleDollarSign,
  TicketCheck,
} from "lucide-react";
import ReportIssue from "../report-issue/reportform";
import ProjectDetails from "../project-details/projectform";
import ThemeToggle from "@/components/ThemeToggle";
import axios from "axios";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import { toast } from "react-toastify";

export default function Dashboard() {
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState("projects");
  const [activeSubSection, setActiveSubSection] = useState("all");
  const [isMobile, setIsMobile] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const local_uri = "http://localhost:8000";
  const [reports, setReports] = useState([]);
  const [filteredTickets, setFilteredTickets] = useState([]);
  const [hasReports, setHasReports] = useState(null);
  const [ticketStatusFilter, setTicketStatusFilter] = useState("open");
  
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const response = await axios.get(`${local_uri}/api/projects/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        const userProjects = response.data.map(project => ({
          id: project.project_id,
          name: project.project_name,
          status: project.project_status,
          domain: project.domain,
          ...project
        }));
  
        setProjects(userProjects);
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchProjects();
  }, []);
  

  // const [tickets, setTickets] = useState([
  //   {
  //     id: 1,
  //     title: "Fix login bug",
  //     project: "AI Assistant",
  //     status: "Open",
  //   },
  //   {
  //     id: 2,
  //     title: "Update documentation",
  //     project: "Web App",
  //     status: "Open",
  //   },
  //   {
  //     id: 3,
  //     title: "Performance optimization",
  //     project: "Blockchain Project",
  //     status: "Closed",
  //   },
  //   {
  //     id: 4,
  //     title: "Security audit",
  //     project: "ML Project",
  //     priority: "Critical",
  //     status: "Closed",
  //   },
  // ]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${local_uri}/api/reports/user`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setReports(res.data.reports);
      } catch (err) {
        console.error('Failed to fetch reports:', err);
      }
    };
  
    fetchReports();
  }, []);
  

  useEffect(() => {
    if (Array.isArray(reports)) {
      const filtered = reports.filter(
        (report) => report.report_status === ticketStatusFilter
      );
      setFilteredTickets(filtered);
    } else {
      setFilteredTickets([]);
    }
  }, [ticketStatusFilter, reports]);
  

  const [payments, setPayments] = useState([
    {
      id: 1,
      project: "AI Assistant",
      amount: 3500,
      date: "2025-02-15",
      status: "Pending",
    },
    {
      id: 2,
      project: "Web App",
      amount: 2800,
      date: "2025-01-30",
      status: "Completed",
    },
    {
      id: 3,
      project: "Blockchain Project",
      amount: 5000,
      date: "2025-03-10",
      status: "Completed",
    },
    {
      id: 4,
      project: "ML Project",
      amount: 4200,
      date: "2025-03-28",
      status: "Pending",
    },
  ]);

  const [selectedProject, setSelectedProject] = useState(null);
  const [newDomain, setNewDomain] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // const handleSubmit = (e) => {
  //   e.preventDefault();
  //   router.push("/project-details");
  // };

  const handleEditClick = (project) => {
    setSelectedProject(project);
    setNewDomain(project.domain);
  };

  const handleDomainChange = (value) => {
    setNewDomain(value);
  };

  const handleSave = async () => {
    const token = localStorage.getItem('token');
    try {
      const res = await fetch(`${local_uri}/api/projects/change-domain/${selectedProject.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ domain: newDomain }),
      });
  
      if (!res.ok) {
        throw new Error("Failed to update domain");
      }
  
      setProjects(prev =>
        prev.map(p => p.id === selectedProject.id ? { ...p, domain: newDomain } : p)
      );
      setSelectedProject(null);
      toast.success("Domain updated successfully!");
    } catch (error) {
      console.error("Failed to update domain:", error);
      toast.error("Failed to update domain!");
    }
  };  
  
  const changeSection = (section, subSection = "all") => {
    setActiveSection(section);
    setActiveSubSection(subSection);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  // const statusStyles = {
  //   "Pending Acceptance": "bg-yellow-500",
  //   "Accepted & Payment Pending": "bg-blue-500",
  //   "Payment Completed": "bg-green-500",
  //   Rejected: "bg-red-500",
  //   Open: "bg-green-500",
  //   Closed: "bg-orange-500",
  //   Pending: "bg-yellow-500",
  //   Completed: "bg-green-500",
  // };

  const statusStyles = {
    "Pending Acceptance": "bg-yellow-400",
    "Accepted & Payment Pending": "bg-blue-500",
    "Payment Completed": "bg-green-500",
    "Rejected": "bg-red-500",
    "Approved": "bg-blue-600",
    "Pending": "bg-yellow-500",
    "Completed": "bg-green-600",
    "Open": "bg-green-500",
    "Closed": "bg-orange-500",
  };  

  // const priorityStyles = {
  //   Low: "bg-blue-100 text-blue-800",
  //   Medium: "bg-yellow-100 text-yellow-800",
  //   High: "bg-orange-100 text-orange-800",
  //   Critical: "bg-red-100 text-red-800",
  // };

  // Filter projects based on search and status
  const filteredProjects = projects.filter((project) => {
    const matchesSearch =
      project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.domain.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeSubSection === "all") return matchesSearch;
    if (activeSubSection === "accepted")
      return matchesSearch && project.status.includes("Accepted");
    if (activeSubSection === "rejected")
      return matchesSearch && project.status === "Rejected";

    return matchesSearch;
  });
  
  // Filter tickets based on status
  // const filteredTickets = tickets.filter((ticket) => {
  //   if (activeSubSection === "all") return true;
  //   if (activeSubSection === "open") return ticket.status === "Open";
  //   if (activeSubSection === "closed") return ticket.status === "Closed";
  //   return true;
  // });

  const filteredPayments = payments.filter((payment) => {
    if (activeSubSection === "all") return true;
    if (activeSubSection === "past") return payment.status === "Completed";
    if (activeSubSection === "pending") return payment.status === "Pending";
    return true;
  });

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 w-full">
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-800 shadow transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } transition-transform duration-300 ease-in-out md:translate-x-0 md:relative`}
      >
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white">
            Dashboard
          </h2>
          {isMobile && (
            <button
              onClick={toggleSidebar}
              className="md:hidden text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white"
            >
              <X size={24} />
            </button>
          )}
        </div>

        <nav className="mt-4">
          {/* Projects Section */}
          <div
            className={`mb-1 ${
              activeSection === "projects" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("projects")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "projects"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <Filter size={18} className="mr-2" />
              <span>Projects</span>
            </button>

            {activeSection === "projects" && (
              <div className="pl-8 pr-3 py-2 space-y-1">
                <button
                  onClick={() => changeSection("projects", "all")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "all"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  All Projects
                </button>
                <button
                  onClick={() => changeSection("projects", "accepted")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "accepted"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Accepted
                </button>
                <button
                  onClick={() => changeSection("projects", "rejected")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "rejected"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Rejected
                </button>
              </div>
            )}
          </div>

          {/* Reports Section */}
          <div
            className={`mb-1 ${
              activeSection === "reports" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("reports")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "reports"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <TicketCheck size={18} className="mr-2" />
              <span>Reports</span>
            </button>

            {activeSection === "reports" && (
              <div className="pl-8 pr-3 py-2 space-y-1">
                <button
                  onClick={() => changeSection("reports", "open")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "open"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Open Tickets
                </button>

                <button
                  onClick={() => changeSection("reports", "closed")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "closed"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Closed Tickets
                </button>
              </div>
            )}
          </div>

          {/* Payments Section */}
          <div
            className={`mb-1 ${
              activeSection === "payments" ? "bg-blue-50 dark:bg-gray-700" : ""
            }`}
          >
            <button
              onClick={() => changeSection("payments")}
              className={`w-full flex items-center p-3 text-left ${
                activeSection === "payments"
                  ? "text-blue-600 dark:text-blue-400 font-medium border-l-4 border-blue-600 dark:border-blue-400"
                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              }`}
            >
              <CircleDollarSign size={18} className="mr-2" />
              <span>Payments</span>
            </button>

            {activeSection === "payments" && (
              <div className="pl-8 pr-3 py-2 space-y-1">
                <button
                  onClick={() => changeSection("payments", "past")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "past"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Past Payments
                </button>
                <button
                  onClick={() => changeSection("payments", "pending")}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${
                    activeSubSection === "pending"
                      ? "bg-blue-100 dark:bg-gray-600 text-blue-700 dark:text-blue-100"
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600"
                  }`}
                >
                  Pending
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Top Nav with Hamburger Menu */}
        <div className="bg-white dark:bg-gray-800 shadow p-4 flex items-center justify-between">
          <div className="flex items-center">
            {isMobile && (
              <button
                onClick={toggleSidebar}
                className="mr-4 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white"
              >
                <Menu size={24} />
              </button>
            )}
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              {activeSection === "projects" && "Project Dashboard"}
              {activeSection === "reports" && "Ticket Reports"}
              {activeSection === "payments" && "Payment Management"}
            
            </h1>
           
          </div>
          <span className="relative -top-7"><ThemeToggle/></span>
        </div>

        {activeSection === "projects" && (
          <div className="p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
              <button
                onClick={() => changeSection("projects", "newproject")}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Add New Project
              </button>

              <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-4">
                {/* Search Input */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                  <Search
                    size={18}
                    className="absolute left-3 top-2.5 text-gray-400"
                  />
                </div>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full md:w-40">
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Status</SelectItem>
                    <SelectItem value="Approved">Approved</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {activeSubSection === "newproject" ? (
                <ProjectDetails />
           
            ) : loading ? (
              <div className="flex justify-center items-center h-60">
                <div className="animate-spin rounded-full h-10 w-10 border-t-4 border-blue-500 border-solid"></div>
              </div>
            ) :(
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="relative p-4 shadow-lg rounded-lg bg-white dark:bg-gray-800"
                  >
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {project.name}
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                      Domain: {project.domain}
                    </p>
                    <div className="flex items-center mb-1">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        statusStyles[project.status] || "bg-gray-400"
                      } text-white`}
                    >
                      {project.status}
                    </span>
                    </div>

                    {/* Edit Icon */}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => handleEditClick(project)}
                          className="absolute top-2 right-2 text-gray-500 hover:text-blue-600"
                        >
                          <Pencil size={18} />
                        </button>
                      </AlertDialogTrigger>
                      {selectedProject?.id === project.id && (
                        <div className="dark:bg-gray-800 ">
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Edit Domain</AlertDialogTitle>
                            <AlertDialogDescription>
                              You can update the domain for{" "}
                              <strong>{selectedProject.name}</strong>.
                            </AlertDialogDescription>
                          </AlertDialogHeader>

                          <div className="mt-4 space-y-2">
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <strong>Project Name:</strong>{" "}
                              {selectedProject.name}
                            </div>

                            <Select
                              value={newDomain}
                              onValueChange={handleDomainChange}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select a domain" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Artificial Intelligence">
                                  Artificial Intelligence
                                </SelectItem>
                                <SelectItem value="Web Development">
                                  Web Development
                                </SelectItem>
                                <SelectItem value="Blockchain">
                                  Blockchain
                                </SelectItem>
                                <SelectItem value="Full Stack">
                                  Full Stack
                                </SelectItem>
                                <SelectItem value="Data Science">
                                  Data Science
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={handleSave}>
                              Save
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                        </div>
                      )}
                    </AlertDialog>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
{/* Dashboard Content - Reports Section */}
{activeSection === "reports" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                {activeSubSection === "open"
                  ? "Open Tickets"
                  : activeSubSection === "closed"
                  ? "Closed Tickets"
                  : activeSubSection === "report"
                  ? "Report Issue"
                  : ""}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => changeSection("reports", "report")}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Report Issue
                </button>
                <button
                  onClick={() => changeSection("reports", "open")}
                  className={`px-4 py-2 rounded ${
                    activeSubSection === "open"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Open
                </button>
                <button
                  onClick={() => changeSection("reports", "closed")}
                  className={`px-4 py-2 rounded ${
                    activeSubSection === "closed"
                      ? "bg-gray-600 text-white"
                      : "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Closed
                </button>
              </div>
            </div>
            {/* Main Content Section */}

            {activeSubSection === "report" ? (
              <ReportIssue />
            ) : (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Reported On
                      </th>
                     
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredTickets.map((ticket) => (
                      <tr key={ticket.report_id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          #{ticket.report_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          {ticket.title}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                          {new Date(ticket.created_at).toISOString().split('T')[0]}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="flex items-center">
                            <span
                              className={`w-2 h-2 mr-2 rounded-full ${
                                statusStyles[ticket.report_status]
                              }`}
                            ></span>
                            <span className="text-sm text-gray-700 dark:text-gray-300">
                              {ticket.report_status}
                            </span>
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Dashboard Content - Payments Section */}
        {activeSection === "payments" && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold">
                {activeSubSection === "past"
                  ? "Past Payments"
                  : "Pending Payments"}
              </h2>
              <div className="flex space-x-4">
                <button
                  onClick={() => changeSection("payments", "past")}
                  className={`px-4 py-2 rounded ${
                    activeSubSection === "past"
                      ? "bg-green-600 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Completed
                </button>
                <button
                  onClick={() => changeSection("payments", "pending")}
                  className={`px-4 py-2 rounded ${
                    activeSubSection === "pending"
                      ? "bg-yellow-500 text-white"
                      : "bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-300"
                  }`}
                >
                  Pending
                </button>
              </div>
            </div>

            {/* Payments Table */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Project
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        #{payment.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {payment.project}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        ${payment.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {payment.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="flex items-center">
                          <span
                            className={`w-2 h-2 mr-2 rounded-full ${
                              statusStyles[payment.status]
                            }`}
                          ></span>
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {payment.status}
                          </span>
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
