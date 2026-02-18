import * as api from '../api';
import * as render from '../utils/render';
import chalk from 'chalk';

interface Task {
  id: string;
  title: string;
  is_active: string;
  priority: string;
  owner_name: string | null;
  project_id: string;
  project_name: string;
  column_name: string;
  date_creation: number;
  description: string | null;
}

/**
 * Command: kanboard task list <project_id>
 */
export async function listTasks(projectId: string): Promise<void> {
  try {
    const tasks = await api.call<Task[]>('getAllTasks', { project_id: parseInt(projectId, 10) });

    if (tasks.length === 0) {
      console.log(chalk.yellow(`No tasks found for project #${projectId}.`));
      return;
    }

    const rows = tasks.map(t => [
      t.id,
      t.title,
      render.formatStatus(t.is_active),
      render.formatPriority(t.priority),
      t.owner_name || chalk.dim('Unassigned')
    ]);

    render.renderTable(['ID', 'Task Title', 'Status', 'Prio', 'Owner'], rows);
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError fetching tasks for project #${projectId}:`), err.message);
  }
}

interface CreateTaskOptions {
  project_id: string;
  title: string;
  color?: string;
  priority?: string;
}

/**
 * Command: kanboard task create -p <project_id> -t <title> [--color <color>] [--priority <int>]
 */
export async function createTask(options: CreateTaskOptions): Promise<void> {
  const { project_id, title, color, priority } = options;

  try {
    const result = await api.call<number>('createTask', {
      project_id: parseInt(project_id, 10),
      title,
      color_id: color,
      priority: priority ? parseInt(priority, 10) : 0
    });

    if (result) {
      console.log(chalk.green.bold(`\n✔ Task #${result} created successfully!`));
    } else {
      console.error(chalk.red.bold('\n✘ Failed to create task.'));
    }
  } catch (err: any) {
    console.error(chalk.red.bold('\nError creating task:'), err.message);
  }
}

/**
 * Command: kanboard task show <task_id>
 */
