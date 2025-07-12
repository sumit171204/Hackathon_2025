
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Search, Filter, TrendingUp, Clock, MessageSquare, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { QuestionCard } from '@/components/QuestionCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Pagination } from '@/components/Pagination';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/api';

interface Question {
  id: string;
  title: string;
  content: string;
  tags: string[];
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  answerCount: number;
  isAnswered: boolean;
  createdAt: string;
  updatedAt: string;
}

const FILTERS = [
  { label: 'Newest', value: 'newest', icon: Clock },
  { label: 'Unanswered', value: 'unanswered', icon: MessageSquare },
  { label: 'Popular', value: 'popular', icon: TrendingUp },
];

export const Home: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [activeFilter, setActiveFilter] = useState(searchParams.get('filter') || 'newest');
  const navigate = useNavigate();

  const questionsPerPage = 20;

  useEffect(() => {
    fetchQuestions();
  }, [currentPage, activeFilter, searchParams]);

  const fetchQuestions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const params = {
        page: currentPage,
        limit: questionsPerPage,
        filter: activeFilter,
        search: searchParams.get('search') || undefined,
      };

      const response = await api.questions.getAll(params);
      // Support both array and object response
      let questionsArr = [];
      let totalCount = 0;
      if (Array.isArray(response.data)) {
        questionsArr = response.data;
        totalCount = response.data.length;
      } else if (response.data && Array.isArray(response.data.questions)) {
        questionsArr = response.data.questions;
        totalCount = response.data.total || questionsArr.length;
      }
      setQuestions(questionsArr);
      setTotalPages(Math.max(1, Math.ceil(totalCount / questionsPerPage)));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch questions');
      setQuestions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const newParams = new URLSearchParams(searchParams);
    if (searchQuery.trim()) {
      newParams.set('search', searchQuery.trim());
    } else {
      newParams.delete('search');
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handleFilterChange = (filter: string) => {
    setActiveFilter(filter);
    const newParams = new URLSearchParams(searchParams);
    if (filter !== 'newest') {
      newParams.set('filter', filter);
    } else {
      newParams.delete('filter');
    }
    setSearchParams(newParams);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container-professional py-6">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Questions</h1>
              {searchParams.get('search') && (
                <p className="text-sm text-muted-foreground">
                  Results for "{searchParams.get('search')}"
                </p>
              )}
            </div>

            <Button
              onClick={() => navigate('/ask')}
              className="btn-professional"
            >
              <Plus className="h-4 w-4 mr-2" />
              Ask Question
            </Button>
          </div>

          {/* Desktop Search Bar */}
          <div className="hidden md:block mb-6">
            <form onSubmit={handleSearch} className="max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-border"
                />
              </div>
            </form>
          </div>

          {/* Mobile Search Bar */}
          <div className="md:hidden mb-6">
            <form onSubmit={handleSearch}>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  type="text"
                  placeholder="Search questions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border-border"
                />
              </div>
            </form>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {FILTERS.map((filter) => (
              <Button
                key={filter.value}
                variant={activeFilter === filter.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => handleFilterChange(filter.value)}
                className={`transition-colors duration-150 ${
                  activeFilter === filter.value 
                    ? 'btn-professional' 
                    : 'border-border hover:bg-accent'
                }`}
              >
                <filter.icon className="h-4 w-4 mr-2" />
                {filter.label}
              </Button>
            ))}
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="border-border hover:bg-accent">
                  <Filter className="h-4 w-4 mr-2" />
                  More
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-popover border-border">
                <DropdownMenuItem 
                  onClick={() => handleFilterChange('trending')}
                  className="hover:bg-accent"
                >
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Trending
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => handleFilterChange('most-answered')}
                  className="hover:bg-accent"
                >
                  Most Answered
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Questions List */}
        <div className="space-y-3">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="card-professional p-4 space-y-3">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16" />
                  <Skeleton className="h-5 w-20" />
                  <Skeleton className="h-5 w-14" />
                </div>
                <div className="flex justify-between">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </div>
            ))
          ) : error ? (
            <div className="text-center py-12">
              <div className="card-professional p-6 max-w-md mx-auto border-destructive/20">
                <h3 className="font-semibold text-destructive mb-2">Error Loading Questions</h3>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchQuestions}
                  className="border-border"
                >
                  Try Again
                </Button>
              </div>
            </div>
          ) : questions.length === 0 ? (
            <div className="text-center py-12">
              <div className="card-professional p-8 max-w-md mx-auto">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">No Questions Found</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchParams.get('search')
                    ? 'Try a different search term or filter.'
                    : 'Be the first to ask a question!'}
                </p>
                <Button variant="outline" size="sm" onClick={() => navigate('/ask')}>
                  Ask Question
                </Button>
              </div>
            </div>
          ) : (
            questions.map((question, idx) => {
              // Handle MongoDB _id vs id mismatch
              const questionId = question._id || question.id;
              return (
                <QuestionCard
                  key={questionId || idx}
                  question={{...question, id: questionId}}
                  onClick={() => {
                    console.log('Navigating to question', questionId);
                    if (questionId) {
                      navigate(`/questions/${questionId}`);
                    }
                  }}
                />
              );
            })
          )}
        </div>

        {/* Pagination */}
        {!isLoading && !error && totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </div>
    </div>
  );
}
