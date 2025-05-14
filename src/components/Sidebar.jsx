import React from "react";
import { FaHome, FaBook, FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import { Link, useNavigate, useLocation } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  // mengecek apakah path yang aktif
  const isActive = (path) => location.pathname === path;

  return (
    <div className="w-56 h-screen bg-gradient-to-b from-gray-800 to-gray-900 text-white flex flex-col p-4 shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center tracking-wide">MyLibrary</h2>
      <ul className="space-y-4">
        {/* Home */}
        <li>
          <Link
            to="/dashboard"
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              isActive("/dashboard") ? "bg-gray-700 text-purple-500" : "hover:bg-gray-700"
            }`}
          >
            <FaHome className={`mr-3 text-lg ${isActive("/dashboard") ? "text-purple-500" : ""}`} />
            <span className={`text-base font-medium ${isActive("/dashboard") ? "text-purple-500" : ""}`}>
              Home
            </span>
          </Link>
        </li>

        {/* Members */}
        <li>
          <Link
            to="/member"
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              isActive("/member") ? "bg-gray-700 text-purple-500" : "hover:bg-gray-700"
            }`}
          >
            <FaUser className={`mr-3 text-lg ${isActive("/member") ? "text-purple-500" : ""}`} />
            <span className={`text-base font-medium ${isActive("/member") ? "text-purple-500" : ""}`}>
              Members
            </span>
          </Link>
        </li>

        {/* Categories */}
        <li>
          <Link
            to="/categories"
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              isActive("/categories") ? "bg-gray-700 text-purple-500" : "hover:bg-gray-700"
            }`}
          >
            <FaBook className={`mr-3 text-lg ${isActive("/categories") ? "text-purple-500" : ""}`} />
            <span className={`text-base font-medium ${isActive("/categories") ? "text-purple-500" : ""}`}>
              Categories
            </span>
          </Link>
        </li>

        {/* My Account */}
        <li>
          <Link
            to="/account"
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              isActive("/account") ? "bg-gray-700 text-purple-500" : "hover:bg-gray-700"
            }`}
          >
            <FaUser className={`mr-3 text-lg ${isActive("/account") ? "text-purple-500" : ""}`} />
            <span className={`text-base font-medium ${isActive("/account") ? "text-purple-500" : ""}`}>
              My Account
            </span>
          </Link>
        </li>

        {/* Settings */}
        <li>
          <Link
            to="/settings"
            className={`flex items-center p-3 rounded-lg cursor-pointer transition-all duration-300 ${
              isActive("/settings") ? "bg-gray-700 text-purple-500" : "hover:bg-gray-700"
            }`}
          >
            <FaCog className={`mr-3 text-lg ${isActive("/settings") ? "text-purple-500" : ""}`} />
            <span className={`text-base font-medium ${isActive("/settings") ? "text-purple-500" : ""}`}>
              Settings
            </span>
          </Link>
        </li>

        {/* Logout */}
        <li
          onClick={handleLogout}
          className="flex items-center p-3 hover:bg-red-600 rounded-lg cursor-pointer transition-all duration-300"
        >
          <FaSignOutAlt className="mr-3 text-lg" />
          <span className="text-base font-medium">Logout</span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;