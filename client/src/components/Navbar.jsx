import { Link, useNavigate } from "react-router-dom";
import { AppData } from "../context/AppContext";
import { useState, useRef, useEffect } from "react";

const Navbar = () => {
  const { isAuth, user, logoutUser } = AppData();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);

  const avatarUrl =
    user?.avatar && user.avatar.trim() !== ""
      ? user.avatar
      : "/default-avatar.png";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="bg-slate-950 text-white shadow-md">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="text-3xl font-bold tracking-wide">
          Quick Pin
        </Link>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {isAuth ? (
            <div className="relative" ref={dropdownRef}>
              {/* Avatar */}
              <img
                src={avatarUrl}
                alt={user?.name || "user"}
                className="w-10 h-10 rounded-full object-cover border-2 border-slate-700 hover:border-white transition cursor-pointer"
                referrerPolicy="no-referrer"
                onClick={() => setOpen(!open)}
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = "/default-avatar.png";
                }}
              />

              {/* Dropdown */}
              {open && (
                <div className="absolute right-0 mt-3 w-72 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden z-50">
                  {/* User Info */}
                  <div className="px-4 py-4 border-b border-slate-700">
                    <h3 className="font-semibold text-lg truncate">
                      {user?.name}
                    </h3>

                    <p className="text-sm text-slate-400 truncate">
                      {user?.email}
                    </p>
                  </div>

                  {/* Menu Items */}
                  <div className="flex flex-col">
                    <Link
                      to="/profile"
                      className="px-4 py-3 hover:bg-slate-700 transition"
                      onClick={() => setOpen(false)}
                    >
                      Profile
                    </Link>

                    <Link
                      to="/settings"
                      className="px-4 py-3 hover:bg-slate-700 transition"
                      onClick={() => setOpen(false)}
                    >
                      Settings
                    </Link>

                    <Link
                      to="/my-courses"
                      className="px-4 py-3 hover:bg-slate-700 transition"
                      onClick={() => setOpen(false)}
                    >
                      My Courses
                    </Link>

                    <button
                      onClick={() => logoutUser(navigate)}
                      className="text-left px-4 py-3 text-red-400 hover:bg-red-500/10 transition"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link
                to="/login"
                className="px-4 py-2 rounded-lg hover:bg-slate-800 transition"
              >
                Login
              </Link>

              <Link
                to="/register"
                className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition"
              >
                Register
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
