import { StateService } from '@uirouter/angular';
import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { MessagingService } from 'src/app/commons/services/messaging.service';
import { User } from 'src/app/commons/models/user.models';
import { WebSocketService } from 'src/app/commons/services/websocket/websocket.service';
import { AuthService } from 'src/app/commons/services/auth/auth.service';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements AfterViewInit {
  @ViewChild('myStream', {static: false}) myStream: ElementRef;
  @ViewChild('calleeStream', {static: false}) calleeStream: ElementRef;

  private localStream: any = null;  
  private peerConnection: any = null;
  private connection: any = null;
  private isCaller: boolean;
  private peerConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ]
  }

  public activeChat: User = new User();
  public callStatus: string = 'Pending'


  constructor(
    private ws: WebSocketService,
    private state: StateService,
    private auth: AuthService,

  ) { }

  ngAfterViewInit() {
    // check if the user is caller or callee
    if(this.state.params.isCaller) {
      const calleeID = this.state.params.calleeID;
      this.isCaller = true;

      this.connectCaller(calleeID);

    } else {
      this.isCaller = false;

      this.connectCallee();
    } 
  }


  /**
   * Connect callee to the signaling server
   */
  async connectCallee() {

    // connect to the signalling server
    this.ws.inboundConnection
    .pipe()
    .subscribe((data: any) => {
      if (data.type === 'offer-call') {
        this.handleAnswerCall(data.sdp);
      }
      if (data.type === 'new-ice-candidate') {
        this.handleNewICECandidateMsg(data);
      }
    })
  }

  /**
   * Create a call
   */
  async connectCaller(calleeID) {
    console.log(calleeID);

    this.connection = await this.ws.connectCall(calleeID, false);

    // if websocket successfully connected to the callee channel
    if (this.connection) {
      this.ws.callUser();
      this.connection
      .pipe()
      .subscribe((data: any) => {
        // if callee answered the call create an call offer
        if (data.type === 'answer-call'){
            this.handleCreateCall();
        }
        if (data.type === 'decline-call'){
          this.state.go('messaging');
        }
        if (data.type === 'answer-sdp-call'){
          this.peerConnection.setRemoteDescription(data.sdp);
        }
        if (data.type === 'new-ice-candidate') {
          this.handleNewICECandidateMsg(data);
        }
      })
    }
  }


  createPeerConnection() {
    this.peerConnection = new RTCPeerConnection(this.peerConfiguration);
    
    this.peerConnection.onicecandidate = e => this.handleICECandidateEvent(e);
    this.peerConnection.ontrack = e => this.handleTrackEvent(e);
    this.peerConnection.onnegotiationneeded = e => this.handleNegotiationNeededEvent();
  }

  /**
   * Create peer connection and get the local media 
   * when the callee answers the call.
  */
  async handleCreateCall() {
    this.createPeerConnection();

    // get local media stream
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    
    let _video = this.myStream.nativeElement;
    this.localStream = stream;

    _video.srcObject = stream;
    _video.play();
    
    // add local stream to the RTCPeerConnection
    this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream))
  }

  /** 
   * handle the answer call
  */
  async handleAnswerCall(offerSdp) {
    const offer = new RTCSessionDescription(offerSdp);

    // create peer connection
    this.createPeerConnection();

    // set offer sdp as remote sdp
    await this.peerConnection.setRemoteDescription(offer);

    // get local media stream
    const stream = await navigator.mediaDevices.getUserMedia({video: true, audio: false});
    
    let _video = this.myStream.nativeElement;
    this.localStream = stream;

    _video.srcObject = stream;
    _video.play();
    
    // add local stream to the RTCPeerConnection
    await this.localStream.getTracks().forEach(track => this.peerConnection.addTrack(track, this.localStream))

    // create answer sdp
    const answer = await this.peerConnection.createAnswer();
    await this.peerConnection.setLocalDescription(answer);

    // send answer back to the caller
    this.ws.calleeMessage({type: 'answer-sdp-call', sdp: answer});
  }

  /**
   * Create an offer sdp and send to the callee 
   * via signaling server
   */
  async handleNegotiationNeededEvent() {
    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    // send sdp to the callee
    this.ws.callerMessage({type: 'offer-call', sdp: offer});
  }

  /**
   * Get peer media (video, audio) and display to the page 
   */
  handleTrackEvent(event) {
    if (event) {
      let remoteStream = this.calleeStream.nativeElement;

      remoteStream.srcObject = event.streams[0];

      console.log(this.peerConnection);
      console.log(event);
    }
  }

  /**
   * Handle ice candidate. And send the candidate to the 
   * peer via signaling server (websocket).
   */
  handleICECandidateEvent(event) {
    if (event.candidate) {
      const newCandidate = {type: 'new-ice-candidate', candidate: event.candidate};

      if (this.isCaller) {
        this.ws.callerMessage(newCandidate);
      } else {
        this.ws.calleeMessage(newCandidate);
      }
    }
  }
  
  /**
   * Receiver of the new ice sent from peer 
   * and add to the RTCPeerConnection
   */
  handleNewICECandidateMsg(msg) {
    const candidate = new RTCIceCandidate(msg.candidate);

    this.peerConnection.addIceCandidate(candidate);
  }
}
