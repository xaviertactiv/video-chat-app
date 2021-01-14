import { ContentOnly } from 'src/app/commons/utils/layout.utils';
import { Disconnect } from 'src/app/commons/utils/security.utils';
import { LoginComponent } from './login/login.component';


export const PUBLIC_STATES: object[] = [
  {
    name: 'login',
    url: '/login',
    views: ContentOnly(LoginComponent),
    params: {next: window.location.pathname}
  },
  {
    name: 'logout',
    url: '/logout',
    onEnter: Disconnect
  }
];
