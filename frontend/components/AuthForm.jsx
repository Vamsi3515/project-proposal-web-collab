"use client";
import { useState } from "react";
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
  return (
    <form className="justify-center items-center space-y-4 mt-16">
      <input type="email" placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      <input type="password" placeholder="Password" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      <button className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600">Login</button>
    </form>
  );
}

function RegisterForm() {
  const router = useRouter(); 

  const handleRegister = (e) => {
    e.preventDefault();
    router.push("/studentdetails"); 
  };

  return (
    <form className="space-y-4" onSubmit={handleRegister}>
      <input type="email" placeholder="Email" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      <input type="password" placeholder="Password" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      <input type="password" placeholder="Confirm Password" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      <input type="text" placeholder="OTP" className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
      <button type="submit"className="w-full bg-green-500 text-white py-2 rounded hover:bg-green-600">Register</button>
    </form>
  );
}
