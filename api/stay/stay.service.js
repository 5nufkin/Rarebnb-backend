import { ObjectId } from 'mongodb'

import { logger } from '../../services/logger.service.js'
import { makeId } from '../../services/util.service.js'
import { dbService } from '../../services/db.service.js'
import { asyncLocalStorage } from '../../services/als.service.js'

const PAGE_SIZE = 20

export const stayService = {
  remove,
  query,
  getById,
  add,
  update,
  addStayMsg,
  removeStayMsg,
}

async function query(filterBy = {}) {
  const criteria = _buildCriteria(filterBy)
  const sort = _buildSort(filterBy)

  try {
    const collection = await dbService.getCollection('stay')
    const totalCount = await collection.countDocuments(criteria)
    const pageIdx = +filterBy.pageIdx || 0

    // var stayCursor = await collection.find(criteria, { sort })

    const stays = await collection.find(criteria).sort(sort).skip(pageIdx * PAGE_SIZE).limit(PAGE_SIZE).toArray()

    // if (filterBy.pageIdx !== undefined) {
    //   stayCursor.skip(filterBy.pageIdx * PAGE_SIZE).limit(PAGE_SIZE)
    // }

    // const stays = stayCursor.toArray()
    // return stays
    return {
      stays, totalCount, totalPages: Math.ceil(totalCount / PAGE_SIZE), pageIdx
    }
  } catch (err) {
    logger.error('cannot find stays', err)
    throw err
  }
}

async function getById(stayId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(stayId) }

    const collection = await dbService.getCollection('stay')
    const stay = await collection.findOne(criteria)

    stay.createdAt = stay._id.getTimestamp()
    return stay
  } catch (err) {
    logger.error(`while finding stay ${stayId}`, err)
    throw err
  }
}

async function remove(stayId) {
  const { loggedInUser } = asyncLocalStorage.getStore()
  const { _id: hostId, isAdmin } = loggedInUser

  try {
    const criteria = {
      _id: ObjectId.createFromHexString(stayId),
    }
    if (!isAdmin) criteria['host._id'] = hostId

    const collection = await dbService.getCollection('stay')
    const res = await collection.deleteOne(criteria)

    if (res.deletedCount === 0) throw ('Not your stay')
    return stayId
  } catch (err) {
    logger.error(`cannot remove stay ${stayId}`, err)
    throw err
  }
}

async function add(stay) {

  try {
    const collection = await dbService.getCollection('stay')
    await collection.insertOne(stay)

    return stay
  } catch (err) {
    logger.error('cannot insert stay', err)
    throw err
  }
}

async function update(stay) {
  const stayToSave = {
    name: stay.name,
    type: stay.type,
    price: stay.price,
    summary: stay.summary,
    capacity: stay.capacity,
    bedCount: stay.bedCount,
    labels: stay.labels,
    amenities: stay.amenities,
    loc: stay.loc,
    imgUrls: stay.imgUrls,
  }

  const criteria = { _id: ObjectId.createFromHexString(stay._id) }

  try {
    const collection = await dbService.getCollection('stay')
    await collection.updateOne(criteria, { $set: stayToSave })
    return { stayToSave, _id: criteria._id } //todo - maybe change to return the whole stay, like we did with order updates
  } catch (err) {
    logger.error(`cannot update stay ${stay._id}`, err)
    throw err
  }
}

async function addStayMsg(stayId, msg) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(stayId) }
    msg.id = makeId()

    const collection = await dbService.getCollection('stay')
    await collection.updateOne(criteria, { $push: { msgs: msg } })

    return msg
  } catch (err) {
    logger.error(`cannot add stay msg ${stayId}`, err)
    throw err
  }
}

async function removeStayMsg(stayId, msgId) {
  try {
    const criteria = { _id: ObjectId.createFromHexString(stayId) }

    const collection = await dbService.getCollection('stay')
    await collection.updateOne(criteria, { $pull: { msgs: { id: msgId } } })

    return msgId
  } catch (err) {
    logger.error(`cannot remove stay msg ${stayId}`, err)
    throw err
  }
}

function _buildCriteria(filterBy) {
  const criteria = {}
  if (filterBy.country) criteria['loc.country'] = { $regex: filterBy.country, $options: 'i' }
  return criteria
}

function _buildSort(filterBy) {
  if (!filterBy.sortField) return {}
  return { [filterBy.sortField]: filterBy.sortDir }
}