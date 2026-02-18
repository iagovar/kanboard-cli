import * as api from '../api';
import * as render from '../utils/render';
import chalk from 'chalk';

interface Project {
  id: string;
  name: string;
  is_active: string;
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
      p.is_active === '1' ? chalk.green('Active') : chalk.gray('Inactive'),
      p.description || chalk.dim('None')
    ]);

    render.renderTable(['ID', 'Project Name', 'Status', 'Description'], rows);
  } catch (err: any) {
    console.error(chalk.red.bold('\nError fetching projects:'), err.message);
  }
}
