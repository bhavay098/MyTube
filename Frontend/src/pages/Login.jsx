import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Mail, Lock } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";
import Spinner from "../components/ui/Spinner.jsx";

import { loginUser } from "../services/auth.service.js";
import { setUser } from "../store/authSlice.js";

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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

      const destination =
        location.state?.from?.pathname || location.state?.from || "/home";
      navigate(destination, { replace: true });
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
          icon={Mail}
        />

        <AuthInput
          label="Password"
          type="password"
          name="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          icon={Lock}
        />

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner size={16} />
              <span>Logging in...</span>
            </>
          ) : (
            "Login"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-(--muted)">
        Don't have an account?{" "}
        <Link to="/register" className="font-medium text-(--text) hover:text-(--accent) transition-colors">
          Register
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Login;
