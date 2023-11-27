import { Component, CUSTOM_ELEMENTS_SCHEMA, type OnInit } from '@angular/core';
import { CommonModule, AsyncPipe } from '@angular/common';
import type { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
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
    ReactiveFormsModule,
    AsyncPipe,
  ],
  templateUrl: './app-settings.component.html',
  styleUrl: './app-settings.component.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class AppSettingsComponent implements OnInit {
  events: string[] = [];
  opened: boolean = false;
  retrievalModes: string[] = [RetrievalMode.Hybrid, RetrievalMode.Vectors, RetrievalMode.Text];
  approaches: string[] = [Approaches.RetrieveThenRead, Approaches.ReadRetrieveRead, Approaches.ReadDecomposeAsk];
  selectedModes: Observable<string[]> | undefined;
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
    retrievalMode: this.retrievalModes[0],
    approach: this.approaches[0],
  };
  retrievalModeControl = new FormControl('');
  approachControl = new FormControl('');
  darkModeControl = new FormControl('');
  ngOnInit(): void {
    this.selectedModes = this.retrievalModeControl.valueChanges.pipe(
      startWith(''),
      map((value) => this._filter(value)),
    );
  }

  private _filter(value: string | null): string[] {
    const filterValue = (value ?? '').toLowerCase();
    return this.retrievalModes.filter((mode) => mode.toLowerCase().includes(filterValue));
  }
}
