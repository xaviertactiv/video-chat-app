import { PUBLIC_STATES } from './components/public/public.states';

export const APP_STATES = {
  otherwise : '/login',
  states    : [].concat(
    PUBLIC_STATES
  )
};
