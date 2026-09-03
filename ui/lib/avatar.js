import {decode} from './identity-utils';

const defaultAvatar = info => identicon(info.id);

const roomAvatar = (info, room) => {
  if (room.userDisplay?.identities) {
    return room.userDisplay.identities[info.id].avatar || defaultAvatar(info);
  } else if (room.userDisplay?.avatars) {
    return room.userDisplay.avatars[info.id] || defaultAvatar(info);
  } else if (room.userDisplay?.randomIdentities) {
    return selectFromList(info.id, room.userDisplay?.randomIdentities).avatar;
  } else if (room.userDisplay?.randomAvatars) {
    return selectFromList(info.id, room.userDisplay.randomAvatars);
  } else {
    return defaultAvatar(info);
  }
};

const roomDisplayName = (info, room) => {
  if (room.userDisplay?.identities) {
    return (
      room.userDisplay.identities[info.id].name ||
      selectFromList(info.id, names)
    );
  } else if (room.userDisplay?.names) {
    return room.userDisplay.names[info.id] || selectFromList(info.id, names);
  } else if (room.userDisplay?.randomIdentities) {
    return selectFromList(info.id, room.userDisplay?.randomIdentities).name;
  } else if (room.userDisplay?.randomNames) {
    return selectFromList(info.id, room.userDisplay?.randomNames);
  } else {
    return selectFromList(info.id, names);
  }
};

export const avatarUrl = (info, room) => {
  if (info.avatar && !room.access?.lockedIdentities) {
    return info.avatar;
  } else {
    return roomAvatar(info, room);
  }
};

export const displayName = (info, room) => {
  const infoName = info.name || info.displayName;
  if (infoName && !room.access?.lockedIdentities) {
    return infoName;
  } else {
    return roomDisplayName(info, room);
  }
};

const selectFromList = (id, list) => {
  return list[publicKeyToIndex(id, list.length)];
};

const names = [
  'Ali',
  'Alex',
  'Ash',
  'Blue',
  'Chi',
  'Drew',
  'Eight',
  'Fin',
  'Floor',
  'Five',
  'Four',
  'Jam',
  'Jaz',
  'Misha',
  'Mu',
  'Nine',
  'One',
  'Pat',
  'Sam',
  'Sasha',
  'Seven',
  'Six',
  'Sky',
  'Sol',
  'Storm',
  'Sun',
  'Tao',
  'Ten',
  'Three',
  'Tsu',
  'Two',
  'Yu',
  'Zero',
];

const integerFromBytes = rawBytes =>
  rawBytes[0] + (rawBytes[1] << 8) + (rawBytes[2] << 16) + (rawBytes[3] << 24);

function publicKeyToIndex(publicKey, range) {
  const bytes = decode(publicKey);
  return Math.abs(integerFromBytes(bytes)) % range;
}

// GitHub-style deterministic pixel avatar, generated from the peer's public
// key so the same id always renders the same identicon, without any of the
// (fixed, non-random) eyes/mouth of the old static placeholder image.
const GRID_SIZE = 5;
const CELL_PX = 20;
const PADDING_PX = 20;

function identicon(publicKey) {
  const bytes = decode(publicKey);
  const hue = bytes[0] % 360;
  const color = `hsl(${hue}, 55%, 55%)`;

  // Build a symmetric 5x5 grid: only the left half (+ middle column) is
  // derived from the hash, the right half mirrors it, just like GitHub's
  // identicons.
  const half = Math.ceil(GRID_SIZE / 2);
  const grid = [];
  for (let col = 0; col < half; col++) {
    const byte = bytes[(col + 1) % bytes.length];
    for (let row = 0; row < GRID_SIZE; row++) {
      const filled = ((byte >> row) & 1) === 1;
      grid[col] = grid[col] || [];
      grid[col][row] = filled;
      grid[GRID_SIZE - 1 - col] = grid[GRID_SIZE - 1 - col] || [];
      grid[GRID_SIZE - 1 - col][row] = filled;
    }
  }

  const gridSizePx = GRID_SIZE * CELL_PX;
  const size = gridSizePx + PADDING_PX * 2;
  let rects = '';
  for (let col = 0; col < GRID_SIZE; col++) {
    for (let row = 0; row < GRID_SIZE; row++) {
      if (grid[col][row]) {
        rects += `<rect x="${PADDING_PX + col * CELL_PX}" y="${
          PADDING_PX + row * CELL_PX
        }" width="${CELL_PX}" height="${CELL_PX}" fill="${color}"/>`;
      }
    }
  }

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${rects}</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
