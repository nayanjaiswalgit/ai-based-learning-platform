const fs = require('fs');
const path = require('path');

// Template for a basic page
const pageTemplate = (title, description) => `export default function Page() {
  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-4">${title}</h1>
      <p className="text-gray-600 mb-6">${description}</p>
      <div className="space-y-4">
        <div className="rounded-lg border p-4">
          <p>Content for ${title} will be displayed here.</p>
        </div>
      </div>
    </div>
  );
}
`;

// Define all pages to create
const pages = [
  // Dashboard pages
  { path: 'app/(dashboard)/dashboard/page.tsx', title: 'Dashboard', description: 'Welcome to your dashboard' },
  { path: 'app/(dashboard)/dashboard/profile/page.tsx', title: 'Profile', description: 'Manage your profile' },
  { path: 'app/(dashboard)/dashboard/settings/page.tsx', title: 'Settings', description: 'Manage your settings' },
  { path: 'app/(dashboard)/dashboard/discussions/page.tsx', title: 'Discussions', description: 'Community discussions' },
  { path: 'app/(dashboard)/dashboard/dsa/page.tsx', title: 'DSA', description: 'Data Structures & Algorithms' },
  { path: 'app/(dashboard)/dashboard/roadmaps/page.tsx', title: 'Roadmaps', description: 'Learning roadmaps' },
  { path: 'app/(dashboard)/dashboard/achievements/page.tsx', title: 'Achievements', description: 'Your achievements' },
  { path: 'app/(dashboard)/dashboard/analytics/page.tsx', title: 'Analytics', description: 'Your analytics' },
  { path: 'app/(dashboard)/dashboard/messages/page.tsx', title: 'Messages', description: 'Your messages' },
  { path: 'app/(dashboard)/dashboard/notifications/page.tsx', title: 'Notifications', description: 'Your notifications' },
  { path: 'app/(dashboard)/dashboard/schedule/page.tsx', title: 'Schedule', description: 'Your schedule' },

  // Course pages
  { path: 'app/(main)/courses/page.tsx', title: 'Courses', description: 'Browse all courses' },
  { path: 'app/(main)/courses/[id]/page.tsx', title: 'Course Details', description: 'Course information' },

  // Analytics pages
  { path: 'app/(dashboard)/analytics/user/[id]/page.tsx', title: 'User Analytics', description: 'User analytics dashboard' },
  { path: 'app/(dashboard)/analytics/instructor/[id]/page.tsx', title: 'Instructor Analytics', description: 'Instructor analytics dashboard' },
  { path: 'app/(dashboard)/analytics/admin/page.tsx', title: 'Admin Analytics', description: 'Admin analytics dashboard' },

  // Coding challenges
  { path: 'app/(main)/problems/[id]/page.tsx', title: 'Problem', description: 'Coding challenge' },
  { path: 'app/(main)/problems/page.tsx', title: 'Problems', description: 'All coding problems' },

  // Community
  { path: 'app/(main)/discussions/page.tsx', title: 'Discussions', description: 'Community discussions' },
  { path: 'app/(main)/discussions/[id]/page.tsx', title: 'Discussion', description: 'Discussion thread' },
  { path: 'app/(main)/community/page.tsx', title: 'Community', description: 'Community page' },
  { path: 'app/(main)/community/cohort/page.tsx', title: 'Cohort', description: 'Your cohort' },
  { path: 'app/(main)/community/leaderboard/page.tsx', title: 'Leaderboard', description: 'Community leaderboard' },
  { path: 'app/(main)/community/profiles/[id]/page.tsx', title: 'Profile', description: 'User profile' },

  // Other pages
  { path: 'app/(main)/bootcamps/page.tsx', title: 'Bootcamps', description: 'Browse bootcamps' },
  { path: 'app/(main)/bootcamps/[id]/page.tsx', title: 'Bootcamp', description: 'Bootcamp details' },
  { path: 'app/(dashboard)/reports/page.tsx', title: 'Reports', description: 'Reports dashboard' },
  { path: 'app/(dashboard)/reports/[id]/page.tsx', title: 'Report', description: 'Report details' },
  { path: 'app/(dashboard)/performance/page.tsx', title: 'Performance', description: 'Performance monitoring' },
  { path: 'app/(dashboard)/feature-flags/page.tsx', title: 'Feature Flags', description: 'Feature flags management' },

  // Learning experience
  { path: 'app/(dashboard)/dashboard/courses/[id]/page.tsx', title: 'Course', description: 'Course page' },
  { path: 'app/(dashboard)/dashboard/courses/[id]/learn/page.tsx', title: 'Learn', description: 'Learning interface' },

  // Additional pages from tests
  { path: 'app/(main)/roadmaps/page.tsx', title: 'Roadmaps', description: 'Career roadmaps' },
  { path: 'app/(main)/roadmaps/[id]/page.tsx', title: 'Roadmap', description: 'Roadmap details' },
  { path: 'app/(main)/terminal/page.tsx', title: 'Terminal', description: 'Interactive terminal' },
  { path: 'app/(main)/interactive/terminal/page.tsx', title: 'Terminal', description: 'Interactive terminal' },
  { path: 'app/(main)/interactive/chat/page.tsx', title: 'Chat', description: 'Live chat' },
  { path: 'app/(main)/learning/page.tsx', title: 'Learning', description: 'Learning resources' },
  { path: 'app/(main)/learning/[id]/page.tsx', title: 'Learning', description: 'Learning content' },
];

// Create pages
pages.forEach(({ path: pagePath, title, description }) => {
  const fullPath = path.join(__dirname, '..', pagePath);
  const dir = path.dirname(fullPath);

  // Create directory if it doesn't exist
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  // Write page file
  fs.writeFileSync(fullPath, pageTemplate(title, description));
  console.log(`Created: ${pagePath}`);
});

console.log(`\n✅ Successfully created ${pages.length} pages!`);
