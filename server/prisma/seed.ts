import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const user = await prisma.user.create({
        data: {
            name: 'Rodolfo',
            email: 'teste@gmail.com',
            avatarURL: 'https://avatars.githubusercontent.com/u/82546139?v=4',
        }
    })

    const pool = await prisma.pool.create({
        data: {
            title: 'Example Pool',
            code: 'BOL12',
            ownerId: user.id,
            participants: {
                create: {
                    userId: user.id,
                }
            }
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-12-19T13:49:32.403Z',
            firstTeamCountryCode: 'FR',
            secondTeamCountryCode: 'AR',
        }
    })

    await prisma.game.create({
        data: {
            date: '2022-12-19T13:49:32.403Z',
            firstTeamCountryCode: 'FR',
            secondTeamCountryCode: 'AR',

            guesses: {
                create: {
                    firstTeamPoints: 3,
                    secondTeamPoints: 3,

                    participant: {
                        connect: {
                            userId_poolId: {
                                userId: user.id,
                                poolId: pool.id,
                            }
                        }
                    }
                }
            }
        }
    })
}



main()