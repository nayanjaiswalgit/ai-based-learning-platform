'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { OrganizationMember } from '@/lib/api/organization-client';
import { MoreHorizontal, UserCog, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

interface OrganizationMembersListProps {
  members: OrganizationMember[];
  onEdit?: (member: OrganizationMember) => void;
  onRemove?: (member: OrganizationMember) => void;
  canManage?: boolean;
}

export function OrganizationMembersList({
  members,
  onEdit,
  onRemove,
  canManage = false,
}: OrganizationMembersListProps) {
  const getRoleBadgeVariant = (role: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
      ADMIN: 'destructive',
      INSTRUCTOR: 'default',
      MENTOR: 'secondary',
      STUDENT: 'outline',
    };
    return variants[role] || 'outline';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Member</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Joined</TableHead>
            {canManage && <TableHead className="w-[70px]">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.length === 0 ? (
            <TableRow>
              <TableCell colSpan={canManage ? 6 : 5} className="text-center text-muted-foreground">
                No members found
              </TableCell>
            </TableRow>
          ) : (
            members.map((member) => (
              <TableRow key={member.id}>
                <TableCell>
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={member.user?.profile?.profilePictureUrl} />
                      <AvatarFallback>
                        {member.user?.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium">{member.user?.username}</div>
                      <div className="text-sm text-muted-foreground">{member.user?.email}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant={getRoleBadgeVariant(member.role)}>{member.role}</Badge>
                </TableCell>
                <TableCell>{member.title || '-'}</TableCell>
                <TableCell>{member.department?.name || '-'}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {format(new Date(member.joinedAt), 'MMM d, yyyy')}
                </TableCell>
                {canManage && (
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => onEdit?.(member)}>
                          <UserCog className="mr-2 h-4 w-4" />
                          Edit Member
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onRemove?.(member)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
