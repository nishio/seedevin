import { HTTPException } from 'hono/http-exception'
import { SessionUseCase } from '../usecases/auth/session'
import { PrismaSessionRepository, PrismaUserRepository } from '../infrastructure/prisma-repositories'

const sessionRepository = new PrismaSessionRepository()
const userRepository = new PrismaUserRepository()
const sessionUseCase = new SessionUseCase(sessionRepository, userRepository)

export const verifyUser = async (session_id: string) => {
  const result = await sessionUseCase.verifySession({ sessionId: session_id })
  
  if (!result.success || !result.userId) {
    throw new HTTPException(401, {
      message: "Not found user in session_ids"
    })
  }
  
  return result.userId
}
