import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from '../auth/auth.service';

// export const WS_ENV_ENDPOINT
import { WS_API } from '../../constants/ws.constants';

@Injectable({
  providedIn: 'root'
})
export class WebSocketService {

  private outboundCall$: WebSocketSubject<any>;
  private inboundCall$: WebSocketSubject<any>;

  constructor(
    private auth: AuthService
  ) { }

  /**
   * connect to call
   */
  async connectCall(id, isMe: boolean = true) {
    if (isMe) {
        if (!this.inboundCall$ || this.inboundCall$.closed) {
          this.inboundCall$ = await this.getNewWebSocket(id);
          return this.inboundCall$;
        }
    } else {
        if (!this.outboundCall$ || this.outboundCall$.closed) {
          this.outboundCall$ = await this.getNewWebSocket(id);
          return this.outboundCall$;
        }
    }

  }

  get outboundConnection() {
    return this.outboundCall$;
  }

  get inboundConnection() {
    return this.inboundCall$;
  }

  private getNewWebSocket(id) {
    return webSocket(WS_API(id).callEndpoint);
  }

  callUser(sdp) {
    this.outboundCall$.next({
      type: 'request-call',
      user: this.auth.user,
      sdp
    });
  }

  sendIceCandidate(candidate, isCaller: boolean) {
    const type = isCaller ? 'caller': 'callee';
    const data = {
      type: `${type}-candidate`,
      user: this.auth.user,
      candidate
    }

    if (isCaller) {
      console.log('hey');
      this.outboundCall$.next(data);
    } else {
      console.log('in')
      this.inboundCall$.next(data);
    }
  }

  disconnectOutbound() {
    this.outboundCall$.complete();

    this.outboundCall$ = null;
  }

  respondCall(isAnswer, sdp) {
    this.inboundCall$.next({
      type: isAnswer ? 'answer-call': 'decline-call',
      user: this.auth.user,
      sdp
    });
  }
}
