declare var FB:any;
declare var window: any;

export class FBConnector {

  constructor() {
    if (!window.fbAsyncInit) {
      window.fbAsyncInit = function() {
        FB.init({
          appId: '850835344955953',
          xfbml: true,
          version: 'v2.5'
        });
      };
    }
  }

  initFB() {
    var js,
      id = 'facebook-jssdk',
      ref = document.getElementsByTagName('script')[0];

    if (document.getElementById(id)) {
      return;
    }

    js = document.createElement('script');
    js.id = id;
    js.async = true;
    js.src = "//connect.facebook.net/en_US/sdk.js";

    ref.parentNode.insertBefore(js, ref);
  }

}