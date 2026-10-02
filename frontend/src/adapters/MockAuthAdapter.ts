import type { IAuthAdapter } from '../types';

export class MockAuthAdapter implements IAuthAdapter {
  async getCurrentUser() {
    return {
      id: 'demo-user-001',
      email: 'demo@yourbusiness.in',
      businessName: 'Your Business Name',
    };
  }

  async signIn(_email: string, _password: string): Promise<void> {
    await new Promise(r => setTimeout(r, 500));
  }

  async signOut(): Promise<void> {
    await new Promise(r => setTimeout(r, 200));
  }
}
