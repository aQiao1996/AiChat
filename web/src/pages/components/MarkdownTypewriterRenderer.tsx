import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeColorChips from "rehype-color-chips";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyToClipboard } from "react-copy-to-clipboard";
import { CopyOutlined } from "@ant-design/icons";
import { synthwave84 as themeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useAppSelector } from "@/store";
interface ICodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
}
const MarkdownTypewriterRenderer = () => {
  const { currentAnswer } = useAppSelector(state => state.chat); // 使用store中的流式数据

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
        {currentAnswer}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownTypewriterRenderer;
