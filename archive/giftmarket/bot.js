import { Bot } from 'grammy'

export const bot = new Bot(process.env.BOT_TOKEN)
const ADMIN_ID = Number(process.env.ADMIN_ID) // <-- ЗАМЕНИТЕ НА СВОЙ ID
const userIds = new Set()

bot.command('start', ctx => {
  const chatId = ctx.chat.id
  if (!userIds.has(chatId)) {
    userIds.add(chatId)
    console.log(
      `Новый пользователь добавлен: ${chatId}. Всего: ${userIds.size}`
    )
  }
  ctx.reply('Привет! Ты подписан на уведомления.')
})

async function broadcast(text) {
  let sentCount = 0
  let blockedCount = 0

  console.log(`Начинаю рассылку для ${userIds.size} пользователей...`)

  for (const chatId of userIds) {
    try {
      await bot.api.sendMessage(chatId, text)
      sentCount++
    } catch (e) {
      if (
        e instanceof GrammyError &&
        e.description.includes('bot was blocked by the user')
      ) {
        userIds.delete(chatId)
        blockedCount++
        console.log(
          `Пользователь ${chatId} заблокировал бота. Удален из списка.`
        )
      } else {
        console.error(
          `Не удалось отправить сообщение пользователю ${chatId}`,
          e
        )
      }
    }
    await new Promise(r => setTimeout(r, 50))
  }

  const resultMessage = `✅ Рассылка завершена!\n\nОтправлено: ${sentCount}\nЗаблокировали бота: ${blockedCount}`
  console.log(resultMessage)
  await bot.api.sendMessage(ADMIN_ID, resultMessage)
}

bot.command('broadcast', async ctx => {
  if (ctx.from?.id !== ADMIN_ID) {
    return ctx.reply('У вас нет прав для выполнения этой команды.')
  }

  const messageText = ctx.match

  if (!messageText) {
    return ctx.reply(
      'Пожалуйста, укажите текст для рассылки. Пример: /broadcast Привет всем!'
    )
  }

  ctx.reply('Начинаю рассылку...')

  broadcast(messageText)
})

bot.catch(err => {
  const ctx = err.ctx
  console.error(`Ошибка при обработке обновления ${ctx.update.update_id}:`)
  const e = err.error
  if (e instanceof GrammyError) {
    console.error('Ошибка в запросе:', e.description)
  } else if (e instanceof HttpError) {
    console.error('Не удалось связаться с Telegram:', e)
  } else {
    console.error('Неизвестная ошибка:', e)
  }
})

bot.start()
console.log('Бот запущен...')

export async function notifyAdmin(message) {
  try {
    await bot.api.sendMessage(ADMIN_ID, `${message}`, {
      parse_mode: 'HTML',
    })
    console.log('Уведомление администратору успешно отправлено.')
  } catch (error) {
    console.error('Не удалось отправить уведомление администратору:', error)
  }
}

function escapeTelegramEntities(text) {
  return text.replace(/[_*[\]()~`>#+\-=|{}.!]/g, function (match) {
    return '\\' + match
  })
}
