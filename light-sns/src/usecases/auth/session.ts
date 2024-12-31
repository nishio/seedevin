import { ISessionRepository, IUserRepository } from '../../domain/types';
import { AuthenticationError } from '../../domain/types';

export interface CreateSessionInput {
  userId: string;
}

export interface CreateSessionOutput {
  success: boolean;
  sessionId?: string;
  error?: string;
}

export interface VerifySessionInput {
  sessionId: string;
}

export interface VerifySessionOutput {
  success: boolean;
  userId?: string;
  error?: string;
}

export class SessionUseCase {
  constructor(
    private sessionRepository: ISessionRepository,
    private userRepository: IUserRepository
  ) {}

  async createSession(input: CreateSessionInput): Promise<CreateSessionOutput> {
    try {
      const user = await this.userRepository.findByUserId(input.userId);
      if (!user) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      const session = await this.sessionRepository.create(input.userId);
      return {
        success: true,
        sessionId: session.UUID
      };
    } catch (error) {
      throw new AuthenticationError('Create session failed: ' + (error as Error).message);
    }
  }

  async verifySession(input: VerifySessionInput): Promise<VerifySessionOutput> {
    try {
      const session = await this.sessionRepository.findByUUID(input.sessionId);
      if (!session) {
        return {
          success: false,
          error: 'Invalid session'
        };
      }

      return {
        success: true,
        userId: session.userId
      };
    } catch (error) {
      throw new AuthenticationError('Verify session failed: ' + (error as Error).message);
    }
  }
}
