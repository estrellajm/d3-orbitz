import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Planet } from '../interfaces/planets.interface';

@Injectable({
  providedIn: 'root',
})
export class KnowledgeGraphService {
  http = inject(HttpClient);

  getPlanets(): Observable<Planet[]> {
    return this.http.get<Planet[]>('assets/lineOfBusinesses.json');
  }
}
