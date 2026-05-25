const AuthInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  name,
}) => {
  return (
    <div>
      <label className="block text-sm text-zinc-300 mb-2">{label}</label>

      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        name={name}
        className="w-full bg-black border border-zinc-800 rounded-xl px-4 py-3 text-white outline-none focus:border-zinc-600 transition-all duration-200"
      />
    </div>
  );
};

export default AuthInput;
