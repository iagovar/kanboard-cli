import { expect, test, describe, beforeAll, afterAll } from "bun:test";
import * as api from '../src/api';

describe('Kanboard Task Lifecycle Integration', () => {
  let projectId = 1; // Default from your current Kanboard setup
  let taskId: number;
  let columnId: number;
  let swimlaneId: number;
  let secondColumnId: number | null = null;

  beforeAll(async () => {
    // 1. Verify we can connect and find columns
    try {
      const columns = await api.call<any[]>('getColumns', { project_id: projectId });
      expect(columns.length).toBeGreaterThan(0);
      columnId = columns[0].id;
      if (columns.length > 1) {
        secondColumnId = columns[1].id;
      }
      console.log(`Using Project #${projectId}, Column #${columnId} (Second: ${secondColumnId})`);
    } catch (err: any) {
      throw new Error(`Prerequisites failed: ${err.message}`);
    }
  });

  test('Step 1: Create a new task', async () => {
    taskId = await api.call<number>('createTask', {
      project_id: projectId,
      title: 'INTEGRATION TEST: Task lifecycle',
      description: 'This task was created by the CLI integration test.'
    });
    expect(taskId).toBeGreaterThan(0);
    console.log(`✔ Task #${taskId} created`);
  });

  test('Step 2: Get task details', async () => {
    const task = await api.call<any>('getTask', { task_id: taskId });
    expect(task.id.toString()).toBe(taskId.toString());
    expect(task.title).toBe('INTEGRATION TEST: Task lifecycle');
    swimlaneId = parseInt(task.swimlane_id, 10);
  });

  test('Step 3: Add a comment', async () => {
    const commentId = await api.call<number>('createComment', {
      task_id: taskId,
      user_id: 1, // Let's use user ID 1 (usually admin) if 0 fails
      content: 'This is a test comment from CLI tests.'
    });
    expect(commentId).toBeGreaterThan(0);
    
    const comments = await api.call<any[]>('getAllComments', { task_id: taskId });
    expect(comments.some(c => c.id.toString() === commentId.toString())).toBe(true);
    console.log(`✔ Comment #${commentId} added`);
  });

  test('Step 4: Move task (if possible)', async () => {
    if (secondColumnId) {
      const result = await api.call<boolean>('moveTaskPosition', {
        project_id: projectId,
        task_id: taskId,
        column_id: secondColumnId,
        position: 1,
        swimlane_id: swimlaneId
      });
      expect(result).toBe(true);
      
      const task = await api.call<any>('getTask', { task_id: taskId });
      expect(task.column_id.toString()).toBe(secondColumnId.toString());
      console.log(`✔ Task moved to column #${secondColumnId}`);
    } else {
      console.log('Skipping move test: Only one column available');
    }
  });

  test('Step 5: Close task', async () => {
    const result = await api.call<boolean>('closeTask', { task_id: taskId });
    expect(result).toBe(true);
    
    const task = await api.call<any>('getTask', { task_id: taskId });
    expect(task.is_active.toString()).toBe("0");
    console.log(`✔ Task #${taskId} closed`);
  });

  test('Step 6: Remove task (Cleanup)', async () => {
    const result = await api.call<boolean>('removeTask', { task_id: taskId });
    expect(result).toBe(true);
    
    const task = await api.call<any>('getTask', { task_id: taskId });
    expect(task).toBe(null);
    console.log(`✔ Task #${taskId} removed (cleanup)`);
  });
});
