import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axios from "axios";

import Loading from "../components/Loading";
import PasswordToggleButton from "../components/PasswordToggleButton";

const backend_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);
  const [loading, setLoading] = useState(true);

  const params = useParams();
  const navigate = useNavigate();

  const verify = async () => {
    try {
      const token = params.token;

      const { data } = await axios.post(
        `${backend_URL}/api/auth/verify-reset-token/${token}`,
      );
      setEmail(data.email);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          error.message ||
          "Something went wrong",
      );
      navigate("/forgot-password");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const token = params.token;

      if (password !== confirmPassword) {
        toast.warn("Password mismatch");
      }

      const { data } = await axios.post(
        `${backend_URL}/api/auth/reset-password/${token}`,
        {
          email,
          password,
        },
      );

      toast.success(data.message);
      navigate("/login");
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

  useEffect(() => {
    verify();
  }, []);

  return (
    <>
      {loading ? (
        <Loading />
      ) : (
        <div className="min-h-screen flex items-center justify-center bg-slate-900">
          <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
            {/* {Title} */}
            <h2 className="text-center text-white text-xl font-semibold mb-8">
              Set new password
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

              {/* Password */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter new password"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />

                  <PasswordToggleButton
                    show={showPassword}
                    onToggle={() => setShowPassword((prev) => !prev)}
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-slate-300 mb-2">
                  Confirm new Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />

                  <PasswordToggleButton
                    show={showConfirmPassword}
                    onToggle={() => setShowConfirmPassword((prev) => !prev)}
                  />
                </div>
              </div>
              <button
                className="w-full mt-3 bg-linear-to-r from-indigo-500 to-purple-500 py-2 rounded-md text-white font-medium hover:opacity-90 transition cursor-pointer"
                disabled={btnLoading}
              >
                {btnLoading ? "Submiting..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ResetPassword;
