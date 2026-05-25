import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import toast from "react-hot-toast";

import AuthLayout from "../components/auth/AuthLayout.jsx";
import AuthInput from "../components/auth/AuthInput.jsx";

import { loginUser, registerUser } from "../services/auth.service.js";
import { setUser } from "../store/authSlice.js";

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
  });

  const [avatar, setAvatar] = useState(null);

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleAvatarChange = (e) => {
    setAvatar(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!avatar) {
      return toast.error("Avatar is required");
    }

    try {
      setLoading(true);

      const submitData = new FormData();

      submitData.append("fullName", formData.fullName);
      submitData.append("username", formData.username);
      submitData.append("email", formData.email);
      submitData.append("password", formData.password);

      submitData.append("avatar", avatar);

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

      navigate("/");
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
        />

        <AuthInput
          label="Username"
          name="username"
          placeholder="Choose username"
          value={formData.username}
          onChange={handleChange}
        />

        <AuthInput
          label="Email"
          type="email"
          name="email"
          placeholder="Enter your email"
          value={formData.email}
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

        <div>
          <label className="block text-sm text-zinc-300 mb-2">Avatar</label>

          <input
            type="file"
            accept="image/*"
            onChange={handleAvatarChange}
            className="w-full text-sm text-zinc-400"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-white text-black font-semibold py-3 rounded-xl hover:opacity-90 transition-all duration-200 disabled:opacity-50"
        >
          {loading ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-zinc-400 text-sm mt-6 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-white font-medium">
          Login
        </Link>
      </p>
    </AuthLayout>
  );
};

export default Register;
