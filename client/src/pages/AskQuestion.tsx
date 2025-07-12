
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, X, HelpCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RichTextEditor } from '@/components/RichTextEditor';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/hooks/use-toast';
import api from '@/services/api';
import { Label } from '@/components/ui/label';

export const AskQuestion: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],

  });
  const [currentTag, setCurrentTag] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value: string) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const tag = currentTag.trim().toLowerCase();
      
      if (tag && !formData.tags.includes(tag) && formData.tags.length < 5) {
        setFormData(prev => ({
          ...prev,
          tags: [...prev.tags, tag],
        }));
        setCurrentTag('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in both title and content.',
        variant: 'destructive',
      });
      return;
    }

    if (formData.tags.length === 0) {
      toast({
        title: 'Tags Required',
        description: 'Please add at least one tag to categorize your question.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await api.questions.create({
        title: formData.title.trim(),
        description: formData.content.trim(),
        tags: formData.tags,
      });

      toast({
        title: 'Question Posted!',
        description: 'Your question has been successfully submitted.',
      });

      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to post question',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container-professional py-6">
        {/* Header */}
        <div className="mb-6">
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
          <h1 className="text-2xl font-semibold text-foreground mb-2">Ask a Question</h1>
          <p className="text-muted-foreground">
            Be specific and clear. Help others understand your problem by providing detailed information.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Form */}
          <div className="lg:col-span-3">
            <Card className="card-professional">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <HelpCircle className="h-5 w-5 text-primary" />
                  Question Details
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Provide clear, specific information to help others understand and answer your question.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="form-professional">
                  {/* Title */}
                  <div className="space-y-2">
                    <Label htmlFor="title" className="text-sm font-medium">
                      Title <span className="text-destructive">*</span>
                    </Label>
                    <Input
                      id="title"
                      name="title"
                      placeholder="e.g., How do I implement user authentication in React with TypeScript?"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      maxLength={200}
                      className="input-professional"
                    />
                    <p className="text-xs text-muted-foreground">
                      Be specific and concise. Include key technologies or concepts.
                    </p>
                  </div>

                  {/* Content */}
                  <RichTextEditor
                    value={formData.content}
                    onChange={handleContentChange}
                    label="Description"
                    required
                    placeholder="Describe your problem in detail. Include what you've tried, expected behavior, and actual results. Add code snippets if applicable."
                    className="input-professional"
                  />
                  <p className="text-xs text-muted-foreground">
                    Include context, what you've attempted, and specific error messages or unexpected behavior.
                  </p>

                  {/* Tags */}
                  <div className="space-y-2">
                    <Label htmlFor="tags" className="text-sm font-medium">
                      Tags <span className="text-destructive">*</span>
                    </Label>
                    <div className="space-y-3">
                      {/* Tag Input */}
                      <Input
                        id="tags"
                        placeholder="Add tags (press Enter or comma to add)"
                        value={currentTag}
                        onChange={(e) => setCurrentTag(e.target.value)}
                        onKeyDown={handleAddTag}
                        disabled={formData.tags.length >= 5}
                        className="input-professional"
                      />
                      
                      {/* Tag Display */}
                      {formData.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {formData.tags.map((tag) => (
                            <Badge
                              key={tag}
                              variant="secondary"
                              className="tag-professional cursor-pointer group hover:bg-destructive/10"
                              onClick={() => handleRemoveTag(tag)}
                            >
                              {tag}
                              <X className="h-3 w-3 ml-1 opacity-60 group-hover:opacity-100 group-hover:text-destructive" />
                            </Badge>
                          ))}
                        </div>
                      )}
                      
                      <p className="text-xs text-muted-foreground">
                        Add up to 5 relevant tags. Use existing popular tags when possible.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="flex gap-3 pt-2">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="btn-professional"
                    >
                      {isSubmitting ? (
                        'Posting Question...'
                      ) : (
                        <>
                          <Plus className="h-4 w-4 mr-2" />
                          Post Question
                        </>
                      )}
                    </Button>
                    
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => navigate('/')}
                      disabled={isSubmitting}
                      className="border-border hover:bg-accent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Tips Sidebar */}
          <div className="lg:col-span-1 space-y-4">
            <Card className="card-professional">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Writing Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Good Title</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Be specific and descriptive</li>
                    <li>• Include key technologies</li>
                    <li>• Mention the actual problem</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Good Description</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Show what you've tried</li>
                    <li>• Include relevant code</li>
                    <li>• Explain expected vs actual results</li>
                    <li>• Provide context</li>
                  </ul>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Good Tags</h4>
                  <ul className="text-muted-foreground space-y-1 text-xs">
                    <li>• Use existing popular tags</li>
                    <li>• Include programming language</li>
                    <li>• Add framework names</li>
                    <li>• Keep them relevant</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="card-professional">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Popular Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {['javascript', 'react', 'typescript', 'node.js', 'python', 'css', 'html', 'api'].map((tag) => (
                    <Badge
                      key={tag}
                      variant="outline"
                      className="cursor-pointer hover:bg-accent text-xs border-border"
                      onClick={() => {
                        if (!formData.tags.includes(tag) && formData.tags.length < 5) {
                          setFormData(prev => ({
                            ...prev,
                            tags: [...prev.tags, tag],
                          }));
                        }
                      }}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
