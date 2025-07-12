import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface VoteButtonsProps {
  votes: number;
  userVote?: 'up' | 'down' | null;
  onVote: (voteType: 'up' | 'down') => void;
  disabled?: boolean;
}

export const VoteButtons: React.FC<VoteButtonsProps> = ({
  votes,
  userVote,
  onVote,
  disabled = false,
}) => {
  const handleVote = (voteType: 'up' | 'down') => {
    if (disabled) {
      toast({
        title: 'Login Required',
        description: 'You must be logged in to vote.',
        variant: 'destructive',
      });
      return;
    }
    onVote(voteType);
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('up')}
        disabled={disabled}
        className={`vote-btn ${userVote === 'up' ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        title={disabled ? 'Login to vote' : 'Upvote'}
      >
        <ChevronUp className="h-5 w-5" />
      </Button>

      <span className={`text-lg font-semibold ${
        userVote === 'up' ? 'text-success' : 
        userVote === 'down' ? 'text-destructive' : 
        'text-muted-foreground'
      }`}>
        {votes}
      </span>

      <Button
        variant="outline"
        size="sm"
        onClick={() => handleVote('down')}
        disabled={disabled}
        className={`vote-btn ${userVote === 'down' ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        title={disabled ? 'Login to vote' : 'Downvote'}
      >
        <ChevronDown className="h-5 w-5" />
      </Button>
    </div>
  );
};