import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { User, AtSign, Mail, Lock, ImagePlus } from "lucide-react";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";
import Spinner from "../components/ui/Spinner.jsx";

import { loginUser, registerUser } from "../services/auth.service.js";
import { setUser } from "../store/authSlice.js";

const handleDragOver = (e) => {
  e.preventDefault();
};

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const fileInputRef = useRef(null);
  const avatarRef = useRef(null);

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/home", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const [avatarPreview, setAvatarPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const updateAvatarFile = (file) => {
    avatarRef.current = file;
    setAvatarPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      updateAvatarFile(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      updateAvatarFile(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatarRef.current) {
      return toast.error("Avatar is required");
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      submitData.append("fullName", formData.fullName);
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);

      submitData.append("avatar", avatarRef.current);

      const registerResponse = await registerUser(submitData);

      const loginResponse = await loginUser({
        email: formData.email,
        username: formData.username,
        password: formData.password,
      });

      if (!loginResponse?.data?.user) {
        throw new Error("Invalid login response after registration");
      }

      dispatch(setUser(loginResponse.data.user));

      toast.success(
        `${registerResponse.message || "Account created successfully"} and logged in successfully`,
      );

      const destination =
        location.state?.from?.pathname || location.state?.from || "/home";
      navigate(destination, { replace: true });
    } catch (error) {
      console.log(error);

      toast.error(error?.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Start uploading and watching videos"
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <AuthInput
          label="Full Name"
          name="fullName"
          placeholder="Enter your full name"
          value={formData.fullName}
          onChange={handleChange}
          icon={User}
        />

        <AuthInput
          label="Username"
          name="username"
          placeholder="Choose username"
          value={formData.username}
          onChange={handleChange}
          icon={AtSign}
        />

        <AuthInput
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
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

        <div>
          <label
            htmlFor="avatar-upload"
            className="mb-2 block text-sm font-medium text-(--muted)"
          >
            Avatar
          </label>

          <div
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            role="button"
            tabIndex={0}
            className="group flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-(--border) bg-(--surface-2) p-6 transition-colors duration-200 hover:border-(--border-strong) hover:bg-(--surface-3)"
          >
            {avatarPreview ? (
              <div className="flex flex-col items-center gap-3">
                <img
                  src={avatarPreview}
                  alt="Avatar preview"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-(--border)"
                />
                <span className="text-xs text-(--muted)">
                  Click or drag to change
                </span>
              </div>
            ) : (
              <>
                <ImagePlus
                  size={28}
                  className="mb-2 text-(--muted-strong) transition-colors group-hover:text-(--text)"
                />
                <span className="text-sm text-(--muted)">
                  Click or drag & drop your avatar
                </span>
                <span className="mt-1 text-xs text-(--muted-strong)">
                  PNG, JPG up to 5MB
                </span>
              </>
            )}

            <input
              id="avatar-upload"
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              className="hidden"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-(--accent) py-3 text-sm font-semibold text-white transition-colors duration-200 hover:bg-(--accent-strong) disabled:opacity-50"
        >
          {loading ? (
            <>
              <Spinner size={16} />
              <span>Creating account...</span>
            </>
          ) : (
            "Register"
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-(--muted)">
        Already have an account?{" "}
        <Link
          to="/login"
          className="font-medium text-(--text) transition-colors hover:text-(--accent)"
        >
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
