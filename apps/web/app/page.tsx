export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            AI-Based Learning Platform
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Master new skills with personalized AI-driven learning paths
          </p>
          <div className="flex gap-4 justify-center">
            <a
              href="/courses"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Courses
            </a>
            <a
              href="/demo"
              className="bg-gray-200 text-gray-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition"
            >
              Watch Demo
            </a>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-16">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎓</div>
            <h3 className="text-xl font-semibold mb-2">Expert Instructors</h3>
            <p className="text-gray-600">
              Learn from industry professionals with real-world experience
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🎥</div>
            <h3 className="text-xl font-semibold mb-2">HD Video Content</h3>
            <p className="text-gray-600">
              High-quality video lessons with adaptive streaming and DRM protection
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="text-4xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">AI-Powered Learning</h3>
            <p className="text-gray-600">
              Personalized roadmaps and recommendations based on your goals
            </p>
          </div>
        </div>

        <div className="mt-16 bg-blue-600 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Learning?</h2>
          <p className="text-xl mb-6">
            Join thousands of students already learning on our platform
          </p>
          <a
            href="/signup"
            className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition inline-block"
          >
            Get Started Free
          </a>
        </div>
      </div>
    </main>
  );
}
