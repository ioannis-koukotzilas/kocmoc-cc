import { Directive, ElementRef, Renderer2 } from '@angular/core';

@Directive({
  selector: 'img[appLazyLoad], source[appLazyLoad]'
})
export class LazyLoadDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) { }

  ngAfterViewInit() {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(({ isIntersecting }) => {
        if (isIntersecting) {
          const isImg = this.el.nativeElement.tagName === 'IMG';
          const dataAttr = isImg ? 'data-src' : 'data-srcset';
          const attr = isImg ? 'src' : 'srcset';
          const value = this.el.nativeElement.getAttribute(dataAttr);
          this.renderer.setAttribute(this.el.nativeElement, attr, value);
          obs.unobserve(this.el.nativeElement);
        }
      });
    });
    obs.observe(this.el.nativeElement);
  }
}