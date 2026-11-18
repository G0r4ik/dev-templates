import axios from 'axios'
const ALLOWED_BACKGROUNDS = ['Black']
const ALLOWED_COLLECTIONS = [
  'Durov’s Cap',
  'Heart Locket',
  'Plush Pepe',
  'Precious Peach',
  'Heroic Helmet',
  'Nail Bracelet',
  'Westside Sign',
  'Astral Shard',
  'Loot Bag',
  'Perfume Bottle',
  'Ion Gem',
  'Gem Signet',
  'Mini Oscar',
  'Bonded Ring',
  'Magic Potion',
  'Scared Cat',
  'Genie Lamp',
  'Low Rider',
  'Swiss Watch',
  'Kissed Frog',
]

export const getPriceFromPortalsByBackground = async () => {
  const limit = 100 // больше нельзя
  const colors = ALLOWED_BACKGROUNDS.map(с => с.replace(/ /g, '+')).join('%2C')
  const collections = ALLOWED_COLLECTIONS.map(с => с.replace(/ /g, '+')).join(
    '%2C'
  )
  let offset = 0
  const result = []

  while (true) {
    let config = {
      method: 'get',
      maxBodyLength: Infinity,
      url: `https://portals-market.com/api/nfts/search?offset=${offset}&limit=${limit}&filter_by_backdrops=${colors}&filter_by_collections=${collections}&sort_by=price+asc&status=listed`,
      headers: {
        Authorization:
          process.env.MARKET_AUTH,
      },
    }

    const res = await axios.request(config)
    const prices = res.data.results
    result.push(...prices)
    if (prices.length < 100) break
    offset += 100
  }

  return result
}

export const getPriceFromTgmrktByBackground = async () => {
  const limit = 20 // больше нельзя
  const result = []
  let cursor = ''

  while (true) {
    const body = {
      count: limit,
      cursor,
      collectionNames: ALLOWED_COLLECTIONS,
      modelNames: [],
      symbolNames: [],
      backdropNames: ALLOWED_BACKGROUNDS,
      ordering: 'Price',
      lowToHigh: true,
    }

    const config = {
      method: 'post',
      url: 'https://api.tgmrkt.io/api/v1/gifts/saling',
      headers: {
        accept: '*/*',
        'content-type': 'application/json',
        authorization: '515eb66b-ccd8-462d-9034-9d5a6fc76445', // FIX
      },
      data: body,
    }

    const res = await axios.request(config)
    const gifts = res.data.gifts || res.data.items || []
    result.push(...gifts)

    cursor = res.data.cursor || res.data.nextCursor || null
    if (!cursor) break
  }

  return result
}
