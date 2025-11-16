/**
 * React Hooks for Bootcamp & Cohort Features
 * Agent 9 - Frontend Integration
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import bootcampClient from '../api/bootcamp-client';

// ===== BOOTCAMPS =====

export function useBootcamps(filters?: any) {
  return useQuery({
    queryKey: ['bootcamps', filters],
    queryFn: () => bootcampClient.getBootcamps(filters),
  });
}

export function useBootcamp(id: string) {
  return useQuery({
    queryKey: ['bootcamp', id],
    queryFn: () => bootcampClient.getBootcamp(id),
    enabled: !!id,
  });
}

export function useApplyToBootcamp() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bootcampClient.applyToBootcamp,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-applications'] });
    },
  });
}

export function useMyApplications() {
  return useQuery({
    queryKey: ['my-applications'],
    queryFn: () => bootcampClient.getMyApplications(),
  });
}

// ===== COHORTS =====

export function useCohorts(bootcampId: string) {
  return useQuery({
    queryKey: ['cohorts', bootcampId],
    queryFn: () => bootcampClient.getCohorts(bootcampId),
    enabled: !!bootcampId,
  });
}

export function useCohort(cohortId: string) {
  return useQuery({
    queryKey: ['cohort', cohortId],
    queryFn: () => bootcampClient.getCohort(cohortId),
    enabled: !!cohortId,
  });
}

export function useCohortDashboard(cohortId: string) {
  return useQuery({
    queryKey: ['cohort-dashboard', cohortId],
    queryFn: () => bootcampClient.getCohortDashboard(cohortId),
    enabled: !!cohortId,
  });
}

export function useEnrollInCohort() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cohortId: string) => bootcampClient.enrollInCohort(cohortId),
    onSuccess: (_, cohortId) => {
      queryClient.invalidateQueries({ queryKey: ['cohort', cohortId] });
    },
  });
}

// ===== LIVE SESSIONS =====

export function useLiveSessions(cohortId: string, upcoming = true) {
  return useQuery({
    queryKey: ['live-sessions', cohortId, upcoming],
    queryFn: () => bootcampClient.getLiveSessions(cohortId, upcoming),
    enabled: !!cohortId,
  });
}

export function useSession(sessionId: string) {
  return useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => bootcampClient.getSession(sessionId),
    enabled: !!sessionId,
  });
}

// ===== 1:1 MEETINGS =====

export function useMentorAvailability(mentorId: string) {
  return useQuery({
    queryKey: ['mentor-availability', mentorId],
    queryFn: () => bootcampClient.getMentorAvailability(mentorId),
    enabled: !!mentorId,
  });
}

export function useBookMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bootcampClient.bookMeeting,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-meetings'] });
    },
  });
}

export function useMyMeetings(role: 'mentor' | 'student', upcoming = true) {
  return useQuery({
    queryKey: ['my-meetings', role, upcoming],
    queryFn: () => bootcampClient.getMyMeetings(role, upcoming),
  });
}

// ===== ASSIGNMENTS =====

export function useAssignments(cohortId: string) {
  return useQuery({
    queryKey: ['assignments', cohortId],
    queryFn: () => bootcampClient.getAssignments(cohortId),
    enabled: !!cohortId,
  });
}

export function useAssignment(assignmentId: string) {
  return useQuery({
    queryKey: ['assignment', assignmentId],
    queryFn: () => bootcampClient.getAssignment(assignmentId),
    enabled: !!assignmentId,
  });
}

export function useSubmitAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ assignmentId, submission }: any) =>
      bootcampClient.submitAssignment(assignmentId, submission),
    onSuccess: (_, { assignmentId }) => {
      queryClient.invalidateQueries({ queryKey: ['assignment', assignmentId] });
      queryClient.invalidateQueries({ queryKey: ['my-submissions'] });
    },
  });
}

export function useMySubmissions(cohortId?: string) {
  return useQuery({
    queryKey: ['my-submissions', cohortId],
    queryFn: () => bootcampClient.getMySubmissions(cohortId),
  });
}

// ===== CERTIFICATES =====

export function useMyCertificates() {
  return useQuery({
    queryKey: ['my-certificates'],
    queryFn: () => bootcampClient.getMyCertificates(),
  });
}

export function useCertificate(certificateId: string) {
  return useQuery({
    queryKey: ['certificate', certificateId],
    queryFn: () => bootcampClient.getCertificate(certificateId),
    enabled: !!certificateId,
  });
}

export function useVerifyCertificate(certificateNumber: string) {
  return useQuery({
    queryKey: ['verify-certificate', certificateNumber],
    queryFn: () => bootcampClient.verifyCertificate(certificateNumber),
    enabled: !!certificateNumber,
  });
}

// ===== PROJECT SHOWCASE =====

export function useProjectShowcases(cohortId: string) {
  return useQuery({
    queryKey: ['project-showcases', cohortId],
    queryFn: () => bootcampClient.getProjectShowcases(cohortId),
    enabled: !!cohortId,
  });
}

export function useCreateProjectShowcase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cohortId, project }: any) =>
      bootcampClient.createProjectShowcase(cohortId, project),
    onSuccess: (_, { cohortId }) => {
      queryClient.invalidateQueries({ queryKey: ['project-showcases', cohortId] });
    },
  });
}
