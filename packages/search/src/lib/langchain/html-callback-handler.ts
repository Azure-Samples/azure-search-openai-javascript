import { BaseTracer, type Run } from 'langchain/callbacks';
import { type AgentRun } from 'langchain/dist/callbacks/handlers/tracer';

type Style = { open: string; close: string };

const STYLES = {
  Bold: { open: '<b>', close: '</b>' },
  Blue: { open: '<span style="color:blue">', close: '</span>' },
  Green: { open: '<span style="color:green">', close: '</span>' },
  Red: { open: '<span style="color:red">', close: '</span>' },
};

export class HtmlCallbackHandler extends BaseTracer {
  name = 'html_callback_handler' as const;

  private html = '';

  protected persistRun(_run: Run) {
    return Promise.resolve();
  }

  getAndResetLog(): string {
    const result = this.html;
    this.html = '';
    return result;
  }

  onLLMStart(run: Run): void {
    this.html += `LLM prompts:<br>${run.inputs.prompts.map((p: string) => toHtml(p)).join('<br>')}<br><br>`;
  }

  onLLMEnd(_run: Run): void {
    // Do nothing
  }

  onLLMError(run: Run): void {
    this.html += `${wrap(STYLES.Red, `LLM error: ${toHtml(tryJsonStringify(run.error, '[error]'))}`)}<br><br>`;
  }

  onChainStart(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    this.html += `[chain/start] [${crumbs}] Entering chain<br><br>`;
  }

  onChainEnd(_run: Run): void {
    this.html += '[chain/end] Finished chain<br>';
  }

  onChainError(run: Run): void {
    this.html += `${wrap(
      STYLES.Red,
      `[chain/error] Chain error: ${toHtml(tryJsonStringify(run.error, '[error]'))}`,
    )}<br><br>`;
  }

  onToolStart(_run: Run): void {
    // Do nothing
  }

  onToolEnd(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    this.html += `${wrap(STYLES.Green, `[tool/run] [${crumbs}]`)}<br>${toHtml(run.outputs?.output?.trim())}<br><br>`;
  }

  onToolError(run: Run): void {
    this.html += `${wrap(
      STYLES.Red,
      `[tool/error] Tool error: ${toHtml(tryJsonStringify(run.error, '[error]'))}`,
    )}<br><br>`;
  }

  onText(run: Run): void {
    const text = run.events[run.events.length - 1].kwargs?.text;
    this.html += `${toHtml(text)}<br>`;
  }

  onAgentAction(run: Run): any {
    const agentRun = run as AgentRun;
    const action = agentRun.actions[agentRun.actions.length - 1];
    const crumbs = this.getBreadcrumbs(run);
    this.html += `[agent/action] [${crumbs}] Agent selected action:<br>${action.log}<br><br>`;
  }

  onAgentFinish(run: Run): void {
    const agentRun = run as AgentRun;
    const action = agentRun.actions[agentRun.actions.length - 1];
    this.html += `${toHtml(action.log)}<br><br>`;
  }

  private getParents(run: Run) {
    const parents: Run[] = [];
    let currentRun = run;
    while (currentRun.parent_run_id) {
      const parent = this.runMap.get(currentRun.parent_run_id);
      if (parent) {
        parents.push(parent);
        currentRun = parent;
      } else {
        break;
      }
    }
    return parents;
  }

  private getBreadcrumbs(run: Run) {
    const parents = this.getParents(run).reverse();
    return [...parents, run]
      .map((parent, index, array) => {
        const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
        return index === array.length - 1 ? wrap(STYLES.Bold, name) : name;
      })
      .join(' > ');
  }
}

function wrap(style: Style, text: string) {
  return `${style.open}${text}${style.close}`;
}

function tryJsonStringify(object: unknown, fallback: string) {
  try {
    return JSON.stringify(object, undefined, 2);
  } catch {
    return fallback;
  }
}

function toHtml(text: string | unknown): string {
  const s = typeof text === 'string' ? text : String(text);
  return s.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll(/\r?\n/g, '<br>');
}
