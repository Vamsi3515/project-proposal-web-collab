"use client"; // This is a client component
import { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  ChevronLeft,
  Grid,
  BarChart2,
  CreditCard,
  Search,
  Bell,
  User,
  Menu,
  X,
  Check,
  AlertCircle,
  RefreshCw,
  LogOutIcon,
  Filter,
} from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import axios from "axios";
import { toast } from "react-toastify";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

// Main Dashboard Component

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [projectStatusFilter, setProjectStatusFilter] = useState("");
  const [reportStatusFilter, setReportStatusFilter] = useState("");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [dateFilterType, setDateFilterType] = useState("delivery");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [refundAmount, setRefundAmount] = useState("");

  const local_uri = "http://localhost:8000";
  const router = useRouter();

  const handleSectionChange = (section) => {
    resetFilters(); // This uses your existing resetFilters function
    setActiveSection(section);
  };

  // Fetch data when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      fetchProjects();
      fetchPayments();
      fetchReports();

      const storedProjects = localStorage.getItem("projects");
      const storedReports = localStorage.getItem("reports");
      const storedPayments = localStorage.getItem("payments");

      if (storedProjects && storedReports && storedPayments) {
        setProjects(JSON.parse(storedProjects));
        setReports(JSON.parse(storedReports));
        setPayments(JSON.parse(storedPayments));
        setIsLoading(false);
      } else {
        try {
          await Promise.all([fetchProjects(), fetchReports(), fetchPayments()]);
        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, []);
  // Helper function to check if a date is in range
  const isDateInRange = (projectDate, dateType = "delivery") => {
    if (!startDate && !endDate) return true;
  
    const date = new Date(projectDate);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
  
    if (start && end) {
      return date >= start && date <= end;
    } else if (start) {
      return date >= start;
    } else if (end) {
      return date <= end;
    }
    return true;
  };
  
  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    router.push("/admin/login");
  };

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${local_uri}/api/admin/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setProjects(response.data);
      localStorage.setItem("projects", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${local_uri}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(response.data);
      localStorage.setItem("reports", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const fetchPayments = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${local_uri}/api/admin/payments`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setPayments(response.data);
      localStorage.setItem("payments", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching payments:", error);
    }
  };

  // Simulate a refund request
  const handleRefund = async () => {
    if (!selectedPayment) return;

    setIsLoading(true);

    // Simulate API call for refund
    setTimeout(() => {
      const updatedPayments = payments.map((payment) =>
        payment.payment_id === selectedPayment.id
          ? { ...payment, status: "Refunded", refundable: false }
          : payment
      );

      setPayments(updatedPayments);
      setShowRefundModal(false);
      setSelectedPayment(null);
      setIsLoading(false);
    }, 2000);
  };

  // Enhanced filtering logic for projects
  const filteredProjects = projects.filter((project) => {
    // First apply the search query to multiple fields
    const searchMatches =
      searchQuery === "" ||
      (project.project_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (project.domain || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      String(project.project_id || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (project.student_name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (project.student_email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (project.student_id || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (project.student_phone || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    // Then apply the status filters
    const projectStatusMatches =
      projectStatusFilter === "" ||
      (project.project_status || "").toLowerCase() ===
        projectStatusFilter.toLowerCase();

    const paymentStatusMatches =
      paymentStatusFilter === "" ||
      (project.payment_status || "").toLowerCase() ===
        paymentStatusFilter.toLowerCase();

        const dateMatches = (!startDate && !endDate) || isDateInRange(
          dateFilterType === "delivery" ? project.delivery_date : project.created_at,
          dateFilterType
        );
    // Return true only if all conditions are met
    return searchMatches && projectStatusMatches && paymentStatusMatches && dateMatches;
  });

      const projectStatuses = [
        ...new Set(projects.map((p) => p.project_status).filter(Boolean)),
      ];
      const paymentStatuses = [
        ...new Set(projects.map((p) => p.payment_status).filter(Boolean)),
      ];

      const reportStatuses = [
        ...new Set(reports.map((r) => r.report_status).filter(Boolean)),
      ];

  const filteredReports = reports.filter((report) => {
    const searchMatches =
      searchQuery === "" ||
      (report.title || "").toLowerCase().includes(searchQuery.toLowerCase());

    const statusMatches =
      reportStatusFilter === "" ||
      (report.report_status || "").toLowerCase() ===
        reportStatusFilter.toLowerCase();

    return searchMatches && statusMatches;
  });

  const filteredPayments = payments.filter(
    (payment) =>
      (payment.user_email || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      (String(payment.payment_id) || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase())
  );

  // Handle section selection
  const renderContent = () => {
    switch (activeSection) {
      case "dashboard":
        return (
          <DashboardContent
            isLoading={isLoading}
            projects={projects}
            reports={reports}
            payments={payments}
            setActiveSection={setActiveSection}
          />
        );
      case "projects":
        return (
          <ProjectsContent
            isLoading={isLoading}
            projects={filteredProjects}
            setActiveSection={setActiveSection}
            setProjects={setProjects}
          />
        );
      case "reports":
        return (
          <ReportsContent
            isLoading={isLoading}
            reports={filteredReports}
            setActiveSection={setActiveSection}
            setReports={setReports}
          />
        );
      case "payments":
        return (
          <PaymentsContent
            isLoading={isLoading}
            payments={filteredPayments}
            setRefundAmount={setRefundAmount}
            onRefundRequest={(payment) => {
              setSelectedPayment(payment);
              setShowRefundModal(true);
            }
          }
          />
        );
      default:
        return (
          <DashboardContent
            isLoading={isLoading}
            projects={projects}
            reports={reports}
            payments={payments}
          />
        );
    }
  };

  // Reset filters function
  const resetFilters = () => {
    setSearchQuery("");
    setProjectStatusFilter("");
    setReportStatusFilter("");
    setPaymentStatusFilter("");
    setStartDate("");
setEndDate("");
setDateFilterType("delivery");
  };

  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-gray-900 text-white transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between">
          {sidebarOpen && <h1 className="text-xl font-bold">Admin Panel</h1>}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded hover:bg-gray-800"
          >
            {sidebarOpen ? <ChevronLeft size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="mt-6 flex-1">
          <NavItem
            icon={<Grid size={20} />}
            label="Dashboard"
            isActive={activeSection === "dashboard"}
            onClick={() => handleSectionChange("dashboard")}
            showLabel={sidebarOpen}
          />
          <NavItem
            icon={<ChevronRight size={20} />}
            label="Projects"
            isActive={activeSection === "projects"}
            onClick={() => handleSectionChange("projects")}
            showLabel={sidebarOpen}
          />
          <NavItem
            icon={<BarChart2 size={20} />}
            label="Reports"
            isActive={activeSection === "reports"}
            onClick={() => handleSectionChange("reports")}
            showLabel={sidebarOpen}
          />
          <NavItem
            icon={<CreditCard size={20} />}
            label="Payments"
            isActive={activeSection === "payments"}
            onClick={() => handleSectionChange("payments")}
            showLabel={sidebarOpen}
          />
        </nav>

        <div className="p-4 border-t border-gray-800">
          {sidebarOpen ? (
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User size={16} />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">Admin User</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center">
                <User size={16} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="bg-white shadow-sm z-10 dark:bg-gray-800 text-black">
          <div className="px-4 py-3 flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
            {/* Title */}
            <h2 className="text-lg text-black font-medium dark:text-white">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>

            {/* Controls */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4 space-y-4 sm:space-y-0">
              <ThemeToggle />

              {/* Search and filter section */}
              <div className="relative flex items-center w-full sm:w-auto">
                <input
                  type="text"
                  placeholder="Search projects, students, IDs..."
                  className="w-full sm:w-64 pl-10 pr-4 py-2 rounded-lg border text-black dark:text-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search
                  size={18}
                  className="absolute left-3 top-2.5 text-gray-400"
                />

                {/* Filter button */}
                <button
                  className={`ml-2 p-2 rounded-lg text-black border border-gray-300 dark:text-white  dark:hover:bg-black ${showFilters}`}
                  onClick={() => setShowFilters(!showFilters)}
                >
                  <Filter size={18} />
                </button>

                {/* Clear filters */}
                {(searchQuery ||
                  projectStatusFilter ||
                  paymentStatusFilter) && (
                  <button
                    className="ml-2 p-2 rounded-lg text-red-500 border dark:text-white border-gray-300 hover:bg-gray-100 dark:hover:bg-black"
                    onClick={resetFilters}
                    title="Clear filters"
                  >
                    <X size={18} />
                  </button>
                )}
              </div>

              {/* Logout Button */}
              <Button
                onClick={handleLogout}
                className="cursor-pointer flex items-center gap-2"
              >
                <LogOutIcon /> Logout
              </Button>
            </div>
          </div>

          {/* Filters for projects */}
          {showFilters && activeSection === "projects" && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Project Status:
                </label>
                <select
                  className="p-2 border border-gray-300 rounded-md text-sm text-black"
                  value={projectStatusFilter}
                  onChange={(e) => setProjectStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {projectStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Payment Status:
                </label>
                <select
                  className="p-2 border border-gray-300 rounded-md text-sm text-black"
                  value={paymentStatusFilter}
                  onChange={(e) => setPaymentStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {paymentStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center flex-wrap gap-2">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">Filter By:</label>
                <select
                  className="p-2 border border-gray-300 rounded-md text-sm text-black"
                  value={dateFilterType}
                  onChange={(e) => setDateFilterType(e.target.value)}
                >
                  <option value="delivery">Delivery Date</option>
                  <option value="created">Creation Date</option>
                </select>
              </div>
              
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">From:</label>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded-md text-sm text-black"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">To:</label>
                <input
                  type="date"
                  className="p-2 border border-gray-300 rounded-md text-sm text-black"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
            </div>

          )}
          {/*Reports Filter*/}
          {showFilters && activeSection === "reports" && (
            <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex flex-col sm:flex-row gap-4">
              <div className="flex items-center">
                <label className="mr-2 text-sm font-medium text-gray-700">
                  Report Status:
                </label>
                <select
                  className="p-2 border border-gray-300 rounded-md text-sm text-black"
                  value={reportStatusFilter}
                  onChange={(e) => setReportStatusFilter(e.target.value)}
                >
                  <option value="">All</option>
                  {reportStatuses.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">{renderContent()}</main>
      </div>

      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-gray-200 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 dark:text-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Process Refund</h3>
              <button
                onClick={() => setShowRefundModal(false)}
                className="text-gray-500 dark:text-gray-200 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6">
              <p className="mb-4">
                Are you sure you want to process a refund for the following
                payment?
              </p>
              {selectedPayment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p>
                    <span className="font-medium">ID:</span>{" "}
                    {selectedPayment.payment_id}
                  </p>
                  <p>
                    <span className="font-medium">Client:</span>{" "}
                    {selectedPayment.student_name}
                  </p>
                  <p>
                    <span className="font-medium">Project ID:</span>{" "}
                    {selectedPayment.project_code}
                  </p>
                  <p>
                    <span className="font-medium">Amount:</span> ₹
                    {refundAmount}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{" "}
                    {new Date(selectedPayment.created_at).toLocaleDateString(
                      "en-GB"
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleRefund}
                className="px-4 py-2 bg-red-600 border border-transparent rounded-md text-sm font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <RefreshCw size={16} className="animate-spin mr-2" />
                    Processing...
                  </div>
                ) : (
                  "Process Refund"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
// Navigation Item Component
const NavItem = ({ icon, label, isActive, onClick, showLabel }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center px-4 py-3 ${
        isActive ? "bg-blue-600" : "hover:bg-gray-800"
      }`}
    >
      <div className={`${showLabel ? "mr-3" : "mx-auto"}`}>{icon}</div>
      {showLabel && <span>{label}</span>}
    </button>
  );
};

