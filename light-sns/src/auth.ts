import { Hono } from 'hono'
import { setCookie } from 'hono/cookie'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import { loginAuthrizationInfomation, signupAuthrizationInfomation } from './schema/auth.schema'
import { PrismaUserRepository, PrismaUserAuthRepository, PrismaSessionRepository } from './infrastructure/prisma-repositories'
import { LoginUseCase } from './usecases/auth/login'
import { SignupUseCase } from './usecases/auth/signup'
import { SessionUseCase } from './usecases/auth/session'

const auth = new Hono()

const userRepository = new PrismaUserRepository()
const userAuthRepository = new PrismaUserAuthRepository()
const sessionRepository = new PrismaSessionRepository()

const sessionUseCase = new SessionUseCase(sessionRepository, userRepository)



auth.post('/login', async (c) => {
  try {
    const { user_id, password } = loginAuthrizationInfomation.parse(await c.req.json())

    const loginUseCase = new LoginUseCase(userAuthRepository)
    const loginResult = await loginUseCase.execute({
      userId: user_id,
      password: password
    })

    if (!loginResult.success) {
      if (loginResult.error === 'Invalid password' || loginResult.error === 'User not found') {
        throw new HTTPException(401, { message: loginResult.error });
      }
      throw new HTTPException(400, { message: loginResult.error || 'Login failed' });
    }

    const sessionResult = await sessionUseCase.createSession({
      userId: user_id
    })

    if (!sessionResult.success || !sessionResult.sessionId) {
      throw new HTTPException(500, { message: 'Failed to create session' })
    }

    setCookie(c, 'session_id', sessionResult.sessionId)
    return c.text("login success", 200)
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HTTPException(400, { message: e.message })
    }
    if (e instanceof HTTPException) {
      throw e
    }
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})
  
auth.post('/signup', async (c) => {
  try {
    const { user_id, user_name, password } = signupAuthrizationInfomation.parse(await c.req.json())

    const signupUseCase = new SignupUseCase(userRepository, userAuthRepository)
    const result = await signupUseCase.execute({
      userId: user_id,
      userName: user_name,
      password: password
    })

    if (!result.success) {
      throw new HTTPException(400, { message: result.error || 'Signup failed' })
    }

    return c.text("success", 200)
  } catch (e) {
    if (e instanceof ZodError) {
      throw new HTTPException(400, { message: e.message })
    }
    if (e instanceof HTTPException) {
      throw e
    }
    throw new HTTPException(500, { message: 'Internal Server Error' })
  }
})

export default auth
