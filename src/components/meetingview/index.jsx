import { useEffect, useMemo, useState } from 'react';
import { Constants, useMeeting } from '@videosdk.live/react-sdk';

import Button from '../../@ui/button';
import { ButtonIcon } from '../../@ui/button-icon';

import copyIcon from '../../../public/icons/copy.png';
import recordIcon from '../../../public/icons/record.png';

import { Controls } from '../controls';
import { Participants } from '../participants';

import { formatTime } from '../../utils';

export const MeetingView = ({ meetingId, onMeetingLeave }) => {
  const [joined, setJoined] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [isRecordStarted, setIsRecordStarted] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0); // Timer in seconds
  const [isCopied, setIsCopied] = useState(false);

  const { join, participants, startRecording, stopRecording } = useMeeting({
    onMeetingJoined: () => setJoined('JOINED'),
    onRecordingStarted: () => setIsRecording(true),
    onRecordingStopped: () => {
      setIsRecording(false);
      setRecordingTime(0); // Reset timer
    },
  });

  // const isRedcor = useMemo(()=>{
  //   if(recordingState == Constants.recordingEvents.RECORDING_STARTED){
  //     return true
  //   }else{
  //     return false
  //   }
  // }, recordingState)

  //record time logic
  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const joinMeeting = () => {
    setJoined('JOINING');
    join();
  };

  const handleCopy = () => {
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
    navigator.clipboard.writeText(meetingId);
    setIsCopied(true);
  };

  const handleRecording = () => {
    const webhookUrl = null;
    const awsDirPath = null;

    const config = {
      layout: {
        type: 'GRID',
        priority: 'SPEAKER',
        gridSize: 2,
      },
      theme: 'DARK',
      mode: 'video-and-audio',
      quality: 'high',
      orientation: 'landscape',
    };

    const transcription = {
      enabled: true,
      summary: {
        enabled: true,
        prompt:
          'Write summary in sections like Title, Agenda, Speakers, Action Items, Outlines, Notes and Summary',
      },
    };

    if (!isRecording) {
      startRecording(webhookUrl, awsDirPath, config, transcription);
    }
    stopRecording();
    setIsRecordStarted(!isRecordStarted);
  };

  return (
    <>
      {/* header */}
      <div className="flex justify-end w-[98%] ml-[1%]">
        <div className="p-4 m-2 rounded-md shadow-sm bg-green-50 flex items-center justify-between">
          <h3 className="text-lg rounded-md px-3 py-1">
            {isCopied ? 'copied!' : meetingId}
          </h3>
          <ButtonIcon onClick={() => handleCopy()}>
            <img src={copyIcon} alt="copy meeting-id" width={30} />
          </ButtonIcon>
        </div>
      </div>

      <div className="h-full flex items-center justify-center">
        {joined === 'JOINED' ? (
          <div className="relative w-full h-full py-y bg-slate-900">
            {/* controls */}
            <div className="flex justify-between w-[96%] left-[2%] py-4 bottom-0 items-center z-20 absolute rounded-lg shadow-lg">
              <div className="flex justify-between w-full items-center gap-4">
                {/* audio/video controls */}
                <Controls onMeetingLeave={onMeetingLeave} />

                {/* recording */}
                <div className="flex gap-4">
                  <ButtonIcon
                    onClick={() => handleRecording()}
                    style={{
                      '--recording-time': `"${formatTime(recordingTime)}"`,
                    }}
                    className={`relative py-4 px-6 rounded-md 
                      ${isRecording ? 'bg-white after:content-[var(--recording-time)]' : 'bg-gray-500'} 
                      ${isRecordStarted ? 'after:absolute after:content-["starting..."]' : 'after:hidden'}
                      after:right-0 after:-top-[110%] after:rounded-md after:w-[160%] after:h-full after:bg-white after:flex after:items-center after:justify-center`}
                  >
                    {isRecording ? (
                      <div className="text-blue-500">stop</div>
                    ) : (
                      <img src={recordIcon} alt="record" width={30} />
                    )}
                  </ButtonIcon>
                </div>
              </div>
            </div>

            {/* participants, chatPannel & whiteboard */}
            <Participants participants={participants} />
          </div>
        ) : joined === 'JOINING' ? (
          <Button
            text="Joining..."
            color="text-white"
            className=" rounded-lg shadow-md mb-20 py-4 px-8 text-xl"
          />
        ) : (
          // start meeting
          <Button
            text="Start Meeting"
            onClick={joinMeeting}
            color="text-white"
            className=" rounded-lg shadow-md mb-20 py-4 px-8 text-xl"
          />
        )}
      </div>
    </>
  );
};
