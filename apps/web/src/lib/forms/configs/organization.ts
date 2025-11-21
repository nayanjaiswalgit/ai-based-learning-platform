/**
 * Organization Form Configurations
 * Config-driven forms for organization and team management
 */

import { FormConfig } from '../types';

export const createOrganizationFormConfig: FormConfig = {
  id: 'create-organization-form',
  title: 'Create Organization',
  description: 'Set up a new organization for your team',
  method: 'POST',
  action: '/api/organizations',
  sections: [
    {
      id: 'org-info',
      title: 'Organization Information',
      fields: [
        {
          id: 'name',
          name: 'name',
          label: 'Organization Name',
          type: 'text',
          placeholder: 'Acme Corporation',
          validation: [
            { type: 'required', message: 'Organization name is required' },
            { type: 'minLength', value: 3, message: 'Name must be at least 3 characters' },
            { type: 'maxLength', value: 50, message: 'Name must be less than 50 characters' },
          ],
        },
        {
          id: 'slug',
          name: 'slug',
          label: 'Organization Slug',
          type: 'text',
          placeholder: 'acme-corp',
          helpText: 'This will be used in URLs (e.g., yourplatform.com/org/acme-corp)',
          validation: [
            { type: 'required', message: 'Slug is required' },
            { type: 'pattern', value: '^[a-z0-9-]+$', message: 'Slug can only contain lowercase letters, numbers, and hyphens' },
            { type: 'minLength', value: 3, message: 'Slug must be at least 3 characters' },
          ],
        },
        {
          id: 'description',
          name: 'description',
          label: 'Description',
          type: 'textarea',
          placeholder: 'Tell us about your organization...',
          rows: 3,
          validation: [
            { type: 'minLength', value: 20, message: 'Description must be at least 20 characters' },
          ],
        },
      ],
    },
    {
      id: 'contact',
      title: 'Contact Information',
      layout: 'grid',
      columns: 2,
      fields: [
        {
          id: 'email',
          name: 'email',
          label: 'Organization Email',
          type: 'email',
          placeholder: 'contact@acme.com',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email' },
          ],
        },
        {
          id: 'website',
          name: 'website',
          label: 'Website (Optional)',
          type: 'url',
          placeholder: 'https://acme.com',
          validation: [
            { type: 'pattern', value: '^https?://', message: 'Please enter a valid URL' },
          ],
        },
      ],
    },
    {
      id: 'settings',
      title: 'Organization Settings',
      fields: [
        {
          id: 'isPrivate',
          name: 'isPrivate',
          label: 'Make organization private',
          type: 'checkbox',
          defaultValue: false,
          helpText: 'Private organizations are only visible to members',
        },
        {
          id: 'allowMemberInvites',
          name: 'allowMemberInvites',
          label: 'Allow members to send invites',
          type: 'checkbox',
          defaultValue: true,
        },
        {
          id: 'requireApproval',
          name: 'requireApproval',
          label: 'Require admin approval for new members',
          type: 'checkbox',
          defaultValue: false,
        },
      ],
    },
  ],
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Create Organization',
      variant: 'default',
      loadingText: 'Creating...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Organization created successfully!',
  },
};

export const inviteUserFormConfig: FormConfig = {
  id: 'invite-user-form',
  title: 'Invite Team Member',
  description: 'Send an invitation to join your organization',
  method: 'POST',
  action: '/api/organizations/:orgId/invites',
  sections: [
    {
      id: 'invite-details',
      fields: [
        {
          id: 'email',
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'colleague@example.com',
          validation: [
            { type: 'required', message: 'Email is required' },
            { type: 'email', message: 'Please enter a valid email address' },
          ],
        },
        {
          id: 'role',
          name: 'role',
          label: 'Role',
          type: 'select',
          options: [
            { label: 'Admin', value: 'ADMIN' },
            { label: 'Member', value: 'MEMBER' },
            { label: 'Viewer', value: 'VIEWER' },
          ],
          defaultValue: 'MEMBER',
          validation: [
            { type: 'required', message: 'Role is required' },
          ],
        },
        {
          id: 'message',
          name: 'message',
          label: 'Personal Message (Optional)',
          type: 'textarea',
          placeholder: 'Add a personal message to the invitation...',
          rows: 3,
        },
      ],
    },
  ],
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Send Invitation',
      variant: 'default',
      loadingText: 'Sending...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Invitation sent successfully!',
  },
};

export const editOrganizationFormConfig: FormConfig = {
  ...createOrganizationFormConfig,
  id: 'edit-organization-form',
  title: 'Edit Organization',
  description: 'Update organization information',
  method: 'PATCH',
  action: '/api/organizations/:id',
  actions: [
    {
      type: 'button',
      label: 'Cancel',
      variant: 'outline',
    },
    {
      type: 'submit',
      label: 'Save Changes',
      variant: 'default',
      loadingText: 'Saving...',
      className: 'btn-modern',
    },
  ],
  onSuccess: {
    message: 'Organization updated successfully!',
  },
};
