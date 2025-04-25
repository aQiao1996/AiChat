import React, { useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeColorChips from "rehype-color-chips";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { CopyToClipboard } from "react-copy-to-clipboard";
import Typewriter, { TypewriterClass } from "typewriter-effect";
import { CopyOutlined } from "@ant-design/icons";
import { synthwave84 as themeStyle } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { useAppSelector } from "@/store";

interface IMarkdownTypewriterProps {
  isLast?: boolean;
}
interface ICodeProps extends React.HTMLAttributes<HTMLElement> {
  node?: any;
}

const MarkdownTypewriterRenderer = ({ isLast }: IMarkdownTypewriterProps) => {
  const { currentAnswer } = useAppSelector(state => state.chat); // 使用store中的流式数据
  const typewriterRef = useRef<TypewriterClass | null>(null);
  const prevContentRef = useRef<string>(""); // 记录上一次的内容

  // 使用useEffect处理内容更新
  useEffect(() => {
    if (!typewriterRef.current) return;

    const diffContent = currentAnswer.slice(prevContentRef.current.length);
    if (diffContent) {
      // 追加新内容并继续
      typewriterRef.current.typeString(diffContent).start();
    }

    // 更新prevContentRef确保下次计算正确
    prevContentRef.current = currentAnswer;
  }, [currentAnswer]);

  return (
    <div className="markdown-content prose max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeColorChips]}
        components={{
          // p 标签处理
          p({ node, children }: ICodeProps) {
            return isLast ? (
              <Typewriter
                key="typewriter-unique-key" // 添加唯一Key防止组件重置
                options={{
                  cursor: "|",
                  delay: 20,
                  loop: false,
                }}
                onInit={typewriter => {
                  typewriterRef.current = typewriter;
                  // 初始渲染时直接设置完整内容
                  typewriter
                    .deleteAll()
                    .typeString(currentAnswer) // 使用当前的流式内容
                    .callFunction(value => {
                      // 隐藏光标
                      value.elements.cursor.style.display = "none";
                    });
                }}
              />
            ) : (
              <p>{children}</p>
            );
          },
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
