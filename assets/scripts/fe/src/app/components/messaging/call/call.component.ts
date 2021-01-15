import { StateService } from '@uirouter/angular';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MessagingService } from 'src/app/commons/services/messaging.service';
import { User } from 'src/app/commons/models/user.models';
import { WebSocketService } from 'src/app/commons/services/websocket/websocket.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements AfterViewInit {
  @ViewChild('myStream', {static: false}) myStream: ElementRef;
  private localStream: any = null;  
  private peerConnection: any = null;

  public activeChat: User = new User();
  public callStatus: string = 'Pending'


  constructor(
    private messagingService: MessagingService,
    private ws: WebSocketService,
    private state: StateService
  ) { }

  ngAfterViewInit() {
    this.setMyStream({video: true, audio: false});

    // get the callee user data
    this.messagingService.activeChat.subscribe(resp => {
      this.activeChat = new User(resp);
    })

    this.connectOutbound();
  }

  connectOutbound() {
    // connect to the outbound call websocket
    this.ws.outboundConnection
    .pipe()
    .subscribe((data: any) => {
      // get response of the callee
      if (data.type === 'decline-call') {
        this.state.go('messaging');
        this.ws.disconnectOutbound();
      }

    })
  }

  setMyStream(constraints){
    let _video = this.myStream.nativeElement;
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      this.localStream = stream;

      _video.srcObject = stream;
      _video.play();
    })
    .catch(error => {
      console.log('denied');
    });
  }

}
