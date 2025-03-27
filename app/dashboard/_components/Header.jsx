"use client";
import { UserButton } from "@clerk/nextjs";
import Image from "next/image";
import { usePathname } from "next/navigation";
import React, { useEffect, useState } from "react";
import { BsMoon, BsSun } from "react-icons/bs"; // Icons for Dark Mode

function Header() {
  const path = usePathname();
  const [darkMode, setDarkMode] = useState(false);

  // Load theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle Dark Mode
  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
    if (!darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  return (
    <>
      {/* Fixed Header */}
      <div className=" bg-gray-200 dark:bg-gray-900 shadow-md h-16 flex items-center">
        <div className="flex items-center justify-between w-full max-w-6xl mx-auto px-4">
          {/* Logo */}
          <Image src="/logo.svg" width={80} height={50} alt="logo" />

          {/* Navigation Links */}
          <ul className="hidden md:flex gap-6">
            {[
              { name: "Dashboard", link: "/dashboard" },
              { name: "Questions", link: "/dashboard/questions" },
              { name: "Upgrade", link: "/dashboard/upgrade" },
              { name: "How it Works", link: "/dashboard/how" },
            ].map(({ name, link }) => (
              <li
                key={link}
                className={`cursor-pointer text-sm font-medium transition-all hover:text-black dark:hover:text-white 
                  ${
                    path === link
                      ? "text-blue-500 font-bold dark:text-yellow-400"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
              >
                {name}
              </li>
            ))}
          </ul>

          {/* Dark Mode Button & User Profile */}
          <div className="flex items-center gap-4">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-full bg-gray-300 dark:bg-gray-700 hover:bg-gray-400 dark:hover:bg-gray-600 transition-all"
            >
              {darkMode ? (
                <BsSun size={20} className="text-yellow-400" />
              ) : (
                <BsMoon size={20} className="text-gray-900" />
              )}
            </button>
            <UserButton />
          </div>
        </div>
      </div>

      {/* Ensure Content Starts Below Header */}
      <div className="pt-16">{/* Adjust this padding to match header height */}</div>
    </>
  );
}

export default Header;
