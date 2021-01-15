import { Component, OnInit } from '@angular/core';
import { WebSocketService } from 'src/app/commons/services/websocket/websocket.service';
import { AuthService } from 'src/app/commons/services/auth/auth.service';

@Component({
  selector: 'app-base',
  templateUrl: './base.component.html',
  styleUrls: ['./base.component.scss']
})
export class BaseComponent implements OnInit {

  constructor(
  ) { }

  ngOnInit() {
  }

}
