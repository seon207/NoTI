import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  js.configs.recommended,
  ...compat.extends(
    "airbnb-base",
    "next/core-web-vitals",
    "next/typescript"
  ),
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    rules: {
      // 리액트 규칙
      "react/react-in-jsx-scope": "off", // Next.js에서는 React import가 필요 없음
      "react/jsx-props-no-spreading": "off", // props spreading 허용
      "react/require-default-props": "off", // TypeScript에서 관리됨
      
      // TypeScript 관련 규칙
      "@typescript-eslint/explicit-module-boundary-types": "off", // 함수 반환 타입 명시 필수 해제
      
      // 임포트 관련
      "import/prefer-default-export": "off", // 단일 export 강제 해제
      
      // 함수 컴포넌트 정의 스타일
      "react/function-component-definition": [
        "error",
        {
          namedComponents: "arrow-function",
          unnamedComponents: "arrow-function",
        },
      ],
      
      // 추가 규칙
    },
    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx", ".ts", ".tsx"],
        },
      },
    },
  },
];

export default eslintConfig;
