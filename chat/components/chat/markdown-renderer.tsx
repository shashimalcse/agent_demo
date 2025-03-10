import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="markdown-renderer prose dark:prose-invert prose-sm max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="my-2 rounded-md overflow-hidden">
                <SyntaxHighlighter
                  style={vscDarkPlus}
                  language={match[1]}
                  PreTag="div"
                  customStyle={{ 
                    borderRadius: '0.375rem',
                    margin: 0,
                    fontSize: '0.875rem'
                  }}
                  {...props}
                >
                  {String(children).replace(/\n$/, '')}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code className="px-1 py-0.5 rounded-sm bg-gray-100 text-gray-800 text-xs font-mono" {...props}>
                {children}
              </code>
            );
          },
          p: ({ children, ...props }) => (
            <p className="my-1.5 leading-relaxed" {...props}>{children}</p>
          ),
          h1: ({ children, ...props }) => (
            <h1 className="text-lg font-semibold mb-2 mt-3 text-gray-900" {...props}>{children}</h1>
          ),
          h2: ({ children, ...props }) => (
            <h2 className="text-base font-semibold mb-2 mt-3 text-gray-900" {...props}>{children}</h2>
          ),
          h3: ({ children, ...props }) => (
            <h3 className="text-sm font-semibold mb-2 mt-3 text-gray-900" {...props}>{children}</h3>
          ),
          a: ({ children, ...props }) => (
            <a 
              {...props} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-orange-600 hover:text-orange-700 underline underline-offset-2"
            >
              {children}
            </a>
          ),
          ul: ({ children, ...props }) => (
            <ul className="list-disc pl-4 my-1.5" {...props}>{children}</ul>
          ),
          ol: ({ children, ...props }) => (
            <ol className="list-decimal pl-4 my-1.5" {...props}>{children}</ol>
          ),
          li: ({ children, ...props }) => (
            <li className="my-0.5" {...props}>{children}</li>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="pl-3 border-l-2 border-gray-200 text-gray-600 my-2" {...props}>{children}</blockquote>
          ),
          hr: ({ ...props }) => (
            <hr className="my-2 border-gray-200" {...props} />
          ),
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto my-2 border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200" {...props}>{children}</table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-gray-50" {...props}>{children}</thead>
          ),
          tr: ({ children, ...props }) => (
            <tr className="even:bg-gray-50" {...props}>{children}</tr>
          ),
          th: ({ children, ...props }) => (
            <th className="px-2 py-1.5 text-left text-xs font-medium text-gray-700 uppercase" {...props}>{children}</th>
          ),
          td: ({ children, ...props }) => (
            <td className="px-2 py-1.5 text-sm" {...props}>{children}</td>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
