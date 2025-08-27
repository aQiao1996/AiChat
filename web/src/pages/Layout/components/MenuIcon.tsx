import { useState } from "react";

interface MenuIconProps {
  barColor?: string;
  animationDuration?: number;
}

const MenuIcon = ({ barColor = "#333", animationDuration = 200 }: MenuIconProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      onClick={() => setIsOpen(!isOpen)}
      style={
        {
          "--bar-color": barColor,
          "--duration": `${animationDuration}ms`,
          "--translate-y": "5px", // 位移量
          "--translate-x": "1px", // 微调水平对齐
        } as React.CSSProperties
      }
      className="cursor-pointer w-16 space-y-2"
    >
      {[0, 1, 2].map(index => (
        <div
          key={index}
          className={`
            h-3 bg-[var(--bar-color)] rounded 
            transition-all duration-[var(--duration)]
            ${
              index === 1
                ? isOpen
                  ? "opacity-0 scale-x-0"
                  : ""
                : isOpen
                ? index === 0
                  ? "rotate-45 translate-y-[var(--translate-y)] translate-x-[var(--translate-x)]"
                  : "-rotate-45 -translate-y-[var(--translate-y)] translate-x-[var(--translate-x)]"
                : ""
            }
          `}
        />
      ))}
    </div>
  );
};

export default MenuIcon;
