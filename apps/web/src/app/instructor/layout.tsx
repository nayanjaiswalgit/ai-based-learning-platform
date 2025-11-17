import { ReactNode } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  FileQuestion,
  BarChart3,
  Settings,
  PlusCircle,
  Users
} from 'lucide-react';

export default function InstructorLayout({ children }: { children: ReactNode }) {
  const navigation = [
    { name: 'Dashboard', href: '/instructor', icon: LayoutDashboard },
    { name: 'My Courses', href: '/instructor/courses', icon: BookOpen },
    { name: 'Create Course', href: '/instructor/courses/create', icon: PlusCircle },
    { name: 'Assessments', href: '/instructor/assessments', icon: FileQuestion },
    { name: 'Students', href: '/instructor/students', icon: Users },
    { name: 'Analytics', href: '/instructor/analytics', icon: BarChart3 },
    { name: 'Settings', href: '/instructor/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="hidden lg:flex lg:flex-shrink-0">
          <div className="flex w-64 flex-col">
            <div className="flex min-h-0 flex-1 flex-col border-r border-slate-200 bg-white/80 backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/80">
              <div className="flex flex-1 flex-col overflow-y-auto pt-5 pb-4">
                <div className="flex flex-shrink-0 items-center px-6">
                  <GraduationCap className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <span className="ml-2 text-xl font-bold text-slate-900 dark:text-white">
                    Instructor
                  </span>
                </div>
                <nav className="mt-8 flex-1 space-y-1 px-3">
                  {navigation.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className="group flex items-center rounded-lg px-3 py-2.5 text-sm font-medium text-slate-700 transition-all hover:bg-blue-50 hover:text-blue-600 dark:text-slate-300 dark:hover:bg-blue-950 dark:hover:text-blue-400"
                    >
                      <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
                      {item.name}
                    </Link>
                  ))}
                </nav>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="flex flex-1 flex-col">
          <main className="flex-1">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
