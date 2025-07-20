import { Link, useNavigate } from "react-router-dom";
import { useContext, useState, useRef, useEffect } from "react";
import { AuthContext } from "../context/AuthContext";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    setDropdownOpen(false);
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 flex justify-between items-center text-white fixed top-0 w-full z-50 shadow-lg">
      <Link
        to="/chat"
        className="font-bold text-3xl bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500 drop-shadow-lg hover:opacity-90 transition"
      >
        PulseChat
      </Link>

      <div className="space-x-4 flex items-center relative">
        {user ? (
          <div className="relative" ref={dropdownRef}>
            <img
              src={user.avatar || `https://ui-avatars.com/api/?name=${user.username}`}
              alt="Profile"
              className="w-10 h-10 rounded-full object-cover cursor-pointer border-2 border-purple-400 hover:scale-105 transition-transform duration-200"
              onClick={() => setDropdownOpen(!dropdownOpen)}
            />
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 backdrop-blur-md bg-white/90 rounded-lg shadow-xl text-black z-30 border border-purple-200 overflow-hidden animate-fadeIn">
                <Link
                  to="/profile"
                  className="block px-4 py-3 hover:bg-purple-100 transition"
                  onClick={() => setDropdownOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-4 py-3 hover:bg-red-100 text-red-600 transition"
                >
                  Logout
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className="px-4 py-2 rounded-md hover:bg-purple-700 bg-purple-600 transition text-white shadow"
            >
              Login
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 rounded-md border border-purple-500 hover:bg-purple-500 transition text-purple-300 hover:text-white shadow"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
