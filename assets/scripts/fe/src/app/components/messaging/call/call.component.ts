import { Component, OnInit, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-call',
  templateUrl: './call.component.html',
  styleUrls: ['./call.component.scss']
})
export class CallComponent implements AfterViewInit {
  @ViewChild('myStream', {static: false}) myStream: ElementRef;
  private localStream: any = null;

  constructor() { }

  ngAfterViewInit() {
    this.setMyStream({video: true, audio: false});
  }

  setMyStream(constraints){
    let _video = this.myStream.nativeElement;
    navigator.mediaDevices.getUserMedia(constraints)
    .then(stream => {
      this.localStream = stream;
      console.log(this.localStream);
      _video.srcObject = stream;
      _video.play();
    })
    .catch(error => {
      console.log('denied');
    });
  }

}
