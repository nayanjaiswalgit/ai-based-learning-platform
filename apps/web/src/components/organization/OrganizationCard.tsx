'use client';

import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Organization } from '@/lib/api/organization-client';
import { Building2, Users, BookOpen, GraduationCap, MapPin } from 'lucide-react';

interface OrganizationCardProps {
  organization: Organization;
}

export function OrganizationCard({ organization }: OrganizationCardProps) {
  const getTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      UNIVERSITY: 'bg-blue-500',
      COLLEGE: 'bg-green-500',
      COMPANY: 'bg-purple-500',
      BOOTCAMP: 'bg-orange-500',
      TRAINING_CENTER: 'bg-pink-500',
      SCHOOL: 'bg-cyan-500',
      OTHER: 'bg-gray-500',
    };
    return colors[type] || colors.OTHER;
  };

  const getTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <Link href={`/dashboard/organizations/${organization.slug}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={organization.logoUrl} alt={organization.name} />
                <AvatarFallback className={getTypeColor(organization.type)}>
                  <Building2 className="h-6 w-6 text-white" />
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle className="text-lg">{organization.name}</CardTitle>
                {organization.location && (
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <MapPin className="h-3 w-3 mr-1" />
                    {organization.location}
                  </div>
                )}
              </div>
            </div>
            <Badge variant="secondary">{getTypeLabel(organization.type)}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {organization.description && (
            <CardDescription className="line-clamp-2 mb-4">
              {organization.description}
            </CardDescription>
          )}

          <div className="grid grid-cols-3 gap-4 text-sm">
            <div className="flex items-center">
              <Users className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{organization._count?.members || 0}</span>
              <span className="text-muted-foreground ml-1">members</span>
            </div>
            <div className="flex items-center">
              <BookOpen className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{organization._count?.courses || 0}</span>
              <span className="text-muted-foreground ml-1">courses</span>
            </div>
            <div className="flex items-center">
              <GraduationCap className="h-4 w-4 mr-2 text-muted-foreground" />
              <span className="font-medium">{organization._count?.bootcamps || 0}</span>
              <span className="text-muted-foreground ml-1">bootcamps</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
