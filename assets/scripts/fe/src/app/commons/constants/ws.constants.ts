import { urlsafe } from '../utils/http.utils';

/**
 *
 * @param id user id
 */
export const WS_API = (id: any) => {
  const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';

  return {
    callEndpoint: urlsafe(`${protocol}://${window.location.host}/ws/call/`, id),
    roomEndpoint: urlsafe(`${protocol}://${window.location.host}/ws/room/`, id)
  };
};
