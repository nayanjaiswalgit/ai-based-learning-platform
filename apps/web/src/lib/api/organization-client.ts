import { request } from '../api-client';

const AUTH_SERVICE_URL = process.env.NEXT_PUBLIC_AUTH_SERVICE_URL || 'http://localhost:3000';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  type: 'UNIVERSITY' | 'COLLEGE' | 'COMPANY' | 'BOOTCAMP' | 'TRAINING_CENTER' | 'SCHOOL' | 'OTHER';
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  settings?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  creator?: {
    id: string;
    username: string;
    email: string;
  };
  members?: OrganizationMember[];
  departments?: Department[];
  _count?: {
    members: number;
    courses: number;
    bootcamps: number;
  };
}

export interface OrganizationMember {
  id: string;
  organizationId: string;
  userId: string;
  role: 'STUDENT' | 'INSTRUCTOR' | 'MENTOR' | 'ADMIN';
  title?: string;
  departmentId?: string;
  permissions?: any;
  isActive: boolean;
  joinedAt: string;
  leftAt?: string;
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
    profile?: any;
  };
  department?: Department;
}

export interface Department {
  id: string;
  organizationId: string;
  name: string;
  description?: string;
  headMemberId?: string;
  createdAt: string;
  updatedAt: string;
  members?: OrganizationMember[];
  _count?: {
    members: number;
  };
}

export interface CreateOrganizationDto {
  name: string;
  slug: string;
  type: Organization['type'];
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  settings?: any;
}

export interface UpdateOrganizationDto {
  name?: string;
  type?: Organization['type'];
  description?: string;
  website?: string;
  logoUrl?: string;
  industry?: string;
  location?: string;
  isActive?: boolean;
  settings?: any;
}

export interface AddMemberDto {
  userId: string;
  role: OrganizationMember['role'];
  title?: string;
  departmentId?: string;
  permissions?: any;
}

export interface UpdateMemberDto {
  role?: OrganizationMember['role'];
  title?: string;
  departmentId?: string;
  permissions?: any;
  isActive?: boolean;
}

export interface CreateDepartmentDto {
  name: string;
  description?: string;
  headMemberId?: string;
}

export const organizationApi = {
  // Organization CRUD
  create: (data: CreateOrganizationDto, token?: string) =>
    request<Organization>(`${AUTH_SERVICE_URL}/api/v1/organizations`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getAll: (filters?: {
    type?: string;
    isActive?: boolean;
    search?: string;
    limit?: number;
    offset?: number;
  }, token?: string) => {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.search) params.append('search', filters.search);
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.offset) params.append('offset', String(filters.offset));

    const query = params.toString();
    return request<{
      organizations: Organization[];
      total: number;
      limit: number;
      offset: number;
    }>(`${AUTH_SERVICE_URL}/api/v1/organizations${query ? `?${query}` : ''}`, { token });
  },

  getMyOrganizations: (token?: string) =>
    request<Organization[]>(`${AUTH_SERVICE_URL}/api/v1/organizations/my-organizations`, { token }),

  getBySlug: (slug: string, token?: string) =>
    request<Organization>(`${AUTH_SERVICE_URL}/api/v1/organizations/${slug}`, { token }),

  update: (slug: string, data: UpdateOrganizationDto, token?: string) =>
    request<Organization>(`${AUTH_SERVICE_URL}/api/v1/organizations/${slug}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  delete: (slug: string, token?: string) =>
    request<void>(`${AUTH_SERVICE_URL}/api/v1/organizations/${slug}`, {
      method: 'DELETE',
      token,
    }),

  // Member Management
  addMember: (slug: string, data: AddMemberDto, token?: string) =>
    request<OrganizationMember>(`${AUTH_SERVICE_URL}/api/v1/organizations/${slug}/members`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getMembers: (slug: string, filters?: {
    role?: string;
    departmentId?: string;
    isActive?: boolean;
  }, token?: string) => {
    const params = new URLSearchParams();
    if (filters?.role) params.append('role', filters.role);
    if (filters?.departmentId) params.append('departmentId', filters.departmentId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));

    const query = params.toString();
    return request<OrganizationMember[]>(
      `${AUTH_SERVICE_URL}/api/v1/organizations/${slug}/members${query ? `?${query}` : ''}`,
      { token }
    );
  },

  updateMember: (memberId: string, data: UpdateMemberDto, token?: string) =>
    request<OrganizationMember>(`${AUTH_SERVICE_URL}/api/v1/organizations/members/${memberId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  removeMember: (memberId: string, token?: string) =>
    request<void>(`${AUTH_SERVICE_URL}/api/v1/organizations/members/${memberId}`, {
      method: 'DELETE',
      token,
    }),

  // Department Management
  createDepartment: (slug: string, data: CreateDepartmentDto, token?: string) =>
    request<Department>(`${AUTH_SERVICE_URL}/api/v1/organizations/${slug}/departments`, {
      method: 'POST',
      body: JSON.stringify(data),
      token,
    }),

  getDepartments: (slug: string, token?: string) =>
    request<Department[]>(`${AUTH_SERVICE_URL}/api/v1/organizations/${slug}/departments`, { token }),

  updateDepartment: (departmentId: string, data: Partial<CreateDepartmentDto>, token?: string) =>
    request<Department>(`${AUTH_SERVICE_URL}/api/v1/organizations/departments/${departmentId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      token,
    }),

  deleteDepartment: (departmentId: string, token?: string) =>
    request<void>(`${AUTH_SERVICE_URL}/api/v1/organizations/departments/${departmentId}`, {
      method: 'DELETE',
      token,
    }),

  // Mentors
  getMentors: (slug: string, departmentId?: string, token?: string) => {
    const params = new URLSearchParams();
    if (departmentId) params.append('departmentId', departmentId);

    const query = params.toString();
    return request<OrganizationMember[]>(
      `${AUTH_SERVICE_URL}/api/v1/organizations/${slug}/mentors${query ? `?${query}` : ''}`,
      { token }
    );
  },

  // Utilities
  getSuggestedTitles: (slug: string, token?: string) =>
    request<{ titles: string[] }>(
      `${AUTH_SERVICE_URL}/api/v1/organizations/${slug}/suggested-titles`,
      { token }
    ),
};
