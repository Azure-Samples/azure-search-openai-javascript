import { type ReactiveController, type ReactiveControllerHost } from 'lit';
import { chatHttpOptions } from '../config/global-config.js';

export class ChatContextController implements ReactiveController {
  host: ReactiveControllerHost;

  constructor(host: ReactiveControllerHost) {
    (this.host = host).addController(this);
  }

  hostConnected() {
    // no-op
  }

  hostDisconnected() {
    // no-op
  }

  private _state: Record<string, any> = {};

  private _selectedChatEntry: ChatThreadEntry | undefined = undefined;

  private _apiUrl: string = chatHttpOptions.url;

  private _interactionModel: 'ask' | 'chat' = 'chat';

  private _isChatStarted: boolean = false;

  private _selectedCitation: Citation | undefined = undefined;

  public set selectedCitation(citation: Citation | undefined) {
    this._selectedCitation = citation;
    this.host.requestUpdate();
  }

  public get selectedCitation() {
    return this._selectedCitation;
  }

  public set isChatStarted(value: boolean) {
    this._isChatStarted = value;
    this.host.requestUpdate();
  }

  public get isChatStarted() {
    return this._isChatStarted;
  }

  public setState(key: string, value: any) {
    this._state[key] = value;
    this.host.requestUpdate();
  }

  public getState(key: string) {
    return this._state[key];
  }

  public set selectedChatEntry(entry: ChatThreadEntry | undefined) {
    this._selectedChatEntry = entry;
    this.host.requestUpdate();
  }

  public get selectedChatEntry() {
    return this._selectedChatEntry;
  }

  public set apiUrl(url: string) {
    this._apiUrl = url;
    this.host.requestUpdate();
  }

  public get apiUrl() {
    return this._apiUrl;
  }

  public set interactionModel(model: 'ask' | 'chat') {
    this._interactionModel = model;
    this.host.requestUpdate();
  }

  public get interactionModel() {
    return this._interactionModel;
  }
}
