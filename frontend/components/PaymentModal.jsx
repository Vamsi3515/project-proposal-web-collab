import { useState } from "react";

const PaymentModal = ({ isOpen, onClose, pendingAmount, projectId, handlePayNow, setSelectedProjectForDetails, project }) => {
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const validateAmount = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) {
      setError("Please enter a valid number");
    } else if (num < 1) {
      setError("Minimum payment amount is ₹1");
    } else if (num > pendingAmount) {
      setError(`Amount cannot exceed ₹${pendingAmount}`);
    } else {
      setError("");
    }
    setAmount(value);
  };

  const handleSubmit = (e) => {
    e.stopPropagation(); 
    e.preventDefault();
    
    if (!error && amount) {
      handlePayNow(projectId, parseFloat(amount));
      onClose();
      setAmount("");
      setSelectedProjectForDetails(project);
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div 
        className="bg-white p-6 rounded-2xl shadow-xl w-[90%] max-w-md dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside modal from closing it
      >
        <h2 className="text-xl font-semibold mb-2">Make a Payment</h2>
        <p className="text-gray-700 mb-4 dark:text-gray-500">Pending Amount: ₹{pendingAmount}</p>
        
        <form onSubmit={handleSubmit}>
          <input
            type="number"
            value={amount}
            onChange={(e) => validateAmount(e.target.value)}
            placeholder="Enter amount"
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            min="1"
            max={pendingAmount}
            step="0.01"
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
          
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setAmount("");
                onClose();
              }}
              className="px-4 py-2 bg-gray-300 rounded-lg hover:bg-gray-400 dark:bg-gray-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!!error || !amount}
              className={`px-4 py-2 rounded-lg text-white ${
                error || !amount
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              Pay ₹{amount || 0}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;