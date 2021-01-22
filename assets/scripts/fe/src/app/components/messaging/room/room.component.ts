import { Component, OnInit, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { AuthService } from 'src/app/commons/services/auth/auth.service';
import { StateService } from '@uirouter/angular';
import { RoomWebSocketService } from 'src/app/commons/services/websocket/room.service';

import { v4 as uuidv4 } from 'uuid';
import { User } from 'src/app/commons/models/user.models';

import {
  faMicrophone,
  faMicrophoneSlash,
  faVideo,
  faVideoSlash,
  faPhoneSlash
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-room',
  templateUrl: './room.component.html',
  styleUrls: ['./room.component.scss']
})
export class RoomComponent implements OnInit {
  @ViewChild('streamsContainer', {static: false}) streamsContainer: ElementRef;
  @ViewChild('peerStream', {static: false}) peerStream: ElementRef;

  public roomID: string = null;
  public userUID: string = null;
  public controls = {video: true, audio: true};
  public isJoined = false;
  public roomURL = null;

  private me: User = new User();
  private localStream: MediaStream = new MediaStream();
  private mediaList: MediaStream[] = Array<MediaStream>();
  private mediaListUID = [];
  private peerConnections = [];
  private mediaSetting = {video: true, audio: true};
  private peerConfiguration = {
    iceServers: [
      {
        urls: [
          'stun:stun1.l.google.com:19302',
          'stun:stun2.l.google.com:19302',
        ],
      },
    ]
  };

  // icons
  faMicrophone = faMicrophone;
  faMicrophoneSlash = faMicrophoneSlash;
  faVideo = faVideo;
  faVideoSlash = faVideoSlash;
  faPhoneSlash = faPhoneSlash;

  constructor(
    private state: StateService,
    private roomService: RoomWebSocketService,
    private auth: AuthService,
    private renderer: Renderer2
  ) { }

  ngOnInit() {
    this.roomID = this.state.params.id;
    this.userUID = uuidv4();
    this.roomURL = window.location.href;
    // this.me = await this.auth.getUser();
  }

  joinRoom() {
    this.connectToChannel();
    this.isJoined = true;
  }

  /**
   * Connect the user to the websocket
   */
  async connectToChannel() {
    const channel = await this.roomService.connectToRoom(this.roomID);
    this.requestOffer();

    // receiver of the data from the other user
    channel.pipe()
    .subscribe((msg: any) => {
      if (msg.type === 'request-offer') {
        if (!this.isMe(msg.user.uid)) {
          this.createOffer(msg.user.uid);
        }
      }
      if (this.userUID === msg.peerUID) {
        if (msg.type === 'video-offer') {
          this.handleAnswerCall(msg);
        }
        if (msg.type === 'answer-sdp-call') {
          const peerConnection = this.getPeerConnection(msg.user.uid);
          peerConnection.setRemoteDescription(msg.sdp);
        }
        if (msg.type === 'new-ice-candidate') {
          this.handleNewICECandidateMsg(msg);
        }
      }
      if (msg.type === 'controls-update') {
        this.updatePeerStream(msg);
      }
      if (msg.type === 'hang-up') {
        this.closeVideoCall(msg.user.uid);
      }
    });
  }

  isMe(id) {
    return this.userUID === id;
  }

  getPeerConnection(peerUID) {
    return this.peerConnections.find(item => item.peerUID === peerUID).peerConnection;
  }

  /**
   * Create an offer and send to the peer who requested an offer.
   */
  async createOffer(peerUID) {
    await this.createPeerConnection(peerUID);
    const peerConnection = this.getPeerConnection(peerUID);

    // get local media stream
    this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaSetting);
    this.createNewStreamElement(this.localStream, this.userUID);

