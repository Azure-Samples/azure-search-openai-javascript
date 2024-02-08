import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import 'chat-component';
import { RetrievalMode, Approaches, type Settings, type AskRequestOverrides } from '../types/index.js';
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
  // Data attribute bindings
  inputPosition: string = 'sticky';
  dataOverrides: AskRequestOverrides = {
    retrievalMode: this.settingsDefaults.retrievalMode,
    top: this.settingsDefaults.top,
    useSemanticRanker: this.settingsDefaults.semanticRanker,
    useSemanticCaptions: this.settingsDefaults.semanticCaptions,
    excludeCategory: '',
    promptTemplate: '',
    promptTemplatePrefix: '',
    promptTemplateSuffix: '',
    suggestFollowupQuestions: this.settingsDefaults.followUpQuestions,
  };
  customStylesObj = {
    AccentHigh: '#692b61',
    AccentLight: '#f6d5f2',
    AccentDark: '#5e3c7d',
    TextColor: '#123f58',
    BackgroundColor: '#e3e3e3',
    ForegroundColor: '#4e5288',
    FormBackgroundColor: '#f5f5f5',
    BorderRadius: '10px',
    BorderWidth: '3px',
    FontBaseSize: '14px',
  };
  apiUrl = 'https://search.blackhill-f5c34daf.eastus2.azurecontainerapps.io';
  customStyles = JSON.stringify(this.customStylesObj, undefined, 2);
  overrides = JSON.stringify(this.dataOverrides, undefined, 2);
  approach: string = Approaches.ReadRetrieveRead;
  interactionModel: string = 'chat';
  streaming: boolean = true;
  title: string = 'Ask anything or try an example';
}
