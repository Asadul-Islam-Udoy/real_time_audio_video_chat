import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
import { useNavigate } from "react-router-dom";
const socket = io("http://localhost:5000");
const VideoCall = () => {
  const audioRefSender = useRef(null);
  const [audioRefReciver] = useState(new Audio('../muisc/lirivial-instrumental-173944.mp3'));
  const [isPlaying, setIsPlaying] = useState(false);
  const [isCancelReciver, setIsCancelReviver] = useState(false);
  const [otherUserId, setOtherUserId] = useState();
  const [myId, setMyId] = useState("");
  const [stream, setStream] = useState(null);
  const [caller, setCaller] = useState(null);
  const [callAccepted, setCallAccepted] = useState(false);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const navigate = useNavigate();
  const myVideo = useRef(null);
  const userVideo = useRef(null);
  const [connectionRef, setCurrentionRef] = useState(null);

  // Get user media (camera and microphone)
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((stream) => {
        setStream(stream);
        if (stream) {
          if(myVideo.current){
            myVideo.current.srcObject = stream;
          }
        }
      });
    socket.on("connect", () => {
      setMyId(socket.id);
    });
    socket.on("callUser", (data) => {
      setIncomingCall(true);
      setCaller(data.from);
      setCallerSignal(data.signal);
    });

    socket.on("callAccepted", (signal) => {
      setIsPlaying(false);
      setCallAccepted(true);
    });
  }, [socket, isPlaying, callAccepted]);

  const callUser = (id) => {
    setIsPlaying(true);
    if (stream) {
      const peer = new Peer({
        initiator: true,
        trickle: false,
        stream: stream,
      });
      peer.on("signal", (signal) => {
        socket.emit("callUser", { userToCall: id, signalData: signal });
      });

      peer.on("stream", (currentStream) => {
        userVideo.current.srcObject = currentStream;
      });

      socket.on("callAccepted", (signal) => {
        setCallAccepted(true);
        peer.signal(signal);
      });
    }
    if(!intervalId){
      const audio = audioRefSender.current;
      const id = setInterval(() => {
        audio.play()
      }, 3000);
      setIntervalId(id)
    }
  };

  const answerCall = () => {
    setIsCancelReviver(true)
    setIncomingCall(false);
    if (stream) {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: stream,
      });
      peer.on("signal", (signal) => {
        socket.emit("answerCall", { signal, to: caller });
      });

      peer.on("stream", (currentStream) => {
        userVideo.current.srcObject = currentStream;
      });

      peer.signal(callerSignal);
      setCurrentionRef(peer);
    }
  };

  useEffect(() => {
    socket.on("callEnded", () => {
      leaveCall();
    });

    return () => {
      socket.off("callEnded"); // Clean up socket listeners when component unmounts
    };
  }, []);
  const leaveCall = () => {
    if(intervalId){
      clearInterval(intervalId);
      setIntervalId(null)
    }
    setCallAccepted(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    // Close the peer connection
    if (connectionRef) {
      connectionRef.destroy();
      setCurrentionRef(null);
    }
    // Optionally, inform the server that the call has ended
    socket.emit("endCall", otherUserId );
    // Reset video elements
    if (myVideo.current) {
      myVideo.current.srcObject = null; // Only set if current is not null
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    } // Only set if current is not null

    setStream(null); // Reset stream state
    setOtherUserId("");
    navigate("/");
    window.location.reload();
  };


  const leaveCallReciver = () => {
    if(intervalId){
      clearInterval(intervalId);
      setIntervalId(null)
    }
    setCallAccepted(false);
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
    }
    // Close the peer connection
    if (connectionRef) {
      connectionRef.destroy();
      setCurrentionRef(null);
    }
    // Optionally, inform the server that the call has ended
     socket.emit("endCall",caller);
    // Reset video elements
    if (myVideo.current) {
      myVideo.current.srcObject = null; // Only set if current is not null
    }
    if (userVideo.current) {
      userVideo.current.srcObject = null;
    } // Only set if current is not null

    setStream(null); // Reset stream state
    setOtherUserId("");
    navigate("/");
    window.location.reload();
  };

  useEffect(() => {
    if (callAccepted) {
      setIsPlaying(false);
    }
  }, [callAccepted]);

  useEffect(() => {
    return () => {
      if(!callAccepted && isPlaying){
        clearInterval(intervalId); 
      }
    };
  }, [intervalId ,isPlaying ,callAccepted]);

  useEffect(()=>{
    if(incomingCall && !callAccepted){
      audioRefReciver.play()
     }
     else{
      audioRefReciver.pause();
     }
  },[incomingCall,callAccepted])

  return (
    <div>
      <h1>Real-Time Voice Call</h1>
      <p>Your ID: {myId}</p>

      <input
        type="text"
        placeholder="Enter User ID to call"
        value={otherUserId}
        onChange={(e) => setOtherUserId(e.target.value)}
      />
      <h1>Video Call</h1>
      <div className="flex m-4 p-4">
        <video playsInline ref={myVideo} autoPlay style={{ width: "300px" }} />
        <video
          className="ml-3"
          playsInline
          ref={userVideo}
          autoPlay
          style={{ width: "300px" }}
        />
      </div>
      <div>
        {incomingCall && !callAccepted ? (
          <div>
            <h2>Incoming Call...</h2>
            <button className="bg-blue-400 p-2 ml-8 rounded-sm text-white font-serif" onClick={answerCall}>Answer</button>
            <button className="m-3 bg-red-400 p-2 ml-8 rounded-sm text-white font-serif" onClick={leaveCallReciver}>Decline</button>
          </div>
        ) : null}
        {isPlaying &&  <div>calling...</div>} 
        {!incomingCall && !callAccepted ? (
          <>
            {!isCancelReciver && <button className="bg-blue-500 p-2 ml-8 rounded-sm text-white font-serif" onClick={() => callUser(otherUserId)}>Call User</button>}
            {isPlaying && <button className="bg-red-400  p-2 ml-8 rounded-sm text-white font-serif" onClick={leaveCall}>Cancel...</button>}
            {isCancelReciver  && 
              <button className="bg-red-400  p-2 ml-8 rounded-sm text-white font-serif" onClick={leaveCallReciver}>End Call</button>
            }
            <audio ref={audioRefSender}>
              <source
                src="../muisc/phone-call-14472 (1).mp3"
                type="audio/mpeg"
              />
            </audio>
          </>
        ) : null}
        {callAccepted && <button className="bg-red-500 p-2 ml-8 rounded-sm text-white font-serif" onClick={leaveCall}>End Call</button>}
      </div>
    </div>
  );
};

export default VideoCall;

