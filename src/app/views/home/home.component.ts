import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subject, catchError, of, switchMap, takeUntil, tap } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { HomePage } from 'src/app/models/homePage';
import Swiper from 'swiper';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  homePage: HomePage | null = null;

  loading: boolean = true;

  private swiper: any;

  constructor(private route: ActivatedRoute, private wpService: WPService) { }

  ngOnInit(): void {
    this.swiper = new Swiper('.swiper');

    this.getHomePage();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getHomePage() {
    const id = 121;
    this.loading = true;
    
    this.wpService.getHomePage(id).pipe(
      catchError(error => {
        console.error('Error getting home page:', error);
        return of(null);
      }),
      tap(page => {
        if (page) this.homePage = new HomePage(page);
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Main observable error:', error);
      },
      complete: () => {
        console.log('Unsubscription completed.');
      }
    });
  }
  

}


// default pages

// getPage() {
//   this.route.paramMap.pipe(
//     switchMap(params => {
//       const id = Number(params.get('id') || '0');
//       this.loading = true;
//       return this.wpService.getPage(id).pipe(
//         catchError(error => {
//           console.error('Error getting home page:', error);
//           return of(null);
//         })
//       );
//     }),
//     tap(page => {
//       if (page) this.homePage = new HomePage(page);
//     }),
//     takeUntil(this.unsubscribe$),
//   ).subscribe({
//     next: () => {
//       this.loading = false;
//     },
//     error: (error) => {
//       console.error('Main observable error:', error);
//     },
//     complete: () => {
//       console.log('Unsubscription completed.');
//     }
//   });
// }