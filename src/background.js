"use strict"

// With background scripts you can communicate with popup
// and contentScript files.
// For more information on background script,
// See https://developer.chrome.com/extensions/background_pages

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "GREETINGS") {
    const message = `Hi ${
      sender.tab ? "Con" : "Pop"
    }, my name is Bac. I am from Background. It's great to hear from you.`

    // Log message coming from the `request` parameter
    console.log(request.payload.message)
    // Send a response message
    sendResponse({
      message,
    })
  }
})

chrome.action.onClicked.addListener((tab) => {
  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: () => {
      console.log({ tab })
    },
    args: ["action"],
  })
})

chrome.commands.onCommand.addListener(async (command, tab) => {
  console.log({ command, tab, chrome, tabs: chrome.tabs })
  const data = await chrome.tabs.captureVisibleTab(null, { format: "png", quality: 50 })
  console.log({ data })
})
