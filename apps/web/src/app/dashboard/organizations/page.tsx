'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { CreateOrganizationDialog } from '@/components/organization/CreateOrganizationDialog';
import { OrganizationCard } from '@/components/organization/OrganizationCard';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { organizationApi, Organization } from '@/lib/api/organization-client';
import { Search, Loader2 } from 'lucide-react';

const ORGANIZATION_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'UNIVERSITY', label: 'University' },
  { value: 'COLLEGE', label: 'College' },
  { value: 'COMPANY', label: 'Company' },
  { value: 'BOOTCAMP', label: 'Bootcamp' },
  { value: 'TRAINING_CENTER', label: 'Training Center' },
  { value: 'SCHOOL', label: 'School' },
  { value: 'OTHER', label: 'Other' },
];

export default function OrganizationsPage() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [myOrganizations, setMyOrganizations] = useState<Organization[]>([]);
  const [allOrganizations, setAllOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  const loadMyOrganizations = async () => {
    try {
      const orgs = await organizationApi.getMyOrganizations();
      setMyOrganizations(orgs);
    } catch (error) {
      console.error('Failed to load my organizations:', error);
    }
  };

  const loadAllOrganizations = async () => {
    try {
      setLoading(true);
      const result = await organizationApi.getAll({
        type: typeFilter !== 'all' ? typeFilter : undefined,
        search: search || undefined,
        limit: 50,
      });
      setAllOrganizations(result.organizations);
    } catch (error) {
      console.error('Failed to load organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMyOrganizations();
    loadAllOrganizations();
  }, []);

  useEffect(() => {
    loadAllOrganizations();
  }, [search, typeFilter]);

  const handleSuccess = () => {
    loadMyOrganizations();
    loadAllOrganizations();
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Organizations</h1>
          <p className="text-muted-foreground">
            Manage and browse organizations, universities, companies, and training centers.
          </p>
        </div>
        <CreateOrganizationDialog onSuccess={handleSuccess} />
      </div>

      <Tabs defaultValue="my-organizations" className="w-full">
        <TabsList>
          <TabsTrigger value="my-organizations">
            My Organizations ({myOrganizations.length})
          </TabsTrigger>
          <TabsTrigger value="browse">Browse All</TabsTrigger>
        </TabsList>

        <TabsContent value="my-organizations" className="space-y-4">
          {myOrganizations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground mb-4">
                You are not part of any organization yet.
              </p>
              <CreateOrganizationDialog onSuccess={handleSuccess} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myOrganizations.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search organizations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                {ORGANIZATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : allOrganizations.length === 0 ? (
            <div className="text-center py-12 border rounded-lg">
              <p className="text-muted-foreground">No organizations found.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allOrganizations.map((org) => (
                <OrganizationCard key={org.id} organization={org} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
