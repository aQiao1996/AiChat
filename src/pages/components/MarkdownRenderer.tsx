import React from "react";
import ReactMarkdown from "react-markdown"; // markdown 语法解析
import remarkGfm from "remark-gfm"; //  Markdown 扩展，（自动链接文字、脚注、删除线、表格、任务列表）
import rehypeColorChips from "rehype-color-chips"; // 颜色块
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"; // 语法高亮
import { CopyToClipboard } from "react-copy-to-clipboard"; // 复制到剪贴板
import { CopyOutlined } from "@ant-design/icons";
// 主题列表 https://github.com/react-syntax-highlighter/react-syntax-highlighter/blob/master/AVAILABLE_STYLES_PRISM.MD
import { synthwave84 as themeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism"; // 导入一个主题

interface IMarkdownRendererProps {
  markdown: string;
}

interface ICodeProps extends React.HTMLAttributes<HTMLElement> {
  inline?: boolean;
  node?: any;
}

const MarkdownRenderer = ({ markdown }: IMarkdownRendererProps) => {
  return (
    <div className="markdown-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeColorChips]}
        components={{
          // node：当前节点 inline：是否是行内代码块
          code({ node, inline, className, children, ...props }: ICodeProps) {
            const match = /language-(\w+)/.exec(className || "");
            return !inline && match ? (
              <div className="bg-gray-100 p-8 rounded-4">
                {/*  */}
                <CopyToClipboard text={String(children).replace(/\n$/, "")}>
                  <div className="flex items-center justify-between py-4">
                    <div className="lang">{match[1]}</div>
                    <div className="cursor-pointer flex items-center">
                      <CopyOutlined />
                      <span className="ml-2">复制</span>
                    </div>
                  </div>
                </CopyToClipboard>
                {/*  */}
                <SyntaxHighlighter
                  {...props}
                  language={match[1]} // 高亮代码的语言
                  style={themeStyle}
                  PreTag="div" // 代替默认预标记的元素或自定义反应组件，即组件的最外层标记（
                  wrapLongLines={true} // 是否 <code> 使用 white-space: pre-wrap 或 来设置块的样式white-space: pre
                  wrapLines={false} // 用于确保每行代码在父元素中,false 时无法对行级别操作
                  showLineNumbers={true} // 代码行号
                >
                  {String(children).replace(/\n$/, "")}
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
