import Table from 'cli-table3';
import chalk from 'chalk';

/**
 * Render a list of items as an ASCII table.
 */
export function renderTable(head: string[], rows: any[][]): void {
  const table = new Table({
    head: head.map(h => chalk.cyan.bold(h)),
    style: {
      head: [],
      border: []
    }
  }) as any;

  table.push(...rows);
  console.log('\n' + table.toString() + '\n');
}

/**
 * Get a colored status label for a task.
 */
export function formatStatus(status: string): string {
  return status === '1' ? chalk.green('● OPEN') : chalk.gray('○ CLOSED');
}

/**
 * Format a priority value with color.
 */
export function formatPriority(priority: string | number): string {
  const p = typeof priority === 'string' ? parseInt(priority, 10) : priority;
  if (p >= 3) return chalk.red.bold(p.toString());
  if (p >= 1) return chalk.yellow(p.toString());
  return chalk.dim(p.toString());
}
