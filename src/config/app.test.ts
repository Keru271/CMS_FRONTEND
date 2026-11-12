import { APP_CONFIG, getProjectName } from './app';

describe('Project Name Verification', () => {
  it('should reflect the updated project name miordr', () => {
    expect(getProjectName()).toBe('miordr');
    expect(APP_CONFIG.name).toBe('miordr');
    expect(APP_CONFIG.previousName).toBe('wendr');
  });
});
