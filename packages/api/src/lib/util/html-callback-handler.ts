import { BaseTracer, Run } from 'langchain/callbacks';
import { AgentRun } from 'langchain/dist/callbacks/handlers/tracer';

type Style = { open: string; close: string };

const STYLES = {
  Bold: { open: '<b>', close: '</b>' },
  Blue: { open: '<span style="color:blue">', close: '</span>' },
  Green: { open: '<span style="color:green">', close: '</span>' },
  Red: { open: '<span style="color:red">', close: '</span>' },
  Grey: { open: '<span style="color:darkgrey">', close: '</span>' },
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

  getParents(run: Run) {
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

  getBreadcrumbs(run: Run) {
    const parents = this.getParents(run).reverse();
    const string = [...parents, run]
      .map((parent, i, arr) => {
        const name = `${parent.execution_order}:${parent.run_type}:${parent.name}`;
        return i === arr.length - 1 ? wrap(STYLES.Bold, name) : name;
      })
      .join(' > ');
    return wrap(STYLES.Grey, string);
  }

  onLlmStart(run: Run): void {
    this.html += `LLM prompts:<br>${run.inputs.prompts.map(toHtml).join('<br>')}<br>`;
  }

  onLlmEnd(run: Run): void {
    // Do nothing
  }

  onLlmError(run: Run): void {
    this.html += `${wrap(STYLES.Red, `LLM error: ${toHtml(tryJsonStringify(run.error, '[error]'))}`)}<br>`;
  }

  onChainStart(run: Run): void {
    const crumbs = this.getBreadcrumbs(run);
    this.html += `[chain/start] [${crumbs}] Entering chain<br>`;
  }

  onChainEnd(run: Run): void {
    this.html += '[chain/end] Finished chain<br>';
  }

  onChainError(run: Run): void {
    this.html += `${wrap(
      STYLES.Red,
      `[chain/error] Chain error: ${toHtml(tryJsonStringify(run.error, '[error]'))}`,
    )}<br>`;
  }

  onToolStart(run: Run): void {
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
    )}<br>`;
  }

  onText(run: Run): void {
    const text = run.events[run.events.length - 1].kwargs?.text;
    this.html += `${toHtml(text)}<br>`;
  }

  onAgentAction(run: Run): any {
    const agentRun = run as AgentRun;
    const action = agentRun.actions[agentRun.actions.length - 1];
    const crumbs = this.getBreadcrumbs(run);
    this.html += `[agent/action] [${crumbs}] Agent selected action:<br>${action.log}<br>`;
  }

  onAgentFinish(run: Run): void {
    const agentRun = run as AgentRun;
    const action = agentRun.actions[agentRun.actions.length - 1];
    this.html += `${toHtml(action.log)}<br>`;
  }
}

function wrap(style: Style, text: string) {
  return `${style.open}${text}${style.close}`;
}

function tryJsonStringify(obj: unknown, fallback: string) {
  try {
    return JSON.stringify(obj, null, 2);
  } catch (err) {
    return fallback;
  }
}

function toHtml(text: string | unknown): string {
  const s = typeof text === 'string' ? text : String(text);
  return s.replace('<', '&lt;').replace('>', '&gt;').replace(/\r?\n/g, '<br>');
}
