const screenshot = {
  tab: 0,
  startX: 0,
  startY: 0,
  scrollX: 0,
  scrollY: 0,
  docHeight: 0,
  docWidth: 0,
  visibleWidth: 0,
  visibleHeight: 0,
  scrollXCount: 0,
  scrollYCount: 0,
  scrollBarX: 17,
  scrollBarY: 17,
  captureStatus: true,
  screenshotName: null,

  /**
   * Receive messages from content_script, and then decide what to do next
   */
  addMessageListener: function () {
    chrome.extension.onMessage.addListener(function (request, sender, response) {
      console.log(request)
      var obj = request
      switch (obj.msg) {
        case "capture_selected":
          screenshot.captureSelected()
          break
        case "capture_window":
          screenshot.captureWindow()
          break
        case "capture_area":
          screenshot.showSelectionArea()
          break
        case "capture_webpage":
          screenshot.captureWebpage()
          break
      }
    })
  },

  /**
   * Send the Message to content-script
   */
  sendMessage: function (message, callback) {
    chrome.tabs.getSelected(null, function (tab) {
      chrome.tabs.sendMessage(tab.id, message, callback)
    })
  },

  showSelectionArea: function () {
    screenshot.sendMessage({ msg: "show_selection_area" }, null)
  },

  captureWindow: function () {
    screenshot.sendMessage({ msg: "capture_window" }, screenshot.onResponseVisibleSize)
  },

  captureSelected: function () {
    screenshot.sendMessage({ msg: "capture_selected" }, screenshot.onResponseVisibleSize)
  },

  captureWebpage: function () {
    screenshot.sendMessage({ msg: "scroll_init" }, screenshot.onResponseVisibleSize)
  },

  onResponseVisibleSize: function (response) {
    switch (response.msg) {
      case "capture_window":
        screenshot.captureVisible(response.docWidth, response.docHeight)
        break
    }
  },

  captureScreenCallback: function (data) {
    var image = new Image()
    image.onload = function () {
      screenshot.canvas.width = image.width
      screenshot.canvas.height = image.height
      var context = screenshot.canvas.getContext("2d")
      context.drawImage(image, 0, 0)
      screenshot.postImage()
    }
    image.src = "data:image/bmp;base64," + data
  },

  captureVisible: function (docWidth, docHeight) {
    var formatParam = localStorage.screenshootQuality || "png"
    chrome.tabs.captureVisibleTab(null, { format: formatParam, quality: 50 }, function (data) {
      var image = new Image()
      image.onload = function () {
        var width = image.height < docHeight ? image.width - 17 : image.width
        var height = image.width < docWidth ? image.height - 17 : image.height
        screenshot.canvas.width = width
        screenshot.canvas.height = height
        var context = screenshot.canvas.getContext("2d")
        context.drawImage(image, 0, 0, width, height, 0, 0, width, height)
        screenshot.postImage()
      }
      image.src = data
    })
  },

  isThisPlatform: function (operationSystem) {
    return navigator.userAgent.toLowerCase().indexOf(operationSystem) > -1
  },

  init: function () {
    localStorage.screenshootQuality = localStorage.screenshootQuality || "png"
    screenshot.addMessageListener()
  },
}

screenshot.init()
