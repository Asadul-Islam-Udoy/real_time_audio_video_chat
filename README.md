
///fontend
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Video Call</title>
    <style>
        video {
            width: 45%;
            margin: 5px;
        }
        #localVideo {
            border: 2px solid blue;
        }
    </style>
</head>
<body>
    <h1>Video Call App</h1>
    <button id="startCall">Start Call</button>
    <button id="endCall">End Call</button>
    <div>
        <video id="localVideo" autoplay muted></video>
        <video id="remoteVideo" autoplay></video>
    </div>

    <script src="/socket.io/socket.io.js"></script>
    <script>
        const socket = io('http://localhost:3001'); // Connect to signaling server

        let localStream;
        let peerConnection;
        const roomId = 'myRoom'; // Example room ID
        const configuration = {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' } // STUN server
            ]
        };

        document.getElementById('startCall').onclick = async () => {
            localStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            document.getElementById('localVideo').srcObject = localStream;

            peerConnection = new RTCPeerConnection(configuration);
            localStream.getTracks().forEach(track => peerConnection.addTrack(track, localStream));

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    socket.emit('signal', {
                        roomId: roomId,
                        signal: { candidate: event.candidate }
                    });
                }
            };

            peerConnection.ontrack = (event) => {
                document.getElementById('remoteVideo').srcObject = event.streams[0];
            };

            socket.emit('join', roomId); // Join room
        };

        socket.on('signal', async (data) => {
            if (data.signal.offer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal.offer));
                const answer = await peerConnection.createAnswer();
                await peerConnection.setLocalDescription(answer);
                socket.emit('signal', {
                    roomId: roomId,
                    signal: { answer: answer }
                });
            } else if (data.signal.answer) {
                await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal.answer));
            } else if (data.signal.candidate) {
                await peerConnection.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
            }
        });

        document.getElementById('endCall').onclick = () => {
            peerConnection.close();
            peerConnection = null;
            localStream.getTracks().forEach(track => track.stop());
            localStream = null;
        };
    </script>
</body>
</html>


///backend
const express = require('express');
const http = require('http');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

io.on('connection', (socket) => {
    console.log('a user connected');

    socket.on('join', (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on('signal', (data) => {
        io.to(data.roomId).emit('signal', {
            senderId: socket.id,
            signal: data.signal,
        });
    });

    socket.on('disconnect', () => {
        console.log('user disconnected');
    });
});

server.listen(3001, () => {
    console.log('Signaling server is running on http://localhost:3001');
});
