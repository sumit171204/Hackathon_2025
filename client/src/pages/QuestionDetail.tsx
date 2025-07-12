import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ChevronUp, ChevronDown, MessageSquare, Edit, Trash2, CheckCircle, Clock, User, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { AnswerEditor } from '@/components/AnswerEditor';
import { VoteButtons } from '@/components/VoteButtons';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';

interface Answer {
  id: string;
  content: string;
  votes: number;
  isAccepted: boolean;
  author: {
    id: string;
    username: string;
    avatar?: string;
  };
  createdAt: string;
  updatedAt: string;
  userVote?: 'up' | 'down' | null;
}

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
  answers: Answer[];
  isAnswered: boolean;
  createdAt: string;
  updatedAt: string;
}

export const QuestionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [question, setQuestion] = useState<Question | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAnswerEditor, setShowAnswerEditor] = useState(false);

  // If id is undefined, redirect to 404 immediately
  useEffect(() => {
    console.log('QuestionDetail useEffect - id:', id);
    if (!id) {
      console.log('No ID found, redirecting to 404');
      navigate('/404', { replace: true });
      return;
    }
    fetchQuestion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchQuestion = async () => {
    if (!id) {
      console.log('fetchQuestion: No ID provided');
      return;
    }
    
    console.log('fetchQuestion: Fetching question with ID:', id);
    try {
      setIsLoading(true);
      setError(null);
      const response = await api.questions.getById(id);
      console.log('fetchQuestion: Response received:', response.data);
      
      // Handle MongoDB _id vs id mismatch
      const questionData = response.data;
      const questionId = questionData._id || questionData.id;
      
      // Transform the data to ensure it has an id property
      setQuestion({
        ...questionData,
        id: questionId,
        // Also transform answers to ensure they have id properties
        answers: Array.isArray(questionData.answers) 
          ? questionData.answers.map(answer => ({
              ...answer,
              id: answer._id || answer.id
            }))
          : []
      });
    } catch (err: any) {
      console.error('fetchQuestion: Error fetching question:', err);
      setError(err.response?.data?.message || 'Failed to fetch question');
      if (err.response?.status === 404) {
        console.log('fetchQuestion: Question not found, redirecting to 404');
        navigate('/404');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async (content: string) => {
    if (!id) return;
    
    try {
      await api.answers.create(id, content);
      toast({
        title: 'Answer submitted!',
        description: 'Your answer has been posted successfully.',
      });
      setShowAnswerEditor(false);
      fetchQuestion(); // Refresh to show new answer
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to submit answer',
        variant: 'destructive',
      });
    }
  };

  const handleVote = async (targetId: string, voteType: 'up' | 'down', targetType: 'answer') => {
    if (!isAuthenticated) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to vote.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Only allow voting on answers
      await api.answers.vote(targetId, voteType);
      fetchQuestion(); // Refresh to show updated answer votes
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to vote',
        variant: 'destructive',
      });
    }
  };

  const handleAcceptAnswer = async (answerId: string) => {
    try {
      await api.answers.accept(answerId);
      toast({
        title: 'Answer accepted!',
        description: 'The answer has been marked as accepted.',
      });
      fetchQuestion();
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to accept answer',
        variant: 'destructive',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-professional py-6">
          <div className="space-y-6">
            <Skeleton className="h-8 w-3/4" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="h-6 w-20" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !question) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container-professional py-6">
          <div className="text-center">
            <Card className="card-professional p-6 max-w-md mx-auto border-destructive/20">
              <h1 className="text-xl font-semibold text-destructive mb-4">Error</h1>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline" className="border-border">
                Back to Home
              </Button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  const isQuestionAuthor = user?.id === question.author.id;
  const acceptedAnswer = question.answers.find(a => a.isAccepted);
  const otherAnswers = question.answers.filter(a => !a.isAccepted);

  return (
    <div className="min-h-screen bg-background">
      <div className="container-professional py-6">
        {/* Back Button */}
        <div className="mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/')}
            className="hover:bg-accent"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Questions
          </Button>
        </div>

        {/* Question */}
        <div className="space-y-6">
          <Card className="card-professional">
            <CardContent className="p-6">
              <div className="flex gap-6">
                {/* Question content */}
                <div className="flex-1 space-y-4">
                  <h1 className="text-2xl font-semibold leading-tight text-foreground">
                    {question.title}
                  </h1>
                  
                  <div className="prose max-w-none text-foreground">
                    <div dangerouslySetInnerHTML={{ __html: question.content }} />
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {question.tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="tag-professional">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Question meta */}
                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Link
                      to={`/users/${question.author.username}`}
                      className="flex items-center gap-3 text-sm text-professional-muted group"
                    >
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={question.author.avatar} alt={question.author.username} />
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          {question.author.username.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium group-hover:text-primary transition-colors duration-150">
                          {question.author.username}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          asked {question.createdAt ? formatDistanceToNow(new Date(question.createdAt), { addSuffix: true }) : 'recently'}
                        </div>
                      </div>
                    </Link>

                    
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Answers Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-foreground">
                {question.answers.length} {question.answers.length === 1 ? 'Answer' : 'Answers'}
              </h2>
            </div>

            {/* Accepted Answer */}
            {acceptedAnswer && (
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-success">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium text-sm">Accepted Answer</span>
                </div>
                <AnswerCard
                  answer={acceptedAnswer}
                  isQuestionAuthor={isQuestionAuthor}
                  onVote={handleVote}
                  onAccept={handleAcceptAnswer}
                  isAuthenticated={isAuthenticated}
                />
                {otherAnswers.length > 0 && <Separator />}
              </div>
            )}

            {/* Other Answers */}
            {otherAnswers.map((answer, index) => (
              <div key={answer.id}>
                <AnswerCard
                  answer={answer}
                  isQuestionAuthor={isQuestionAuthor}
                  onVote={handleVote}
                  onAccept={handleAcceptAnswer}
                  isAuthenticated={isAuthenticated}
                />
                {index < otherAnswers.length - 1 && <Separator />}
              </div>
            ))}

            {question.answers.length === 0 && (
              <Card className="card-professional">
                <CardContent className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No answers yet. Be the first to answer this question!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          <Separator />

          {/* Answer Editor */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your Answer</h3>
            
            {isAuthenticated ? (
              <AnswerEditor
                onSubmit={handleAnswerSubmit}
                isVisible={showAnswerEditor}
                onToggle={setShowAnswerEditor}
              />
            ) : (
              <Card className="card-professional">
                <CardContent className="text-center py-6">
                  <p className="text-muted-foreground mb-4">
                    You must be logged in to post an answer.
                  </p>
                  <Button variant="outline" className="border-border">
                    Login to Answer
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface AnswerCardProps {
  answer: Answer;
  isQuestionAuthor: boolean;
  onVote: (answerId: string, voteType: 'up' | 'down', targetType: 'answer') => void;
  onAccept: (answerId: string) => void;
  isAuthenticated: boolean;
}

const AnswerCard: React.FC<AnswerCardProps> = ({
  answer,
  isQuestionAuthor,
  onVote,
  onAccept,
  isAuthenticated,
}) => {
  return (
    <Card className={`card-professional ${answer.isAccepted ? 'border-success/30 bg-success/5' : ''}`}>
      <CardContent className="p-6">
        <div className="flex gap-6">
          {/* Vote buttons */}
          <div className="flex flex-col items-center gap-2">
            <VoteButtons
              votes={answer.votes}
              userVote={answer.userVote}
              onVote={(voteType) => onVote(answer.id, voteType, 'answer')}
              disabled={!isAuthenticated}
            />
            
            {isQuestionAuthor && !answer.isAccepted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAccept(answer.id)}
                className="mt-2 p-2 text-success hover:bg-success/10 border-success/30"
                title="Accept this answer"
              >
                <CheckCircle className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Answer content */}
          <div className="flex-1 space-y-4">
            <div className="prose max-w-none text-foreground">
              <div dangerouslySetInnerHTML={{ __html: answer.content }} />
            </div>

            {/* Answer meta */}
            <div className="flex items-center justify-between pt-4 border-t border-border">
              <Link
                to={`/users/${answer.author.username}`}
                className="flex items-center gap-3 text-sm text-professional-muted group"
              >
                <Avatar className="h-8 w-8">
                  <AvatarImage src={answer.author.avatar} alt={answer.author.username} />
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {answer.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium group-hover:text-primary transition-colors duration-150">
                    {answer.author.username}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    answered {answer.createdAt ? 
                      (() => {
                        try {
                          return formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true });
                        } catch (error) {
                          return 'recently';
                        }
                      })() : 'recently'}
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
