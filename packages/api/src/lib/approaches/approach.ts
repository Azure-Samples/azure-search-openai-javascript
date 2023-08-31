// TODO: improve typings

export interface ChatApproach {
  run(history: any[], overrides: Record<string, any>): Promise<any>;
}

export interface AskApproach {
  run(q: string, overrides: Record<string, any>): Promise<any>;
}
