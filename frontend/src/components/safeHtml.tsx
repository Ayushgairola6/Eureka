import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import dracula from 'react-syntax-highlighter/dist/cjs/styles/prism/dracula';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowedElements?: string[];
}

// Custom code component — matches react-markdown's expected shape
const CodeBlock = ({
  inline,
  className,
  children,
  ...props
}: {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}) => {
  const match = /language-(\w+)/.exec(className || '');
  return !inline && match ? (
    <SyntaxHighlighter
      style={dracula as { [key: string]: React.CSSProperties }}
      language={match[1]}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, '')}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  allowedElements = [
    'p', 'em', 'strong', 'h1', 'h2', 'h3', 'ul', 'ol', 'li',
    'a', 'blockquote', 'code', 'pre'
  ] as string[]
}) => {
  return (
    <div className={`prose h-full dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code: CodeBlock 
        }}
        allowedElements={allowedElements}
        unwrapDisallowed={true}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
