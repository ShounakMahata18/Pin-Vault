import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { useGoogleLogin } from "@react-oauth/google";

import googleIcon from "../assets/google.svg";
import PasswordToggleButton from "../components/PasswordToggleButton";

const backend_URL =
  import.meta.env.VITE_REACT_APP_BACKEND_URL || "http://localhost:5000";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [btnLoading, setBtnLoading] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    setBtnLoading(true);
    e.preventDefault();

    try {
      const { data } = await axios.post(`${backend_URL}/api/auth/login`, {
        email,
        password,
      });

      toast.success(data.message);
      navigate("/verify-otp", { state: { email } });
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

  const googleLogin = useGoogleLogin({
    flow: "auth-code",
    onSuccess: async (codeResponse) => {
      try {
        const { data } = await axios.post(
          `${backend_URL}/api/auth/google`,
          {
            code: codeResponse.code,
          },
          {
            withCredentials: true,
          },
        );

        window.location.href = "/dashboard";
      } catch (error) {
        toast.error(
          error.response?.data?.message ||
            error.message ||
            "Google login failed",
        );
      }
    },
    onError: () => {
      toast.error("Google Sign-In failed");
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900">
      <div className="w-full max-w-md bg-slate-800 border border-slate-700 rounded-xl p-8 shadow-lg">
        {/* {Title} */}
        <h2 className="text-center text-white text-xl font-semibold mb-8">
          Sign in to your account
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

          {/* Password */}
          <div>
            <label className="block text-sm text-slate-300 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter password"
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
            {/* Forget password */}
            <div className="flex items-center justify-end text-sm mt-1">
              <a href="/forgot-password" className="text-slate-300">
                Forgot password?
              </a>
            </div>
          </div>

          {/* Sign in button */}
          <button
            className="w-full bg-linear-to-r from-indigo-500 to-purple-500 py-2 rounded-md text-white font-medium hover:opacity-90 transition cursor-pointer"
            disabled={btnLoading}
          >
            {btnLoading ? "Submiting..." : "Sign in"}
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center my-6">
          <div className="grow border-t border-slate-600"></div>
          <span className="px-4 text-slate-400 text-sm">Or continue with</span>
          <div className="grow border-t border-slate-600"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-4">
          <button
            onClick={googleLogin}
            className="flex items-center justify-center gap-2  bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-md border border-slate-600 cursor-pointer"
          >
            <img src={googleIcon} alt="google" className="w-5 h-5" />
            Google
          </button>
        </div>
        <div className="text-slate-400 text-center mt-4">
          <span>Don't have an account? </span>
          <a className="text-slate-300" href="/register">
            Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
