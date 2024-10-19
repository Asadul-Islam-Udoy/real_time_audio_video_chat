import React, { useState } from 'react';
import io from "socket.io-client";
import Peer from "simple-peer";
const socket = io("http://localhost:5000");
function AudionCall() {
  const [isPlaying,setIsPlaying] = useState(false);
  const [incomingCall,setIncomingCall] = useState(false);
  const [caller,setCaller] = useState(null);
  const [otherUserId,setOtherUserId] = useState(null);
  return (
    <>
      <div>Audio Call..</div>
    </>
  )
}

export default AudionCall
