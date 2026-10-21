/** Mirrors `ConsumerDTO` and `ConsumerAuthResponse` in foodrescue-api. */

/** `password` is always `null` on the way out: the backend never returns it. */
export type ConsumerDTO = {
  id: number
  name: string
  email: string
  password: null
}

export type RegisterConsumerRequest = {
  name: string
  email: string
  password: string
}

export type ConsumerAuthResponse = {
  consumer: ConsumerDTO
  token: string
}
