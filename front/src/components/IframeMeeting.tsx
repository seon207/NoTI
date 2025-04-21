'use client';

interface IframeMeetingProps {
  meetingId: string;
}

export default function IframeMeeting({ meetingId }: IframeMeetingProps) {
  return (
    <iframe
      src={`https://meet337.webex.com/meet337/${meetingId}`}
      allow="camera; microphone; fullscreen"
      style={{ width: '100%', height: '100%', border: 0 }}
    />
  );
}
