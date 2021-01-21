import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base/base.component';

import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { UIRouterModule } from '@uirouter/angular';
import { ListComponent } from './list/list.component';
import { ContentComponent } from './content/content.component';
import { CallComponent } from './call/call.component';
import { AnswerModalComponent } from './call/answer-modal/answer-modal.component';
import { RoomComponent } from './room/room.component';


@NgModule({
  declarations: [
    BaseComponent,
    ListComponent,
    ContentComponent,
    CallComponent,
    AnswerModalComponent,
    RoomComponent
  ],
  imports: [
    CommonModule,
    UIRouterModule,
    NgbModule,
    FontAwesomeModule
  ]
})
export class MessagingModule { }
