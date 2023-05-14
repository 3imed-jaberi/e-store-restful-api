import bCrypt from 'bcryptjs'

export const hashPassword = async (password) => {
  const salt = await bCrypt.genSalt(10)
  const hash = await bCrypt.hash(password, salt)
  return hash
}

export const isPasswordMatched = async (password, hash) => {
  return await bCrypt.compare(password, hash)
}
