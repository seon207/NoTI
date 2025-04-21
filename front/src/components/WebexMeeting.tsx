'use client';                     // 이 파일은 클라이언트에서 실행

/* ---------- 1) findDOMNode 폴리필 ---------- */
import * as ReactDOM from 'react-dom';
import { findDOMNode } from 'find-dom-node-polyfill';

if (typeof (ReactDOM as any).findDOMNode !== 'function') {
  (ReactDOM as any).findDOMNode = findDOMNode;
}
/* ------------------------------------------- */

import { WebexMeetingsWidget } from '@webex/widgets';
import { useRef } from 'react';

interface WebexMeetingProps {
  destination: string;
  accessToken: string;
}

export default function WebexMeeting({ destination, accessToken }: WebexMeetingProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);

  const controlsProps = {
    mute:  { hidden: true },
    audio: { hidden: true },
    video: { hidden: true },
    roster:{ hidden: true },
  };

  return (
    <div ref={wrapperRef} style={{ width: '100%', height: '100%' }}>
      <WebexMeetingsWidget
        style={{ width: '100%', height: '100%' }}
        accessToken={accessToken}
        meetingDestination={destination}
        controlsProps={controlsProps}
      />
    </div>
  );
}
