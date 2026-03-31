import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export type ThemeMode = 'light' | 'dark';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private currentTheme$ = new BehaviorSubject<ThemeMode>('light');
  public theme$: Observable<ThemeMode> = this.currentTheme$.asObservable();

  private readonly THEME_KEY = 'ferreteria_bl_theme';
  private readonly PREFERS_DARK_QUERY = '(prefers-color-scheme: dark)';

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initialize theme on app startup
   * Priority: localStorage > system preference > default light
   */
  private initializeTheme(): void {
    const savedTheme = this.getSavedTheme();
    
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      // Check system preference
      const prefersDark = window.matchMedia(this.PREFERS_DARK_QUERY).matches;
      const systemTheme: ThemeMode = prefersDark ? 'dark' : 'light';
      this.setTheme(systemTheme);
    }

    // Listen for system theme changes
    window.matchMedia(this.PREFERS_DARK_QUERY).addEventListener('change', (e) => {
      if (!this.getSavedTheme()) {
        // Only apply system change if user hasn't manually selected a theme
        this.setTheme(e.matches ? 'dark' : 'light');
      }
    });
  }

  /**
   * Get saved theme from localStorage
   */
  private getSavedTheme(): ThemeMode | null {
    const saved = localStorage.getItem(this.THEME_KEY);
    return saved === 'light' || saved === 'dark' ? saved : null;
  }

  /**
   * Set theme and apply to DOM
   */
  public setTheme(theme: ThemeMode): void {
    this.currentTheme$.next(theme);
    localStorage.setItem(this.THEME_KEY, theme);
    
    // Apply to HTML element
    const htmlElement = document.documentElement;
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
    } else {
      htmlElement.removeAttribute('data-theme');
    }

    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute(
        'content',
        theme === 'dark' ? '#161B27' : '#F8FAFC'
      );
    }
  }

  /**
   * Toggle between light and dark mode
   */
  public toggleTheme(): void {
    const currentTheme = this.currentTheme$.value;
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /**
   * Get current theme
   */
  public getCurrentTheme(): ThemeMode {
    return this.currentTheme$.value;
  }

  /**
   * Reset to system preference
   */
  public resetToSystemPreference(): void {
    localStorage.removeItem(this.THEME_KEY);
    const prefersDark = window.matchMedia(this.PREFERS_DARK_QUERY).matches;
    this.setTheme(prefersDark ? 'dark' : 'light');
  }
}
