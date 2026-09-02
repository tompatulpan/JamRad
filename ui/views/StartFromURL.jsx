import React, {useState} from 'react';
import {use} from 'use-minimal-state';
import {useMqParser} from '../lib/tailwind-mqp';
import Container from './Container';
import {useJam} from '../jam-core-react';

const iOS =
  /^iP/.test(navigator.platform) ||
  (/^Mac/.test(navigator.platform) && navigator.maxTouchPoints > 4);

const macOS = /^Mac/.test(navigator.platform) && navigator.maxTouchPoints === 0;

export default function StartFromURL({roomId, newRoom}) {
  const [state, {setProps, createRoom, autoJoinOnce, updateInfo}] = useJam();
  let mqp = useMqParser();

  let myIdentity = use(state, 'myIdentity');
  let [userName, setUserName] = useState(myIdentity?.info?.name ?? '');

  let submit = async e => {
    e.preventDefault();
    if (!userName.trim()) return;
    setProps('userInteracted', true);
    await updateInfo({name: userName.trim()});
    autoJoinOnce(); // => enter room as soon as create room succeeded
    // (^ causes room to be entered in the same microtask where also room info updates;
    // if we await createRoom the microtask queue is already emptied)
    createRoom(roomId, newRoom);
  };

  return (
    <Container>
      <div className={mqp('p-2 pt-60 md:p-10 md:pt-60')}>
        <h1>Start a Room</h1>
        <p className="mb-6">
          The room with ID{' '}
          <code className="text-gray-900 bg-yellow-100">{roomId}</code> does not
          exist yet.
        </p>

        <input
          className="mb-5 rounded placeholder-gray-400 bg-gray-50 w-full md:w-96"
          type="text"
          placeholder="Your name"
          value={userName}
          name="jam-user-name"
          autoComplete="off"
          onChange={e => {
            setUserName(e.target.value);
          }}
        ></input>
        <div className="mb-5 p-2 text-gray-500 italic">
          {`What's your name?`}
        </div>

        <button
          onClick={submit}
          disabled={!userName.trim()}
          className="select-none h-12 px-6 text-lg text-black bg-gray-200 rounded-lg focus:shadow-outline active:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          🌱 Start room
        </button>

        <div className={iOS ? 'mt-40 text-gray-500 text-center' : 'hidden'}>
          🎧 Use headphones or earbuds
          <br />
          for the best audio experience on iOS
        </div>

        <div className={macOS ? 'mt-40 text-gray-500 text-center' : 'hidden'}>
          🎧 Use Chrome or Firefox instead of Safari
          <br />
          for the best audio experience on macOS
        </div>
      </div>
    </Container>
  );
}
