"use client";

import { useState, useEffect } from "react";
import Terms from "./Terms";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation"; 

export default function ProjectDetails() {
  const [projectId, setProjectId] = useState("");
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [file, setFile] = useState(null);
  const [showDialog, setShowDialog] = useState(false);
  const local_uri = "http://localhost:8000";
  const router = useRouter(); 

  useEffect(() => {
    async function getProjectId() {
      const id = await fetchProjectId();
      if (id) {
        console.log("Setting project ID:", id);
        setProjectId(id);
      }
    }
  
    getProjectId();
  }, []);  

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!projectId || !domain || !name || !deliveryDate) {
      alert("Please fill in all required fields.");
      return;
    }
  
    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user"));
      const userId = user?.id;

      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("domain", domain);
      formData.append("projectName", name);
      formData.append("description", description);
      formData.append("deliveryDate", deliveryDate);
      formData.append("termsAgreed", 1);
      if (file) {
        formData.append("referenceFile", file);
      }
    
      const response = await axios.post(
        `${local_uri}/api/projects/request`,
        formData,
        {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
    
      console.log("Project submitted:", response.data);
      alert("Project request submitted successfully!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Error submitting project:", error.response?.data || error.message);
      alert("Something went wrong while submitting. Please try again.");
    }    
  }
const token = localStorage.getItem("token");

  async function fetchProjectId() {
    try {
      const res = await axios.get(`${local_uri}/api/projects/generate-id`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const { projectId } = res.data;
      console.log("Fetched project ID:", projectId);
      return projectId;
    } catch (error) {
      console.error("Error fetching project ID:", error.response?.data || error.message);
      return null;
    }
  }


  return (
    <div className="w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-md transition-colors duration-300 border dark:border-gray-700 border-gray-300">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Project Details
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project ID
          </label>
          <input
            type="text"
            value={projectId || "Loading..."}
            readOnly
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project Domain
          </label>
          <select
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            required
          >
            <option value="">Select Domain</option>
            <option value="AI">Artificial Intelligence</option>
            <option value="Web">Web Development</option>
            <option value="Blockchain">Blockchain</option>
            <option value="Data Science">Data Science</option>
          </select>
        </div>

        {/* Project Name */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            rows="4"
            required
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Upload Documents (Optional)
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
          />
        </div>

        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Delivery Date
          </label>
          <input
            type="date"
            value={deliveryDate}
            onChange={(e) => setDeliveryDate(e.target.value)}
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
            required
          />
        </div>
        <Button
            type="button"
            onClick={() => {
              if (!projectId || !domain || !name || !deliveryDate) {
                alert("Please fill in all required fields.");
                return;
              }
              setShowDialog(true);
            }}
          >
            Submit
        </Button>

        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
            <DialogTitle>Terms & Conditions</DialogTitle>
            <DialogDescription>
              Please read and accept the terms to continue.
            </DialogDescription>
            <Terms />
            <Button onClick={handleSubmit}>Confirm & Submit</Button>
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
}
