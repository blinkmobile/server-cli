'use strict'

module.exports.post = function (req, res) {
  const companies = [
    {
      ABN: '1',
      companyName: 'Bobs burgers'
    },
    {
      ABN: '2',
      companyName: 'Roberts burgers'
    }
  ]
  // access the submission data from the request body
  if (req.body && req.body.submission && req.body.submission.abn) {
    const abn = req.body.submission.abn
    const details = companies.find(company => company.ABN === abn)
    if (details) {
      // set the response code and set body as form pre-fill data using 'element name': 'value'
      res.setStatusCode(200)
        .setPayload({
          'Company_name': details.companyName
        })
    } else {
      res.setStatusCode(404)
    }
  } else {
    res.setStatusCode(400)
  }
}
