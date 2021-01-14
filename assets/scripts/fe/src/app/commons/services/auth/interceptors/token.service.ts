import * as _ from 'lodash';

import { Injectable } from '@angular/core';
import {
  HttpEvent,
  HttpHandler,
  HttpRequest,
  HttpResponse
} from '@angular/common/http';

import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

import { AuthService } from '../auth.service';


@Injectable({
  providedIn: 'root'
})
export class TokenService {

  constructor(
    private auth: AuthService
  ) { }

  intercept(r: HttpRequest<any>, n: HttpHandler): Observable <HttpEvent <any>> {
    const req = r.clone({
      headers: r.headers.set('Authorization', this.token())
    });

    return n.handle(req).pipe(tap(
      resp => {
        if (resp instanceof HttpResponse) { return resp; }
      }
    ));
  }

  // Get user token from the local storage
  // and format if to be placed into the request header.
  token() {
    const t = _.get(this.auth.getToken(), ['token'], null);
    return `Token ${t}`;
  }
}
