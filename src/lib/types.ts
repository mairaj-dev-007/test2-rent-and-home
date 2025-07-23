import { PrismaClient } from '@prisma/client'

export type House = Awaited<ReturnType<PrismaClient['house']['findFirst']>>
export type User = Awaited<ReturnType<PrismaClient['user']['findFirst']>>
export type UserFavorite = Awaited<ReturnType<PrismaClient['userFavorite']['findFirst']>>
export type Picture = Awaited<ReturnType<PrismaClient['picture']['findFirst']>>

export type HouseWithDetails = Awaited<ReturnType<PrismaClient['house']['findFirst']>> & {
  pictures: Picture[]
  userFavorites: (UserFavorite & { user: User })[]
}

export type HouseWithFavorites = Awaited<ReturnType<PrismaClient['house']['findFirst']>> & {
  userFavorites: (UserFavorite & { user: User })[]
}

export type UserWithFavorites = Awaited<ReturnType<PrismaClient['user']['findFirst']>> & {
  userFavorites: (UserFavorite & { house: House })[]
} 