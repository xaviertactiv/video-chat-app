import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { API_AUTH_LOGIN, API_AUTH, API_USERS } from '../../constants/api.constants';
import { AUTH_KEY } from '../../constants/conf.constants';
import { User, Users } from '../../models/user.models';
import { BehaviorSubject } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public user: User = new User();
  private users$: BehaviorSubject<Users> = new BehaviorSubject(new Users());

  constructor(
    private http: HttpClient
  ) {}

  get users() {
    return this.users$.asObservable();
  }

  async login(data: any) {
    try {
      const resp = await this.http.post(API_AUTH_LOGIN, data)
        .toPromise();
      this.setToken(resp);
      return resp;
    } catch (errors) {
      return Promise.reject(errors);
    }
  }

  fetchUsers() {
    return this.http.get(API_USERS)
    .toPromise()
    .then((resp: Users) => {
      this.users$.next(resp);
    });
  }

  /* MANAGE USER TOKEN
   * @desc : manage user token generated from the backend
   *         to be used on authenticated requests
   */
  setToken(token: any) {
    // save the generated token to the local storage
    (window as any).localStorage[AUTH_KEY] = JSON.stringify(token);
    return;
  }

  getToken() {
    // fetch the generated token from the storage
    const d = (window as any).localStorage[AUTH_KEY];
    if (!d) {
      return null;
    }
    return JSON.parse(d);
  }

  rmToken() {
    // clear the token from the local storage.
    (window as any).localStorage.removeItem(AUTH_KEY);
  }

  authenticated() {
    return this.getToken() ? true : false;
  }

  async setUser() {
    const resp = await this.http.get(API_AUTH)
      .toPromise();
    this.user = new User(resp);
  }

  async getUser() {
    if (this.user.id === null) {
      await this.setUser();
    }

    return this.user;
  }
}
