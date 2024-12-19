chrome.webRequest.onHeadersReceived.addListener(
  function(details) {
    var headers = details.responseHeaders;
    for (var i = 0; i < headers.length; ++i) {
      if (headers[i].name.toLowerCase() === 'access-control-allow-origin') {
        headers[i].value = '*';
      } else if (headers[i].name.toLowerCase() === 'access-control-allow-headers') {
        headers[i].value = '*';
      }
    }
    return {responseHeaders: headers};
  },
  {urls: ["https://ichemlabs.cloud.chemdoodle.com/*"]},
  ["responseHeaders", "extraHeaders"]
);