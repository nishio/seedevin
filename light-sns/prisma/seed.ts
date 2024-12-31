import { Prisma, PrismaClient } from '@prisma/client'
import { formatISO } from 'date-fns'
import { generateSalt, hashPassword } from '../src/domain/password'

const prisma = new PrismaClient()
async function main() {

    const salt = generateSalt();
    const testUserModel = {
        userId: "test",
        userName: "test",
        description: "test",
        iconurl: "https://example.com",
        password: hashPassword("test", salt),
        salt: salt,
        UUID: "4ff3388f-8b0d-4b38-9dae-7dfcc546c5b0",
    }

    const createUserHandler = await prisma.user.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            userName: testUserModel.userName,
            description: testUserModel.description,
            iconUrl: testUserModel.iconurl
        }
    })

    const createUserAuthHandler = await prisma.userAuth.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            password: testUserModel.password,
            salt: testUserModel.salt
        }
    })

    const createSessionIDsHandler = await prisma.sessionIDs.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            UUID: testUserModel.UUID
        }
    })

    const createPostHandler = await prisma.post.create({
        data: {
            createdAt: formatISO(new Date()),
            userId: testUserModel.userId,
            body: "test"
        }
    })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
