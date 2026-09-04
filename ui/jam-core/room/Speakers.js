import {is} from 'minimal-state';
import {useEvent, useAction} from '../../lib/state-tree';
import {useStableArray} from '../../lib/state-diff';
import {StoredState} from '../../lib/local-storage';
import {useDidChange} from '../../lib/state-utils';
import {getCache} from '../../lib/GetRequest';
import {actions} from '../state';
import {put, apiUrl} from '../backend';

export {addSpeaker, removeSpeaker};

export default function Speakers() {
  const leftStageRooms = StoredState('jam.leftStageRooms', () => ({}));
  const leftStageMap = new Map(); // roomId => Set(peerId)
  // JamRad: peers we (as moderator) already requested auto-add-to-speakers
  // for, so we don't spam the API on every render. roomId => Set(peerId)
  const moderatorAutoAddedMap = new Map();

  return function Speakers({
    roomId,
    hasRoom,
    room,
    peerState,
    myPeerState,
    myIdentity,
  }) {
    let leftStagePeers =
      leftStageMap.get(roomId) ??
      leftStageMap.set(roomId, new Set()).get(roomId);
    let moderatorAutoAdded =
      moderatorAutoAddedMap.get(roomId) ??
      moderatorAutoAddedMap.set(roomId, new Set()).get(roomId);

    let {speakers, stageOnly, moderators = []} = room;
    let myId = myIdentity.publicKey;
    let iAmModerator = moderators.includes(myId);

    // did I leave stage? (from localStorage / gets overridden when we are put back on stage while in the room)
    let [isLeaveStage] = useAction(actions.LEAVE_STAGE);
    let justGotRoom = useDidChange(hasRoom) && hasRoom;
    let iAmServerSpeaker = speakers.includes(myId);
    let iBecameSpeaker =
      useDidChange(iAmServerSpeaker) && iAmServerSpeaker && !justGotRoom;
    if (iBecameSpeaker) {
      is(leftStageRooms, roomId, undefined);
      leftStagePeers.delete(myId);
    }
    if (isLeaveStage) {
      is(leftStageRooms, roomId, true);
      leftStagePeers.add(myId);
    }
    let leftStage = !!leftStageRooms[roomId];
    is(myPeerState, {leftStage}); // announce to peers

    // JamRad: stageOnly rooms default new joiners to speaker. Only the
    // moderator has permission to PUT room updates (see pantry auth
    // roomAuthenticator.canPut), so a joiner's own attempt to add themselves
    // to speakers[] would be rejected (403) -- instead, the moderator
    // auto-promotes every other connected peer (detected via peerState,
    // which is announced over the signaling channel regardless of WebRTC/
    // speaker status) to speaker, unless that peer already left the stage.
    if (iAmModerator && stageOnly && hasRoom) {
      for (let otherId of Object.keys(peerState)) {
        if (otherId === myId) continue;
        if (speakers.includes(otherId)) continue;
        if (leftStagePeers.has(otherId)) continue;
        if (moderatorAutoAdded.has(otherId)) continue;
        moderatorAutoAdded.add(otherId);
        addSpeaker({myIdentity}, roomId, otherId);
      }
    }

    // who else did leave stage? (announced by others via p2p state)
    let [isLeftStage, peerId, state] = useEvent(
      peerState,
      (peerId, state) => state?.leftStage === !leftStagePeers.has(peerId)
    );
    if (isLeftStage) {
      if (state.leftStage) {
        leftStagePeers.add(peerId);
        // if I'm moderator and someone else left stage, I remove him from speakers
        if (iAmModerator && room.speakers.includes(peerId)) {
          removeSpeaker({myIdentity}, roomId, peerId);
        }
      } else {
        leftStagePeers.delete(peerId);
      }
    }
    speakers = useStableArray(speakers.filter(s => !leftStagePeers.has(s)));
    return speakers;
  };
}

function getCachedRoom(roomId) {
  if (!roomId) return null;
  return getCache(`${apiUrl()}/rooms/${roomId}`).data;
}

async function addSpeaker(state, roomId, peerId) {
  let room = getCachedRoom(roomId);
  if (room === null) return false;
  let {speakers = []} = room;
  if (speakers.includes(peerId)) return true;
  let newRoom = {...room, speakers: [...speakers, peerId]};
  return await put(state, `/rooms/${roomId}`, newRoom);
}

async function removeSpeaker(state, roomId, peerId) {
  let room = getCachedRoom(roomId);
  if (room === null) return false;
  let {speakers = []} = room;
  if (!speakers.includes(peerId)) return true;
  let newRoom = {...room, speakers: speakers.filter(id => id !== peerId)};
  return await put(state, `/rooms/${roomId}`, newRoom);
}
