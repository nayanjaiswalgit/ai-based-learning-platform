import Link from 'next/link';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 text-white p-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold">Learning Platform</h2>
        </div>
        <nav className="space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-800">
            Dashboard
          </Link>
          <Link href="/dashboard/courses" className="block px-4 py-2 rounded hover:bg-gray-800">
            My Courses
          </Link>
          <Link href="/dashboard/dsa" className="block px-4 py-2 rounded hover:bg-gray-800">
            DSA
          </Link>
          <Link href="/dashboard/discussions" className="block px-4 py-2 rounded hover:bg-gray-800">
            Discussions
          </Link>
          <Link href="/dashboard/roadmaps" className="block px-4 py-2 rounded hover:bg-gray-800">
            Roadmaps
          </Link>
          <Link href="/dashboard/achievements" className="block px-4 py-2 rounded hover:bg-gray-800">
            Achievements
          </Link>
          <Link href="/dashboard/analytics" className="block px-4 py-2 rounded hover:bg-gray-800">
            Analytics
          </Link>
          <Link href="/dashboard/messages" className="block px-4 py-2 rounded hover:bg-gray-800">
            Messages
          </Link>
          <Link href="/dashboard/notifications" className="block px-4 py-2 rounded hover:bg-gray-800">
            Notifications
          </Link>
          <Link href="/dashboard/schedule" className="block px-4 py-2 rounded hover:bg-gray-800">
            Schedule
          </Link>
          <Link href="/dashboard/profile" className="block px-4 py-2 rounded hover:bg-gray-800">
            Profile
          </Link>
          <Link href="/dashboard/settings" className="block px-4 py-2 rounded hover:bg-gray-800">
            Settings
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 bg-white">
        <header className="bg-white border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <div className="flex items-center gap-4">
              <button className="p-2 rounded hover:bg-gray-100" aria-label="Notifications">
                🔔
              </button>
              <button className="p-2 rounded hover:bg-gray-100" aria-label="User menu">
                👤
              </button>
            </div>
          </div>
        </header>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
