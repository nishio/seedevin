import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { ZodError } from 'zod'
import AuthRoute from "./auth"
import DebugRoute from "./debug"
import { verifyUser } from "./middleware/auth"
import { postRequestSchema, timelineRequestSchema } from './schema/service.schema'
import { CreatePostUseCase } from './usecases/post/create-post'
import { GetTimelineUseCase } from './usecases/post/get-timeline'
import { PrismaPostRepository } from './infrastructure/prisma-repositories'

const app = new Hono()

app.route("/auth", AuthRoute)
app.route("/debug", DebugRoute)

const postRepository = new PrismaPostRepository()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/service/post', async (c) => {
  try {
    const data = postRequestSchema.parse(await c.req.json())
    const userId = await verifyUser(data.session_id)

    const createPostUseCase = new CreatePostUseCase(postRepository)
    const result = await createPostUseCase.execute({
      userId,
      body: data.body
    })

    if (!result.success) {
      throw new HTTPException(400, { message: result.error })
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


app.get('/service/getTimeline', async (c) => {
  try {
    const query = c.req.query();
    const validatedQuery = timelineRequestSchema.parse({
      limit: query.limit ? parseInt(query.limit) : undefined
    });
    
    const getTimelineUseCase = new GetTimelineUseCase(postRepository)
    const result = await getTimelineUseCase.execute({ limit: validatedQuery.limit })

    if (!result.success) {
      throw new HTTPException(400, { message: result.error })
    }

    const forJsonPosts = result.posts?.map(post => ({
      id: String(post.id),
      createdAt: post.createdAt,
      userId: post.userId,
      body: post.body
    }))

    return c.json(forJsonPosts)
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


app.onError((error, c) => {
  if  (error instanceof HTTPException) {
    return c.json({
      message: error.message
    }, error.status)
  }
  return c.json({
    message: 'Internal Server Error'
  }, 500)
})

export default app
