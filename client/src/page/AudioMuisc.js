import React, { useRef, useState } from 'react';

const AudioMuisc = () => {
  const audioRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div>
      <h2>Custom Audio Player</h2>
      <audio ref={audioRef}>
      Sound Effect from 
        <source src="../muisc/phone-call-14472 (1).mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      <button onClick={togglePlay}>
        {isPlaying ? 'Pause' : 'Play'}
      </button>
    </div>
  );
};

export default AudioMuisc;