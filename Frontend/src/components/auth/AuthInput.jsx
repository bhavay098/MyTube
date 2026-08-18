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
  const inputId = id || name;

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
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          name={name}
          className={`w-full rounded-xl border border-(--border) bg-(--surface-2) ${
            Icon ? "pl-11" : "px-4"
          } py-3 pr-4 text-sm text-(--text) outline-none transition-colors duration-200 placeholder:text-(--muted-strong) focus:border-(--accent) focus:shadow-[0_0_0_3px_var(--accent-soft)]`}
        />
      </div>
    </div>
  );
};

export default AuthInput;
