import Link from 'next/link';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="container mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-2xl font-bold">
                Learning Platform
              </Link>
              <div className="hidden md:flex gap-6">
                <Link href="/courses" className="hover:text-blue-600">
                  Courses
                </Link>
                <Link href="/problems" className="hover:text-blue-600">
                  Problems
                </Link>
                <Link href="/discussions" className="hover:text-blue-600">
                  Discussions
                </Link>
                <Link href="/community" className="hover:text-blue-600">
                  Community
                </Link>
                <Link href="/roadmaps" className="hover:text-blue-600">
                  Roadmaps
                </Link>
                <Link href="/bootcamps" className="hover:text-blue-600">
                  Bootcamps
                </Link>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/login" className="px-4 py-2 hover:text-blue-600">
                Log in
              </Link>
              <Link
                href="/signup"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-12">
        <div className="container mx-auto px-6 py-8">
          <p className="text-center text-gray-400">
            © 2024 Learning Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
