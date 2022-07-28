const Util = {
  titleCase(string) {
    var sentence = string.toLowerCase().split(' ');
    for (var i = 0; i < sentence.length; i++) {
      sentence[i] = sentence[i][0].toUpperCase() + sentence[i].slice(1);
    }
    // document.write(sentence.join(' '));
    return sentence.join(' ');
  },
  isWebView() {
    // return true;

    var standalone = window.navigator.standalone,
      userAgent = window.navigator.userAgent.toLowerCase(),
      safari = /safari/.test(userAgent),
      ios = /iphone|ipod|ipad/.test(userAgent);
    if (ios) {
      if (!standalone && safari) {
        // Safari
      } else if (!standalone && !safari) {
        // iOS webview
        return true;
      }
    } else {
      if (userAgent.includes('wv')) {
        // Android webview
        return true;
      } else {
        // Chrome
      }
    }
    return false;
  },
  sendDataToReactNative(message) {
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(message);
  },
};

export default Util;
