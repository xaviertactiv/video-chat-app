import { ContentOnly } from 'src/app/commons/utils/layout.utils';
import { Disconnect } from 'src/app/commons/utils/security.utils';

// components
import { BaseComponent } from './base/base.component';
import { CallComponent } from './call/call.component';
import { RoomComponent } from './room/room.component';


export const MESSAGING_STATES: object[] = [
  {
    name: 'messaging',
    url: '/m',
    views: ContentOnly(BaseComponent),
  },
  {
    name: 'call',
    url: '/call',
    views: ContentOnly(CallComponent),
    params: {
      isCaller: true,
      calleeID: null
    }
  },
  {
    name: 'video-room',
    url: '/room/:id',
    views: ContentOnly(RoomComponent),
  },
];
