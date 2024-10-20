import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import Peer from "simple-peer";
const socket = io("http://localhost:5000");
function AudionCall() {
  const senderRingtonRef = useRef(null);
  const [reciverRingtonRef] = useState(
    new Audio("../muisc/lirivial-instrumental-173944.mp3")
  );
  const [isPlaying, setIsPlaying] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [incomingCall, setIncomingCall] = useState(false);
  const [callAccepted, setCallAccepted] = useState(false);
  const [userSignal, setUserSingal] = useState(null);
  const [myId, setMyId] = useState("");
  const [caller, setCaller] = useState(null);
  const [otherUserId, setOtherUserId] = useState(null);
  const senderAudioRef = useRef(null);
  const reciverAudioRef = useRef(null);
  const [peerConnection, setPeerConnection] = useState(null);
  const [peerStream, setPeerStreem] = useState(null);
  useEffect(() => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      if (stream) {
        if (senderAudioRef.current) {
          senderAudioRef.current.srcObject = stream;
        }
        setPeerStreem(stream);
      }
    });
    socket.on("connect", () => {
      setMyId(socket.id);
    });
    socket.on("audioCallUser", (data) => {
      setIncomingCall(true);
      setCaller(data.YourId);
      setUserSingal(data.signal);
    });
    socket.on("AudioCallAccepted", (data) => {
      setIncomingCall(false);
      setCallAccepted(true);
    });
  }, [socket]);

  const callUserHandler = (id) => {
    setIsPlaying(true);

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: peerStream,
    });

    peer.on("signal", (signal) => {
      socket.emit("audioCallUser", { callReciverId: id, userSignal: signal });
    });
    peer.on("stream", (currentStream) => {
      reciverAudioRef.current.srcObject = currentStream;
    });
    socket.on("AudioCallAccepted", (signal) => {
      setCallAccepted(true);
      peer.signal(signal);
    });
    if (!intervalId) {
      const audio = senderRingtonRef.current;
      const id = setInterval(() => {
        audio.play();
      }, 3000);
      setIntervalId(id);
    }
  };

  const callReciverHandler = () => {
    if (peerStream) {
      const peer = new Peer({
        initiator: false,
        trickle: false,
        stream: peerStream,
      });
      peer.on("signal", (signal) => {
        socket.emit("audioCallAnwser", {
          callSenderId: caller,
          userSignal: signal,
        });
      });
      peer.on("stream", (currentStream) => {
        reciverAudioRef.current.srcObject = currentStream;
      });
      peer.signal(userSignal);
      setPeerConnection(peer);
      setIncomingCall(false);
      setCallAccepted(true);
    }
  };

  useEffect(() => {
    return () => {
      if (isPlaying && !callAccepted) {
        clearInterval(intervalId);
      }
    };
  }, [isPlaying, callAccepted, intervalId]);

  useEffect(() => {
    if (incomingCall && !callAccepted) {
      reciverRingtonRef.play();
    } else {
      reciverRingtonRef.pause();
    }
  }, [incomingCall, callAccepted]);

  return (
    <>
      <div>
        <h1>Audio Calling</h1>
      </div>
      <div>Soket ID : {myId}</div>
      <input
        className=" bg-slate-300 border-black rounded-md"
        onChange={(e) => setOtherUserId(e.target.value)}
      />
      <div>
        {incomingCall && !callAccepted ? (
          <div className="m-2">
            <p className="ml-2">incomming call...</p>
            <button
              onClick={callReciverHandler}
              className=" bg-blue-400 p-1 m-2 rounded-sm text-white font-serif"
            >
              Answer
            </button>
            <button className=" bg-orange-500 p-1 m-2 rounded-sm text-white font-serif">
              Cancel
            </button>
          </div>
        ) : (
          <div>
            {isPlaying ? (
              <div className="m-3">
                <p className="ml-2">running....</p>
                <button className=" bg-orange-500 p-1 m-2 rounded-sm text-white font-serif">
                  Cancel
                </button>
              </div>
            ) : (
              <div>
                {callAccepted ? (
                  <button
                    onClick={() => callUserHandler(otherUserId)}
                    className=" bg-orange-500 p-1 m-2 rounded-sm text-white font-serif"
                  >
                    Cancel
                  </button>
                ) : (
                  <button
                    onClick={() => callUserHandler(otherUserId)}
                    className=" bg-blue-400 p-1 m-2 rounded-sm text-white font-serif"
                  >
                    Send Call
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div>
        {incomingCall ? (
          <audio ref={senderAudioRef} controls autoPlay />
        ) : (
          <audio ref={reciverAudioRef} controls autoPlay />
        )}
      </div>
      <audio ref={senderRingtonRef}>
        <source src="../muisc/phone-call-14472 (1).mp3" type="audio/mpeg" />
      </audio>
    </>
  );
}

export default AudionCall;
