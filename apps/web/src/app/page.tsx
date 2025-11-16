import Link from 'next/link'
import { BarChart3, Users, TrendingUp, Flag, Activity, FileText } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Analytics Dashboard
          </h1>
          <p className="text-xl text-gray-600">
            Comprehensive analytics and insights for the AI Learning Platform
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* User Analytics */}
          <Link
            href="/analytics/user/demo-user-id"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <BarChart3 className="w-8 h-8 text-blue-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              User Analytics
            </h2>
            <p className="text-gray-600">
              Learning streaks, time tracking, course progress, and achievements
            </p>
          </Link>

          {/* Instructor Analytics */}
          <Link
            href="/analytics/instructor/demo-instructor-id"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <Users className="w-8 h-8 text-green-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Instructor Dashboard
            </h2>
            <p className="text-gray-600">
              Course performance, revenue analytics, and student engagement
            </p>
          </Link>

          {/* Admin Analytics */}
          <Link
            href="/analytics/admin"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <TrendingUp className="w-8 h-8 text-purple-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-gray-600">
              Platform metrics, revenue tracking, and content analytics
            </p>
          </Link>

          {/* Feature Flags */}
          <Link
            href="/feature-flags"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
                <Flag className="w-8 h-8 text-orange-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Feature Flags
            </h2>
            <p className="text-gray-600">
              Manage feature rollouts and A/B testing experiments
            </p>
          </Link>

          {/* Performance Monitoring */}
          <Link
            href="/performance"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-red-100 rounded-lg group-hover:bg-red-200 transition-colors">
                <Activity className="w-8 h-8 text-red-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Performance
            </h2>
            <p className="text-gray-600">
              API metrics, database performance, and error tracking
            </p>
          </Link>

          {/* Reports */}
          <Link
            href="/reports/demo-user-id"
            className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-teal-100 rounded-lg group-hover:bg-teal-200 transition-colors">
                <FileText className="w-8 h-8 text-teal-600" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Reports
            </h2>
            <p className="text-gray-600">
              Weekly and monthly reports with export functionality
            </p>
          </Link>
        </div>

        {/* Footer */}
        <div className="text-center mt-16">
          <p className="text-gray-500">
            Built with Next.js 15, React 19, and Recharts
          </p>
          <p className="text-gray-400 mt-2">
            Agent 12: Analytics & Reporting System
          </p>
        </div>
      </div>
    </div>
  )
}
