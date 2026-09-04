import React, {useState, useMemo} from 'react';
import slugify from 'slugify';
import {use} from 'use-minimal-state';

import {navigate} from '../lib/use-location';
import Container from './Container';
import {useJam} from '../jam-core-react';
import {colors} from '../lib/theme';
import {staticConfig} from '../jam-core/config';

export default function Start({newRoom = {}, urlRoomId, roomFromURIError}) {
  const [state, {enterRoom, setProps, createRoom, updateInfo}] = useJam();

  let myIdentity = use(state, 'myIdentity');
  let [userName, setUserName] = useState(myIdentity?.info?.name ?? '');

  // note: setters are currently unused because form is hidden
  let [name, setName] = useState(newRoom.name ?? '');
  let [description, setDescription] = useState(newRoom.description ?? '');
  let [color, setColor] = useState(newRoom.color ?? '#39ff14');
  let [logoURI, setLogoURI] = useState(newRoom.logoURI ?? '');
  let [buttonText, setButtonText] = useState(newRoom.buttonText ?? '');
  let [buttonURI, setButtonURI] = useState(newRoom.buttonURI ?? '');
  // JamRad: everyone joins the "stage" (as a transmitter) by default; single
  // source of truth for the default is jam-config.json's defaultRoom.stageOnly
  let {stageOnly = staticConfig.defaultRoom?.stageOnly ?? false} = newRoom;

  let [showAdvanced, setShowAdvanced] = useState(false);

  let submit = e => {
    e.preventDefault();
    if (!userName.trim()) return;
    setProps('userInteracted', true);
    let roomId;
    if (name) {
      let slug = slugify(name, {lower: true, strict: true});
      roomId = slug + '-' + Math.random().toString(36).substr(2, 4);
    } else {
      roomId = Math.random().toString(36).substr(2, 6);
    }

    (async () => {
      let roomPosted = {name, description, logoURI, color, stageOnly};
      await updateInfo({name: userName.trim()});
      let ok = await createRoom(roomId, roomPosted);
      if (ok) {
        if (urlRoomId !== roomId) navigate('/' + roomId);
        enterRoom(roomId);
      }
    })();
  };

  let humins = useMemo(() => {
    let humins = ['DoubleMalt', 'mitschabaude', '__tosh'];
    return humins.sort(() => Math.random() - 0.5);
  }, []);

  const roomColors = colors(newRoom);
  return (
    <Container style={{height: 'initial', minHeight: '100%'}}>
      <div className="p-6 md:p-10">
        <div
          className={
            roomFromURIError
              ? 'mb-12 p-4 text-gray-700 rounded-lg border border-yellow-100 bg-yellow-50'
              : 'hidden'
          }
        >
          The Room ID{' '}
          <code className="text-gray-900 bg-yellow-200">{urlRoomId}</code> is
          not valid.
          <br />
          <a
            href="https://gitlab.com/jam-systems/jam"
            target="_blank"
            rel="noreferrer"
            className="underline text-blue-800 active:text-blue-600"
          >
            Learn more about Room IDs
          </a>
          <br />
          <br />
          You can use the button below to start a room.
        </div>

        <h1>Start a Room</h1>

        <p>Click on the button below to start a room.</p>

        <form className="pt-6" onSubmit={submit}>
          <input
            className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-96"
            type="text"
            placeholder="Your name"
            value={userName}
            name="jam-user-name"
            autoComplete="off"
            onChange={e => {
              setUserName(e.target.value);
            }}
          ></input>
          <div className="p-2 text-gray-500 italic">
            {`What's your name?`}
          </div>
          <br />
          <div className="hidden">
            <input
              className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-96"
              type="text"
              placeholder="Room topic"
              value={name}
              name="jam-room-topic"
              autoComplete="off"
              onChange={e => {
                setName(e.target.value);
              }}
            ></input>
            <div className="p-2 text-gray-500 italic">
              Pick a topic to talk about.{' '}
              <span className="text-gray-400">(optional)</span>
            </div>
            <br />
            <textarea
              className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-full"
              placeholder="Room description"
              value={description}
              name="jam-room-description"
              autoComplete="off"
              rows="2"
              onChange={e => {
                setDescription(e.target.value);
              }}
            ></textarea>
            <div className="p-2 text-gray-500 italic">
              Describe what this room is about.{' '}
              <span className="text-gray-400">
                (optional) (supports{' '}
                <a
                  className="underline"
                  href="https://guides.github.com/pdfs/markdown-cheatsheet-online.pdf"
                  target="_blank"
                  rel="noreferrer"
                >
                  Markdown
                </a>
                )
              </span>{' '}
              <span onClick={() => setShowAdvanced(!showAdvanced)}>
                {/* heroicons/gift */}
                <svg
                  style={{cursor: 'pointer'}}
                  className="pb-1 h-5 w-5 inline-block"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7"
                  />
                </svg>
              </span>
            </div>
          </div>

          {/* advanced Room options */}
          <div className={showAdvanced ? '' : 'hidden'}>
            <br />
            <input
              className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-full"
              type="text"
              placeholder="Logo URI"
              value={logoURI}
              name="jam-room-logo-uri"
              autoComplete="off"
              onChange={e => {
                setLogoURI(e.target.value);
              }}
            ></input>
            <div className="p-2 text-gray-500 italic">
              Set the URI for your logo.{' '}
              <span className="text-gray-400">(optional)</span>
            </div>

            <br />
            <input
              className="rounded w-44 h-12"
              type="color"
              value={color}
              name="jam-room-color"
              autoComplete="off"
              onChange={e => {
                setColor(e.target.value);
              }}
            ></input>
            <div className="p-2 text-gray-500 italic">
              Set primary color for your Room.{' '}
              <span className="text-gray-400">(optional)</span>
            </div>

            <br />
            <input
              className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-full"
              type="text"
              placeholder="Button URI"
              value={buttonURI}
              name="jam-room-button-uri"
              autoComplete="off"
              onChange={e => {
                setButtonURI(e.target.value);
              }}
            ></input>
            <div className="p-2 text-gray-500 italic">
              Set the link for the {`'call to action'`} button.{' '}
              <span className="text-gray-400">(optional)</span>
            </div>

            <br />
            <input
              className="rounded placeholder-gray-400 bg-gray-50 w-full md:w-96"
              type="text"
              placeholder="Button Text"
              value={buttonText}
              name="jam-room-button-text"
              autoComplete="off"
              onChange={e => {
                setButtonText(e.target.value);
              }}
            ></input>
            <div className="p-2 text-gray-500 italic">
              Set the text for the {`'call to action'`} button.{' '}
              <span className="text-gray-400">(optional)</span>
            </div>
          </div>

          <button
            onClick={submit}
            disabled={!userName.trim()}
            className="select-none h-12 px-6 text-lg text-black rounded-lg focus:shadow-outline disabled:opacity-50 disabled:cursor-not-allowed"
            style={{backgroundColor: roomColors.buttonSecondary}}
          >
            🌱 Start room
          </button>
        </form>

        <hr className="mt-14 mb-14" />

        {!window.jamConfig.hideJamInfo && (
          <div>
            <h1>Welcome to JamRad</h1>

            <div className="flex flex-row pt-4 pb-4">
              <div className="flex-1 pt-6">
                JamRad is an <span className="italic">audio&nbsp;space</span> for chatting, brainstorming, discussing, ... Its a modified version of Jam, a web-based audio chat platform. 
                
                <br />
                <a
                  href="https://github.com/tompatulpan/JamRad"
                  className="underline"
                  target="_blank"
                  rel="noreferrer"
                  style={{color: roomColors.link}}
                >
                  Learn&nbsp;more&nbsp;about&nbsp;JamRad
                </a>
                <br />
                <br />

              </div>

            </div>
          </div>
        )}

        <div className="pt-32 text-xs text-gray-400 text-center">
          <a
            href="https://gitlab.com/jam-systems/jam"
            target="_blank"
            rel="noreferrer"
          >


          </a>
        </div>
      </div>
    </Container>
  );
}
