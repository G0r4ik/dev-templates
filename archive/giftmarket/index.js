import Fastify from 'fastify'
const fastify = Fastify()
import db from './database.js'
import {
  getPriceFromPortalsByBackground,
  getPriceFromTgmrktByBackground,
} from './parsing.js'
import { notifyAdmin } from './bot.js'

// -------------------- CONST --------------------

const PARSER_INTERVAL_MS = 100000
const MARKETPLACES = ['MRKT', 'Tunnel', 'Portals']
const PRICE_ALERT_THRESHOLD = 0.8

// -------------------- CRUD --------------------

try {
  await fastify.listen({ port: 3000 })
} catch (err) {
  fastify.log.error(err)
  process.exit(1)
}

// -------------------- PARSING DATE --------------------

const deleteOldNftsStmt = db.prepare('DELETE FROM nfts WHERE last_seen < ?')
const upsertNftStmt = db.prepare(`
    INSERT INTO nfts (id, marketplace, collection_name, item_number, model_name, backdrop_name, price, photo_url, telegram_link, listed_at, last_seen)
    VALUES (@id, @marketplace, @collectionName, @number, @modelName, @backdropName, @price, @photoUrl, @telegramLink, @listedAt, @lastSeen)
    ON CONFLICT(id) DO UPDATE SET
        price = excluded.price,
        last_seen = excluded.last_seen;
`)

//

const updatePriceStatsStmt = db.prepare(`
    INSERT INTO price_stats (collection_name, model_name, backdrop_name, avg_price, min_price, max_price, item_count, last_updated)
    SELECT
        collection_name,
        model_name,
        backdrop_name,
        ROUND(AVG(price),2),
        MIN(price),
        MAX(price),
        COUNT(*),
        datetime('now')
    FROM nfts
    WHERE collection_name IS NOT NULL AND backdrop_name IS NOT NULL
    GROUP BY collection_name, backdrop_name
    ON CONFLICT(collection_name, backdrop_name) DO UPDATE SET
        avg_price = excluded.avg_price,
        min_price = excluded.min_price,
        max_price = excluded.max_price,
        item_count = excluded.item_count,
        last_updated = excluded.last_updated,
        model_name = excluded.model_name;
`)
const getPriceStatsStmt = db.prepare(
  'SELECT * FROM price_stats WHERE collection_name = ? AND backdrop_name = ?'
)
const getNotificationStmt = db.prepare(
  'SELECT 1 FROM notifications WHERE nft_id = ? AND notified_price = ?'
)
const insertNotificationStmt = db.prepare(
  'INSERT INTO notifications (nft_id, notified_price) VALUES (?, ?)'
)

async function updateStatsAndCheckForDeals(updatedItems) {
  console.log('Updating price statistics...')
  updatePriceStatsStmt.run() // сложное обновление статистики
  console.log('Price statistics updated.')

  for (const item of updatedItems) {
    const stats = getPriceStatsStmt.get(item.collectionName, item.backdropName)
    if (!stats || stats.item_count < 2) continue

    const isBelowAvg = item.price <= stats.avg_price * PRICE_ALERT_THRESHOLD
    const isBelowMin = item.price <= stats.min_price * PRICE_ALERT_THRESHOLD

    // Нам интересен только случай, когда текущая цена равна минимальной,
    // но при этом значительно ниже средней. Или когда она просто очень низкая.
    const isGoodDeal =
      item.price === stats.min_price ? isBelowAvg : isBelowAvg || isBelowMin

    if (isGoodDeal) {
      const alreadyNotified = getNotificationStmt.get(item.id, item.price)
      if (alreadyNotified) {
        console.log(
          `Skipping notification for ${item.id} at price ${item.price}, already sent.`
        )
        continue
      }

      console.log(`🚀 Found a good deal! Sending notification for ${item.id}`)

      const avgDiff = Math.round((1 - item.price / stats.avg_price) * 100)
      const avg = formatNumber(stats.avg_price.toFixed(1))
      const min = formatNumber(stats.min_price.toFixed(1))
      const price = formatNumber(stats.min_price.toFixed(1))
      const message = `
🚨 <b>Выгодное предложение</b> 🚨

<a href="${item.telegramLink}">${item.collectionName} #${item.number} </a>
<b>Модель:</b> ${item.modelName}  |  <b>Фон: </b>${item.backdropName}

<b>price: </b>${price} ꘜ | <b>min: </b>${min} ꘜ | <b>avg: </b>${avg} ꘜ  
<b>Всего в продаже: </b>${stats.item_count} шт.
`

      await notifyAdmin(message)

      insertNotificationStmt.run(item.id, item.price)
    }
  }
}

const formatNumber = num =>
  Number.isInteger(num) || num.match(/\.0$/) ? Math.floor(num) : num

async function runParser() {
  try {
    console.log('Starting parsing cycle...')
    const a = await getPriceFromPortalsByBackground()
    const b = await getPriceFromTgmrktByBackground()
    const normalizeItems = [...a, ...b].map(gift => standardizeItem(gift))

    console.log(`Parsed ${normalizeItems.length} items. Upserting into DB...`)
    const upsertTransaction = db.transaction(items => {
      for (const item of items) upsertNftStmt.run(item)
    })
    upsertTransaction(normalizeItems)

    const tenSecondsAgo = new Date(
      Date.now() - PARSER_INTERVAL_MS * 1.5
    ).toISOString()
    const deleteInfo = deleteOldNftsStmt.run(tenSecondsAgo)
    console.log(`Deleted ${deleteInfo.changes} old items.`)

    await updateStatsAndCheckForDeals(normalizeItems)

    console.log('Parsing cycle finished.')
  } catch (error) {
    console.error('An error occurred during the parsing cycle:', error)
  }
}

setInterval(runParser, PARSER_INTERVAL_MS)

function standardizeItem(item) {
  let modelName, backdropName
  let marketplace = 'MRKT'
  if (item.attributes) marketplace = 'Portals'
  for (const attr of item.attributes || []) {
    if (attr.type === 'model') modelName = attr.value
    if (attr.type === 'backdrop') backdropName = attr.value
  }

  const number = item.number || item.external_collection_number
  const collection = (item.collectionName || item.name || '')
    .toLowerCase()
    .replace(/ /g, '')
  let img = `https://nft.fragment.com/gift/${collection}-${number}.large.jpg`

  return {
    id: `${collection}-${number}` || null,
    collectionName: item.collectionName || item.name || null,
    modelName: item.modelName || modelName || null,
    backdropName: item.backdropName || backdropName || null,
    number: number || null,

    marketplace: marketplace,
    price: item.salePrice / 1_000_000_000 || +item.price || null,
    telegramLink: `t.me/nft/${collection}-${number}` || null,
    listedAt: item.exportDate || item.listed_at || null,
    photoUrl: item.photo_url || img || null,
    lastSeen: new Date().toISOString(),
  }
}
