import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import { AppData } from "../context/AppContext";

const backend_URL = import.meta.env.VITE_REACT_APP_BACKEND_URL;

const LoginVerification = () => {
  const [btnLoading, setBtnLoading] = useState(false);
  const [OTP, setOTP] = useState("");

  const { setIsAuth, setUser } = AppData();

  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  useEffect(() => {
    if (!email) {
      navigate("/login");
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${backend_URL}/api/auth/verify-otp`,
        {
          email,
          OTP,
        },
        { withCredentials: true },
      );

      toast.success(data.message);
      setIsAuth(true);
      setUser(data.user);
      navigate("/dashboard");
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
    } finally {
      setBtnLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
        {/* {Title} */}
        <h2 className="text-center text-white text-xl font-semibold mb-8">
          Verify OTP
        </h2>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Email address
            </label>
            <input
              type="email"
              placeholder="Enter email"
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-gray-300 focus:outline-none"
              value={email || ""}
              readOnly
            />
          </div>

          {/* OTP */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">OTP</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Enter OTP"
                className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                value={OTP}
                onChange={(e) => setOTP(e.target.value)}
              />
            </div>
          </div>

          {/* Verify button */}
          <button
            className="w-full bg-linear-to-r from-indigo-500 to-purple-500 py-2 rounded-md text-white font-medium hover:opacity-90 transition cursor-pointer"
            disabled={btnLoading}
          >
            {btnLoading ? "Verifying..." : "Verify OTP"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LoginVerification;
