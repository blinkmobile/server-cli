'use strict'

// 'axios' is a popular promise based http library (https://github.com/axios/axios)
const axios = require('axios')

const instance = axios.create({
  baseURL: 'https://api.example.com'
})

module.exports.get = function(req, res) {
  // The autocomplete element will make the request with the it's current input sent as a query string of 'value'

  const value = req.url.query.value

  // Lets assume we're using a third party service for searching addresses
  // that takes in a query string to return a list of addresses that match the value

  instance.get(`/addresses?search=${value}`).then(response => {
    // it's important to refer to the documentation of the service you're using in order to understand
    // how the response body will be structured - we'll assume this response is an array of strings

    const addresses = response.data

    // To be compatible with the autocomplete element, options must be returned as an array of objects
    // containing all three of the properties below (id (must be unique), label, value)

    const options = addresses.map((address, index) => {
      return {
        id: index,
        label: address,
        value: address
      }
    })

    return res.setStatusCode(200).setPayload(options)
  })
}
