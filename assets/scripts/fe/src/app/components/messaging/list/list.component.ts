import { Component, OnInit } from '@angular/core';
import { AuthService } from 'src/app/commons/services/auth/auth.service';
import { Users, User } from 'src/app/commons/models/user.models';
import { MessagingService } from 'src/app/commons/services/messaging.service';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  public users: Users = new Users();

  constructor(
    private authService: AuthService,
    private messagingService: MessagingService
  ) { }

  async ngOnInit() {
    this.authService.fetchUsers();

    this.authService.users.subscribe((resp: Users) => {
      this.users = resp;
      if (this.users.count) {
        this.activeChat(this.users.results[0]);
      }
    })
  }

  activeChat(user: User) {
    this.messagingService.updateActiveChat(user);
  }

  formatName(user: User) {
    const userObj = new User(user);
    return userObj.displayName();
  }
}
