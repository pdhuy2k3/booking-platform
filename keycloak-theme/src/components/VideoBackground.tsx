import React, { useState, useRef, useEffect } from 'react';

// Import all video files


const videoSources = [
  "https://res.cloudinary.com/de0ler3wa/video/upload/v1759930824/289105_small_ihwcvv.mp4",
  "https://res.cloudinary.com/de0ler3wa/video/upload/v1759930822/47213-451041047_small_bf1rqh.mp4",
  "https://res.cloudinary.com/de0ler3wa/video/upload/v1759930798/72566-543910236_small_ja5zzs.mp4",
  "https://res.cloudinary.com/de0ler3wa/video/upload/v1759930792/277187_small_k5n93g.mp4",

];

export const VideoBackground: React.FC = () => {
  const [currentVideoIndex, setCurrentVideoIndex] = useState<number>(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Initialize with random video on first load
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * videoSources.length);
    setCurrentVideoIndex(randomIndex);
  }, []);

  // Handle video end event to play next video
  const handleVideoEnd = () => {
    setCurrentVideoIndex((prevIndex) => {
      const nextIndex = (prevIndex + 1) % videoSources.length;
      return nextIndex;
    });
  };

  // Handle video load to ensure it plays
  const handleVideoLoad = () => {
    if (videoRef.current) {
      videoRef.current.play().catch(console.error);
    }
  };

  return (
    <video
      ref={videoRef}
      className="fixed inset-0 w-full h-full object-cover z-0"
      autoPlay
      loop={false} // We handle looping manually
      muted
      playsInline
      onEnded={handleVideoEnd}
      onLoadedData={handleVideoLoad}
      key={currentVideoIndex} // Force re-render when video changes
    >
      <source src={videoSources[currentVideoIndex]} type="video/mp4" />
      Your browser does not support the video tag.
    </video>
  );
};

export default VideoBackground;
