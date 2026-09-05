import React, {useEffect, useState} from 'react';
import {avatarUrl, displayName} from '../lib/avatar';
import animateEmoji from '../lib/animate-emoji';
import {useMqParser} from '../lib/tailwind-mqp';
import {colors} from '../lib/theme';
import {MicOffSvg} from './Svg';

const reactionEmojis = ['❤️', '💯', '😂', '😅', '😳', '🤔'];

export function StageAvatar({
  room,
  speaking,
  canSpeak,
  moderators,
  peerId,
  peerState,
  reactions,
  info,
  onClick,
}) {
  let mqp = useMqParser();
  let {micMuted, inRoom = null} = peerState || {};
  let reactions_ = reactions[peerId];
  info = info || {id: peerId};
  let isSpeaking = speaking.has(peerId);
  let isModerator = moderators.includes(peerId);
  const roomColors = colors(room);
  return (
    inRoom && (
      <li
        key={peerId}
        title={displayName(info, room)}
        className="relative items-center space-y-1 mt-4 ml-2 mr-2"
        style={onClick ? {cursor: 'pointer'} : undefined}
      >
        <div
          className={mqp('jam-badge relative w-20 h-20 md:w-28 md:h-28')}
          style={{
            boxShadow: isSpeaking
              ? `0 0 8px ${roomColors.buttonPrimary}`
              : 'none',
            backgroundColor: roomColors.background,
          }}
        >
          <img
            className="w-full h-full object-cover"
            alt={displayName(info, room)}
            src={avatarUrl(info, room)}
            onClick={onClick}
          />
          <Reactions
            reactions={reactions_}
            className={mqp(
              'absolute inset-0 flex items-center justify-center text-5xl md:text-7xl text-center'
            )}
            style={{backgroundColor: roomColors.buttonPrimary}}
          />
          {/* name badge, overlaid on the bottom of the avatar */}
          <div
            className={mqp(
              'absolute bottom-0 left-0 right-0 px-1 truncate text-xs md:text-sm text-center'
            )}
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              color: roomColors.header,
            }}
          >
            <span
              className={
                isModerator
                  ? 'flex-none inline-block leading-3 w-3 h-3 rounded-full -ml-3'
                  : 'hidden'
              }
              style={{
                backgroundColor: roomColors.text,
                color: roomColors.background,
              }}
            >
              <svg
                className="inline-block w-2 h-2"
                style={{margin: '-3px 0 0 0'}}
                x="0px"
                y="0px"
                viewBox="0 0 1000 1000"
                enableBackground="new 0 0 1000 1000"
                fill="currentColor"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M894.5,633.4L663.3,500l231.1-133.4c39.1-22.6,52.4-72.5,29.9-111.6c-22.6-39.1-72.5-52.4-111.6-29.9L581.7,358.5V91.7c0-45.1-36.6-81.7-81.7-81.7c-45.1,0-81.7,36.6-81.7,81.7v266.9L187.2,225.1c-39.1-22.6-89-9.2-111.6,29.9c-22.6,39.1-9.2,89,29.9,111.6L336.7,500L105.5,633.4C66.5,656,53.1,705.9,75.6,745c22.6,39.1,72.5,52.4,111.6,29.9l231.1-133.4v266.9c0,45.1,36.6,81.7,81.7,81.7c45.1,0,81.7-36.6,81.7-81.7V641.5l231.1,133.4c39.1,22.6,89,9.2,111.6-29.9C946.9,705.9,933.5,656,894.5,633.4z" />
              </svg>
            </span>{' '}
            {displayName(info, room).substring(0, 12)}
          </div>
        </div>
        {/* div for showing mute/unmute status */}
        {(!!micMuted || !canSpeak) && (
          <div
            className={mqp(
              'absolute w-10 h-10 right-0 top-0 rounded-full bg-white border-2 text-2xl border-gray-400 flex items-center justify-center'
            )}
            style={{backgroundColor: roomColors.textLight}}
          >
            <MicOffSvg
              className="w-5 h-5"
              fill={!canSpeak ? 'red' : undefined}
              stroke={roomColors.text}
            />
          </div>
        )}
        <TwitterHandle
          info={info}
          divClass={mqp('text-center w-20 md:w-28')}
          fontClass="text-sm"
        />
      </li>
    )
  );
}

export function AudienceAvatar({
  room,
  peerId,
  peerState,
  reactions,
  info,
  handRaised,
  onClick,
}) {
  let mqp = useMqParser();
  let {inRoom = null} = peerState || {};
  let reactions_ = reactions[peerId];
  info = info || {id: peerId};
  const roomColors = colors(room);
  return (
    inRoom && (
      <li
        title={displayName(info, room)}
        className={mqp('flex-none m-2 w-16 md:w-24 text-xs')}
        style={onClick ? {cursor: 'pointer'} : undefined}
      >
        <div
          className={mqp('jam-badge relative w-16 h-16 md:w-24 md:h-24')}
          style={{
            backgroundColor: roomColors.background,
          }}
        >
          <img
            className="w-full h-full object-cover"
            alt={displayName(info, room)}
            src={avatarUrl(info, room)}
            onClick={onClick}
          />
          <Reactions
            reactions={reactions_}
            className={mqp(
              'absolute inset-0 flex items-center justify-center text-4xl md:text-6xl text-center'
            )}
            style={{backgroundColor: roomColors.buttonPrimary}}
          />
          {/* name badge, overlaid on the bottom of the avatar */}
          <div
            className="absolute bottom-0 left-0 right-0 px-1 truncate text-center"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.55)',
              color: roomColors.header,
            }}
          >
            {displayName(info, room)}
          </div>
          <div className={handRaised ? '' : 'hidden'}>
            <div
              className={mqp(
                'absolute w-9 h-9 top-0 left-0 md:top-0 md:left-0 rounded-full bg-white text-lg border-2 border-gray-400 flex items-center justify-center'
              )}
            >
              ✋🏽
            </div>
          </div>
        </div>
        <TwitterHandle
          info={info}
          divClass="text-center mt-1"
          fontClass="text-xs"
        />
      </li>
    )
  );
}

function TwitterHandle({info, divClass, fontClass}) {
  let twitterIdentity = info?.identities?.find(i => i.type === 'twitter');
  return (
    (twitterIdentity?.id || null) && (
      <div className={divClass}>
        <span className={fontClass}>
          {/* <span className="text-gray-800">@</span> */}
          <a
            className={
              twitterIdentity.verificationInfo
                ? 'text-blue-600 font-medium ml-1'
                : 'text-gray-500 font-medium ml-1'
            }
            style={{textDecoration: 'none', fontWeight: 'normal'}}
            href={'https://twitter.com/' + twitterIdentity?.id.replace('@', '')}
            target="_blank"
            rel="noreferrer"
          >
            @{twitterIdentity?.id.replace('@', '')}
          </a>
        </span>
      </div>
    )
  );
}

function Reactions({reactions, className}) {
  if (!reactions) return null;
  return (
    <>
      {reactions.map(
        ([r, id]) =>
          reactionEmojis.includes(r) && (
            <AnimatedEmoji
              key={id}
              emoji={r}
              className={className}
              style={{
                alignSelf: 'center',
              }}
            />
          )
      )}
    </>
  );
}

function AnimatedEmoji({emoji, ...props}) {
  let [element, setElement] = useState(null);
  useEffect(() => {
    if (element) animateEmoji(element);
  }, [element]);
  return (
    <div ref={setElement} {...props}>
      {emoji}
    </div>
  );
}
