import * as _ from 'lodash';
import { Injectable } from '@angular/core';

import { webSocket, WebSocketSubject } from 'rxjs/webSocket';
import { AuthService } from '../auth/auth.service';

// export const WS_ENV_ENDPOINT
import { WS_API } from '../../constants/ws.constants';

@Injectable({
  providedIn: 'root'
})
export class RoomWebSocketService {

  private room$: WebSocketSubject<any>;

  constructor(
    private auth: AuthService
  ) { }

  /**
   * connect to room django channel
   */
  async connectToRoom(id) {
    if (!this.room$) {
      this.room$ = await this.getNewWebSocket(id);
      return this.room$;
    }
  }

  get roomConnection() {
    return this.room$;
  }


  private getNewWebSocket(id) {
    return webSocket(WS_API(id).roomEndpoint);
  }

  sendMessage(data) {
    this.room$.next(data);
  }

  // callUser() {
  //   this.outboundCall$.next({
  //     type: 'request-call',
  //     user: this.auth.user
  //   });
  // }

  // callerMessage(data) {
  //   this.outboundCall$.next(data);
  // }

  // calleeMessage(data) {
  //   this.inboundCall$.next(data);
  // }

  // disconnectOutbound() {
  //   this.outboundCall$.complete();

  //   this.outboundCall$ = null;
  // }

  // respondCall(isAnswer) {
  //   this.inboundCall$.next({
  //     type: isAnswer ? 'answer-call': 'decline-call',
  //     user: this.auth.user
  //   });
  // }
}
