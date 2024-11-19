import { useRef, useEffect } from 'react';
import { useParticipant } from '@videosdk.live/react-sdk';

export const Participant = ({ participantId }) => {
  const { webcamStream, micStream, webcamOn, micOn, isLocal } =
    useParticipant(participantId);

  const micRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    if (webcamOn && webcamStream && videoRef.current) {
      const mediaStream = new MediaStream();
      mediaStream.addTrack(webcamStream.track);
      videoRef.current.srcObject = mediaStream;
      videoRef.current
        .play()
        .catch((error) =>
          console.error('videoElem.current.play() failed', error)
        );
    }
  }, [webcamStream, webcamOn]);

  useEffect(() => {
    if (micRef.current) {
      if (micOn && micStream) {
        const mediaStream = new MediaStream();
        mediaStream.addTrack(micStream.track);

        micRef.current.srcObject = mediaStream;
        micRef.current
          .play()
          .catch((error) =>
            console.error('micElem.current.play() failed', error)
          );
      } else {
        micRef.current.srcObject = null;
      }
    }
  }, [micStream, micOn]);

  return (
    <div>
      <audio ref={micRef} autoPlay muted={isLocal} />
      {webcamOn && (
        <video
          ref={videoRef}
          autoPlay
          className={`${isLocal ? 'absolute top-0 left-[5%] w-[90%] h-[90%]' : 'absolute right-[50px] bottom-[150px] w-[200px]'}`}
          playsInline
        />
      )}
    </div>
  );
};
