import { FastifyInstance } from "fastify";
import { z } from "zod";
import { prisma } from "../lib/prisma";
import fetch from "node-fetch";
import { authenticate } from "../plugins/authenticate";

export async function authRoutes(fastify: FastifyInstance) {
  fastify.get('/me', {
    onRequest: [authenticate],
  }, async (request) => {
    return { user: request.user }
  })

  fastify.post('/users', async (request) => {

    const createUserBody = z.object({
      acces_token: z.string(),
    })

    const { acces_token } = createUserBody.parse(request.body)

    const userRespose = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${acces_token}`,
      }
    })

    const userData = await userRespose.json()
    console.log(userData)

    const userInfoSchema = z.object({
      id: z.string(),
      // googleId: z.string(),
      email: z.string().email(),
      name: z.string(),
      picture: z.string().url(),
    })
    const userInfo = userInfoSchema.parse(userData)
    console.log(userInfo)
    let user = await prisma.user.findUnique({
      where: {
        googleId: userInfo.id,
      }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          googleId: userInfo.id,
          name: userInfo.name,
          email: userInfo.email,
          avatarURL: userInfo.picture
        }
      })
    }

    const token = fastify.jwt.sign({
      name: user.name,
      avatarUrl: user.avatarURL,
    }, {
      sub: user.id,
      expiresIn: '7 days'

    })

    return {
      token
    }
  })
}