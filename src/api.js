const axios = require('axios')
let url = (process.env.NODE_ENV === 'production')?'/':'http://localhost:4000'
if(window.mobileCheck() && process.env.NODE_ENV !== 'production') url = 'http://10.0.1.10:4000'
const baseAPI = axios.create({baseURL:url})
const join = (id,username)=>baseAPI.post('join',{id,username})
const create = (username,houseRule)=>baseAPI.post('create',{username,houseRule})

module.exports = {join,create,baseAPI}