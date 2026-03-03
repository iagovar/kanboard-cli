import * as api from '../api';
import * as render from '../utils/render';
import chalk from 'chalk';

interface Project {
  id: string;
  name: string;
  is_active: string | number;
  description: string | null;
}

interface Column {
  id: string;
  title: string;
  position: string;
  task_limit: string;
  description: string | null;
}

/**
 * Command: kanboard project list
 */
export async function listProjects(): Promise<void> {
  try {
    const projects = await api.call<Project[]>('getAllProjects');

    if (projects.length === 0) {
      console.log(chalk.yellow('No projects found.'));
      return;
    }

    const rows = projects.map(p => [
      p.id,
      p.name,
      p.is_active == 1 ? chalk.green('Active') : chalk.gray('Inactive'),
      p.description || chalk.dim('None')
    ]);

    render.renderTable(['ID', 'Project Name', 'Status', 'Description'], rows);
  } catch (err: any) {
    console.error(chalk.red.bold('\nError fetching projects:'), err.message);
  }
}

/**
 * Command: kanboard project columns <project_id>
 */
export async function listColumns(projectId: string): Promise<void> {
  try {
    const columns = await api.call<Column[]>('getColumns', { project_id: parseInt(projectId, 10) });

    if (columns.length === 0) {
      console.log(chalk.yellow(`No columns found for project #${projectId}.`));
      return;
    }

    const rows = columns.map(c => [
      c.id,
      c.title,
      c.position,
      c.task_limit !== '0' ? c.task_limit : chalk.dim('Unlimited'),
      c.description || chalk.dim('None')
    ]);

    render.renderTable(['ID', 'Column Name', 'Position', 'Task Limit', 'Description'], rows);
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError fetching columns for project #${projectId}:`), err.message);
  }
}
