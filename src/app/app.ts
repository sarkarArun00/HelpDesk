import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallPrompt } from './core/pwa/components/install-prompt/install-prompt';
import {
  CustomAlertService,
} from './core/auth/services/custom-alert.service.js';


@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InstallPrompt],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  constructor(
    public readonly customAlert:
      CustomAlertService,
  ) { }
}