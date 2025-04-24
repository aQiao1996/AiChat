import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeColorChips from "rehype-color-chips";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typewriter from "typewriter-effect";
import { CopyOutlined } from "@ant-design/icons";
import { synthwave84 as themeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import type { Element, Text } from "hast";
interface IMarkdownRendererProps {
  markdown: string;
}
interface ICodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
}

// 递归转换函数
const hastToString = (node: Element | Text): string => {
  // 处理文本节点
  if (node.type === "text") {
    return node.value;
  }

  // 处理元素节点
  if (node.type === "element") {
    // 转换属性
    const attrs = Object.entries(node.properties || {})
      .map(([key, value]) => {
        if (value === true) return key; // 处理布尔属性如 disabled
        if (Array.isArray(value)) return `${key}="${value.join(" ")}"`; // 处理 class 数组
        return `${key}="${value}"`;
      })
      .join(" ");

    // 处理子节点
    const children = (node.children || []).map(child => hastToString(child as Element | Text)).join("");

    // 特殊处理 p 标签
    if (node.tagName === "p") {
      return children; // 直接返回子内容，不包裹 p 标签，否则打字机光标偏移
    }

    // 处理自闭合标签
    const voidElements = new Set([
      "area",
      "base",
      "br",
      "col",
      "embed",
      "hr",
      "img",
      "input",
      "link",
      "meta",
      "param",
      "source",
      "track",
      "wbr",
    ]);

    return voidElements.has(node.tagName)
      ? `<${node.tagName}${attrs ? " " + attrs : ""}>`
      : `<${node.tagName}${attrs ? " " + attrs : ""}>${children}</${node.tagName}>`;
  }

  return "";
};

const MarkdownRenderer = ({ markdown }: IMarkdownRendererProps) => {
  return (
    <div className="markdown-content prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeColorChips]}
        components={{
          p({ node }: ICodeProps) {
            return (
              <Typewriter
                options={{ cursor: "", delay: 20 }}
                onInit={typewriter => {
                  const content = hastToString(node);
                  typewriter
                    .typeString(content)
                    .callFunction(() => {})
                    .start();
                }}
              />
            );
          },
          code({ node, className, children, ...props }: ICodeProps) {
            const match = /language-(\w+)/.exec(className || "");
            return match ? (
              <div className="code-block relative group">
                <CopyToClipboard text={String(children).replace(/\n$/, "")}>
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
