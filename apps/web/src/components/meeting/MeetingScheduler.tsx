'use client';

import React, { useState } from 'react';
import { Calendar, Clock, Video, User } from 'lucide-react';

interface TimeSlot {
  time: string;
  available: boolean;
}

interface MeetingSchedulerProps {
  mentorId: string;
  mentorName: string;
  mentorAvatar?: string;
  onSchedule?: (data: { date: Date; time: string; agenda: string }) => void;
}

export function MeetingScheduler({ mentorId, mentorName, mentorAvatar, onSchedule }: MeetingSchedulerProps) {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [agenda, setAgenda] = useState('');

  // Mock time slots - would come from API
  const timeSlots: TimeSlot[] = [
    { time: '09:00 AM', available: true },
    { time: '10:00 AM', available: true },
    { time: '11:00 AM', available: false },
    { time: '02:00 PM', available: true },
    { time: '03:00 PM', available: true },
    { time: '04:00 PM', available: true },
  ];

  const handleSchedule = () => {
    if (selectedDate && selectedTime && agenda) {
      onSchedule?.({
        date: selectedDate,
        time: selectedTime,
        agenda,
      });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-2xl mx-auto">
      {/* Mentor Info */}
      <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-200">
        {mentorAvatar ? (
          <img
            src={mentorAvatar}
            alt={mentorName}
            className="w-16 h-16 rounded-full"
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-blue-500 flex items-center justify-center">
            <User className="w-8 h-8 text-white" />
          </div>
        )}
        <div>
          <h2 className="text-xl font-bold text-gray-900">Schedule 1:1 Meeting</h2>
          <p className="text-gray-600">with {mentorName}</p>
        </div>
      </div>

      {/* Date Selection */}
      <div className="mb-6">
        <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
          <Calendar className="w-4 h-4" />
          Select Date
        </label>
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          onChange={(e) => setSelectedDate(new Date(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Time Slots */}
      {selectedDate && (
        <div className="mb-6">
          <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
            <Clock className="w-4 h-4" />
            Available Time Slots
          </label>
          <div className="grid grid-cols-3 gap-3">
            {timeSlots.map((slot) => (
              <button
                key={slot.time}
                disabled={!slot.available}
                onClick={() => setSelectedTime(slot.time)}
                className={`py-2 px-4 rounded-lg font-semibold text-sm transition-colors ${
                  !slot.available
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : selectedTime === slot.time
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {slot.time}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agenda */}
      {selectedTime && (
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 block">
            Meeting Agenda
          </label>
          <textarea
            value={agenda}
            onChange={(e) => setAgenda(e.target.value)}
            placeholder="What would you like to discuss?"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>
      )}

      {/* Summary & Action */}
      {selectedDate && selectedTime && agenda && (
        <div className="bg-blue-50 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-gray-900 mb-2">Meeting Summary</h3>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              <span>{selectedDate.toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              <span>{selectedTime}</span>
            </div>
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              <span>30 minutes (Google Meet)</span>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Button */}
      <button
        onClick={handleSchedule}
        disabled={!selectedDate || !selectedTime || !agenda}
        className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
      >
        Schedule Meeting
      </button>
    </div>
  );
}
