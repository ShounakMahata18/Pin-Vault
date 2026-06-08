import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const backend_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [btnLoading, setBtnLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBtnLoading(true);

    try {
      const { data } = await axios.post(
        `${backend_URL}/api/auth/forgot-password`,
        { email },
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
        {/* {Title} */}
        <h2 className="text-center text-white text-xl font-semibold mb-8">
          Forget Password
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
              className="w-full bg-slate-700 border border-slate-600 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Submit button */}
          <button
            className="w-full bg-linear-to-r from-indigo-500 to-purple-500 py-2 rounded-md text-white font-medium hover:opacity-90 transition cursor-pointer"
            disabled={btnLoading}
          >
            {btnLoading ? "Submiting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ForgotPassword;
