import { urlsafe } from '../utils/http.utils';

/**
 *
 * @param id user id
 */
export const WS_API = (id: any) => {
  return {
    callEndpoint: urlsafe(`ws://${window.location.host}/ws/call/`, id)
  };
};