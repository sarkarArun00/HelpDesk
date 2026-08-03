import {
  Component,
  inject,
  signal,
} from '@angular/core';

import {
  PwaInstallService,
} from '../../services/pwa-install';

@Component({
  selector: 'app-install-prompt',
  imports: [],
  templateUrl: './install-prompt.html',
  styleUrl: './install-prompt.scss',
})
export class InstallPrompt {
  protected readonly pwaInstallService =
    inject(PwaInstallService);

  protected readonly isDismissed =
    signal(false);

  protected readonly isInstalling =
    signal(false);

  protected readonly showIosInstructions =
    signal(false);

  protected async openInstallOption():
    Promise<void> {
    if (
      this.pwaInstallService
        .isInstalled()
    ) {
      return;
    }

    if (
      this.pwaInstallService
        .isIosDevice()
    ) {
      this.showIosInstructions.set(true);
      return;
    }

    await this.installAndroidApp();
  }

  private async installAndroidApp():
    Promise<void> {
    this.isInstalling.set(true);

    try {
      const installed =
        await this.pwaInstallService
          .installApp();

      if (installed) {
        this.isDismissed.set(true);
      }
    } finally {
      this.isInstalling.set(false);
    }
  }

  protected closeIosInstructions():
    void {
    this.showIosInstructions.set(false);
  }

  protected dismissPrompt(): void {
    this.isDismissed.set(true);
  }
}