import color from 'color';

export {colors};

// SDR/CRT console theme: black background, matrix-green accents
const defaultColors = {
  background: '#0a0f0a',
  header: '#39ff14',
  text: '#39ff14',
  link: '#7CFC93',
  buttonPrimary: '#39ff14',
  buttonSecondary: '#123312',
};

const colors = room => {
  const currentColors = {
    ...defaultColors,
    ...room.theme?.colors,
    buttonPrimary: room.color || defaultColors.buttonPrimary,
  };

  return {
    ...currentColors,
    textLight: color(currentColors.text).lighten(0.1).hex(),
    textSuperLight: color(currentColors.text).lighten(0.2).hex(),
  };
};