// Dashboard Content Component
const DashboardContent = ({
  isLoading,
  projects,
  reports,
  payments,
  setActiveSection,
}) => {
  const recentProjects = projects.slice(0, 3);
  const recentReports = reports.slice(0, 3);
  const recentPayments = payments.slice(0, 3);

  // Calculate summary stats
  const projectsRejected = projects.filter(
    (p) => p.project_status === "rejected"
  ).length;

  const totalPayments = projects.reduce(
    (sum, payment) => sum + Number(payment.total_amount || 0),
    0
  );
  const paidPayments = payments.reduce(
    (sum, payment) => sum + Number(payment.paid_amount || 0),
    0
  );
  const refundedPayments = payments.filter(
    (p) => p.status === "refunded"
  ).length;
  const reportsClosed = reports.filter(
    (r) => r.report_status === "closed"
  ).length;
  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [existingFile, setExistingFile] = useState(null);
  const local_uri = "http://localhost:8000";
  const [newDomain, setNewDomain] = useState("");
  const [newFile, setNewFile] = useState(null);
  const [editDomainId, setEditDomainId] = useState(null);
  const [editedDomainName, setEditedDomainName] = useState("");
  const [editedFile, setEditedFile] = useState(null);
  const [editDomain, setEditDomain] = useState(null);
  const [editName, setEditName] = useState("");
  const [editFile, setEditFile] = useState(null);

  //fetch domains
  useEffect(() => {
    axios
      .get(`${local_uri}/api/admin/domains`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      })
      .then((res) => setDomains(res.data.domains))
      .catch((err) => console.error("Error fetching domains", err));
  }, []);

  const handleUpdateDomain = async (domainId) => {
    const formData = new FormData();
    formData.append("domainName", editedDomainName);
    if (editedFile) formData.append("file", editedFile);

    try {
      await axios.post(
        `${local_uri}/api/admin/domains/update/${domainId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Domain updated successfully");
      setEditDomainId(null);
      setEditedDomainName("");
      setEditedFile(null);
      const res = await axios.get(`${local_uri}/api/admin/domains`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setDomains(res.data.domains);
    } catch (err) {
      console.error("Update failed", err);
      alert("Failed to update domain");
    }
  };

  // Upload + add new domain
  const handleNewDomainUpload = async () => {
    if (!newDomain || !newFile) {
      alert("Please enter domain name and select a file");
      return;
    }

    const formData = new FormData();
    formData.append("domainName", newDomain);
    formData.append("pdf", newFile);

    try {
      await axios.post(`${local_uri}/api/admin/domains`, formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      alert("New domain and PDF uploaded!");
      setNewFile(null);
      setNewDomain("");
      const res = await axios.get(`${local_uri}/api/admin/domains`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setDomains(res.data.domains);
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    }
  };

  const handleDeleteDomain = async (domainId) => {
    if (!window.confirm("Are you sure you want to delete this domain?")) return;

    try {
      await axios.post(
        `${local_uri}/api/admin/domains/delete/${domainId}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }
      );
      alert("Domain deleted.");
      const res = await axios.get(`${local_uri}/api/admin/domains`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setDomains(res.data.domains);
    } catch (error) {
      console.error("Delete failed", error);
      alert("Failed to delete domain.");
    }
  };

  const handleEditClick = (domain) => {
    setEditDomain(domain);
    setEditName(domain.domain_name);
    setEditFile(null); // reset file input
  };

  const handleEditSubmit = async () => {
    const formData = new FormData();
    formData.append("domainName", editName);
    if (editFile) formData.append("pdf", editFile);

    try {
      await axios.post(
        `${local_uri}/api/admin/domains/update/${editDomain.domain_id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      alert("Domain updated successfully.");
      setEditDomain(null);
      const res = await axios.get(`${local_uri}/api/admin/domains`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
      });
      setDomains(res.data.domains);
    } catch (error) {
      console.error("Update failed", error);
      alert("Failed to update domain.");
    }
  };

  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Projects"
          value={projects.length}
          subtitle={`${projectsRejected} rejected`}
        />
        <StatCard
          title="Total Reports"
          value={reports.length}
          subtitle={`${reportsClosed} closed`}
        />
        <StatCard
          title="Payment Volume"
          value={`₹${paidPayments.toFixed(2)}`}
          subtitle={`of total ₹${totalPayments.toFixed(2)}`}
        />
        <StatCard
          title="Refunds"
          value={refundedPayments}
          subtitle={`${(
            (refundedPayments / (payments.length || 1)) *
            100
          ).toFixed(1)}%`}
        />
      </div>

      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Projects</h3>
          <button
            className="text-sm text-blue-600 hover:text-blue-800"
            onClick={() => setActiveSection("projects")}
          >
            View All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Domain
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-800">
              {recentProjects.map((project) => (
                <tr key={project.project_id}>
                  <td className="px-6 py-4 whitespace-nowrap ">
                    {project.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={project.project_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.domain}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {project.delivery_date
                      ? new Date(project.delivery_date).toLocaleDateString()
                      : "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Reports */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Reports</h3>
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setActiveSection("reports")}
            >
              View All
            </button>
          </div>

          <ul className="space-y-4">
            {recentReports.map((report, index) => (
              <li
                key={report.report_id || index}
                className="flex items-center p-3 rounded-lg transition-colors 
                 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                  <BarChart2
                    size={16}
                    className="text-blue-600 dark:text-blue-300"
                  />
                </div>

                {/* Report Info */}
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-300 dark:hover:text-gray-100">
                    {report.title}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(report.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>

                {/* Status */}
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 dark:hover:text-gray-100">
                  {report.report_status}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Payments</h3>
            <button
              className="text-sm text-blue-600 hover:text-blue-800"
              onClick={() => setActiveSection("payments")}
            >
              View All
            </button>
          </div>
          <ul className="space-y-4">
            {recentPayments.map((payment, index) => (
              <li
                key={payment.payment_id || index}
                className="flex items-center p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-black dark:hover:text-white transition-colors"
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                  <CreditCard
                    size={16}
                    className="text-green-600 dark:text-green-300"
                  />
                </div>

                {/* Project Info */}
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {payment.project_code}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(payment.created_at).toLocaleDateString("en-GB")}
                  </p>
                </div>

                {/* Amount + Status */}
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                    ₹{Number(payment.total_amount || 0).toFixed(2)}
                  </p>
                  <PaymentStatusBadge status={payment.payment_status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Upload Domain PDF Section */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium mb-6 text-center">
          Upload Domain PDF
        </h3>

        {/* Centered Add New Domain Block */}
        <div className="flex justify-center mb-10">
          <div className="w-full max-w-md border border-gray-200 dark:border-gray-700 rounded-lg p-6">
            <h4 className="text-md font-semibold mb-4 text-center">
              Add New Domain and Upload PDF
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  New Domain Name
                </label>
                <input
                  type="text"
                  placeholder="Enter domain name"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Upload PDF
                </label>
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => setNewFile(e.target.files[0])}
                  className="w-full"
                />
              </div>

              <button
                onClick={handleNewDomainUpload}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
              >
                Add Domain & Upload
              </button>
            </div>
          </div>
        </div>

        {/* Edit Section */}
        {editDomain && (
          <div className="bg-gray-100 dark:bg-gray-700 p-4 mt-6 rounded-lg max-w-xl mx-auto">
            <h4 className="font-semibold mb-2">
              Edit Domain: {editDomain.domain_name}
            </h4>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full mb-2 p-2 border border-gray-300 rounded"
            />
            <input
              type="file"
              accept="application/pdf"
              onChange={(e) => setEditFile(e.target.files[0])}
              className="w-full mb-2"
            />
            <div className="flex gap-2">
              <button
                onClick={handleEditSubmit}
                className="bg-blue-600 text-white px-4 py-1 rounded"
              >
                Save
              </button>
              <button
                onClick={() => setEditDomain(null)}
                className="bg-gray-400 text-white px-4 py-1 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Domain Cards List */}
        {domains.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">Manage Domains</h3>
            <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {domains.map((domain) => (
                <div
                  key={domain.domain_id}
                  className="border rounded p-4 dark:border-gray-700 shadow-sm flex flex-col justify-between"
                >
                  <div>
                    <p className="font-medium text-lg">{domain.domain_name}</p>
                    <a
                      href={`${local_uri}${domain.pdf_url}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm"
                    >
                      View PDF
                    </a>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => handleEditClick(domain)}
                      className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600 text-sm"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteDomain(domain.domain_id)}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

import {
  ProjectViewModal,
  ProjectApprovalModal,
  ProjectRejectionModal,
  DeleteConfirmationModal,
  ReportViewModal,
  CloseReportModal,
  DeleteReportModal,
  RefundDialog,
} from "./AdminDashboardModals";

// // Loading State Component
// const LoadingState = () => (
//   <div className="p-8 text-center">
//     <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
//     <p className="mt-2 text-gray-600">Loading reports...</p>
//   </div>
// );

// Status Badge Component
// const StatusBadge = ({ status }) => {
//   const getStatusClass = (status) => {
//     switch (status.toLowerCase()) {
//       case 'open':
//         return 'bg-green-100 text-green-800';
//       case 'closed':
//         return 'bg-gray-100 text-gray-800';
//       case 'pending':
//         return 'bg-yellow-100 text-yellow-800';
//       case 'urgent':
//         return 'bg-red-100 text-red-800';
//       default:
//         return 'bg-blue-100 text-blue-800';
//     }
//   };

const ProjectsContent = ({
  isLoading,
  projects,
  setActiveSection,
  setProjects,
}) => {
  const [selectedProject, setSelectedProject] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showApprovalModal, setShowApprovalModal] = useState(false);
  const [showRejectionModal, setShowRejectionModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  const local_uri = "http://localhost:8000";

  const fetchProjects = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${local_uri}/api/admin/projects`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const parsedProjects = response.data.map((project) => {
        try {
          return {
            ...project,
            college:
              typeof project.college === "string"
                ? JSON.parse(project.college)
                : project.college,
          };
        } catch (e) {
          return {
            ...project,
            college: { name: null, branch: null, domain: null },
          };
        }
      });

      setProjects(parsedProjects);
      localStorage.setItem("projects", JSON.stringify(parsedProjects));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleApprove = async (projectId, price) => {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${local_uri}/api/admin/projects/approve/${projectId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId, price }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Project approved successfully and mail sent!");
        fetchProjects();
      } else {
        toast.error("Something went wrong");
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Approval failed: " + err.message);
    }
  };

  const handleReject = async (projectId, reason) => {
    const token = localStorage.getItem("adminToken");

    try {
      const res = await fetch(
        `${local_uri}/api/admin/projects/reject/${projectId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ projectId, reason }),
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Project rejected and mail sent!");
        fetchProjects();
      } else {
        toast.error("Failed to Reject Project");
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Failed to Reject Project");
      console.log("Rejection failed: " + err.message);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (
      selectedProject &&
      selectedProject.payment_status !== "pending" &&
      selectedProject.payment_status !== "refunded"
    ) {
      toast.error("Cannot delete. Make a refund first to enable deletion.");
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.delete(
        `${local_uri}/api/admin/projects/delete/${projectId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      toast.success(res.data.message || "Project deleted successfully!");
      fetchProjects();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error deleting project";
      toast.error(errorMsg);
    }
  };

  const handleProjectUpdate = (updatedProject) => {
    // Update the project in the local state
    const updatedProjects = projects.map((p) =>
      p.project_id === updatedProject.project_id ? updatedProject : p
    );
    setProjects(updatedProjects);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "approved":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPaymentStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "success":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "failed":
        return "bg-red-100 text-red-800";
      case "refunded":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  fetchProjects();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg text-black font-medium">Project Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects && projects.length > 0 ? (
              projects.map((project) => (
                <tr key={project.project_id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                    {project.project_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {project.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                        project.project_status
                      )}`}
                    >
                      {project.project_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(project.delivery_date)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPaymentStatusBadgeClass(
                        project.payment_status
                      )}`}
                    >
                      {project.payment_status || "N/A"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowViewModal(true);
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        View
                      </button>
                      {project.project_status === "pending" && (
                        <>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowApprovalModal(true);
                            }}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              setSelectedProject(project);
                              setShowRejectionModal(true);
                            }}
                            className="text-yellow-600 hover:text-yellow-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => {
                          setSelectedProject(project);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {selectedProject && showViewModal && (
        <ProjectViewModal
          project={selectedProject}
          onClose={() => setShowViewModal(false)}
          onUpdate={handleProjectUpdate}
        />
      )}

      {selectedProject && showApprovalModal && (
        <ProjectApprovalModal
          project={selectedProject}
          onClose={() => setShowApprovalModal(false)}
          onApprove={handleApprove}
        />
      )}

      {selectedProject && showRejectionModal && (
        <ProjectRejectionModal
          project={selectedProject}
          onClose={() => setShowRejectionModal(false)}
          onReject={handleReject}
        />
      )}

      {selectedProject && showDeleteModal && (
        <DeleteConfirmationModal
          item={selectedProject}
          itemType="project"
          onClose={() => setShowDeleteModal(false)}
          onDelete={handleDeleteProject}
          warning={
            selectedProject.payment_status !== "pending" &&
            selectedProject.payment_status !== "refunded"
              ? "This project has an active payment. Please refund the payment before deleting."
              : null
          }
        />
      )}
    </div>
  );
};

// Reports Content Component

// Main ReportsContent Component
const ReportsContent = ({
  isLoading,
  reports,
  setActiveSection,
  setReports,
}) => {
  const [selectedReport, setSelectedReport] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  if (isLoading) {
    return <LoadingState />;
  }

  const local_uri = "http://localhost:8000";

  const fetchReports = async () => {
    try {
      const token = localStorage.getItem("adminToken");
      const response = await axios.get(`${local_uri}/api/admin/reports`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setReports(response.data);
      localStorage.setItem("reports", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching reports:", error);
    }
  };

  const handleCloseReport = async (reportId) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(
        `${local_uri}/api/admin/reports/close/${reportId}`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        toast.success("Report closed successfully.");
        fetchReports();
      } else {
        toast.error("Failed to Close Report");
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Failed to Close Report");
      console.log("Close failed: " + err.message);
    }
  };

  const handleDeleteReport = async (reportId) => {
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${local_uri}/api/admin/reports/${reportId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (res.ok) {
        toast.success("Report deleted successfully.");
        fetchReports();
      } else {
        toast.error("Failed to Delete Report");
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Failed to Delete Report");
      console.log("Delete failed: " + err.message);
    }
  };

  const handleReportReply = async (reportId, note) => {
    try {
      const token = localStorage.getItem("adminToken");
      await axios.post(
        `${local_uri}/api/admin/reports/${reportId}/note`,
        { note },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports((rs) =>
        rs.map((r) =>
          r.report_id === reportId ? { ...r, report_note: note } : r
        )
      );
      console.log("Reply saved");
    } catch (err) {
      console.error(err);
      toast.error("Failed to save reply");
    }
  };

  fetchReports();

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg text-black font-medium">Report Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Report Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Generated Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports && reports.length > 0 ? (
              reports.map((report, index) => (
                <tr
                  key={report.report_id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.report_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {report.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(report.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={report.report_status || "No Status"} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      className="text-indigo-600 hover:text-indigo-900 mr-3"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowViewModal(true);
                      }}
                    >
                      View
                    </button>
                    {report.report_status === "open" && (
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => {
                          setSelectedReport(report);
                          setShowCloseModal(true);
                        }}
                      >
                        Close
                      </button>
                    )}
                    <button
                      className="text-red-600 hover:text-red-900"
                      onClick={() => {
                        setSelectedReport(report);
                        setShowDeleteModal(true);
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="6"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modals */}
      {selectedReport && showViewModal && (
        <ReportViewModal
          report={selectedReport}
          onClose={() => setShowViewModal(false)}
          onReply={handleReportReply}
        />
      )}

      {selectedReport && showCloseModal && (
        <CloseReportModal
          report={selectedReport}
          onClose={() => setShowCloseModal(false)}
          onConfirm={handleCloseReport}
        />
      )}

      {selectedReport && showDeleteModal && (
        <DeleteReportModal
          report={selectedReport}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteReport}
        />
      )}
    </div>
  );
};

// Payments Content Component

const PaymentsContent = ({
  isLoading,
  payments,
  setRefundAmount,
  onRefundRequest,
  onConfirmRefund,
}) => {
  const [refundDialogOpen, setRefundDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);

  const handleRefundClick = (payment) => {
    setSelectedPayment(payment);
    setRefundDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setRefundDialogOpen(false);
    setSelectedPayment(null);
  };

  const handleConfirmRefund = (payment, refundAmount) => {
    setRefundAmount(refundAmount);
    if (onConfirmRefund) {
      onConfirmRefund(payment);
    } else if (onRefundRequest) {
      onRefundRequest(payment);
    }
    setRefundDialogOpen(false);
    setSelectedPayment(null);
  };

  if (isLoading) {
    return <LoadingState />;
  }

  console.log("Payments:", payments);

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-black">Payment Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Payment ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project ID
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Project Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Paid Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pending Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Refund Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr
                  key={payment.payment_id || payment.order_id || index}
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {payment.payment_id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.project_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {payment.project_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {isNaN(payment.total_amount)
                      ? "0.00"
                      : Number(payment.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {isNaN(payment.paid_amount)
                      ? "0.00"
                      : Number(payment.paid_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={payment.payment_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {isNaN(payment.pending_amount)
                      ? "0.00"
                      : Number(payment.pending_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹
                    {isNaN(payment.refund_amt)
                      ? "0.00"
                      : Number(payment.refund_amt).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(payment.created_at).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {
                      <button
                        className="text-red-600 hover:text-red-900"
                        onClick={() => handleRefundClick(payment)}
                      >
                        Refund
                      </button>
                    }
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="10"
                  className="px-6 py-4 text-center text-sm text-gray-500"
                >
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Refund Dialog */}
      <RefundDialog
        isOpen={refundDialogOpen}
        payment={selectedPayment}
        onClose={handleCloseDialog}
        onConfirmRefund={handleConfirmRefund}
      />
    </div>
  );
};

// Loading State Component
const LoadingState = () => {
  return (
    <div className="flex flex-col items-center justify-center h-64">
      <RefreshCw size={40} className="text-blue-500 animate-spin mb-4" />
      <p className="text-gray-500 text-lg">Loading data...</p>
    </div>
  );
};

// Status Badge Component
const StatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";

  switch (status) {
    case "approved":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      break;
    case "completed":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "open":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      break;
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "partially_paid":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "closed":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    case "rejected":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      break;
    default:
      break;
  }

  return (
    <span
      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {status}
    </span>
  );
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
  let bgColor = "bg-gray-100";
  let textColor = "text-gray-800";
  let icon = null;

  switch (status) {
    case "paid":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = <Check size={12} className="mr-1" />;
      break;
    case "success":
      bgColor = "bg-green-100";
      textColor = "text-green-800";
      icon = <Check size={12} className="mr-1" />;
      break;
    case "partially_paid":
      bgColor = "bg-blue-100";
      textColor = "text-blue-800";
      icon = <RefreshCw size={12} className="mr-1 animate-spin" />;
      break;
    case "pending":
      bgColor = "bg-yellow-100";
      textColor = "text-yellow-800";
      break;
    case "refunded":
      bgColor = "bg-orange-100";
      textColor = "text-orange-800";
      icon = <AlertCircle size={12} className="mr-1" />;
      break;
    case "failed":
      bgColor = "bg-red-100";
      textColor = "text-red-800";
      icon = <AlertCircle size={12} className="mr-1" />;
      break;
    default:
      break;
  }

  return (
    <span
      className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}
    >
      {icon}
      {status}
    </span>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle }) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h4 className="text-sm font-medium text-gray-500 mb-1">{title}</h4>
      <div className="flex items-end">
        <p className="text-2xl font-semibold">{value}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 ml-2 mb-1">{subtitle}</p>
        )}
      </div>
    </div>
  );
};