export async function showTask(taskId: string): Promise<void> {
  try {
    const task = await api.call<Task>('getTask', { task_id: parseInt(taskId, 10) });

    if (!task) {
      console.log(chalk.yellow(`Task #${taskId} not found.`));
      return;
    }

    console.log(`\n${chalk.cyan.bold('TASK DETAILS')} ${chalk.dim(`#${task.id}`)}`);
    console.log(chalk.gray('─'.repeat(40)));
    console.log(`${chalk.bold('Title:')}      ${task.title}`);
    console.log(`${chalk.bold('Status:')}     ${render.formatStatus(task.is_active)}`);
    console.log(`${chalk.bold('Project:')}    ${task.project_name} ${chalk.dim(`(#${task.project_id})`)}`);
    console.log(`${chalk.bold('Priority:')}   ${render.formatPriority(task.priority)}`);
    console.log(`${chalk.bold('Owner:')}      ${task.owner_name || chalk.dim('Unassigned')}`);
    console.log(`${chalk.bold('Column:')}     ${task.column_name}`);
    console.log(`${chalk.bold('Date Create:')} ${new Date(task.date_creation * 1000).toLocaleString()}`);
    
    if (task.description) {
      console.log(`\n${chalk.bold('Description:')}\n${task.description}`);
    }
    console.log(chalk.gray('─'.repeat(40)) + '\n');
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError showing task #${taskId}:`), err.message);
  }
}

/**
 * Command: kanboard task close <task_id>
 */
export async function closeTask(taskId: string): Promise<void> {
  try {
    const result = await api.call<boolean>('closeTask', { task_id: parseInt(taskId, 10) });

    if (result) {
      console.log(chalk.green.bold(`\n✔ Task #${taskId} closed successfully!`));
    } else {
      console.error(chalk.red.bold(`\n✘ Failed to close task #${taskId}.`));
    }
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError closing task #${taskId}:`), err.message);
  }
}

/**
 * Command: kanboard task remove <task_id>
 */
export async function removeTask(taskId: string): Promise<void> {
  try {
    const result = await api.call<boolean>('removeTask', { task_id: parseInt(taskId, 10) });

    if (result) {
      console.log(chalk.green.bold(`\n✔ Task #${taskId} removed successfully!`));
    } else {
      console.error(chalk.red.bold(`\n✘ Failed to remove task #${taskId}.`));
    }
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError removing task #${taskId}:`), err.message);
  }
}

/**
 * Command: kanboard task move <task_id> <column_id>
 */
export async function moveTask(taskId: string, columnId: string): Promise<void> {
  try {
    // We need project_id and swimlane_id for moveTaskPosition to be reliable
    const task = await api.call<any>('getTask', { task_id: parseInt(taskId, 10) });
    
    if (!task) {
      console.error(chalk.red.bold(`\n✘ Task #${taskId} not found.`));
      return;
    }

    const result = await api.call<boolean>('moveTaskPosition', {
      project_id: parseInt(task.project_id, 10),
      task_id: parseInt(taskId, 10),
      column_id: parseInt(columnId, 10),
      position: 1,
      swimlane_id: parseInt(task.swimlane_id, 10)
    });

    if (result) {
      console.log(chalk.green.bold(`\n✔ Task #${taskId} moved to column #${columnId}!`));
    } else {
      console.error(chalk.red.bold(`\n✘ Failed to move task #${taskId}.`));
    }
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError moving task #${taskId}:`), err.message);
  }
}

/**
 * Command: kanboard task assign <task_id> <user_id>
 */
export async function assignTask(taskId: string, userId: string): Promise<void> {
  try {
    const result = await api.call<boolean>('updateTask', {
      id: parseInt(taskId, 10),
      owner_id: parseInt(userId, 10)
    });

    if (result) {
      console.log(chalk.green.bold(`\n✔ Task #${taskId} assigned to user #${userId}!`));
    } else {
      console.error(chalk.red.bold(`\n✘ Failed to assign task #${taskId}.`));
    }
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError assigning task #${taskId}:`), err.message);
  }
}

/**
 * Command: kanboard task comment add <task_id> <content>
 */
export async function addComment(taskId: string, content: string): Promise<void> {
  try {
    // Assuming the user doesn't specify a user_id, it will be the one associated with the API key
    const result = await api.call<number>('createComment', {
      task_id: parseInt(taskId, 10),
      content,
      user_id: 0 // Using 0 as a placeholder (Kanboard usually defaults to the API user)
    });

    if (result) {
      console.log(chalk.green.bold(`\n✔ Comment #${result} added successfully to task #${taskId}!`));
    } else {
      console.error(chalk.red.bold(`\n✘ Failed to add comment to task #${taskId}.`));
    }
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError adding comment to task #${taskId}:`), err.message);
  }
}

/**
 * Command: kanboard task comment list <task_id>
 */
export async function listComments(taskId: string): Promise<void> {
  try {
    const comments = await api.call<any[]>('getAllComments', { task_id: parseInt(taskId, 10) });

    if (comments.length === 0) {
      console.log(chalk.yellow(`No comments found for task #${taskId}.`));
      return;
    }

    console.log(`\n${chalk.cyan.bold('COMMENTS FOR TASK')} ${chalk.dim(`#${taskId}`)}`);
    console.log(chalk.gray('─'.repeat(40)));

    for (const c of comments) {
      console.log(`${chalk.bold(c.username || 'System')} ${chalk.dim(`(${new Date(c.date_creation * 1000).toLocaleString()})`)}:`);
      console.log(`${c.content}\n`);
    }
    console.log(chalk.gray('─'.repeat(40)) + '\n');
  } catch (err: any) {
    console.error(chalk.red.bold(`\nError fetching comments for task #${taskId}:`), err.message);
  }
}
