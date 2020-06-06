function getUrl(url, window) {
  var getUrl = window.location;
  var baseUrl = getUrl.protocol + "//" + getUrl.host + "/" + getUrl.pathname.split('/')[0];
  console.log(baseUrl + url);
  return baseUrl + url;
}
