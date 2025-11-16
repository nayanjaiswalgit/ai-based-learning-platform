'use client';

import { useState } from 'react';
import MuxPlayer from '@mux/mux-player-react';

export default function DemoPage() {
  const [playbackId] = useState('YOUR_MUX_PLAYBACK_ID'); // Replace with actual playback ID
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTimeUpdate = (event: any) => {
    setCurrentTime(event.target.currentTime);
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <a href="/" className="text-blue-600 hover:underline">
            ← Back to Home
          </a>
        </div>

        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Video Player Demo
        </h1>
        <p className="text-gray-600 mb-8">
          Experience our advanced video player with Mux adaptive streaming
        </p>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <MuxPlayer
                playbackId={playbackId}
                metadata={{
                  video_title: 'Introduction to React',
                  viewer_user_id: 'demo-user',
                }}
                streamType="on-demand"
                autoPlay={false}
                onPlay={handlePlay}
                onPause={handlePause}
                onTimeUpdate={handleTimeUpdate}
                className="w-full aspect-video"
              />
            </div>

            {/* Course Content */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-4">
                Introduction to React
              </h2>
              <p className="text-gray-600 mb-4">
                Learn the fundamentals of React, including components, props,
                and state management.
              </p>

              <div className="flex gap-4 items-center text-sm text-gray-500">
                <span>⏱️ 15 minutes</span>
                <span>📚 Module 1</span>
                <span>👁️ Free Preview</span>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Playback Stats */}
            <div className="bg-white rounded-lg shadow p-6 mb-6">
              <h3 className="font-semibold mb-4">Playback Stats</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium">
                    {isPlaying ? '▶️ Playing' : '⏸️ Paused'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Time:</span>
                  <span className="font-medium">
                    {Math.floor(currentTime)}s
                  </span>
                </div>
              </div>
            </div>

            {/* Course Modules */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold mb-4">Course Content</h3>
              <div className="space-y-3">
                <div className="p-3 bg-blue-50 rounded border-l-4 border-blue-600">
                  <div className="flex items-center gap-2">
                    <span className="text-blue-600">▶️</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Introduction to React
                      </div>
                      <div className="text-xs text-gray-500">15 min</div>
                    </div>
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                      Free
                    </span>
                  </div>
                </div>

                <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">▶️</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Setting Up Dev Environment
                      </div>
                      <div className="text-xs text-gray-500">20 min</div>
                    </div>
                    <span className="text-xs text-gray-400">🔒</span>
                  </div>
                </div>

                <div className="p-3 hover:bg-gray-50 rounded cursor-pointer">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">▶️</span>
                    <div className="flex-1">
                      <div className="font-medium text-sm">
                        Your First Component
                      </div>
                      <div className="text-xs text-gray-500">25 min</div>
                    </div>
                    <span className="text-xs text-gray-400">🔒</span>
                  </div>
                </div>
              </div>

              <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
                Enroll Now - $99.99
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🎬</div>
            <div className="font-semibold">HD Streaming</div>
            <div className="text-xs text-gray-500">Adaptive bitrate</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">🔒</div>
            <div className="font-semibold">DRM Protected</div>
            <div className="text-xs text-gray-500">Secure content</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">📱</div>
            <div className="font-semibold">Mobile Friendly</div>
            <div className="text-xs text-gray-500">Watch anywhere</div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow text-center">
            <div className="text-2xl mb-2">⚡</div>
            <div className="font-semibold">Fast Loading</div>
            <div className="text-xs text-gray-500">No buffering</div>
          </div>
        </div>
      </div>
    </div>
  );
}
