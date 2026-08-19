import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const AuthInput = ({
  id,
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
  icon: Icon,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || name;
  const isPasswordType = type === "password";
  const effectiveType = isPasswordType
    ? showPassword
      ? "text"
      : "password"
    : type;

  return (
    <div>
      <label
        htmlFor={inputId}
        className="mb-2 block text-sm font-medium text-(--muted)"
      >
        {label}
      </label>

      <div className="relative">
        {Icon && (
          <div className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-(--muted-strong)">
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          type={effectiveType}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          className={`w-full rounded-xl border border-(--border) bg-(--surface-2) ${
            Icon ? "pl-11" : "px-4"
          } ${
            isPasswordType ? "pr-11" : "pr-4"
          } py-3 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]`}
        />

        {isPasswordType && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-lg p-1 text-(--muted-strong) transition-colors hover:text-(--text) focus:outline-none"
            aria-label={showPassword ? "Hide password" : "Show password"}
            title={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
    </div>
  );
};

export default AuthInput;
