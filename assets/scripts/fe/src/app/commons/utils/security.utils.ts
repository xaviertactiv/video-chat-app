import { AuthService } from '../services/auth/auth.service';

/* LOGIN REQUIRED
 * @desc : callback function that will check and will not pass
 *         users that are not logged in.
 */
export function LoginRequired(t) {
  const auth = t.injector().get(AuthService);
  const state = t.router.stateService;

  if (!auth.authenticated()) { return state.target('login'); }
}

/* DISCONNECT
 * @desc : callback function that will log user out.
 *         (removes/clear the user token)
 */
export function Disconnect(t) {
  const auth = t.injector().get(AuthService);
  const state = t.router.stateService;

  if (auth.authenticated()) { auth.rmToken(); }
  return state.target('login');
}
