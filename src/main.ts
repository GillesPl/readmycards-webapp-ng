import { enableProdMode, TRANSLATIONS, TRANSLATIONS_FORMAT } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();

  // Enable Google Analytics
  document.write(`  <!-- Google Analytics -->
  <script>
    (function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
      (i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
      m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
    })(window,document,'script','https://www.google-analytics.com/analytics.js','ga');
    ga('create', 'UA-XXXXX-Y', 'none');
  </script>
  <!-- End Google Analytics -->`);
}

// use the require method provided by webpack
declare const require;

// check if pkcs11-config is present and set if necessary
let pkcs11 = localStorage.getItem('rmc-pkcs11-config');
if (!pkcs11) {
  pkcs11 = JSON.stringify({
    linux: '/usr/local/lib/libeTPkcs11.so',
    mac: '/usr/local/lib/libeTPkcs11.dylib',
    win: 'C:\\Windows\\System32\\eTPKCS11.dll'
  });
  localStorage.setItem('rmc-pkcs11-config', pkcs11);
}

// retrieve locale and set default if none is set
let locale = localStorage.getItem('rmc-locale');
if (!locale) {
  locale = 'en';
  localStorage.setItem('rmc-locale', locale);
}
// we use the webpack raw-loader to return the content as a string
const translations = require(`raw-loader!./locale/messages.${locale}.xlf`);

platformBrowserDynamic().bootstrapModule(AppModule, { providers: [
    { provide: TRANSLATIONS, useValue: translations },
    { provide: TRANSLATIONS_FORMAT, useValue: 'xlf' }
  ]});
