import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private collapsedSubject = new BehaviorSubject<boolean>(false);
  public collapsed$: Observable<boolean> = this.collapsedSubject.asObservable();

  constructor() {}

  toggleCollapsed(): void {
    this.collapsedSubject.next(!this.collapsedSubject.value);
  }

  isCollapsed(): boolean {
    return this.collapsedSubject.value;
  }
}
