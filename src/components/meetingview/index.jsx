import { useState } from 'react';
import { useMeeting } from '@videosdk.live/react-sdk';

import Button from '../../@ui/button';
import { ButtonIcon } from '../../@ui/button-icon';

import copyIcon from '../../../public/icons/copy.png';

import { Controls } from '../controls';
import { Participants } from '../participants';

export const MeetingView = ({ meetingId, onMeetingLeave }) => {
  const [joined, setJoined] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

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

                {/* handle bgChange, whiteboard & chatPannel */}
                <div className="flex gap-4"></div>
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
