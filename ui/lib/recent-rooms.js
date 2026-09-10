import {getStorage, setStorage} from './local-storage';

const STORAGE_KEY = 'jam-recent-rooms';
const MAX_ROOMS = 8;

export function getRecentRooms() {
  return getStorage(localStorage, STORAGE_KEY) ?? [];
}

export function addRecentRoom(roomId, {name, color} = {}) {
  if (!roomId) return;
  let rooms = getRecentRooms().filter(r => r.roomId !== roomId);
  rooms.unshift({roomId, name: name ?? '', color: color ?? '', lastVisited: Date.now()});
  setStorage(localStorage, STORAGE_KEY, rooms.slice(0, MAX_ROOMS));
}

export function removeRecentRoom(roomId) {
  setStorage(
    localStorage,
    STORAGE_KEY,
    getRecentRooms().filter(r => r.roomId !== roomId)
  );
}
