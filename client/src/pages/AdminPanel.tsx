import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Users, FileText, BarChart3, Ban, CheckCircle, XCircle, Download, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  banned: boolean;
  createdAt: string;
}

interface Question {
  id: string;
  title: string;
  author: { username: string };
  createdAt: string;
  status: 'pending' | 'approved' | 'rejected';
}

interface PlatformStats {
  totalUsers: number;
  totalQuestions: number;
  totalAnswers: number;
  bannedUsers: number;
  pendingQuestions: number;
}

export const AdminPanel: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [platformMessage, setPlatformMessage] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchAdminData();
  }, [user, navigate]);

  const fetchAdminData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch platform statistics
      const statsResponse = await api.admin.getStats();
      setStats(statsResponse.data);
      
      // Fetch users
      const usersResponse = await api.admin.getUsers();
      setUsers(usersResponse.data);
      
      // Fetch questions for moderation
      const questionsResponse = await api.admin.getQuestions();
      setQuestions(questionsResponse.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load admin data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBanUser = async (userId: string, ban: boolean) => {
    try {
      await api.admin.banUser(userId, ban);
      setUsers(prev => prev.map(user => 
        user.id === userId ? { ...user, banned: ban } : user
      ));
      
      toast({
        title: ban ? 'User Banned' : 'User Unbanned',
        description: `User has been ${ban ? 'banned' : 'unbanned'} successfully.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update user status',
        variant: 'destructive',
      });
    }
  };

  const handleModerateQuestion = async (questionId: string, status: 'approved' | 'rejected') => {
    try {
      await api.admin.moderateQuestion(questionId, status);
      setQuestions(prev => prev.map(q => 
        q.id === questionId ? { ...q, status } : q
      ));
      
      toast({
        title: 'Question Moderated',
        description: `Question has been ${status}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to moderate question',
        variant: 'destructive',
      });
    }
  };

  const handleSendPlatformMessage = async () => {
    if (!platformMessage.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a message',
        variant: 'destructive',
      });
      return;
    }

    try {
      await api.admin.sendPlatformMessage('Platform Update', platformMessage);
      toast({
        title: 'Message Sent',
        description: 'Platform-wide message has been sent successfully.',
      });
      setPlatformMessage('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send message',
        variant: 'destructive',
      });
    }
  };

  const handleDownloadReport = () => {
    // In a real app, you'd generate and download a report
    toast({
      title: 'Report Downloaded',
      description: 'Platform report has been downloaded.',
    });
  };

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-muted-foreground">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-professional py-6">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/')}
              className="hover:bg-accent"
            >
              ← Back to Questions
            </Button>
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">Admin Panel</h1>
          <p className="text-muted-foreground">
            Manage users, moderate content, and monitor platform activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="card-professional">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.bannedUsers} banned
              </p>
            </CardContent>
          </Card>

          <Card className="card-professional">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Questions</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalQuestions.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.pendingQuestions} pending
              </p>
            </CardContent>
          </Card>

          <Card className="card-professional">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Answers</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.totalAnswers.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card className="card-professional">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Platform Health</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">98%</div>
              <p className="text-xs text-muted-foreground">
                All systems operational
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="moderation">Content Moderation</TabsTrigger>
            <TabsTrigger value="messages">Platform Messages</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Manage user accounts, ban/unban users, and view user activity.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Joined</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.banned ? 'destructive' : 'default'}>
                            {user.banned ? 'Banned' : 'Active'}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {user.banned ? (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleBanUser(user.id, false)}
                                className="h-8 px-2"
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Unban
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleBanUser(user.id, true)}
                                className="h-8 px-2"
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Ban
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="moderation" className="space-y-4">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Content Moderation</CardTitle>
                <CardDescription>
                  Review and moderate questions and answers for inappropriate content.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Author</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question) => (
                      <TableRow key={question.id}>
                        <TableCell className="font-medium">{question.title}</TableCell>
                        <TableCell>{question.author.username}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={
                              question.status === 'approved' ? 'default' : 
                              question.status === 'rejected' ? 'destructive' : 'secondary'
                            }
                          >
                            {question.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{new Date(question.createdAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {question.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleModerateQuestion(question.id, 'approved')}
                                  className="h-8 px-2"
                                >
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleModerateQuestion(question.id, 'rejected')}
                                  className="h-8 px-2"
                                >
                                  <XCircle className="h-3 w-3 mr-1" />
                                  Reject
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages" className="space-y-4">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Platform Messages</CardTitle>
                <CardDescription>
                  Send platform-wide messages to all users (e.g., feature updates, downtime alerts).
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-message">Message</Label>
                  <Textarea
                    id="platform-message"
                    placeholder="Enter your platform-wide message..."
                    value={platformMessage}
                    onChange={(e) => setPlatformMessage(e.target.value)}
                    className="min-h-[100px]"
                  />
                </div>
                <Button onClick={handleSendPlatformMessage} className="btn-professional">
                  <Send className="h-4 w-4 mr-2" />
                  Send Platform Message
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-4">
            <Card className="card-professional">
              <CardHeader>
                <CardTitle>Reports & Analytics</CardTitle>
                <CardDescription>
                  Download reports of user activity, feedback logs, and platform statistics.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={handleDownloadReport} variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span>User Activity Report</span>
                  </Button>
                  <Button onClick={handleDownloadReport} variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Content Moderation Log</span>
                  </Button>
                  <Button onClick={handleDownloadReport} variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Platform Statistics</span>
                  </Button>
                  <Button onClick={handleDownloadReport} variant="outline" className="h-20 flex-col">
                    <Download className="h-6 w-6 mb-2" />
                    <span>Feedback Analysis</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}; 