import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { Label } from '@/components/ui/label';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
  className?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value,
  onChange,
  placeholder = 'Write your content here...',
  label,
  required = false,
  className = '',
}) => {
  // Quill modules configuration
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['emoji'],
      ['clean']
    ],
    clipboard: {
      matchVisual: false,
    },
  };

  // Quill editor formats
  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'align',
    'link', 'image',
    'emoji',
  ];

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <Label className="text-sm font-medium">
          {label} {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="border border-border rounded-md overflow-hidden">
        <ReactQuill
          theme="snow"
          value={value}
          onChange={onChange}
          modules={modules}
          formats={formats}
          placeholder={placeholder}
          className="rich-text-editor"
        />
      </div>
      <style jsx global>{`
        .rich-text-editor .ql-editor {
          min-height: 200px;
          font-size: 14px;
          line-height: 1.6;
          color: hsl(var(--foreground));
          background: hsl(var(--background));
        }
        
        .rich-text-editor .ql-toolbar {
          border-bottom: 1px solid hsl(var(--border));
          background: hsl(var(--muted));
        }
        
        .rich-text-editor .ql-container {
          border: none;
          background: hsl(var(--background));
        }
        
        .rich-text-editor .ql-editor.ql-blank::before {
          color: hsl(var(--muted-foreground));
          font-style: italic;
        }
        
        .rich-text-editor .ql-snow .ql-stroke {
          stroke: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow .ql-fill {
          fill: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow .ql-picker {
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow .ql-picker-options {
          background: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
        }
        
        .rich-text-editor .ql-snow .ql-picker-item:hover {
          background: hsl(var(--accent));
        }
        
        .rich-text-editor .ql-snow .ql-tooltip {
          background: hsl(var(--popover));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow .ql-tooltip input[type=text] {
          background: hsl(var(--background));
          border: 1px solid hsl(var(--border));
          color: hsl(var(--foreground));
        }
        
        .rich-text-editor .ql-snow .ql-tooltip a {
          color: hsl(var(--primary));
        }
        
        .rich-text-editor .ql-snow .ql-tooltip a:hover {
          color: hsl(var(--primary-foreground));
        }
        
        .rich-text-editor .ql-editor a {
          color: hsl(var(--primary));
          text-decoration: underline;
        }
        
        .rich-text-editor .ql-editor a:hover {
          color: hsl(var(--primary-foreground));
        }
        
        .rich-text-editor .ql-editor img {
          max-width: 100%;
          height: auto;
          border-radius: 4px;
        }
        
        .rich-text-editor .ql-editor blockquote {
          border-left: 4px solid hsl(var(--border));
          margin: 0;
          padding-left: 1rem;
          color: hsl(var(--muted-foreground));
        }
        
        .rich-text-editor .ql-editor code {
          background: hsl(var(--muted));
          padding: 0.125rem 0.25rem;
          border-radius: 0.25rem;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.875em;
        }
        
        .rich-text-editor .ql-editor pre {
          background: hsl(var(--muted));
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1rem 0;
        }
        
        .rich-text-editor .ql-editor pre code {
          background: none;
          padding: 0;
        }
      `}</style>
    </div>
  );
}; 