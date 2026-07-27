import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { InstallPrompt } from './core/pwa/components/install-prompt/install-prompt';



@Component({
  selector: 'app-root',
  imports: [RouterOutlet, InstallPrompt],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {}