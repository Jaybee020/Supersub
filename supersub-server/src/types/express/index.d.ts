declare global {
  namespace Express {
    export interface Request {
      auth: {
        apiKey: 'public' | 'secret' | null;
        method: 'access-token' | 'api-key';
        address: string;
      };
    }
  }
}

export {};
