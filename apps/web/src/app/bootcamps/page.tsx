'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { BootcampCard } from '@/components/bootcamp/BootcampCard';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter } from 'lucide-react';
import bootcampClient from '@/lib/api/bootcamp-client';

export default function BootcampsPage() {
  const [bootcamps, setBootcamps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchBootcamps();
  }, [difficultyFilter]);

  const fetchBootcamps = async () => {
    try {
      setLoading(true);
      setError(null);
      const filters: any = {
        isPublished: true,
      };

      if (difficultyFilter) {
        filters.difficultyLevel = difficultyFilter;
      }

      if (searchQuery) {
        filters.search = searchQuery;
      }

      const data = await bootcampClient.getBootcamps(filters);
      setBootcamps(data);
    } catch (err: any) {
      console.error('Error fetching bootcamps:', err);
      setError('Failed to load bootcamps. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchBootcamps();
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-4xl font-bold">Bootcamps</h1>
          <p className="text-lg text-muted-foreground">
            Intensive, instructor-led programs to accelerate your career
          </p>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center">
          <form onSubmit={handleSearch} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search bootcamps..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button type="submit">Search</Button>
          </form>

          <div className="flex gap-2">
            <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Difficulty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Levels</SelectItem>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="Beginner to Advanced">Beginner to Advanced</SelectItem>
              </SelectContent>
            </Select>

            {(searchQuery || difficultyFilter) && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchQuery('');
                  setDifficultyFilter('');
                }}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-96 animate-pulse rounded-lg bg-muted"
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-6 text-center">
            <p className="text-destructive">{error}</p>
            <Button onClick={fetchBootcamps} className="mt-4" variant="outline">
              Try Again
            </Button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && bootcamps.length === 0 && (
          <div className="rounded-lg border border-border bg-muted/20 p-12 text-center">
            <h3 className="mb-2 text-2xl font-semibold">No bootcamps found</h3>
            <p className="text-muted-foreground">
              {searchQuery || difficultyFilter
                ? 'Try adjusting your search or filters'
                : 'Check back soon for new bootcamps'}
            </p>
          </div>
        )}

        {/* Bootcamps Grid */}
        {!loading && !error && bootcamps.length > 0 && (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {bootcamps.length} bootcamp{bootcamps.length !== 1 ? 's' : ''}
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {bootcamps.map((bootcamp) => (
                <BootcampCard key={bootcamp.id} bootcamp={bootcamp} />
              ))}
            </div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
