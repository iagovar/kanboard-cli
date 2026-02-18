import { expect, test, describe } from "bun:test";
import * as api from '../src/api';

describe('Kanboard API Integration Test', () => {
  test('Should connect and retrieve projects successfully', async () => {
    try {
      const projects = await api.call<any[]>('getAllProjects');
      expect(Array.isArray(projects)).toBe(true);
      console.log(`Connected successfully! Found ${projects.length} projects.`);
    } catch (err: any) {
      throw new Error(`Connection failed: ${err.message}`);
    }
  });
});
