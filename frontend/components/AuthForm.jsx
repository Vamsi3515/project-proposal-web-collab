"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; 

export default function AuthForm() {
  const [tab, setTab] = useState("login"); 
  const isLogin = tab === "login";


  return (
    <div className=" w-md p-6 bg-white dark:bg-gray-800 rounded-lg shadow-lg min-h-[400px]">
      <div className="flex justify-between mb-4">
        <button
          onClick={() => setTab("login")}
          className={`w-1/2 py-2 ${isLogin ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          Login
        </button>
        <button
          onClick={() => setTab("register")}
          className={`w-1/2 py-2 ${!isLogin ? "border-b-2 border-blue-500 text-blue-500" : "text-gray-500 dark:text-gray-400"}`}
        >
          Register
        </button>
      </div>

      {isLogin ? (
        <LoginForm />
      ) : (
        <RegisterForm />
      )}
    </div>
  );
}

function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const local_uri = "http://localhost:8000";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
  
    try {
      const response = await fetch(`${local_uri}/api/users/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        setError(data.message || "Login failed");
        return;
      }
  
      const { token, user, hasProjects } = data;
  
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
  
      if (hasProjects) {
        router.push("/dashboard");
      } else {
        router.push("/studentdetails");
      }
  
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again later.");
    }
  };

  return (
    <form className="space-y-4 mt-16" onSubmit={handleLogin}>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="text-red-500 text-sm">{error}</p>}
      <button type="submit" className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">
        Login
      </button>
    </form>
  );
}


function RegisterForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [showOtpFields, setShowOtpFields] = useState(false);
  const [showOtpMessage, setShowOtpMessage] = useState(false);
  const [error, setError] = useState("");
  const [otpTimer, setOtpTimer] = useState(0);
  const [loading, setLoading] = useState(false);
  const local_uri = "http://localhost:8000";

  useEffect(() => {
    let interval;
    if (otpTimer > 0) {
      interval = setInterval(() => setOtpTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [otpTimer]);

  const handleOtpChange = (value, index) => {
    if (/^\d?$/.test(value)) {
      const updatedOtp = [...otp];
      updatedOtp[index] = value;
      setOtp(updatedOtp);
      if (value && index < 5) {
        document.getElementById(`otp-${index + 1}`)?.focus();
      }
    }
  };

  const handleGetOtp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    try {
      const response = await fetch(`${local_uri}/api/users/send-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
        }),
      });
      const data = await response.json();
  
      if (response.ok) {
        setShowOtpFields(true);
        setShowOtpMessage(true);
        setOtpTimer(30); 
        console.log("OTP sent:", data.message); 
      } else if(response.status === 400){
        console.error("Failed to send OTP:", data.message);
        setError(data.message);
      }else if(response.status === 500){
        setError("Internal Server Error! Try again later");
      }else{
        setError("Something went wrong! Try again");
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
    }
  };
  
  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const fullOtp = otp.join("");
    if (fullOtp.length < 6) {
      setError("Enter complete 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${local_uri}/api/users/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password, otp: fullOtp }),
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        const newUser = data.user;
        if (newUser.is_verified) {
          router.push("/studentdetails");
        }
      } else if (res.status === 400) {
        setError(data.error || "Invalid OTP");
      }
    } catch (err) {
      setError("Internal Server Error. Please try again later.");
    }
    setLoading(false);
  };

  const isFormValid =
    email &&
    password &&
    confirmPassword &&
    password === confirmPassword &&
    otp.every((digit) => digit !== "");

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        required
      />

      {showOtpFields && (
        <div className="flex justify-between space-x-2">
          {otp.map((digit, idx) => (
            <input
              key={idx}
              id={`otp-${idx}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, idx)}
              className="w-12 h-12 text-center text-lg border rounded dark:bg-gray-700 dark:text-white"
            />
          ))}
        </div>
      )}

      {showOtpMessage && (
        <div className="bg-green-100 text-green-800 p-2 rounded text-center transition-all duration-300">
          OTP sent to the registered email address.
        </div>
      )}

      {otpTimer > 0 ? (
        <button
          type="button"
          disabled
          className="w-full bg-gray-400 text-white py-2 rounded cursor-not-allowed"
        >
          Resend OTP in {otpTimer}s
        </button>
      ) : (
        <button
          type="button"
          onClick={handleGetOtp}
          className="w-full dark:bg-yellow-500 text-white py-2 rounded hover:bg-yellow-600 bg-yellow-300"
        >
          {showOtpFields ? "Resend OTP" : "Get OTP"}
        </button>
      )}

      {error && (
        <div className="bg-red-100 text-red-800 p-2 rounded text-center transition-all duration-300">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!isFormValid || loading}
        className={`w-full py-2 rounded ${
          isFormValid && !loading
            ? "bg-green-500 hover:bg-green-600 text-white"
            : "bg-gray-400 text-white cursor-not-allowed"
        }`}
      >
        {loading ? "Registering..." : "Register"}
      </button>
    </form>
  );
}