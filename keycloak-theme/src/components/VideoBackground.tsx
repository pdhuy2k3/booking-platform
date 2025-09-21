import React, { useState, useRef, useEffect } from 'react';

// Import all video files
import background1 from '../login/assets/background.mp4';
import background2 from '../login/assets/277187_small.mp4';
import background3 from '../login/assets/289105_small.mp4';
import background4 from '../login/assets/298643_small.mp4';
import background5 from '../login/assets/47213-451041047_small.mp4';
import background6 from '../login/assets/72566-543910236_small.mp4';

const videoSources = [
  background1,
  background2,
  background3,
  background4,
  background5,
  background6
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
