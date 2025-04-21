// app/providers.tsx
'use client';

import * as ReactDOMModule from 'react-dom';

// ReactDOMModule를 any로 바꿔서, findDOMNode를 붙일 수 있게 합니다.
const ReactDOM: any = ReactDOMModule;

if (typeof ReactDOM.findDOMNode !== 'function') {
  ReactDOM.findDOMNode = () => null;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
