import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import 'chat-component';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatCheckboxModule, FormsModule, MatButtonModule],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppSettingsComponent {
  events: string[] = [];
  opened: boolean = false;
  panelLabel: string = 'App Settings';
}
