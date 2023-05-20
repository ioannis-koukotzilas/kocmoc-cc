import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})

export class WordPressService {

  constructor(private http: HttpClient) { }

  fetchPosts() {
    return this.http.get<any[]>('http://localhost/kocmoc/wp-json/wp/v2/posts');
  }

  fetchPost(id: string) {
    return this.http.get('http://localhost/kocmoc/wp-json/wp/v2/posts/' + id);
  }

}