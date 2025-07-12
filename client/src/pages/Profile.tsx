import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { User, MapPin, Calendar, Globe, Edit, MessageSquare, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/context/AuthContext';
import { QuestionCard } from '@/components/QuestionCard';
import api from '@/services/api';
import { formatDistanceToNow } from 'date-fns';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface UserProfile {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt: string;
  stats: {
    questionsCount: number;
    answersCount: number;
    totalVotes: number;
    acceptedAnswers: number;
  };
}

export const Profile: React.FC = () => {
  const { username: paramUsername } = useParams<{ username: string }>();
  const { user: currentUser } = useAuth();
  const username = paramUsername || currentUser?.username;
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm({
    defaultValues: {
      bio: '',
      location: '',
      website: '',
      avatar: '',
    },
  });

  const isOwnProfile = currentUser?.username === username;

  useEffect(() => {
    if (!username) {
      navigate('/');
      return;
    }
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    if (!username) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [profileRes, questionsRes, answersRes] = await Promise.all([
        api.users.getProfile(username),
        api.users.getQuestions(username),
        api.users.getAnswers(username),
      ]);
      
      setProfile(profileRes.data);
      setQuestions(questionsRes.data.questions || []);
      setAnswers(answersRes.data.answers || []);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      if (err.response?.status === 404) {
        navigate('/404');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const openEdit = () => {
    if (profile) {
      reset({
        bio: profile.bio || '',
        location: profile.location || '',
        website: profile.website || '',
        avatar: profile.avatar || '',
      });
      setEditOpen(true);
    }
  };

  const onEditSubmit = async (data: any) => {
    try {
      await api.users.updateProfile(data);
      setEditOpen(false);
      fetchUserProfile();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update profile');
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-40" />
            </div>
          </div>
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive mb-4">Profile Not Found</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Button onClick={() => navigate('/')} variant="outline">
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <Card className="shadow-medium mb-8">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              <Avatar className="h-24 w-24 ring-4 ring-primary/20">
                <AvatarImage src={profile.avatar} alt={profile.username} />
                <AvatarFallback className="text-2xl bg-gradient-primary text-white">
                  {profile.username.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div>
                    <h1 className="text-3xl font-bold">{profile.username}</h1>
                    <p className="text-muted-foreground">
                      Joined {formatDistanceToNow(new Date(profile.joinedAt), { addSuffix: true })}
                    </p>
                  </div>
                  {isOwnProfile && (
                    <Button variant="outline" onClick={openEdit}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                {profile.bio && (
                  <p className="text-muted-foreground">{profile.bio}</p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {profile.location && (
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {profile.location}
                    </div>
                  )}
                  {profile.website && (
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4" />
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-primary transition-colors"
                      >
                        {profile.website}
                      </a>
                    </div>
                  )}
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Member since {new Date(profile.joinedAt).getFullYear()}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Dialog */}
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(onEditSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Bio</label>
                <Textarea {...register('bio')} maxLength={200} placeholder="Tell us about yourself..." />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Location</label>
                <Input {...register('location')} placeholder="Your location" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Website</label>
                <Input {...register('website')} placeholder="https://yourwebsite.com" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Avatar URL</label>
                <Input {...register('avatar')} placeholder="Paste image URL" />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isSubmitting}>Save</Button>
                <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="text-center shadow-soft">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary mb-1">
                {profile.stats.questionsCount}
              </div>
              <div className="text-sm text-muted-foreground">Questions</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-primary mb-1">
                {profile.stats.answersCount}
              </div>
              <div className="text-sm text-muted-foreground">Answers</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success mb-1">
                {profile.stats.totalVotes}
              </div>
              <div className="text-sm text-muted-foreground">Votes</div>
            </CardContent>
          </Card>
          
          <Card className="text-center shadow-soft">
            <CardContent className="p-6">
              <div className="text-2xl font-bold text-success mb-1">
                {profile.stats.acceptedAnswers}
              </div>
              <div className="text-sm text-muted-foreground">Accepted</div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="questions" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="questions" className="gap-2">
              <MessageSquare className="h-4 w-4" />
              Questions ({profile.stats.questionsCount})
            </TabsTrigger>
            <TabsTrigger value="answers" className="gap-2">
              <ChevronUp className="h-4 w-4" />
              Answers ({profile.stats.answersCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="questions" className="space-y-6">
            {questions.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No Questions Yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "You haven't asked any questions yet. Start by asking your first question!"
                      : `${profile.username} hasn't asked any questions yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Button className="mt-4" onClick={() => navigate('/ask')}>
                      Ask Your First Question
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              questions.map((question: any) => (
                <QuestionCard key={question.id} question={question} />
              ))
            )}
          </TabsContent>

          <TabsContent value="answers" className="space-y-6">
            {answers.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <ChevronUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <h3 className="font-semibold mb-2">No Answers Yet</h3>
                  <p className="text-muted-foreground">
                    {isOwnProfile 
                      ? "You haven't answered any questions yet. Help others by sharing your knowledge!"
                      : `${profile.username} hasn't answered any questions yet.`
                    }
                  </p>
                  {isOwnProfile && (
                    <Button className="mt-4" onClick={() => navigate('/')}>
                      Browse Questions
                    </Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                {answers.map((answer: any) => (
                  <Card key={answer.id} className="shadow-soft">
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold hover:text-primary">
                            <a href={`/questions/${answer.questionId}`}>
                              {answer.questionTitle}
                            </a>
                          </h3>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <ChevronUp className="h-4 w-4" />
                            {answer.votes}
                          </div>
                        </div>
                        <div className="prose max-w-none text-sm">
                          <div dangerouslySetInnerHTML={{ 
                            __html: answer.content.substring(0, 200) + '...' 
                          }} />
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Answered {formatDistanceToNow(new Date(answer.createdAt), { addSuffix: true })}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};