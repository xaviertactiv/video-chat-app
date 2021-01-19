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
    console.log(id);
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

  callUser() {
    this.outboundCall$.next({
      type: 'request-call',
      user: this.auth.user
    });
  }

  callerMessage(data) {
    this.outboundCall$.next(data);
  }

  calleeMessage(data) {
    this.inboundCall$.next(data);
  }

  disconnectOutbound() {
    this.outboundCall$.complete();

    this.outboundCall$ = null;
  }

  respondCall(isAnswer) {
    this.inboundCall$.next({
      type: isAnswer ? 'answer-call': 'decline-call',
      user: this.auth.user
    });
  }
}
