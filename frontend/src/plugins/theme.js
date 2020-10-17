import colors from 'vuetify/lib/util/colors';

export default {
  options: {
    customProperties: true
  },
  themes: {
    light: {
      primary: '#44A963',
      secondary: '#e33a0b',
      error: '#e33a0b',
      loadingOverlay: colors.grey.lighten1,
      background: colors.shades.white,
      menuBackground: '#44A963',
      pathBackground: colors.grey.lighten2
    },
    dark: {
      primary: '#44A963',
      secondary: '#e33a0b',
      error: '#e33a0b',
      loadingOverlay: colors.grey.darken1,
      background: colors.grey.darken3,
      menuBackground: colors.grey.darken4,
      pathBackground: colors.grey.darken1
    },
  },
}