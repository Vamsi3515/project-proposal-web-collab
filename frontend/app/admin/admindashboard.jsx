"use client"; // This is a client component
import { useState, useEffect } from 'react';
import { ChevronDown, ChevronRight, ChevronLeft, Grid, BarChart2, CreditCard, Search, Bell, User, Menu, X, Check, AlertCircle, RefreshCw, LogOutIcon } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';
import axios from 'axios';
import { toast } from 'react-toastify';
import { Button } from '@/components/ui/button';
import { useRouter } from "next/navigation";

// Main Dashboard Component
export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState([]);
  const [reports, setReports] = useState([]);
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState(null);
  const local_uri = "http://localhost:8000";
  const router = useRouter();

  // Fetch data when component mounts
  useEffect(() => {

    const fetchData = async () => {
      setIsLoading(true);
  
      const storedProjects = localStorage.getItem('projects');
      const storedReports = localStorage.getItem('reports');
      const storedPayments = localStorage.getItem('payments');
  
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
      const updatedPayments = payments.map(payment => 
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

  const filteredProjects = projects.filter(project => {
    console.log("Filtered project:", project);
    return (project.project_name || "").toLowerCase().includes(searchQuery.toLowerCase());
  });
  console.log("Filtered Projects:", filteredProjects);
  
  
  const filteredReports = reports.filter(report => 
    (report.title || "").toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const filteredPayments = payments.filter(payment => 
    (payment.user_email || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    (String(payment.payment_id) || "").toLowerCase().includes(searchQuery.toLowerCase())
  );  

  // Handle section selection
  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardContent isLoading={isLoading} projects={projects} reports={reports} payments={payments} setActiveSection={setActiveSection} />;
      case 'projects':
        return <ProjectsContent isLoading={isLoading} projects={filteredProjects} setActiveSection={setActiveSection} setProjects={setProjects} />;
      case 'reports':
        return <ReportsContent isLoading={isLoading} reports={filteredReports} setActiveSection={setActiveSection} setReports={setReports} />;
      case 'payments':
        return <PaymentsContent 
          isLoading={isLoading} 
          payments={filteredPayments} 
          onRefundRequest={(payment) => {
            setSelectedPayment(payment);
            setShowRefundModal(true);
          }} 
        />;
      default:
        return <DashboardContent isLoading={isLoading} projects={projects} reports={reports} payments={payments} />;
    }
  };
  
  return (
    <div className="flex h-screen w-full bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
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
            isActive={activeSection === 'dashboard'} 
            onClick={() => setActiveSection('dashboard')} 
            showLabel={sidebarOpen}
          />
          <NavItem 
            icon={<ChevronRight size={20} />} 
            label="Projects" 
            isActive={activeSection === 'projects'} 
            onClick={() => setActiveSection('projects')} 
            showLabel={sidebarOpen}
          />
          <NavItem 
            icon={<BarChart2 size={20} />} 
            label="Reports" 
            isActive={activeSection === 'reports'} 
            onClick={() => setActiveSection('reports')} 
            showLabel={sidebarOpen}
          />
          <NavItem 
            icon={<CreditCard size={20} />} 
            label="Payments" 
            isActive={activeSection === 'payments'} 
            onClick={() => setActiveSection('payments')} 
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
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <h2 className="text-lg text-black font-medium">
              {activeSection.charAt(0).toUpperCase() + activeSection.slice(1)}
            </h2>
           
            <div className="flex items-center space-x-4">
               {/* <div className="right-20"> <ThemeToggle /> </div> */}
              {/* Search */}
              <div className="relative">
              
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-64 pl-10 pr-4 py-2 rounded-lg border text-black border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search size={18} className="absolute left-3 top-2.5 text-gray-400" />
              </div>
              
                    
              
              {/* Notifications */}
              <button className="p-2 rounded-full text-black hover:bg-gray-100">
                <Bell size={20} />
              </button>
             
              <Button onClick={handleLogout} className="cursor-pointer"><LogOutIcon/>Logout</Button>

              {/* Profile */}
              {/* <button className="p-2 rounded-full hover:bg-gray-100">
                <User size={20} />
              </button> */}
             
            </div>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
      
      {/* Refund Modal */}
      {showRefundModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
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
              <p className="mb-4">Are you sure you want to process a refund for the following payment?</p>
              {selectedPayment && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p><span className="font-medium">ID:</span> {selectedPayment.id}</p>
                  <p><span className="font-medium">Client:</span> {selectedPayment.client}</p>
                  <p><span className="font-medium">Amount:</span> ${selectedPayment.amount.toFixed(2)}</p>
                  <p><span className="font-medium">Date:</span> {selectedPayment.date}</p>
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
                  'Confirm Refund'
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
      className={`w-full flex items-center px-4 py-3 ${isActive ? 'bg-blue-600' : 'hover:bg-gray-800'}`}
    >
      <div className={`${showLabel ? 'mr-3' : 'mx-auto'}`}>
        {icon}
      </div>
      {showLabel && <span>{label}</span>}
    </button>
  );
};

// Dashboard Content Component
const DashboardContent = ({ isLoading, projects, reports, payments, setActiveSection }) => {
  const recentProjects = projects.slice(0, 3);
  const recentReports = reports.slice(0, 3);
  const recentPayments = payments.slice(0, 3);
  
  // Calculate summary stats
  const projectsRejected = projects.filter(p => p.project_status === "rejected").length;
  const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.total_amount || 0), 0);
  const paidPayments = payments.reduce((sum, payment) => sum + Number(payment.paid_amount || 0), 0);
  const refundedPayments = payments.filter(p => p.status === "refunded").length;
  const reportsClosed = reports.filter(r => r.report_status === "closed").length;
  
  if (isLoading) {
    return <LoadingState />;
  }
  
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Projects" value={projects.length} subtitle={`${projectsRejected} rejected`} />
        <StatCard title="Total Reports" value={reports.length} subtitle={`${reportsClosed} closed`} />
        <StatCard title="Payment Volume" value={`₹${paidPayments.toFixed(2)}`} subtitle={`of total ₹${totalPayments.toFixed(2)}`} />
        <StatCard title="Refunds" value={refundedPayments} subtitle={`${(refundedPayments / (payments.length || 1) * 100).toFixed(1)}%`} />
      </div>
      
      {/* Recent Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Recent Projects</h3>
          <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setActiveSection('projects')}>View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
            {recentProjects.map((project) => (
              <tr key={project.project_id}>
                <td className="px-6 py-4 whitespace-nowrap">{project.project_name}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={project.project_status} />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {project.domain}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {project.delivery_date ? new Date(project.delivery_date).toLocaleDateString() : 'N/A'}
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
            <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setActiveSection('reports')}>View All</button>
          </div>
          <ul className="space-y-4">
          {recentReports.map((report, index) => (
              <li key={report.report_id || index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <BarChart2 size={16} className="text-blue-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium">{report.title}</p>
                  <p className="text-xs text-gray-500">{new Date(report.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <span className="text-xs font-medium text-gray-500">{report.report_status}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Recent Payments */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-medium">Recent Payments</h3>
            <button className="text-sm text-blue-600 hover:text-blue-800" onClick={() => setActiveSection('payments')}>View All</button>
          </div>
          <ul className="space-y-4">
            {recentPayments.map((payment, index) => (
              <li key={payment.payment_id || index} className="flex items-center p-3 hover:bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <CreditCard size={16} className="text-green-600" />
                </div>
                <div className="ml-4 flex-1">
                  <p className="text-sm font-medium">{payment.project_name}</p>
                  <p className="text-xs text-gray-500">{new Date(payment.created_at).toLocaleDateString('en-GB')}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">₹{Number(payment.total_amount || 0).toFixed(2)}</p>
                  <PaymentStatusBadge status={payment.payment_status} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

// Projects Content Component
const ProjectsContent = ({ isLoading, projects, setActiveSection,setProjects }) => {
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
      setProjects(response.data);
      localStorage.setItem("projects", JSON.stringify(response.data));
    } catch (error) {
      console.error("Error fetching projects:", error);
    }
  };

  const handleApprove = async (projectId) => {
    const price = prompt("Enter the price for this project:");
    const local_uri = "http://localhost:8000";
    const token = localStorage.getItem("adminToken");
  
    if (!price || isNaN(price)) {
      alert("Please enter a valid amount.");
      return;
    }
  
    try {
      const res = await fetch(`${local_uri}/api/admin/projects/approve/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ projectId, price })
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success("Project approved successfully and mail sent!");
        fetchProjects();
      } else {
        toast.error("Something went wrong");
        console.log("Error: " + data.message);
      }
    } catch (err) {
      alert("Approval failed: " + err.message);
    }
  };

  const handleReject = async (projectId) => {
    const reason = prompt("Enter the reason for rejecting this project:");
    const local_uri = "http://localhost:8000";
    const token = localStorage.getItem("adminToken");
  
    if (!reason) {
      alert("Rejection reason is required.");
      return;
    }
  
    try {
      const res = await fetch(`${local_uri}/api/admin/projects/reject/${projectId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ projectId, reason }),
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success("Project rejected and mail sent!");
        fetchProjects();
      } else {
        toast.error("Failed to Reject Project")
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Failed to Reject Project")
      console.log("Rejection failed: " + err.message);
    }
  };

  const handleDeleteProject = async (projectId, paymentStatus) => {
    const confirm = window.confirm("Are you sure you want to delete this project and its associated data?");
    if (!confirm) return;
  
    if (paymentStatus !== 'pending' && paymentStatus !== 'refunded') {
      toast.error("Cannot delete. Make a refund first to enable deletion.");
      return;
    }
    console.log("Attempted delete:", projectId, "Status:", paymentStatus);
  
    try {
      const token = localStorage.getItem("adminToken");
      const res = await axios.delete(`${local_uri}/api/admin/projects/delete/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success(res.data.message || "Project deleted successfully!");
      fetchProjects();
    } catch (err) {
      const errorMsg = err.response?.data?.message || "Error deleting project";
      toast.error(errorMsg);
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.length > 0 ? (
              projects.map((project, index) => (
                <tr key={project.project_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{project.project_id || "No ID"}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">{project.project_name || "No Name"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={project.project_status || "No Status"} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(project.delivery_date).toLocaleDateString('en-GB') || "No Due Date"}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={project.payment_status || "No Status"} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-blue-600 hover:text-blue-900 mr-3">View</button>
                    <button
                      onClick={() => handleDeleteProject(project.project_id, project.payment_status)}
                      className={`mr-3 ${
                        project.payment_status !== 'pending' && project.payment_status !== 'refunded'
                          ? 'text-gray-400 cursor-not-allowed'
                          : 'text-red-600 hover:text-red-900'
                      }`}
                      title={
                        project.payment_status !== 'pending' && project.payment_status !== 'refunded'
                          ? 'Cannot delete. Payment initiated. Make a refund to delete.'
                          : ''
                      }
                    >
                      Delete
                    </button>
                    {project.project_status === 'pending' && (
                      <>
                        <button 
                          onClick={() => handleApprove(project.project_id)} 
                          className="text-green-600 hover:text-green-900 ml-3"
                        >
                          Approve
                        </button>
                        <button 
                          onClick={() => handleReject(project.project_id)} 
                          className="text-yellow-600 hover:text-yellow-900 ml-3"
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No projects found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Reports Content Component
const ReportsContent = ({ isLoading, reports, setActiveSection, setReports }) => {
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

  const handleCloseReport = async (reportId, reportName) => {
    const confirmDelete = window.confirm(`Are you sure you want to close ${reportName} report?`);
    if (!confirmDelete) return;
    const token = localStorage.getItem("adminToken");
    try {
      const res = await fetch(`${local_uri}/api/admin/reports/close/${reportId}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      const data = await res.json();
      if (res.ok) {
        toast.success("Report closed successfully.");
        fetchReports();
      } else {
        toast.error("Failed to Close Report")
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Failed to Close Report")
      console.log("Close failed: " + err.message);
    }
  };
  
  const handleDeleteReport = async (reportId, reportName) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete ${reportName} report?`);
    if (!confirmDelete) return;
  
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
        toast.error("Failed to Delete Report")
        console.log("Error: " + data.message);
      }
    } catch (err) {
      toast.error("Failed to Delete Report")
      console.log("Delete failed: " + err.message);
    }
  };  
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg  text-black font-medium">Report Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Report Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Generated Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {reports.length > 0 ? (
              reports.map((report, index) => (
                <tr key={report.report_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.report_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{report.title}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(report.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={report.report_status || "No Status"} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-green-600 hover:text-green-900 mr-3">View</button>
                    {report.report_status === 'open' && (
                      <button
                        className="text-blue-600 hover:text-blue-900 mr-3"
                        onClick={() => handleCloseReport(report.report_id, report.title)}
                      >
                        Close
                      </button>
                    )}
                    <button className="text-red-600 hover:text-red-900" onClick={() => handleDeleteReport(report.report_id, report.title)}>Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No reports found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Payments Content Component
const PaymentsContent = ({ isLoading, payments, onRefundRequest }) => {
  if (isLoading) {
    return <LoadingState />;
  }

  console.log("Payments :", payments);
  
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-black">Payment Management</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Paid Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pending Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Refund Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {payments.length > 0 ? (
              payments.map((payment, index) => (
                <tr key={payment.payment_id || index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{payment.payment_id}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.project_code}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{payment.project_name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{isNaN(payment.total_amount) ? "0.00" : Number(payment.total_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{isNaN(payment.paid_amount) ? "0.00" : Number(payment.paid_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <PaymentStatusBadge status={payment.payment_status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{isNaN(payment.paid_amount) ? "0.00" : Number(payment.pending_amount).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{isNaN(payment.refund_amt) ? "0.00" : Number(payment.refund_amt).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{new Date(payment.created_at).toLocaleDateString('en-GB')}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button className="text-red-600 hover:text-blue-900 mr-3">Refund</button>
                    {payment.refundable && (
                      <button 
                        className="text-red-600 hover:text-red-900"
                        onClick={() => onRefundRequest(payment)}
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                  No payments found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
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
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  
  switch (status) {
    case 'approved':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      break;
    case 'completed':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'open':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'partially_paid':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'closed':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    case 'rejected':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      break;
    default:
      break;
  }
  
  return (
    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {status}
    </span>
  );
};

// Payment Status Badge Component
const PaymentStatusBadge = ({ status }) => {
  let bgColor = 'bg-gray-100';
  let textColor = 'text-gray-800';
  let icon = null;
  
  switch (status) {
    case 'paid':
      bgColor = 'bg-green-100';
      textColor = 'text-green-800';
      icon = <Check size={12} className="mr-1" />;
      break;
    case 'partially_paid':
      bgColor = 'bg-blue-100';
      textColor = 'text-blue-800';
      icon = <RefreshCw size={12} className="mr-1 animate-spin" />;
      break;
    case 'pending':
      bgColor = 'bg-yellow-100';
      textColor = 'text-yellow-800';
      break;
    case 'refunded':
      bgColor = 'bg-red-100';
      textColor = 'text-red-800';
      icon = <AlertCircle size={12} className="mr-1" />;
      break;
    default:
      break;
  }
  
  return (
    <span className={`px-2 py-0.5 inline-flex items-center text-xs leading-5 font-semibold rounded-full ${bgColor} ${textColor}`}>
      {icon}{status}
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
        {subtitle && <p className="text-xs text-gray-500 ml-2 mb-1">{subtitle}</p>}
      </div>
    </div>
  );
};