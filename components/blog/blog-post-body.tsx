import Link from "next/link";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";

const linkClass =
  "font-medium text-brand underline decoration-brand/30 underline-offset-2 transition hover:decoration-brand";

export function BlogPostBody({ markdown }: { markdown: string }) {
  const markdownComponents: Components = {
    h1: (props) => (
      <h1
        className="mb-4 mt-8 text-2xl font-bold tracking-tight text-foreground first:mt-0"
        {...props}
      />
    ),
    h2: (props) => (
      <h2 className="mb-3 mt-8 text-xl font-semibold tracking-tight text-foreground" {...props} />
    ),
    h3: (props) => (
      <h3 className="mb-2 mt-6 text-lg font-semibold text-foreground" {...props} />
    ),
    h4: (props) => (
      <h4 className="mb-2 mt-4 text-base font-semibold text-foreground" {...props} />
    ),
    p: (props) => <p className="mb-4 leading-relaxed text-muted last:mb-0" {...props} />,
    a: ({ href, children, ...props }) => {
      if (href?.startsWith("/")) {
        return (
          <Link href={href} className={linkClass} {...props}>
            {children}
          </Link>
        );
      }
      return (
        <a
          href={href}
          className={linkClass}
          target="_blank"
          rel="noopener noreferrer"
          {...props}
        >
          {children}
        </a>
      );
    },
    ul: (props) => (
      <ul className="mb-4 list-disc space-y-2 pl-6 text-muted marker:text-muted" {...props} />
    ),
    ol: (props) => (
      <ol className="mb-4 list-decimal space-y-2 pl-6 text-muted marker:font-medium" {...props} />
    ),
    li: (props) => <li className="leading-relaxed [&>p]:mb-2" {...props} />,
    blockquote: (props) => (
      <blockquote
        className="my-4 border-l-4 border-brand/40 bg-surface/50 py-2 pl-4 pr-2 text-sm text-foreground italic"
        {...props}
      />
    ),
    code: ({ className, children, ...props }) => {
      const isBlock = /language-/.test(className ?? "");
      if (isBlock) {
        return (
          <code className={className} {...props}>
            {children}
          </code>
        );
      }
      return (
        <code
          className="rounded bg-surface px-1.5 py-0.5 font-mono text-[0.9em] text-foreground ring-1 ring-border"
          {...props}
        >
          {children}
        </code>
      );
    },
    pre: (props) => (
      <pre
        className="my-4 overflow-x-auto rounded-xl border border-border bg-[#0d1117] p-4 font-mono text-sm text-neutral-100 [&_code]:bg-transparent [&_code]:p-0 [&_code]:ring-0"
        {...props}
      />
    ),
    hr: (props) => <hr className="my-8 border-border" {...props} />,
    table: ({ children }) => (
      <div className="my-4 overflow-x-auto rounded-xl border border-border">
        <table className="w-full min-w-[280px] border-collapse text-sm">{children}</table>
      </div>
    ),
    thead: (props) => <thead className="border-b border-border bg-surface/80" {...props} />,
    th: (props) => (
      <th className="px-3 py-2 text-left font-semibold text-foreground" {...props} />
    ),
    td: (props) => <td className="border-t border-border px-3 py-2 text-muted" {...props} />,
    tr: (props) => <tr className="odd:bg-card" {...props} />,
    img: ({ alt, ...props }) => (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        className="my-4 h-auto max-w-full rounded-xl border border-border"
        alt={alt ?? ""}
        {...props}
      />
    ),
  };

  return (
    <div className="blog-post-markdown">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
        {markdown}
      </ReactMarkdown>
    </div>
  );
}
