// components/YouTubePlayer.tsx
import { useRef, useCallback } from 'react';
import YouTube, { YouTubeProps, YouTubePlayer as YTPlayer } from 'react-youtube';

// 올바른 문법으로 수정
interface YouTubePlayerProps {
  videoId: string;
  onTimeUpdate?: (_: number) => void;
}

function YouTubePlayer({ videoId, onTimeUpdate }: YouTubePlayerProps) {
  const playerRef = useRef<YTPlayer | null>(null);
  const intervalRef = useRef<number | null>(null);

  const stopTimeTracking = useCallback(() => {
    if (intervalRef.current !== null) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const startTimeTracking = useCallback(() => {
    stopTimeTracking();

    intervalRef.current = window.setInterval(() => {
      if (playerRef.current && onTimeUpdate) {
        onTimeUpdate(playerRef.current.getCurrentTime() as unknown as number);
      }
    }, 1000);
  }, [onTimeUpdate, stopTimeTracking]);

  const opts: YouTubeProps['opts'] = {
    height: '100%',
    width: '100%',
    playerVars: {
      autoplay: 0,
      modestbranding: 1,
      rel: 0,
    },
  };

  const onReady: YouTubeProps['onReady'] = (event) => {
    playerRef.current = event.target;
    console.log('YouTube Player ready');
  };

  const onStateChange: YouTubeProps['onStateChange'] = (event) => {
    if (event.data === YouTube.PlayerState.PLAYING && onTimeUpdate) {
      startTimeTracking();
    } else {
      stopTimeTracking();
    }
  };

  return (
    <div className="w-full h-full flex flex-col">
      <div className="w-full flex-grow bg-black">
        <YouTube
          videoId={videoId}
          opts={opts}
          onReady={onReady}
          onStateChange={onStateChange}
          className="w-full h-full"
        />
      </div>
    </div>
  );
}

export default YouTubePlayer;