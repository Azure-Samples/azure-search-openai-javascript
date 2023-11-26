import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [CommonModule, MatSidenavModule, MatCheckboxModule, FormsModule, MatButtonModule],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.css',
})
export class AppSettingsComponent {
  events: string[] = [];
  opened: boolean = false;
}
