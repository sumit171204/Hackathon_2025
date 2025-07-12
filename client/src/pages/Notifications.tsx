import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Check, CheckCheck, ArrowLeft, Trash2, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/context/AuthContext';
import { useNotifications } from '@/context/NotificationContext';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

interface Notification {
  id: string;
  type: 'answer' | 'comment' | 'vote' | 'accept' | 'mention';
  title?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
  relatedType?: 'question' | 'answer';
}

export const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useNotifications();
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    refreshNotifications();
  }, [isAuthenticated, navigate, refreshNotifications]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
      toast({
        title: 'Notification marked as read',
        description: 'The notification has been marked as read.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark notification as read.',
        variant: 'destructive',
      });
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      toast({
        title: 'All notifications marked as read',
        description: 'All notifications have been marked as read.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark all notifications as read.',
        variant: 'destructive',
      });
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'answer':
        return '💬';
      case 'vote':
        return '👍';
      case 'mention':
        return '@';
      case 'accept':
        return '✅';
      default:
        return '🔔';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'answer':
        return 'text-blue-600';
      case 'vote':
        return 'text-green-600';
      case 'mention':
        return 'text-purple-600';
      case 'accept':
        return 'text-success';
      default:
        return 'text-muted-foreground';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'unread') return !notification.isRead;
    if (filter === 'read') return notification.isRead;
    return true;
  });

  if (!isAuthenticated) {
    return null;
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
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Questions
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground mb-2">Notifications</h1>
              <p className="text-muted-foreground">
                Stay updated with activity on your questions and answers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="border-border hover:bg-accent">
                    <Filter className="h-4 w-4 mr-2" />
                    {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover border-border">
                  <DropdownMenuItem 
                    onClick={() => setFilter('all')}
                    className="hover:bg-accent"
                  >
                    All Notifications
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilter('unread')}
                    className="hover:bg-accent"
                  >
                    Unread Only
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => setFilter('read')}
                    className="hover:bg-accent"
                  >
                    Read Only
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {unreadCount > 0 && (
                <Button
                  onClick={handleMarkAllAsRead}
                  variant="outline"
                  size="sm"
                  className="border-border hover:bg-accent"
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark all read
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {isLoading ? (
            // Loading skeletons
            Array.from({ length: 5 }).map((_, index) => (
              <Card key={index} className="card-professional">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-8 w-8 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          ) : filteredNotifications.length === 0 ? (
            <Card className="card-professional">
              <CardContent className="text-center py-12">
                <Bell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="font-semibold mb-2">
                  {filter === 'all' ? 'No notifications yet' : 
                   filter === 'unread' ? 'No unread notifications' : 'No read notifications'}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {filter === 'all' 
                    ? 'You\'ll see notifications here when someone interacts with your content.'
                    : filter === 'unread'
                    ? 'All caught up! No unread notifications.'
                    : 'No read notifications to show.'
                  }
                </p>
                {filter !== 'all' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFilter('all')}
                    className="border-border"
                  >
                    View all notifications
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card 
                key={notification.id} 
                className={`card-professional transition-all duration-150 ${
                  !notification.isRead 
                    ? 'border-primary/20 bg-primary/5' 
                    : 'hover:bg-muted/50'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Notification Icon */}
                    <div className={`text-2xl ${getNotificationColor(notification.type)}`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium text-sm">
                              {notification.title || notification.type}
                            </p>
                            {!notification.isRead && (
                              <Badge variant="default" className="text-xs">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.createdAt ? 
                              (() => {
                                try {
                                  return formatDistanceToNow(new Date(notification.createdAt), {
                                    addSuffix: true,
                                  });
                                } catch (error) {
                                  return 'recently';
                                }
                              })() : 'recently'
                            }
                          </p>
                        </div>
                        
                        {/* Actions */}
                        <div className="flex items-center gap-1">
                          {!notification.isRead && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                              className="h-6 w-6 p-0 opacity-60 hover:opacity-100"
                              title="Mark as read"
                            >
                              <Check className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Summary */}
        {notifications.length > 0 && (
          <div className="mt-8 pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>
                Showing {filteredNotifications.length} of {notifications.length} notifications
              </span>
              <span>
                {unreadCount} unread
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 