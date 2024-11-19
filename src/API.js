import { APP_URL } from './constants/constants';

// unsafe Token
export const authToken =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhcGlrZXkiOiI2YzkwZDk3OS01NThiLTRiYjctOTUyYi1hZTE0MzZiNzJmYzIiLCJwZXJtaXNzaW9ucyI6WyJhbGxvd19qb2luIl0sImlhdCI6MTczMTM5MTMyMiwiZXhwIjoxNzMxOTk2MTIyfQ.2yiorhzmNDliaVtLHlyEKTWWtcQd-kZFQ3ChTFfatpg';
// authToken
export const createMeeting = async () => {
  const res = await fetch(`${APP_URL}/v2/rooms`, {
    method: 'POST',
    headers: {
      authorization: `${authToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({}),
  });
  const { roomId } = await res.json();
  return roomId;
};
