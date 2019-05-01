'use strict'

// require the OneBlink SDK
const OneBlink = require('@oneblink/sdk')

const warehouses = [
  {
    warehouseNumber: '1',
    assets: [
      'crane',
      'forklift',
      'hammer',
      'drill'
    ]
  },
  {
    warehouseNumber: '2',
    assets: [
      'lightsaber',
      'pod-racer seat',
      'hyper-drive'
    ]
  }
]

module.exports.post = async function (req, res) {
  // If the request does not contain the essential data to process,
  // finish early with a custom error message for the user to see.
  if (
    !req.body ||
    !req.body.submission ||
    !req.body.submission.warehouseNumber
  ) {
    // A user friendly error message can be shown to the user in One Blink Forms
    // by returning a 400 Status code and a JSON payload with a `message` property.
    // There is no character limit, however it is suggested to keep the message
    // short and clear.
    return res
      .setStatusCode(400)
      .setPayload({
        'message': 'This is my custom friendly error message that will be shown to the user on a failed lookup'
      })
  }

  // Access the submission data from the request body.
  const warehouseNumber = req.body.submission.warehouseNumber
  const assets = warehouses.find(warehouse => warehouse.warehouseNumber === warehouseNumber)

  if (assets) {
    // Loop through all assets and create an element for each using the SDK.
    const elements = []

    for (const asset in assets) {
      // Configure the element data as a basic yes/no set of radio buttons using the asset name in the label.
      const elementData = {
        name: asset,
        label: `Is the ${asset} present in the warehouse?`,
        type: 'radio',
        buttons: 'true',
        options: [
          {
            value: 'yes',
            label: 'yes'
          },
          {
            value: 'no',
            label: 'no'
          }
        ]
      }
      try {
        // Send the above basic data to the SDK to generate a form element.
        const element = await OneBlink.Forms.generateFormElement(elementData)
        elements.push(element)
      } catch (error) {
        // Silently fail on any validation errors so other elements in the loop aren't affected.
        console.error('error generating element for the following: ', elementData)
      }
    }

    // Set the response code and set body as the array of form elements.
    return res
      .setStatusCode(200)
      .setPayload(elements)
  }

  return res
    .setStatusCode(400)
    .setPayload({
      'message': 'Could not find the warehouse number you were looking for.'
    })
}
