import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";

import { loginUser } from "../services/auth.service.js";
import { setUser } from "../store/authSlice.js";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      const response = await loginUser({
        email: formData.identifier,
        username: formData.identifier,
        password: formData.password,
      });

      if (!response?.data?.user) {
        throw new Error("Invalid login response");
      }

      dispatch(setUser(response.data.user));
      toast.success(response.message || "Login successful");

      navigate("/");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" subtitle="Login to continue watching">
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Email or Username"
          name="identifier"
          placeholder="Enter your email or username"
          value={formData.identifier}
          onChange={handleChange}
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>

      <p className="text-zinc-400 text-sm mt-6 text-center">
        Don’t have an account?{" "}
        <Link to="/register" className="text-white font-medium">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
