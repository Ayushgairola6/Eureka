// components/MarkdownRenderer.tsx
import React, { type JSX } from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { dracula } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowedElements?: (keyof JSX.IntrinsicElements)[];
}

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = '',
  allowedElements = [
    'p', 'em', 'strong', 'h1', 'h2', 'h3', 'ul', 'ol', 'li', 
    'a', 'blockquote', 'code', 'pre'
  ]
}) => {
  return (
    <div className={`prose dark:prose-invert max-w-none ${className}`}>
      <ReactMarkdown
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <SyntaxHighlighter
                style={dracula}
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
          }
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