import {
    Injectable,
    signal,
} from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class CustomAlertService {
    readonly isVisible = signal(false);
    readonly title = signal('');
    readonly message = signal('');

    private confirmAction:
        (() => void) | null = null;

    show(
        title: string,
        message: string,
        onConfirm?: () => void,
    ): void {
        this.title.set(title);
        this.message.set(message);
        this.confirmAction =
            onConfirm ?? null;

        this.isVisible.set(true);
    }

    confirm(): void {
        const action = this.confirmAction;

        this.close();
        action?.();
    }

    close(): void {
        this.isVisible.set(false);
        this.confirmAction = null;
    }
}