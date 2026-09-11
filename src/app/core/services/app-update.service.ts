import {
    ApplicationRef,
    Injectable,
    inject,
    signal,
} from '@angular/core';
import {
    SwUpdate,
    VersionReadyEvent,
} from '@angular/service-worker';
import {
    concat,
    filter,
    first,
    interval,
} from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class AppUpdateService {
    private readonly swUpdate =
        inject(SwUpdate);

    private readonly applicationRef =
        inject(ApplicationRef);

    readonly isUpdateAvailable =
        signal(true);

    constructor() {
        if (!this.swUpdate.isEnabled) {
            return;
        }

        this.listenForAvailableUpdate();
        this.startUpdateChecking();
    }

    private listenForAvailableUpdate():
        void {
        this.swUpdate.versionUpdates
            .pipe(
                filter(
                    (
                        event,
                    ): event is VersionReadyEvent =>
                        event.type ===
                        'VERSION_READY',
                ),
            )
            .subscribe(() => {
                this.isUpdateAvailable.set(true);
            });
    }

    private startUpdateChecking(): void {
        const applicationIsStable =
            this.applicationRef.isStable.pipe(
                first(isStable => isStable),
            );

        const checkEveryFiveMinutes =
            interval(5 * 60 * 1000);

        concat(
            applicationIsStable,
            checkEveryFiveMinutes,
        ).subscribe(() => {
            void this.checkForUpdate();
        });
    }

    private async checkForUpdate():
        Promise<void> {
        try {
            await this.swUpdate
                .checkForUpdate();
        } catch (error) {
            console.error(
                'Unable to check for application update:',
                error,
            );
        }
    }

    updateApplication(): void {
        document.location.reload();
    }
}