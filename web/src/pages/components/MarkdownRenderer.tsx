import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeColorChips from "rehype-color-chips";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined } from "@ant-design/icons";
// import { synthwave84 as themeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useAppSelector } from "@/store";
import { CSSProperties, useState } from "react";
import { TPrism } from "@/enum/prism";
interface IMarkdownRendererProps {
  markdown: string;
}
interface ICodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
}

const MarkdownRenderer = ({ markdown }: IMarkdownRendererProps) => {
  const { prism } = useAppSelector(state => state.syntaxHighlighter);
  const [themeStyle, setThemeStyle] = useState<{ [key: string]: CSSProperties }>();
  const getThemeStyle = async () => {
    try {
      const theme = await import("react-syntax-highlighter/dist/cjs/styles/prism");
      setThemeStyle(theme[prism] || theme.default);
    } catch (error) {
      console.error("Failed to load theme:", error);
    }
  };
  getThemeStyle();
  return (
    <div className="markdown-content prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeColorChips]}
        components={{
          // code 标签处理
          code({ node, className, children, ...props }: ICodeProps) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <div className="code-block relative group">
                <CopyToClipboard text={String(children).trim()}>
                  <div className="absolute right-4 top-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <CopyOutlined className="w-4 h-4" />
                    <span className="text-sm">复制</span>
                  </div>
                </CopyToClipboard>
                <SyntaxHighlighter
                  {...props}
                  language={match[1]}
                  style={themeStyle}
                  PreTag="div"
                  wrapLongLines={true}
                  showLineNumbers={true}
                  customStyle={{
                    borderRadius: "8px",
                    marginTop: "1rem",
                    position: "relative",
                  }}
                >
                  {String(children).trim()}
                </SyntaxHighlighter>
              </div>
            ) : (
              <code {...props} className={className}>
                {children}
              </code>
            );
          },
        }}
      >
        {markdown}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownRenderer;
