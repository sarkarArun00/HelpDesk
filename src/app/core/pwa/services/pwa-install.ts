import {
  Injectable,
  signal,
} from '@angular/core';

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;

  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
}

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt:
    BeforeInstallPromptEvent | null = null;

  readonly isIosDevice =
    signal(this.detectIosDevice());

  readonly isInstalled =
    signal(this.detectStandaloneMode());

  readonly canInstall =
    signal(false);

  constructor() {
    window.addEventListener(
      'beforeinstallprompt',
      event => {
        event.preventDefault();

        this.deferredPrompt =
          event as BeforeInstallPromptEvent;

        this.canInstall.set(true);
      },
    );

    window.addEventListener(
      'appinstalled',
      () => {
        this.deferredPrompt = null;
        this.canInstall.set(false);
        this.isInstalled.set(true);
      },
    );

    window
      .matchMedia('(display-mode: standalone)')
      .addEventListener('change', event => {
        this.isInstalled.set(event.matches);

        if (event.matches) {
          this.canInstall.set(false);
        }
      });
  }

  private detectIosDevice(): boolean {
    const userAgent =
      navigator.userAgent.toLowerCase();

    const isAppleMobile =
      /iphone|ipad|ipod/.test(userAgent);

    /*
     * Newer iPads can report themselves
     * as Macintosh devices.
     */
    const isModernIpad =
      navigator.platform === 'MacIntel' &&
      navigator.maxTouchPoints > 1;

    return isAppleMobile || isModernIpad;
  }

  private detectStandaloneMode(): boolean {
    const navigatorWithStandalone =
      navigator as NavigatorWithStandalone;

    return (
      window.matchMedia(
        '(display-mode: standalone)',
      ).matches ||
      navigatorWithStandalone.standalone === true
    );
  }

  async installApp(): Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    await this.deferredPrompt.prompt();

    const choice =
      await this.deferredPrompt.userChoice;

    this.deferredPrompt = null;
    this.canInstall.set(false);

    if (choice.outcome === 'accepted') {
      this.isInstalled.set(true);

      return true;
    }

    return false;
  }
}