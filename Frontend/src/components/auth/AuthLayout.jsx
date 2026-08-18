import { Link } from "react-router-dom";

const AuthLayout = ({ title, subtitle, children }) => {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-(--bg) px-4">
      {/* Background gradient orbs */}
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-(--accent) opacity-[0.04] blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-(--accent) opacity-[0.04] blur-3xl" />

      <div className="animate-fade-in w-full max-w-md">
        <div className="mb-8 text-center">
          <Link
            to="/"
            className="mb-6 inline-block text-2xl font-bold tracking-tight"
          >
            <span className="text-(--accent)">My</span>
            <span className="text-(--text)">Tube</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-(--border) bg-(--surface) p-8 shadow-(--shadow)">
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-(--text)">{title}</h1>
            <p className="mt-2 text-sm text-(--muted)">{subtitle}</p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
