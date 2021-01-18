import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/commons/models/user.models';
import { MessagingService } from 'src/app/commons/services/messaging.service';
import { StateService } from '@uirouter/angular';
import { WebSocketService } from 'src/app/commons/services/websocket/websocket.service';

@Component({
  selector: 'app-content',
  templateUrl: './content.component.html',
  styleUrls: ['./content.component.scss']
})
export class ContentComponent implements OnInit {
  public activeChat: User = new User();

  constructor(
    private state: StateService,
    private messagingService: MessagingService
  ) { }

  ngOnInit() {
    this.messagingService.activeChat.subscribe(resp => {
      this.activeChat = new User(resp);
    })
  }

  get displayName() {
    return this.activeChat.displayName();
  }

  async makeCall() {
    // this.ws.connectCall(this.activeChat.id, false);
    this.state.go('call', {isAnswer: false});
  }
}
