import { useState } from 'react';
import {
  useMeeting,
  useTranscription,
  Constants,
} from '@videosdk.live/react-sdk';

import Button from '../../@ui/button';
import { ButtonIcon } from '../../@ui/button-icon';

import copyIcon from '../../../public/icons/copy.png';
import closeCaption from '../../../public/icons/close-caption.png';
import openCaption from '../../../public/icons/open-caption.png';

import { Controls } from '../controls';
import { Participants } from '../participants';

export const MeetingView = ({ meetingId, onMeetingLeave }) => {
  const [joined, setJoined] = useState(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isTranscriptionStarted, setIsTranscriptionStarted] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');

  const { startTranscription, stopTranscription } = useTranscription({
    onTranscriptionStateChanged: (state) => {
      const {
        TRANSCRIPTION_STARTING,
        TRANSCRIPTION_STARTED,
        TRANSCRIPTION_STOPPING,
      } = Constants.transcriptionEvents;

      const { status } = state;

      if (status === TRANSCRIPTION_STARTING) {
        console.log('starting...');
        setIsStarting(true);
      } else if (status === TRANSCRIPTION_STARTED) {
        setIsTranscriptionStarted(true);
        setIsStarting(false);
        console.log('started...');
      } else if (status === TRANSCRIPTION_STOPPING) {
        console.log('stopping...');
      } else {
        setIsTranscriptionStarted(false);
        setTranscriptionText('');
        console.log('stopped...');
      }
    },
    onTranscriptionText: (data) => {
      const { participantName, text } = data;
      setTranscriptionText(`${text}`);
      console.log(participantName, text);
    },
  });

  const handleTranscription = () => {
    const config = {
      webhookUrl: null,
      summary: {
        enabled: true,
        prompt:
          'Write summary in sections like Title, Agenda, Speakers, Action Items, Outlines, Notes and Summary',
      },
    };

    if (!isTranscriptionStarted) {
      startTranscription(config);
    } else {
      stopTranscription();
    }
  };

  const { join, participants } = useMeeting({
    onMeetingJoined: () => setJoined('JOINED'),
  });

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

                {/* handle transcription */}
                <div className="flex gap-4">
                  <ButtonIcon
                    onClick={handleTranscription}
                    className="bg-white p-4 rounded-md"
                  >
                    {isTranscriptionStarted ? (
                      <img src={openCaption} alt="open-caption" width={30} />
                    ) : isStarting ? (
                      <div>starting...</div>
                    ) : (
                      <img src={closeCaption} alt="close-caption" width={30} />
                    )}
                  </ButtonIcon>
                </div>
              </div>
            </div>

            {/* participants */}
            <Participants participants={participants} />

            {/* Transcription Area */}
            {isTranscriptionStarted && (
              <div className="fixed bottom-40 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white p-4 rounded-lg shadow-lg text-center">
                {transcriptionText ?? transcriptionText}
              </div>
            )}
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
