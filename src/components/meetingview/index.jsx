import { useState, useMemo, useRef, useEffect } from 'react';
import { Constants, useMeeting } from '@videosdk.live/react-sdk';
import Hls from 'hls.js';

import Button from '../../@ui/button';
import { ButtonIcon } from '../../@ui/button-icon';
import { Participant } from '../participant';

import copyIcon from '../../../public/icons/copy.png';
import groupIcon from '../../../public/icons/group.png';

import mic from '../../../public/icons/microphone.png';
import no_mic from '../../../public/icons/no-microphone.png';

import cam from '../../../public/icons/videocam.png';
import no_cam from '../../../public/icons/no-videocam.png';

import { Controls } from '../controls';

export const MeetingView = ({ meetingId, onMeetingLeave }) => {
  const [joined, setJoined] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const [isParticipantListOpened, setIsParticipantlistOpened] = useState(false);

  const { join, participants } = useMeeting();

  const mMeeting = useMeeting({
    onMeetingJoined: () => setJoined('JOINED'),
    onRecordingStarted: () => setIsRecording(true),
    onRecordingStopped: () => {
      setIsRecording(false);
      setRecordingTime(0); // Reset timer
    },
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
            {mMeeting.localParticipant.mode == Constants.modes.CONFERENCE ? (
              <SpeakerView />
            ) : (
              <ViewerView />
            )}

            {/* participants */}
            <div
              className={`${isParticipantListOpened ? 'block' : 'hidden'} fixed right-0 top-0 bg-[whitesmoke] h-full w-1/3 min-w-[350px]`}
            >
              {participants && <ParticipantList participants={participants} />}
            </div>

            {/* controls */}
            <div className="flex justify-between w-[96%] left-[2%] py-4 bottom-0 items-center z-20 absolute rounded-lg shadow-lg">
              <div className="flex justify-between w-full items-center gap-4">
                {/* audio/video controls */}
                {mMeeting.localParticipant.mode ===
                  Constants.modes.CONFERENCE && <Controls />}

                {/* participant list control */}
                <ButtonIcon
                  className="bg-white p-4 rounded-md"
                  onClick={() => setIsParticipantlistOpened((prev) => !prev)}
                >
                  <img src={groupIcon} alt="group icon" width={30} />
                </ButtonIcon>
              </div>
            </div>

            {/* participants, chatPannel & whiteboard */}
            {/* <Participants participants={participants} /> */}
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

const SpeakerView = () => {
  const { participants } = useMeeting();

  const speakers = useMemo(() => {
    const speakerParticipants = [...participants.values()].filter(
      (participant) => {
        return participant.mode == Constants.modes.CONFERENCE;
      }
    );
    return speakerParticipants;
  }, [participants]);

  const viewvers = useMemo(() => {
    const viewverParticipants = [...participants.values()].filter(
      (participant) => {
        return participant.mode == Constants.modes.VIEWER;
      }
    );
    return viewverParticipants;
  }, [participants]);

  // console.log('speakers : ', speakers);
  // console.log('viewers : ', viewvers);

  return (
    <div>
      {speakers.map((participant) => (
        <Participant participantId={participant.id} key={participant.id} />
      ))}
    </div>
  );
};

const ViewerView = () => {
  const playerRef = useRef(null);
  //Getting the hlsUrls
  const { hlsUrls, hlsState } = useMeeting();

  console.log('current hlsState : ', hlsState);

  //Playing the HLS stream when the playbackHlsUrl is present and it is playable
  useEffect(() => {
    if (hlsUrls.playbackHlsUrl && hlsState == 'HLS_PLAYABLE') {
      if (Hls.isSupported()) {
        const hls = new Hls({
          maxLoadingDelay: 1, // max video loading delay used in automatic start level selection
          defaultAudioCodec: 'mp4a.40.2', // default audio codec
          maxBufferLength: 0, // If buffer length is/becomes less than this value, a new fragment will be loaded
          maxMaxBufferLength: 1, // Hls.js will never exceed this value
          startLevel: 0, // Start playback at the lowest quality level
          startPosition: -1, // set -1 playback will start from intialtime = 0
          maxBufferHole: 0.001, // 'Maximum' inter-fragment buffer hole tolerance that hls.js can cope with when searching for the next fragment to load.
          highBufferWatchdogPeriod: 0, // if media element is expected to play and if currentTime has not moved for more than highBufferWatchdogPeriod and if there are more than maxBufferHole seconds buffered upfront, hls.js will jump buffer gaps, or try to nudge playhead to recover playback.
          nudgeOffset: 0.05, // In case playback continues to stall after first playhead nudging, currentTime will be nudged evenmore following nudgeOffset to try to restore playback. media.currentTime += (nb nudge retry -1)*nudgeOffset
          nudgeMaxRetry: 1, // Max nb of nudge retries before hls.js raise a fatal BUFFER_STALLED_ERROR
          maxFragLookUpTolerance: 0.1, // This tolerance factor is used during fragment lookup.
          liveSyncDurationCount: 1, // if set to 3, playback will start from fragment N-3, N being the last fragment of the live playlist
          abrEwmaFastLive: 1, // Fast bitrate Exponential moving average half-life, used to compute average bitrate for Live streams.
          abrEwmaSlowLive: 3, // Slow bitrate Exponential moving average half-life, used to compute average bitrate for Live streams.
          abrEwmaFastVoD: 1, // Fast bitrate Exponential moving average half-life, used to compute average bitrate for VoD streams
          abrEwmaSlowVoD: 3, // Slow bitrate Exponential moving average half-life, used to compute average bitrate for VoD streams
          maxStarvationDelay: 1, // ABR algorithm will always try to choose a quality level that should avoid rebuffering
        });

        let player = document.querySelector('#hlsPlayer');

        hls.loadSource(hlsUrls.playbackHlsUrl);
        hls.attachMedia(player);
      } else {
        if (typeof playerRef.current?.play === 'function') {
          playerRef.current.src = hlsUrls.playbackHlsUrl;
          playerRef.current.play();
        }
      }
    }
  }, [hlsUrls, hlsState, playerRef.current]);

  return (
    <div>
      {/* Showing message if HLS is not started or is stopped by HOST */}
      {hlsState != 'HLS_PLAYABLE' ? (
        <div className="bg-white w-1/2 min-w-[300] py-4 px-4 rounded-md mx-auto mt-16">
          <p>HLS has not started yet or is stopped</p>
        </div>
      ) : (
        hlsState == 'HLS_PLAYABLE' && (
          <div>
            <video
              ref={playerRef}
              id="hlsPlayer"
              autoPlay={true}
              controls
              style={{ width: '100%', height: '100%' }}
              playsinline
              playsInline
              muted={true}
              playing
              onError={(err) => {
                console.log(err, 'hls video error');
              }}
            ></video>
          </div>
        )
      )}
    </div>
  );
};

const ParticipantList = ({ participants }) => {
  return (
    <>
      {[...participants.values()].map((p, index) => (
        <div
          key={index}
          className="flex items-center mx-auto bg-slate-200 text-gray-800 py-4 px-2 mt-4 rounded-md w-[95%]"
        >
          <div className="flex-grow min-w-[200px] px-4">{p.displayName}</div>
          <div className="flex gap-4">
            <ButtonIcon className="bg-white p-4 rounded-md">
              <img src={p.micOn ? mic : no_mic} alt="microphone" width={25} />
            </ButtonIcon>
            <ButtonIcon className="bg-white p-4 rounded-md">
              <img src={p.webcamOn ? cam : no_cam} alt="videocam" width={25} />
            </ButtonIcon>
          </div>
        </div>
      ))}
    </>
  );
};
