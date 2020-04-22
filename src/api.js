const axios = require('axios')
const url = (process.env.NODE_ENV === 'production')?'/':'http://localhost:4000'

const baseAPI = axios.create({baseURL:url})
const join = (id,username)=>baseAPI.post('join',{id,username})
const create = (username)=>baseAPI.post('create',{username})

module.exports = {join,create}