import { HistoryMessage } from '../message';

export interface ChatQueryResponse {
  data_points: string[];
  answer: string;
  thoughts: string;
}

export interface ChatApproach {
  run(history: HistoryMessage[], overrides: Record<string, any>): Promise<ChatQueryResponse>;
}

// TODO: improve typing
export interface AskApproach {
  run(q: string, overrides: Record<string, any>): Promise<any>;
}
