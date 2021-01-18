import { StateService, toJson } from '@uirouter/angular';
import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
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
  @ViewChild('calleeStream', {static: false}) calleeStream: ElementRef;

  private isCaller: boolean;
  private connection = null;
  private dataChannel: any = null;
  private localCandidate: any = null;
  private localStream: any = null;  
  private peerConnection: any = null;
  private configuration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ],
  };

  public activeChat: User = new User();
  public callStatus: string = 'Pending'


  constructor(
    private messagingService: MessagingService,
    private ws: WebSocketService,
    private state: StateService
  ) { }

  ngAfterViewInit() {
    // get the callee user data
    this.messagingService.activeChat.subscribe(resp => {
      this.activeChat = new User(resp);
    })

    if (this.state.params.isAnswer) {
      this.isCaller = false;
      this.answerCall(this.state.params.data);
    } else {
      this.isCaller = true;
      this.createCall();
    }
  }

  async answerCall(offer) {
    this.connectInbound();
    await this.createPeerConnection();
    // set sdp from caller as remote description
    await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));

    this.setMyStream({video: true, audio: false});

    // create answer spd 
    const answer = await this.peerConnection.createAnswer();
    // debugger;
    await this.peerConnection.setLocalDescription(answer);

    this.ws.respondCall(true, this.peerConnection.localDescription);
    setTimeout(() => {
      this.sendICE();
    }, 1000);
  }

  async createCall(){ 
    this.connection = await this.ws.connectCall(this.activeChat.id, false);

    if (this.connection) {
      // create peer connection 
      await this.createPeerConnection();
      this.setMyStream({video: true, audio:false});

      // create offer
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);

      await this.ws.callUser(this.peerConnection.localDescription);
      this.connectOutbound();
      this.peerConnection.ontrack();
    }
  }

  async createPeerConnection() {
    const localStream = await navigator.mediaDevices.getUserMedia({video: true, audio: true})
    this.peerConnection = new RTCPeerConnection();

    localStream.getTracks().forEach(track => {
      this.peerConnection.addTrack(track, localStream);
    });

    //create data channel
    this.dataChannel = this.peerConnection.createDataChannel("channel");
    this.dataChannel.onopen = e => { console.log('Abre') };
    this.dataChannel.onmessage = e => { console.log(e.data); };
    this.peerConnection.ontrack = e => this.ontrack(e);
    this.peerConnection.onicecandidate = e => this.onIceCandidate(e);
  }

  onIceCandidate(event) {
    if (event.candidate) {
      this.localCandidate = event.candidate;
    }
  }
  
  ontrack(event) {
    if (event && !this.calleeStream.nativeElement.srcObject) {
      this.calleeStream.nativeElement.srcObject = event.streams[0];
      this.calleeStream.nativeElement.play();
      console.log(this.calleeStream);
    } 
  }

  handleNewICECandidateMsg(data) {
    const candidate = new RTCIceCandidate(data);
    this.peerConnection.addIceCandidate(candidate);
  }

  /**
   * receiver for the caller. Data sent by the callee
   */
  connectOutbound() {
    // connect to the outbound call websocket
    this.ws.outboundConnection
    .pipe()
    .subscribe((data: any) => {
      // get response of the callee
      if (data.type === 'answer-call'){
        // send ICE to callee
        this.sendICE();

        this.peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
        // debugger;
      }
      if (data.type === 'decline-call') {
        this.state.go('messaging');
        this.ws.disconnectOutbound();
      }
      if(data.type === 'callee-candidate') {
        this.handleNewICECandidateMsg(data.candidate);
      }

    })
  }

  sendICE(){
    if (this.localCandidate) {
        this.ws.sendIceCandidate(this.localCandidate, this.isCaller);
    }
  }

  /**
   * receiver for the callee. Data sent by caller
   */
  connectInbound() {
    this.ws.inboundConnection
    .pipe()
    .subscribe((data: any) => {
      if (data.type === 'caller-candidate') {
        this.handleNewICECandidateMsg(data.candidate);
      }
    })
  }

  setMyStream(constraints){
    let _video = this.myStream.nativeElement;
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      this.localStream = stream;

      _video.srcObject = stream;

      this.localStream.getTracks().forEach(track => {
        this.peerConnection.addTrack(track, this.localStream);
      });
    })
    .catch(error => {
      console.log('denied');
    });
  }

}
