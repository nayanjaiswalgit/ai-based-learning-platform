'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { OrganizationMembersList } from '@/components/organization/OrganizationMembersList';
import { useToast } from '@/components/ui/use-toast';
import { organizationApi, Organization, OrganizationMember } from '@/lib/api/organization-client';
import {
  Building2,
  Users,
  BookOpen,
  GraduationCap,
  MapPin,
  Globe,
  Briefcase,
  Settings,
  UserPlus,
  Loader2,
} from 'lucide-react';

export default function OrganizationDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { data: session } = useSession();
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [userMembership, setUserMembership] = useState<OrganizationMember | null>(null);

  const loadOrganization = async () => {
    try {
      setLoading(true);
      const [org, membersList] = await Promise.all([
        organizationApi.getBySlug(slug),
        organizationApi.getMembers(slug),
      ]);

      setOrganization(org);
      setMembers(membersList);

      // Find current user's membership
      const membership = membersList.find(m => m.user?.email === session?.user?.email);
      setUserMembership(membership || null);
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to load organization',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrganization();
  }, [slug]);

  const isAdmin = userMembership?.role === 'ADMIN';

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Organization not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-4">
          <Avatar className="h-20 w-20">
            <AvatarImage src={organization.logoUrl} alt={organization.name} />
            <AvatarFallback className="text-2xl">
              <Building2 className="h-10 w-10" />
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">{organization.name}</h1>
            <div className="flex items-center gap-4 mt-2">
              <Badge>{organization.type.replace(/_/g, ' ')}</Badge>
              {organization.location && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-1" />
                  {organization.location}
                </div>
              )}
              {organization.website && (
                <a
                  href={organization.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center text-sm text-primary hover:underline"
                >
                  <Globe className="h-4 w-4 mr-1" />
                  Website
                </a>
              )}
            </div>
            {userMembership && (
              <div className="mt-2">
                <span className="text-sm text-muted-foreground">Your role: </span>
                <Badge variant="secondary">
                  {userMembership.title || userMembership.role}
                </Badge>
              </div>
            )}
          </div>
        </div>

        {isAdmin && (
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
        )}
      </div>

      {/* Description */}
      {organization.description && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">{organization.description}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count?.members || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count?.courses || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Bootcamps</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization._count?.bootcamps || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Departments</CardTitle>
            <Briefcase className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{organization.departments?.length || 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="members" className="w-full">
        <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="mentors">Mentors</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Organization Members</CardTitle>
                  <CardDescription>
                    Manage members, their roles, and permissions
                  </CardDescription>
                </div>
                {isAdmin && (
                  <Button>
                    <UserPlus className="mr-2 h-4 w-4" />
                    Add Member
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <OrganizationMembersList
                members={members}
                canManage={isAdmin}
                onEdit={(member) => {
                  toast({ title: 'Edit member (coming soon)' });
                }}
                onRemove={(member) => {
                  toast({ title: 'Remove member (coming soon)' });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="courses">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Courses tab coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Departments tab coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="mentors">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">Mentors tab coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
