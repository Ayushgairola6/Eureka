import React from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import dracula from "react-syntax-highlighter/dist/cjs/styles/prism/dracula";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  allowedElements?: string[];
}

// Custom code component
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
  const match = /language-(\w+)/.exec(className || "");
  return !inline && match ? (
    <SyntaxHighlighter
      style={dracula as { [key: string]: React.CSSProperties }}
      language={match[1]}
      PreTag="div"
      {...props}
    >
      {String(children).replace(/\n$/, "")}
    </SyntaxHighlighter>
  ) : (
    <code className={className} {...props}>
      {children}
    </code>
  );
};

// Custom heading components with responsive sizing
const Heading1 = ({ children, ...props }: { children?: React.ReactNode }) => (
  <h1
    className="font-bold text-xl md:text-2xl lg:text-3xl mt-4 mb-3 bai-jamjuree-bold"
    {...props}
  >
    {children}
  </h1>
);

const Heading2 = ({ children, ...props }: { children?: React.ReactNode }) => (
  <h2
    className="font-semibold text-lg md:text-xl lg:text-2xl mt-3 mb-2 bai-jamjuree-semibold"
    {...props}
  >
    {children}
  </h2>
);

const Heading3 = ({ children, ...props }: { children?: React.ReactNode }) => (
  <h3
    className="font-semibold text-md md:text-lg lg:text-xl mt-2 mb-1 bai-jamjuree-regular"
    {...props}
  >
    {children}
  </h3>
);

const Paragraph = ({ children, ...props }: { children?: React.ReactNode }) => (
  <p
    className="font-normal text-sm md:text-md leading-relaxed mb-3 space-grotesk"
    {...props}
  >
    {children}
  </p>
);

const Strong = ({ children, ...props }: { children?: React.ReactNode }) => (
  <strong className="font-semibold text-sm" {...props}>
    {children}
  </strong>
);

const Emphasis = ({ children, ...props }: { children?: React.ReactNode }) => (
  <em className="font-medium italic text-sm" {...props}>
    {children}
  </em>
);

const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  className = "",
  allowedElements = [
    "p",
    "em",
    "strong",
    "h1",
    "h2",
    "h3",
    "ul",
    "ol",
    "li",
    "a",
    "blockquote",
    "code",
    "pre",
  ],
}) => {
  return (
    <div
      className={`prose prose-sm h-full dark:prose-invert w-full  ${className}`}
    >
      <ReactMarkdown
        components={{
          code: CodeBlock,
          h1: Heading1,
          h2: Heading2,
          h3: Heading3,
          p: Paragraph,
          strong: Strong,
          em: Emphasis,
          a: ({ children, ...props }) => (
            <a
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium text-sm"
              {...props}
            >
              {children}
            </a>
          ),
          ul: ({ children, ...props }) => (
            <ul
              className="list-disc list-inside my-3 space-y-1 text-sm"
              {...props}
            >
              {children}
            </ul>
          ),
          ol: ({ children, ...props }) => (
            <ol
              className="list-decimal list-inside my-3 space-y-1 text-sm"
              {...props}
            >
              {children}
            </ol>
          ),
          li: ({ children, ...props }) => (
            <li className="font-normal text-sm" {...props}>
              {children}
            </li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="border-l-4 border-gray-300 dark:border-red-600 pl-3 italic my-3 text-sm text-gray-700 dark:text-gray-300"
              {...props}
            >
              {children}
            </blockquote>
          ),
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
