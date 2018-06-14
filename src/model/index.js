'use strict'

module.exports = {
    get history() {
        return require('./history')
    },

    get fare() {
        return require('./fare')
    },
    get token() {
        return require('./token')
    },
    get voucher() {
        return require('./voucher')
    }
}