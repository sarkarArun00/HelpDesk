import {
  Injectable,
  signal,
} from '@angular/core';

interface BeforeInstallPromptEvent
  extends Event {
  prompt(): Promise<void>;

  userChoice: Promise<{
    outcome:
      | 'accepted'
      | 'dismissed';

    platform: string;
  }>;
}

@Injectable({
  providedIn: 'root',
})
export class PwaInstallService {
  private deferredPrompt:
    BeforeInstallPromptEvent | null =
      null;

  readonly canInstall =
    signal(false);

  readonly isInstalled =
    signal(
      window.matchMedia(
        '(display-mode: standalone)',
      ).matches,
    );

  constructor() {
    window.addEventListener(
      'beforeinstallprompt',
      event => {
        event.preventDefault();

        this.deferredPrompt =
          event as
            BeforeInstallPromptEvent;

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
  }

  async installApp():
    Promise<boolean> {
    if (!this.deferredPrompt) {
      return false;
    }

    await this.deferredPrompt.prompt();

    const choice =
      await this.deferredPrompt
        .userChoice;

    this.deferredPrompt = null;
    this.canInstall.set(false);

    if (
      choice.outcome === 'accepted'
    ) {
      this.isInstalled.set(true);

      return true;
    }

    return false;
  }
}