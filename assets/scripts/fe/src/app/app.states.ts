import { PUBLIC_STATES } from './components/public/public.states';
import { MESSAGING_STATES } from './components/messaging/messaging.states';

export const APP_STATES = {
  otherwise : '/login',
  states    : [].concat(
    PUBLIC_STATES,
    MESSAGING_STATES
  )
};
