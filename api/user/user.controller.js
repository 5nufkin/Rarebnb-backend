import { userService } from './user.service.js'
import { logger } from '../../services/logger.service.js'
import bcrypt from 'bcrypt'

export async function getUser(req, res) {
  try {
    const user = await userService.getById(req.params.id)
    res.send(user)
  } catch (err) {
    logger.error('Failed to get user', err)
    res.status(400).send({ err: 'Failed to get user' })
  }
}

export async function getUsers(req, res) {
  try {
    const filterBy = {
      txt: req.query?.txt || '',
      minBalance: +req.query?.minBalance || 0
    }
    const users = await userService.query(filterBy)
    res.send(users)
  } catch (err) {
    logger.error('Failed to get users', err)
    res.status(400).send({ err: 'Failed to get users' })
  }
}

export async function deleteUser(req, res) {
  try {
    await userService.remove(req.params.id)
    res.send({ msg: 'Deleted successfully' })
  } catch (err) {
    logger.error('Failed to delete user', err)
    res.status(400).send({ err: 'Failed to delete user' })
  }
}

export async function updateUser(req, res) {
  try {
    const user = req.body
    const savedUser = await userService.update(user)
    res.send(savedUser)
  } catch (err) {
    logger.error('Failed to update user', err)
    res.status(400).send({ err: 'Failed to update user' })
  }
}

export async function addUser(req, res) {
  const saltRounds = 10
  const user = req.body

  const userToAdd = {
    fullname: user.fullname,
    username: user.username,
    imgUrl: user.imgUrl,
    isAdmin: user.isAdmin
  }
  const hash = await bcrypt.hash(user.password, saltRounds)
  userToAdd.password = hash

  try {
    const addedUser = await userService.add(userToAdd)
    res.json(addedUser)
  } catch (err) {
    logger.error('Failed to add user', err)
    res.status(400).send({ err: 'Failed to add user' })
  }
}
