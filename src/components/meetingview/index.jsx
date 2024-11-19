import { useState } from 'react';
import {
  useMeeting,
  useWhiteboard,
  createCameraVideoTrack,
} from '@videosdk.live/react-sdk';
import { VirtualBackgroundProcessor } from '@videosdk.live/videosdk-media-processor-web';

import Button from '../../@ui/button';
import { ButtonIcon } from '../../@ui/button-icon';

import chatIcon from '../../../public/icons/chat.svg';
import whiteboard from '../../../public/icons/whiteboard.png';
import bgchangeIcon from '../../../public/icons/changebg.webp';
import copyIcon from '../../../public/icons/copy.png';

import { Controls } from '../controls';
import { ChatPannel } from '../chat';

import { Whiteboard } from '../whiteboard';
import { Participants } from '../participants';

export const MeetingView = ({ meetingId, onMeetingLeave }) => {
  const [joined, setJoined] = useState(null);
  const [isChatOpened, setIsChatOpened] = useState(false);
  const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [showBgImage, setShowBgImage] = useState(false);
  const videoProcessor = new VirtualBackgroundProcessor();
  const imageOptions = ['san-fran', 'paper-wall', 'beach'];

  const { startWhiteboard, stopWhiteboard, whiteboardUrl } = useWhiteboard();

  const { join, participants, changeWebcam } = useMeeting({
    onMeetingJoined: () => setJoined('JOINED'),
  });

  const handleCopy = () => {
    setTimeout(() => {
      setIsCopied(false);
    }, 3000);
    navigator.clipboard.writeText(meetingId);
    setIsCopied(true);
  };

  const handleWhiteBoard = () => {
    if (!isWhiteboardOpen) {
      startWhiteboard();
    } else {
      stopWhiteboard();
    }
    setIsWhiteboardOpen(!isWhiteboardOpen);
  };

  const addVideoBg = async (imgIndex) => {
    if (!videoProcessor.ready) {
      await videoProcessor.init();
    }

    const imageUrl = `https://cdn.videosdk.live/virtual-background/${imageOptions[imgIndex]}.jpeg`;

    const config = {
      type: 'image', // "blur"
      imageUrl,
    };
    const stream = await createCameraVideoTrack({});
    const processedStream = await videoProcessor.start(stream, config);
    changeWebcam(processedStream);
    setShowBgImage(!showBgImage);
  };

  const removeVideoBg = async () => {
    videoProcessor.stop();
    const stream = await createCameraVideoTrack({});
    changeWebcam(stream);
    setShowBgImage(!showBgImage);
  };

  const joinMeeting = () => {
    setJoined('JOINING');
    join();
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
              {/* handle backgroundChange, whiteboard & chat */}
              <div className="flex items-center gap-2 h-full">
                {showBgImage && (
                  <div className="absolute w-[200px] right-12 bottom-full bg-white text-black rounded-lg shadow-lg p-2 text-sm whitespace-pre">
                    <div
                      className="py-4 cursor-pointer hover:bg-slate-50"
                      onClick={() => removeVideoBg()}
                    >
                      none
                    </div>
                    {imageOptions.map((item, index) => (
                      <div
                        key={index}
                        className="py-4 cursor-pointer hover:bg-slate-50"
                        onClick={() => addVideoBg(index)}
                      >
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between w-full items-center gap-4">
                {/* audio/video controls */}
                <Controls onMeetingLeave={onMeetingLeave} />

                {/* handle bgChange, whiteboard & chatPannel */}
                <div className="flex gap-4">
                  <ButtonIcon
                    onClick={() => setShowBgImage(!showBgImage)}
                    className="bg-white p-4 rounded-md"
                  >
                    <img src={bgchangeIcon} width={30} alt="background" />
                  </ButtonIcon>

                  <ButtonIcon
                    onClick={() => handleWhiteBoard()}
                    className="bg-white p-4 rounded-md"
                  >
                    <img
                      src={whiteboard}
                      alt="whiteboard"
                      width={30}
                      className="filter grayscale brightness-0"
                    />
                  </ButtonIcon>

                  <ButtonIcon
                    onClick={() => setIsChatOpened(!isChatOpened)}
                    className="bg-white p-4 rounded-md"
                  >
                    <img
                      src={chatIcon}
                      alt="chat-icon"
                      width={30}
                      className="filter grayscale brightness-0"
                    />
                  </ButtonIcon>
                </div>
              </div>
            </div>

            {/* participants, chatPannel & whiteboard */}
            <Participants participants={participants} />
            <Whiteboard
              isWhiteboardOpen={isWhiteboardOpen}
              whiteboardUrl={whiteboardUrl}
              handleWhiteBoard={handleWhiteBoard}
            />
            <ChatPannel
              isChatOpened={isChatOpened}
              setIsChatOpened={setIsChatOpened}
            />
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
