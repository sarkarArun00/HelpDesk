import {
  Injectable,
} from '@angular/core';

import {
  FirebaseApp,
  getApp,
  getApps,
  initializeApp,
} from 'firebase/app';

import {
  MessagePayload,
  Messaging,
  Unsubscribe,
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from 'firebase/messaging';

import {
  environment,
} from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class FirebaseMessagingService {
  private firebaseApp:
    FirebaseApp | null = null;

  private messaging:
    Messaging | null = null;

  async initialize(): Promise<boolean> {
    const messagingSupported =
      await isSupported();

    if (!messagingSupported) {
      console.warn(
        'Firebase Messaging is not supported in this browser.',
      );

      return false;
    }

    this.firebaseApp =
      getApps().length
        ? getApp()
        : initializeApp(
          environment.firebase,
        );

    this.messaging =
      getMessaging(
        this.firebaseApp,
      );

    return true;
  }

  async requestPermissionAndGetToken(
    serviceWorkerRegistration:
      ServiceWorkerRegistration,
  ): Promise<string | null> {
    const initialized =
      await this.initialize();

    if (
      !initialized ||
      !this.messaging ||
      !('Notification' in window)
    ) {
      return null;
    }

    const permission =
      await Notification
        .requestPermission();

    if (permission !== 'granted') {
      console.warn(
        'Notification permission was not granted.',
      );

      return null;
    }

    const token =
      await getToken(
        this.messaging,
        {
          vapidKey:
            environment.firebaseVapidKey,

          serviceWorkerRegistration,
        },
      );

    return token || null;
  }

  async listenForForegroundMessages(
    callback: (
      payload: MessagePayload,
    ) => void,
  ): Promise<Unsubscribe | null> {
    const initialized =
      await this.initialize();

    if (
      !initialized ||
      !this.messaging
    ) {
      return null;
    }

    return onMessage(
      this.messaging,
      callback,
    );
  }
}