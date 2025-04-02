"use client";

import { useState } from "react";

export default function Terms() {
  const [agreed, setAgreed] = useState(false);
  const [signature, setSignature] = useState("");

  // The submit button is enabled only if a signature is provided and the checkbox is checked.
  const isSubmitEnabled = agreed && signature.trim().length > 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Terms accepted and form submitted!");
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white dark:bg-gray-900 shadow-lg rounded-md transition-colors duration-300">
      <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">
        Terms & Conditions
      </h1>
      <p className="text-gray-700 dark:text-gray-200 mb-4">
        1. The project should be completed within the given timeline.<br />
        2. Any plagiarism or unauthorized copying of content will lead to disqualification.<br />
        3. The final project should be submitted along with necessary documentation.<br />
        4. The project should adhere to the provided guidelines and specifications.<br />
        5. Any changes to the project scope should be approved by the mentor.<br />
      </p>

      <form onSubmit={handleSubmit}>
        {/* Student Signature */}
        <div className="mt-8">
          <h2 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
            Student Signature
          </h2>
          <input
            type="text"
            placeholder="Type your signature here..."
            value={signature}
            onChange={(e) => setSignature(e.target.value)}
            className="text-3xl font-[cursive] border-b-2 border-black dark:border-white bg-gray-100 dark:bg-gray-800 text-black dark:text-white w-full p-2 mb-4"
          />
        </div>

        {/* Checkbox Agreement */}
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            id="agree"
            checked={agreed}
            onChange={(e) => setAgreed(e.target.checked)}
            className="mr-2 w-5 h-5 accent-blue-600 dark:accent-blue-400"
          />
          <label htmlFor="agree" className="text-gray-700 dark:text-gray-200">
            I agree to the Terms and Conditions
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!isSubmitEnabled}
          className={`w-full py-2 px-4 rounded-md transition-colors ${
            isSubmitEnabled
              ? "bg-blue-600 dark:bg-blue-500 hover:bg-blue-700 dark:hover:bg-blue-400 text-white"
              : "bg-gray-400 dark:bg-gray-700 text-gray-700 dark:text-gray-300 cursor-not-allowed"
          }`}
        >
          Submit
        </button>
      </form>
    </div>
  );
}
