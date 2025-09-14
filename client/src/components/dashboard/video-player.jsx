import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";

export default function VideoPlayer({ videoSrc, className = "" }) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef(null);

  // Auto-play when component mounts
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.play().catch((error) => {
        console.log("Auto-play was prevented:", error);
        setIsPlaying(false);
      });
    }
  };

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
        className="w-full h-full object-cover"
        muted={isMuted}
        loop
        autoPlay
        playsInline
        onLoadedData={handleVideoLoad}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        style={{ display: 'block' }}
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