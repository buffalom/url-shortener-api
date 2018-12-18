#!/usr/bin/env node
 
import program from 'commander'
import inquirer from 'inquirer'
import logger from '../src/utils/logger'

import mongoose from 'mongoose'
import connection from '../src/utils/mongo'




// Hacky fix for babel-node options that should be ignored by babel-node but not by this script
process.argv.splice(process.argv.findIndex(a => a === '--'), 1)


/*
 * Set cli options
 */
program
  .version('0.1.0')
  .option('-c, --clear-db', 'Clear database')

program.parse(process.argv);

/*
 * Make connection to database
 */
connection.then(async _ => {
  /*
   * Clear database
   */
  if (program.clearDb) {
    let { clear } = await inquirer.prompt([
      { name: 'clear', type: 'confirm', message: 'Are you sure about clearing the whole database?', default: false }
    ])
    if (!clear) {
      logger.logInfo('Aborting')
      process.exit(0)
    }

    for (let collection of await mongoose.connection.db.collections()) {
      await mongoose.connection.db.dropCollection(collection.s.name)
    }

    logger.logInfo('Successfully cleared database');
  }

  mongoose.connection.close()
})
