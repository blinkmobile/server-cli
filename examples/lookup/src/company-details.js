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
    // A user friendly error message can be shown to the user in One Blink Forms
    // by returning a 400 Status code and a JSON payload with a `message` property.
    // There is no character limit, however it is suggested to keep the message
    // short and clear.
    res.setStatusCode(400)
      .setPayload({
        'message': 'This is my custom friendly error message that will be shown to the user on a failed lookup'
      })
  }
}
