import { IUserRepository, IUserAuthRepository } from '../../domain/types';
import { generateSalt, hashPassword } from '../../domain/password';
import { ValidationError } from '../../domain/types';

export interface SignupInput {
  userId: string;
  userName: string;
  password: string;
}

export interface SignupOutput {
  success: boolean;
  error?: string;
}

export class SignupUseCase {
  constructor(
    private userRepository: IUserRepository,
    private userAuthRepository: IUserAuthRepository
  ) {}

  async execute(input: SignupInput): Promise<SignupOutput> {
    try {
      // Check if user already exists
      const existingUser = await this.userRepository.findByUserId(input.userId);
      if (existingUser) {
        return {
          success: false,
          error: 'already user_id'
        };
      }

      // Create user
      const user = await this.userRepository.create({
        userId: input.userId,
        userName: input.userName,
        description: null,
        iconUrl: null
      });

      // Create user authentication
      const salt = generateSalt();
      const hashedPassword = hashPassword(input.password, salt);
      
      await this.userAuthRepository.create({
        userId: user.userId,
        password: hashedPassword,
        salt: salt
      });

      return {
        success: true
      };
    } catch (error) {
      throw new ValidationError('Signup failed: ' + (error as Error).message);
    }
  }
}
