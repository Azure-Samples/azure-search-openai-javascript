import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, MatSidenavModule],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.css',
})
export class AppSettingsComponent {}