    // add local stream to the RTCPeerConnection
    this.localStream.getTracks().forEach(track => {
      peerConnection.addTrack(track, this.localStream);
    });
  }


  /**
   * Create video element for the new stream
   */
  async createNewStreamElement(stream, uid) {
    if (!this.mediaListUID.includes(uid)) {
      const elContainer = await this.renderer.createElement('div');
      elContainer.id = `div-${uid}`;
      elContainer.classList.add('stream-video');

      const videoEl = await this.renderer.createElement('video');
      videoEl.id = uid;
      videoEl.srcObject = stream;
      videoEl.muted = this.isMe(uid);
      videoEl.play();

      this.renderer.appendChild(elContainer, videoEl);
      this.renderer.appendChild(this.streamsContainer.nativeElement, elContainer);

      this.mediaListUID.push(uid);
    }
  }

  createPeerConnection(peerUID) {
    const peerConnection = new RTCPeerConnection(this.peerConfiguration);

    peerConnection.onicecandidate = e => this.handleICECandidateEvent(e, peerUID);
    peerConnection.ontrack = e => this.handleTrackEvent(e, peerUID);
    peerConnection.onnegotiationneeded = e => this.handleNegotiationNeededEvent(peerUID);
    peerConnection.oniceconnectionstatechange = e => this.handleICEConnectionStateChangeEvent(e, peerUID);

    // add peer connection to the list
    this.peerConnections.push({peerUID, peerConnection});
  }

  async handleNegotiationNeededEvent(peerUID) {
    const peerConnection = this.getPeerConnection(peerUID);
    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);

    // send offer to the user
    this.roomService.sendMessage({
      type: 'video-offer',
      user: {
        // id: this.me.id,
        uid: this.userUID
      },
      peerUID,
      sdp: offer
    });
  }

  /**
   * Get peer media (video, audio) and display to the page
   */
  handleTrackEvent(event, peerUID) {
    if (event) {
      this.createNewStreamElement(event.streams[0], peerUID);
    }
  }

  /**
   * Handle ice candidate. And send the candidate to the
   * peer via signaling server (websocket).
   */
  handleICECandidateEvent(event, peerUID) {
    if (event.candidate) {
      // send ICE back to peer
      this.roomService.sendMessage({
        type: 'new-ice-candidate',
        user: {
          // id: this.me.id,
          uid: this.userUID
        },
        peerUID,
        ice: event.candidate
      });
    }
  }

  /**
   * handle the answer call
   */
  async handleAnswerCall(msg) {
    const offer = new RTCSessionDescription(msg.sdp);
    const peerUID = msg.user.uid;

    // create peer connection
    this.createPeerConnection(peerUID);
    const peerConnection = this.getPeerConnection(peerUID);

    // set offer sdp as remote sdp
    await peerConnection.setRemoteDescription(offer);

    // get local media stream
    this.localStream = await navigator.mediaDevices.getUserMedia(this.mediaSetting);
    this.createNewStreamElement(this.localStream, this.userUID);
    // add local stream to the RTCPeerConnection
    this.localStream.getTracks().forEach(track =>
      peerConnection.addTrack(track, this.localStream)
    );

    // // create answer sdp
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);

    // send answer back to the caller
    this.roomService.sendMessage({
      type: 'answer-sdp-call',
      user: {
        // id: this.me.id,
        uid: this.userUID
      },
      peerUID,
      sdp: answer
    });
  }

  /**
   * Request an offer to the users already in the room
   */
  requestOffer() {
    this.roomService.sendMessage({
      type: 'request-offer',
      user: {
        // id: this.me.id,
        uid: this.userUID
      }
    });
  }

  /**
   * Receiver of the new ice sent from peer
   * and add to the RTCPeerConnection
   */
  handleNewICECandidateMsg(msg) {
    const peerConnection = this.getPeerConnection(msg.user.uid);
    const candidate = new RTCIceCandidate(msg.ice);

    peerConnection.addIceCandidate(candidate);
  }

  handleICEConnectionStateChangeEvent(event, peerUID) {
    const peerConnection = this.getPeerConnection(peerUID);

    switch (peerConnection.iceConnectionState) {
      case 'disconnected':
        this.closeVideoCall(peerUID);
        break;
    }
  }


  /**
   * Enable/disable a video or audio
   * type: audio or video
   */
  controlToggle(type) {
    this.controls[type] = !this.controls[type];

    this.roomService.sendMessage({
      type: 'controls-update',
      user: {
        uid: this.userUID
      },
      controls: this.controls
    });
  }

  hangUp() {
    this.roomService.sendMessage({
      type: 'hang-up',
      user: {
        uid: this.userUID
      },
      controls: this.controls
    });

    // redirect page
    this.state.go('messaging');
  }

  updatePeerStream(msg) {
    const peerUID = msg.user.uid;
    const controls = msg.controls;
    const videoEl = document.getElementById(peerUID);

    if (videoEl) {
      videoEl.style.display = controls.video ? 'block' : 'none';

      if (!this.isMe(peerUID)) {
        // tslint:disable-next-line: no-string-literal
        videoEl['muted'] = !controls.audio;
      }
    }
  }

  closeVideoCall(peerUID) {
    const el = document.getElementById(`div-${peerUID}`);
    const peerConnection = this.getPeerConnection(peerUID);

    if (peerConnection) {
      peerConnection.onicecandidate = null;
      peerConnection.ontrack = null;
      peerConnection.onnegotiationneeded = null;

      // remove element
      el.remove();
    }
  }
}
