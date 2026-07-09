import Link from "next/link";

// 404 for routes under /{locale} (incl. invalid feature slugs). The [locale] layout
// provides <html>/<body>, so this renders content only.
export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center px-4 hero-gradient">
      <div className="text-center max-w-md relative z-10">
        <p className="text-7xl sm:text-8xl font-bold gradient-text">404</p>
        <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Page not found</h1>
        <p className="mt-4 text-slate-600 dark:text-slate-400">
          The page you&apos;re looking for doesn&apos;t exist or has moved.
        </p>
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link
            href="/en"
            className="btn-primary text-white px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
          >
            Back to Logistiq
          </Link>
          <Link
            href="/en/features"
            className="btn-secondary px-6 py-3 rounded-xl font-medium inline-flex items-center gap-2"
          >
            Explore features
          </Link>
        </div>
      </div>
    </main>
  );
}
