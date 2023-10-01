import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorInterceptor implements HttpInterceptor {

  constructor(private router: Router) {}

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {

        console.log('Error handled by interceptor:', error);

        switch (error.status) {
          case 404:
            this.router.navigateByUrl('/episodes');
            break;
          case 402:
            break;
          case 406:
            break;
          default:
            break;
        }
        return throwError(() => error);
      })
    );
  }
}
