"use client";

import { useState, useEffect } from "react";
import Terms from "./Terms";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

function generateProjectId(company = "HT") {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // Ensure 2-digit month
  const date = String(now.getDate()).padStart(2, "0"); // Ensure 2-digit date
  const projectNumber = "001"; // You can dynamically fetch the next number from a database

  return `${company}${date}${month}${year}${projectNumber}`;
}

export default function ProjectDetails() {
  const [projectId, setProjectId] = useState("");
  const [domain, setDomain] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    setProjectId(generateProjectId());
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({
      projectId,
      domain,
      name,
      description,
      deliveryDate,
      file,
    });
  };

  return (
    <div className="w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-md transition-colors duration-300 border dark:border-gray-700 border-gray-300">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Project Details
      </h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Project ID (Non-editable) */}
        <div>
          <label className="block text-gray-700 dark:text-gray-200 font-medium">
            Project ID
          </label>
          <input
            type="text"
            value={projectId}
            readOnly
            className="w-full p-2 border bg-gray-100 dark:bg-gray-800 dark:text-white rounded"
          />
        </div>

        {/* Project Domain (Dropdown) */}
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

        {/* Project Description */}
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

        {/* File Upload (Optional) */}
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

        {/* Delivery Date */}
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

        {/* Submit Button */}
        <Dialog>
          <DialogTrigger asChild>
            <Button>Submit</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] dark:bg-gray-800 dark:text-white">
            <Terms />
          </DialogContent>
        </Dialog>
      </form>
    </div>
  );
}
