// src/types/webex-widgets.d.ts

declare module '@webex/widgets' {
  import { ComponentType, CSSProperties } from 'react';

  export interface WebexWidgetProps {
    accessToken: string;
    meetingDestination: string;
    style?: CSSProperties;
    // 필요하다면 controlsProps, layouts 등도 any 타입으로 추가 가능
    [key: string]: any;
  }

  export const WebexMeetingsWidget: ComponentType<WebexWidgetProps>;
  export default WebexMeetingsWidget;
}
