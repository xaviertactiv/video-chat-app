import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from './base/base.component';

import { UIRouterModule } from '@uirouter/angular';
import { ListComponent } from './list/list.component';
import { ContentComponent } from './content/content.component';
import { CallComponent } from './call/call.component';


@NgModule({
  declarations: [
    BaseComponent, 
    ListComponent, 
    ContentComponent, 
    CallComponent
  ],
  imports: [
    CommonModule,
    UIRouterModule
  ]
})
export class MessagingModule { }
