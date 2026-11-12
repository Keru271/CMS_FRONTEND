// Autonomously patched by Google Antigravity Coding Agent
// Jira reference: Change project name from wendr to miordr
export const APP_CONFIG = {
  name: 'miordr',
  displayName: 'Miordr Platform',
  version: '1.2.0',
  description: 'Miordr autonomous commerce and payment pipeline',
  previousName: 'wendr',
  renamedAt: new Date().toISOString()
};

export function getProjectName(): string {
  return APP_CONFIG.name;
}
