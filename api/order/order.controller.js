import { logger } from '../../services/logger.service.js'
import { orderService } from './order.service.js'

export async function getOrders(req, res) {
  const filterBy = {
    txt: req.query.txt || '',
    // sortField: req.query.sortField || '',
    // sortDir: req.query.sortDir || 1,
    // pageIdx: req.query.pageIdx,
  }
  try {
    const orders = await orderService.query(filterBy)
    res.json(orders)
  } catch (err) {
    logger.error('Failed to get orders', err)
    res.status(400).send({ err: 'Failed to get orders' })
  }
}

export async function getOrderById(req, res) {
  try {
    const orderId = req.params.id
    const order = await orderService.getById(orderId)
    res.json(order)
  } catch (err) {
    logger.error('Failed to get order', err)
    res.status(400).send({ err: 'Failed to get order' })
  }
}

export async function addOrder(req, res) {
  const { loggedInUser } = req
  const order = req.body

  try {
    const addedOrder = await orderService.add(order, loggedInUser)
    res.json(addedOrder)
  } catch (err) {
    logger.error('Failed to add order', err)
    res.status(400).send({ err: 'Failed to add order' })
  }
}

export async function updateOrder(req, res) {
  const { loggedInUser, body: order } = req
  const { _id: userId, isAdmin } = loggedInUser

  if (!isAdmin && order.host._id !== userId && order.guest._id !== userId) {
    res.status(403).send('Not your order...')
    return
  }

  try {
    const updatedOrder = await orderService.update(order, loggedInUser)
    res.json(updatedOrder)
  } catch (err) {
    logger.error('Failed to update order', err)
    res.status(400).send({ err: 'Failed to update order' })
  }
}

export async function removeOrder(req, res) {
  try {
    const orderId = req.params.id
    const removedId = await orderService.remove(orderId)

    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove order', err)
    res.status(400).send({ err: 'Failed to remove order' })
  }
}

export async function addOrderMsg(req, res) {
  const { loggedInUser } = req

  try {
    const orderId = req.params.id
    const msg = {
      txt: req.body.txt,
      by: loggedInUser,
    }
    const savedMsg = await orderService.addOrderMsg(orderId, msg)
    res.json(savedMsg)
  } catch (err) {
    logger.error('Failed to add order msg', err)
    res.status(400).send({ err: 'Failed to add order msg' })
  }
}

export async function removeOrderMsg(req, res) {
  try {
    const { id: orderId, msgId } = req.params

    const removedId = await orderService.removeOrderMsg(orderId, msgId)
    res.send(removedId)
  } catch (err) {
    logger.error('Failed to remove order msg', err)
    res.status(400).send({ err: 'Failed to remove order msg' })
  }
}
