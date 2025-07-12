
import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, User, Clock, CheckCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';


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


interface QuestionCardProps {
  question: Question;
  onClick?: () => void;
}

const QuestionCard: React.FC<QuestionCardProps> = ({ question, onClick }) => {
  const truncateContent = (content: string, maxLength: number = 120) => {
    if (typeof content !== 'string') return '';
    if (content.length <= maxLength) return content;
    return content.slice(0, maxLength) + '...';
  };

  return (
    <div 
      className="question-card cursor-pointer" 
      onClick={(e) => {
        console.log('Question card clicked', question.id);
        if (onClick) onClick();
      }}
    >
      <div className="flex gap-4">
        {/* Stats Column */}
        <div className="flex flex-col items-center gap-3 text-sm text-muted-foreground min-w-0 w-16">
          <div className={`flex flex-col items-center ${
            question.isAnswered ? 'text-success' : 'text-muted-foreground'
          }`}>
            <div className="flex items-center gap-1">
              {question.isAnswered ? (
                <CheckCircle className="h-4 w-4" />
              ) : (
                <MessageSquare className="h-4 w-4" />
              )}
              <span className="font-medium text-xs">{question.answerCount}</span>
            </div>
            <span className="text-xs">
              {question.isAnswered ? 'solved' : 'answers'}
            </span>
          </div>
        </div>
        {/* Content Column */}
        <div className="flex-1 min-w-0">
          <div className="space-y-3">
            {/* Title */}
            <div className="block">
              <h3 className="text-base font-medium line-clamp-2 leading-tight text-professional-primary">
                {question.title}
              </h3>
            </div>
            {/* Content Preview */}
              {truncateContent(question.content)}
            {/* Tags */}
            <div className="flex flex-wrap gap-1">
              {question.tags.slice(0, 4).map((tag) => (
                <Badge key={tag} variant="secondary" className="tag-professional text-xs">
                  {tag}
                </Badge>
              ))}
              {question.tags.length > 4 && (
                <Badge variant="secondary" className="tag-professional text-xs">
                  +{question.tags.length - 4}
                </Badge>
              )}
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between pt-1">
              {/* Author Info */}
              <Link
                to={`/users/${question.author.username}`}
                className="flex items-center gap-2 text-xs text-professional-muted group"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="h-5 w-5">
                  <AvatarImage src={question.author.avatar} alt={question.author.username} />
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {question.author.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="group-hover:text-primary transition-colors duration-150">
                  {question.author.username}
                </span>
              </Link>
              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-professional-muted">
                <Clock className="h-3 w-3" />
                <span>
                  {question.createdAt ? 
                    (() => {
                      try {
                        return formatDistanceToNow(new Date(question.createdAt), {
                          addSuffix: true,
                        });
                      } catch (error) {
                        return 'recently';
                      }
                    })() : 'recently'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export { QuestionCard };
