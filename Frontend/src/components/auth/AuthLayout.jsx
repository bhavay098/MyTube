const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-md border border-zinc-800 rounded-3xl p-8 bg-zinc-950">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">{title}</h1>

          <p className="text-zinc-400 mt-2 text-sm">{subtitle}</p>
        </div>

        {children}
      </div>
    </div>
  );
};

export default AuthLayout;
