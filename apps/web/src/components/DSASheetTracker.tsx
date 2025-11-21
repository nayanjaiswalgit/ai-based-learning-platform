'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { CheckCircle2, Circle, Clock, Trophy, Search, Filter } from 'lucide-react';

interface Problem {
  id: string;
  title: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD';
  categories: string[];
  companyTags: string[];
  status: 'TODO' | 'ATTEMPTED' | 'SOLVED' | 'MASTERED';
  attempts?: number;
  lastAttempted?: Date;
}

const MOCK_PROBLEMS: Problem[] = [
  {
    id: '1',
    title: 'Two Sum',
    difficulty: 'EASY',
    categories: ['Array', 'Hash Table'],
    companyTags: ['Google', 'Amazon', 'Meta'],
    status: 'SOLVED',
    attempts: 2,
  },
  {
    id: '2',
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'MEDIUM',
    categories: ['Tree', 'Stack', 'DFS'],
    companyTags: ['Microsoft', 'Amazon'],
    status: 'ATTEMPTED',
    attempts: 1,
  },
  {
    id: '3',
    title: 'Merge k Sorted Lists',
    difficulty: 'HARD',
    categories: ['Linked List', 'Heap', 'Divide and Conquer'],
    companyTags: ['Google', 'Meta'],
    status: 'TODO',
  },
];

const STATUS_CONFIG = {
  TODO: { icon: Circle, color: 'text-muted-foreground', label: 'Todo' },
  ATTEMPTED: { icon: Clock, color: 'text-warning', label: 'Attempted' },
  SOLVED: { icon: CheckCircle2, color: 'text-success', label: 'Solved' },
  MASTERED: { icon: Trophy, color: 'text-secondary', label: 'Mastered' },
};

const DIFFICULTY_COLORS = {
  EASY: 'text-success',
  MEDIUM: 'text-warning',
  HARD: 'text-destructive',
};

export default function DSASheetTracker() {
  const [problems] = useState<Problem[]>(MOCK_PROBLEMS);
  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = difficultyFilter === 'all' || problem.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === 'all' || problem.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || problem.categories.includes(categoryFilter);

    return matchesSearch && matchesDifficulty && matchesStatus && matchesCategory;
  });

  const stats = {
    total: problems.length,
    solved: problems.filter((p) => p.status === 'SOLVED').length,
    attempted: problems.filter((p) => p.status === 'ATTEMPTED').length,
    mastered: problems.filter((p) => p.status === 'MASTERED').length,
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-card p-4 rounded-lg border card-elevated">
          <div className="text-2xl font-bold">{stats.total}</div>
          <div className="text-sm text-muted-foreground">Total Problems</div>
        </div>
        <div className="bg-card p-4 rounded-lg border card-elevated">
          <div className="text-2xl font-bold text-success">{stats.solved}</div>
          <div className="text-sm text-muted-foreground">Solved</div>
        </div>
        <div className="bg-card p-4 rounded-lg border card-elevated">
          <div className="text-2xl font-bold text-warning">{stats.attempted}</div>
          <div className="text-sm text-muted-foreground">Attempted</div>
        </div>
        <div className="bg-card p-4 rounded-lg border card-elevated">
          <div className="text-2xl font-bold text-secondary">{stats.mastered}</div>
          <div className="text-sm text-muted-foreground">Mastered</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card p-4 rounded-lg border mb-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search problems..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              <SelectItem value="EASY">Easy</SelectItem>
              <SelectItem value="MEDIUM">Medium</SelectItem>
              <SelectItem value="HARD">Hard</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="TODO">Todo</SelectItem>
              <SelectItem value="ATTEMPTED">Attempted</SelectItem>
              <SelectItem value="SOLVED">Solved</SelectItem>
              <SelectItem value="MASTERED">Mastered</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Problems Table */}
      <div className="bg-card rounded-lg border overflow-hidden">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Problem
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Difficulty
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Categories
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Companies
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Attempts
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProblems.map((problem) => {
              const StatusIcon = STATUS_CONFIG[problem.status].icon;
              return (
                <tr
                  key={problem.id}
                  className="hover:bg-muted/50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusIcon className={`w-5 h-5 ${STATUS_CONFIG[problem.status].color}`} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium">{problem.title}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-semibold ${DIFFICULTY_COLORS[problem.difficulty]}`}>
                      {problem.difficulty}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {problem.categories.slice(0, 2).map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-1 text-xs bg-primary/10 text-primary rounded"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-1 flex-wrap">
                      {problem.companyTags.slice(0, 2).map((company) => (
                        <span
                          key={company}
                          className="px-2 py-1 text-xs bg-secondary/10 text-secondary rounded"
                        >
                          {company}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                    {problem.attempts || 0}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
