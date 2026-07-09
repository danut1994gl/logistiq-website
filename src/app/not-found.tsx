import Link from "next/link";

// Global 404. Rendered outside the [locale] layout, so it provides its own
// html/body. English + dark, on-brand.
export default function NotFound() {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-white antialiased">
        <main className="min-h-screen flex items-center justify-center px-4 hero-gradient">
          <div className="text-center max-w-md relative z-10">
            <p className="text-7xl sm:text-8xl font-bold gradient-text">404</p>
            <h1 className="mt-4 text-2xl sm:text-3xl font-bold text-white">Page not found</h1>
            <p className="mt-4 text-slate-400">
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
      </body>
    </html>
  );
}
