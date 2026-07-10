import createCache from '@emotion/cache';
import rtlPlugin from 'stylis-plugin-rtl';
// @ts-ignore
import { prefixer } from 'stylis';

// Ce fichier fabrique le "moteur de style" de MUI.
// Selon la direction choisie, il ajoute (ou non) le plugin qui inverse le CSS.

export const createEmotionCacheLtr = () =>
  createCache({ key: 'mui-ltr' });

export const createEmotionCacheRtl = () =>
  createCache({
    key: 'mui-rtl',
    stylisPlugins: [prefixer, rtlPlugin],
  });