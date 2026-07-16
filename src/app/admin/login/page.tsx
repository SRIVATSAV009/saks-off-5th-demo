import { adminLogin } from "@/app/admin/login/actions";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-[70vh] w-full flex items-center justify-center bg-[#1b1b1b] px-4 py-16">
      <div className="w-full max-w-sm bg-[#242424] border border-[#3a3a3a] p-8 text-[#e8e8e8]">
        <p className="text-xs tracking-widest uppercase text-[#9c7a3c] mb-1">Saks OFF 5TH</p>
        <h1 className="font-display text-2xl mb-6">Business Manager</h1>

        {error === "1" && (
          <p className="bg-[#3a2323] border border-[#5a3a3a] text-[#e8a0a0] text-sm px-4 py-2 mb-6">
            Incorrect password.
          </p>
        )}

        <form action={adminLogin} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="password">
              Admin Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm text-[#e8e8e8] focus:outline-none focus:border-[#9c7a3c]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#9c7a3c] text-[#1b1b1b] py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b28e4c]"
          >
            Log In
          </button>
        </form>

        <p className="text-xs text-[#7a7a7a] mt-6">
          Demo password: <span className="font-mono">admin123</span>
        </p>
      </div>
    </div>
  );
}
