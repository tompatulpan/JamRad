import color from 'color';

export {colors};

// SDR/CRT console theme: black background, matrix-green accents
const defaultColors = {
  background: '#0a0f0a',
  header: '#39ff14',
  text: '#39ff14',
  link: '#7CFC93',
  buttonPrimary: '#39ff14',
  buttonSecondary: '#1f6b1f',
};

const colors = room => {
  const primary = room.color || defaultColors.buttonPrimary;
  const derivedFromRoomColor = room.color
    ? {
        buttonPrimary: primary,
        buttonSecondary: color(primary).darken(0.5).hex(),
        header: primary,
        text: primary,
        link: color(primary).lighten(0.3).hex(),
      }
    : {};

  const currentColors = {
    ...defaultColors,
    ...derivedFromRoomColor,
    ...room.theme?.colors,
  };

  return {
    ...currentColors,
    textLight: color(currentColors.text).lighten(0.1).hex(),
    textSuperLight: color(currentColors.text).lighten(0.2).hex(),
  };
};
