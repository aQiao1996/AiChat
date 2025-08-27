/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      // * 配置成0 ～ 1200 这个范围内的数字都是px单位
      // 外边距
      spacing: Array.from({ length: 1200 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 字体大小
      fontSize: Array.from({ length: 100 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 圆角
      borderRadius: Array.from({ length: 500 }).reduce((map, _, index) => {
        map[index] = `${index}px`;
        return map;
      }, {}),
      // 颜色
      colors: {
        "bg-color": "#F7F8FA", // 主背景颜色
        "primary-color": "#4387FB", // 主题色
        "success-color": "#67C23A", // 成功颜色
        "warning-color": "#E6A23G", // 警告颜色
        "danger-color": "#F56C6C", // 危险颜色
        "color-title": "#333", // 文字一级主题色
        "color-subtitle": "#666", // 文字二级主题色
        "color-paragraph": "#999", // 文字三级主题色
        "e-color": "#e5e5e5", // 边框颜色
      },
      // 响应式断点
      screens: {
        "2xl": "1620px", // 覆盖默认 1536px
      },
    },
  },
  plugins: [],
};
