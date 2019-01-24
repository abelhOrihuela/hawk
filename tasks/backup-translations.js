require('../config')
require('lib/databases/mongo')

const Task = require('lib/task')
const { Translation } = require('models')
const { mkdirSync } = require('lib/tools')
const fs = require('fs')

const task = new Task(async function (argv) {
  let langs = await Translation.find().distinct('lang')
  const translationsPath = './app/translations'
  await mkdirSync(translationsPath)
  for (let lang of langs) {
    let translations = await Translation.find({ lang: lang })
    translations = translations.map(t => {
      return {
        id: t.id,
        module: t.module,
        content: t.content
      }
    })
    fs.writeFileSync(`${translationsPath}/${lang}.json`, JSON.stringify(translations, null, 2))
  }

  return langs
})

if (require.main === module) {
  task.setCliHandlers()
  task.run()
} else {
  module.exports = task
}
