import { StateService } from '@uirouter/angular';
import { User } from 'src/app/commons/models/user.models';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { WebSocketService } from 'src/app/commons/services/websocket/websocket.service';
import { AuthService } from 'src/app/commons/services/auth/auth.service';

@Component({
  selector: 'app-answer-modal',
  templateUrl: './answer-modal.component.html',
  styleUrls: ['./answer-modal.component.scss']
})
export class AnswerModalComponent implements OnInit {
  @ViewChild('content', {static: false}) content: ElementRef;
  public connection = null;
  public caller: User = new User()


  private modal = null;

  constructor(
    private modalService: NgbModal,
    private ws: WebSocketService,
    private auth: AuthService,
    private state: StateService
  ) { }

  async ngOnInit() {
    
    await this.auth.setUser();

    this.connection = await this.ws.connectCall(this.auth.user.id);

    if (this.connection) {
      this.connection
      .pipe()
      .subscribe((data: any) => {
        if (data.type === 'request-call') {
          this.caller = new User(data.user);
          this.open();
        }
      })
    }
  }

  respondCall(isAnswer) {
    this.ws.respondCall(isAnswer);
    
    if (isAnswer) {
      this.state.go('call', {isCaller: false})
    }

    this.modal.close()
  }

  open() {
    this.modal = this.modalService.open(this.content);
  }

}
