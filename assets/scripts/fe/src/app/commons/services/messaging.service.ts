import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { User } from '../models/user.models';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class MessagingService {
  private activeChat$: BehaviorSubject<User> = new BehaviorSubject(new User());

  constructor(
    private http: HttpClient
  ) {}

  get activeChat() {
    return this.activeChat$.asObservable();
  }

  updateActiveChat(user: User) {
    this.activeChat$.next(user);
  }
}
