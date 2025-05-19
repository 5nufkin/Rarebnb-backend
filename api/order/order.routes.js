import express from 'express'

import { requireAuth } from '../../middlewares/requireAuth.middleware.js'
import { log } from '../../middlewares/logger.middleware.js'

import { getOrders, getOrderById, addOrder, updateOrder, removeOrder, addOrderMsg, removeOrderMsg } from './order.controller.js'

const router = express.Router()

// We can add a middleware for the entire router:
// router.use(requireAuth)

router.get('/', log, getOrders)
router.get('/:id', log, getOrderById)

// router.post('/', log, addOrder)
router.post('/', log, addOrder)

// router.put('/:id', updateOrder)
router.put('/:id', updateOrder)

// router.delete('/:id', removeOrder)
router.delete('/:id', removeOrder)
// router.delete('/:id', requireAdmin, removeOrder)

router.post('/:id/msg', addOrderMsg)
router.delete('/:id/msg/:msgId', removeOrderMsg)

export const orderRoutes = router