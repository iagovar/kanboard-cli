#!/usr/bin/env bun

import { Command } from 'commander';
import * as projects from '../commands/projects';
import * as tasks from '../commands/tasks';
import chalk from 'chalk';
import packageJson from '../../package.json';

const program = new Command();

program
  .name('kanboard')
  .description('Professional CLI for Kanboard API interaction.')
  .version(packageJson.version)
  .addHelpText('after', `
Example usage:
  $ kanboard project list
  $ kanboard task list 1
  $ kanboard task show 10
  $ kanboard task create -p 1 -t "My New Task"
  $ kanboard task move 10 2
  $ kanboard task comment add 10 "Important info"

To see more help for a specific command:
  $ kanboard task --help
  $ kanboard project --help
  `);

// Project Commands
const projectCmd = program.command('project').alias('p').description('Manage projects');
projectCmd
  .command('list')
  .alias('ls')
  .description('List all projects')
  .action(projects.listProjects);

// Task Commands
const taskCmd = program.command('task').alias('t').description('Manage tasks');

taskCmd
  .command('list <project_id>')
  .alias('ls')
  .description('List all tasks in a project')
  .action((projectId: string) => {
    tasks.listTasks(projectId);
  });

taskCmd
  .command('create')
  .alias('c')
  .description('Create a new task')
  .requiredOption('-p, --project_id <id>', 'Project ID')
  .requiredOption('-t, --title <title>', 'Task title')
  .option('--color <color>', 'Task color (e.g., yellow, blue, red)', 'yellow')
  .option('--priority <int>', 'Task priority', '0')
  .action((options: { project_id: string; title: string; color?: string; priority?: string }) => {
    tasks.createTask(options);
  });

taskCmd
  .command('show <task_id>')
  .alias('s')
  .description('Display task details')
  .action((taskId: string) => {
    tasks.showTask(taskId);
  });

taskCmd
  .command('close <task_id>')
  .description('Mark a task as closed')
  .action((taskId: string) => {
    tasks.closeTask(taskId);
  });

taskCmd
  .command('remove <task_id>')
  .alias('rm')
  .description('Permanently remove a task')
  .action((taskId: string) => {
    tasks.removeTask(taskId);
  });

taskCmd
  .command('move <task_id> <column_id>')
  .alias('mv')
  .description('Move a task to a different column')
  .action((taskId: string, columnId: string) => {
    tasks.moveTask(taskId, columnId);
  });

taskCmd
  .command('assign <task_id> <user_id>')
  .alias('as')
  .description('Assign a task to a user')
  .action((taskId: string, userId: string) => {
    tasks.assignTask(taskId, userId);
  });

// Comment Sub-commands
const commentCmd = taskCmd.command('comment').description('Manage task comments');

commentCmd
  .command('add <task_id> <content>')
  .description('Add a comment to a task')
  .action((taskId: string, content: string) => {
    tasks.addComment(taskId, content);
  });

commentCmd
  .command('list <task_id>')
  .description('List all comments for a task')
  .action((taskId: string) => {
    tasks.listComments(taskId);
  });

// Handle unknown commands
program.on('command:*', () => {
  console.error(chalk.red.bold('\nInvalid command: %s\nSee --help for a list of available commands.'), program.args.join(' '));
  process.exit(1);
});

// Parse arguments
if (!process.argv.slice(2).length) {
  program.outputHelp();
} else {
  program.parse(process.argv);
}
