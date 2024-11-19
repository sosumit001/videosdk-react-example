import { useState } from 'react';
import Button from '../../@ui/button';
import { useMeeting, usePubSub } from '@videosdk.live/react-sdk';

export const ChatPannel = ({ isChatOpened, setIsChatOpened }) => {
  const [message, setMessage] = useState('');

  // Subscribe to the 'CHAT' topic using usePubSub
  const { publish, messages } = usePubSub('CHAT', {
    onMessageReceived: () => console.log('message received'),
    onOldMessagesReceived: () => console.log('old msg recived'),
  });
  const {
    localParticipant: { id: localId, displayName },
  } = useMeeting();

  // Function to publish the message
  const handleMessagePublish = () => {
    if (!message) {
      return;
    }
    publish(message, { persist: true });
    setMessage('');
  };

  return (
    <div
      className={`${
        isChatOpened ? 'fixed' : 'hidden'
      } bg-black h-full top-0 py-6 right-0 w-1/3 min-w-[300px] z-30 rounded-md`}
    >
      {/* Chat Messages */}
      <div className="flex items-center flex-col h-full space-y-2 my-2">
        {/* Display all messages */}
        <Button onClick={() => setIsChatOpened(!isChatOpened)} text="X Close" />
        <div className="w-[95%] flex-grow my-2 rounded-md p-2 overflow-y-auto">
          {messages.map((msg, index) => {
            const isLocalUser = msg.senderId === localId;
            return (
              <div
                key={index}
                className={`flex ${
                  isLocalUser ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`${
                    isLocalUser ? 'bg-gray-700' : 'bg-gray-600'
                  } text-white rounded-lg px-4 py-4 max-w-xs mb-1`}
                >
                  <p className="text-sm font-semibold text-[10px]">
                    {isLocalUser ? 'You' : displayName}
                  </p>
                  <p className="mt-1">{msg.message}</p>
                </div>
              </div>
            );
          })}
        </div>
        {/* Message Input */}
        <div className="flex w-[95%]">
          <input
            type="text"
            value={message}
            placeholder="Type a message..."
            onChange={(e) => setMessage(e.target.value)}
            className="w-full px-4 py-2 mx-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            aria-label="Message Input"
          />
          <Button text="Send" onClick={() => handleMessagePublish()} />
        </div>
      </div>
    </div>
  );
};
