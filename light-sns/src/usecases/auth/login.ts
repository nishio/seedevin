import { IUserAuthRepository } from '../../domain/types';
import { verifyPassword } from '../../domain/password';
import { AuthenticationError } from '../../domain/types';

export interface LoginInput {
  userId: string;
  password: string;
}

export interface LoginOutput {
  success: boolean;
  error?: string;
}

export class LoginUseCase {
  constructor(
    private userAuthRepository: IUserAuthRepository
  ) {}

  async execute(input: LoginInput): Promise<LoginOutput> {
    try {
      const userAuth = await this.userAuthRepository.findByUserId(input.userId);
      
      if (!userAuth) {
        return {
          success: false,
          error: 'User not found'
        };
      }

      if (!userAuth.password || !userAuth.salt) {
        return {
          success: false,
          error: 'Invalid user credentials'
        };
      }

      const isValid = verifyPassword(
        input.password,
        userAuth.password,
        userAuth.salt
      );

      if (!isValid) {
        return {
          success: false,
          error: 'Invalid password'
        };
      }

      return {
        success: true
      };
    } catch (error) {
      throw new AuthenticationError('Login failed: ' + (error as Error).message);
    }
  }
}
