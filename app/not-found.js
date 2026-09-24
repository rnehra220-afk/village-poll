import Link from "next/link";

export default function NotFound() {
  return (
    <div className="max-w-xl mx-auto px-4 py-20 text-center">
      <p className="text-6xl font-bold text-slate-200" aria-hidden>404</p>
      <h1 className="text-xl font-bold text-slate-900 mt-2">Page not found</h1>
      <p className="text-sm text-slate-500 mt-2">This poll could not be found. It may have been removed.</p>
      <Link href="/" className="btn-primary mt-6">Go Home</Link>
    </div>
  );
}
