import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import 'chat-component';
import { RetrievalMode, Approaches, type Settings } from '../types/index.js';
@Component({
  selector: 'app-app-settings',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatCheckboxModule,
    FormsModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatInputModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppSettingsComponent {
  events: string[] = [];
  opened: boolean = false;
  settingsDefaults: Settings = {
    panelLabel: 'App Settings',
    panelTitle: 'Configure answer generation',
    darkMode: false,
    overridePromptTemplate: undefined,
    excludeCategory: undefined,
    semanticRanker: false,
    semanticCaptions: false,
    followUpQuestions: true,
    top: 3,
    temperature: 0.5,
    streaming: true,
    retrievalMode: RetrievalMode.Hybrid,
    approach: Approaches.RetrieveThenRead,
  };
  retrievalModeControl = new FormControl('');
  retrievalMode?: RetrievalMode;
  approachControl = new FormControl('');
  darkModeControl = new FormControl('');
}
