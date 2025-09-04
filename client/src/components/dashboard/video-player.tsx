
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

interface VideoPlayerProps {
  videoSrc: string;
  className?: string;
}

export default function VideoPlayer({ videoSrc, className = "" }: VideoPlayerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  return (
    <div className={`relative group ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-auto rounded-lg shadow-lg"
        muted={isMuted}
        loop
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Video Controls Overlay */}
      <div className="absolute bottom-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="secondary"
          size="sm"
          onClick={togglePlay}
          className="bg-black/70 text-white hover:bg-black/90"
        >
          <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'}`}></i>
        </Button>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={toggleMute}
          className="bg-black/70 text-white hover:bg-black/90"
        >
          <i className={`fas ${isMuted ? 'fa-volume-mute' : 'fa-volume-up'}`}></i>
        </Button>
      </div>
    </div>
  );
}
