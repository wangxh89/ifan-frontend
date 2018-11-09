#!/usr/bin/env node
/**
 * Created by spy on 14-3-12.
 */
//
// This hook copies various resource files from our version control system directories into the appropriate platform specific location
//


var fs = require('fs');
var path = require('path');

// no need to configure below
var rootdir = process.argv[2];

// configure all the files to copy.  Key of object is the source file, value is the destination location.
// It's fine to put all platforms' icons and splash screen files here,
// even if we don't build for all platforms on each developer's box.
var
  filestocopy = [
    {//默认drawable,是48*48
      "res/icons/android/icon-48-mdpi.png": "platforms/android/res/drawable/icon.png"
    },
    {
      "res/icons/android/icon-36-ldpi.png": "platforms/android/res/drawable-hdpi/icon.png"
    },
    {
      "res/icons/android/icon-48-mdpi.png": "platforms/android/res/drawable-ldpi/icon.png"
    },
    {
      "res/icons/android/icon-72-hdpi.png": "platforms/android/res/drawable-mdpi/icon.png"
    },
    {
      "res/icons/android/icon-96-xhdpi.png": "platforms/android/res/drawable-xhdpi/icon.png"
    },
    {//默认drawable文件夹，mdpi
      "res/screens/android/screen-mdpi-portrait.png": "platforms/android/res/drawable/screen.png"
    },
    {
      "res/screens/android/screen-hdpi-portrait.png": "platforms/android/res/drawable-hdpi/screen.png"
    },
    {
      "res/screens/android/screen-ldpi-portrait.png": "platforms/android/res/drawable-mdpi/screen.png"
    },
    {
      "res/screens/android/screen-mdpi-portrait.png": "platforms/android/res/drawable-xhdpi/screen.png"
    },
    {
      "res/screens/android/screen-xhdpi-portrait.png": "platforms/android/res/drawable-xhdpi/screen.png"
    },

    {
      "res/icons/ios/icon-57.png": "platforms/ios/YourAppName/Resources/icons/icon.png"
    },
    {
      "res/icons/ios/icon-57-2x.png": "platforms/ios/YourAppName/Resources/icons/icon@2x.png"
    },
    {
      "res/icons/ios/icon-72-2x.png": "platforms/ios/YourAppName/Resources/icons/icon-72@2x.png"
    },
    {
      "res/icons/ios/icon-72.png": "platforms/ios/YourAppName/Resources/icons/icon-72.png"
    },
    //Default@2x~iphone.png,Default-568h@2x~iphone.png,Default~iphone.png
    //Default-Portrait~ipad.png,Default-Portrait@2x~ipad.png
    {
      "res/screens/ios/screen-ipad-landscape.png": "platforms/ios/YourAppName/Resources/splash/Default@2x~iphone.png"
    },
    {
      "res/screens/ios/screen-ipad-landscape-2x.png": "platforms/ios/YourAppName/Resources/splash/Default-568h@2x~iphone.png"
    },
    {
      "res/screens/ios/screen-ipad-portrait.png": "platforms/ios/YourAppName/Resources/splash/Default~iphone.png"
    },
    {
      "res/screens/ios/screen-ipad-portrait-2x.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait~ipad.png"
    },
    {
      "res/screens/ios/screen-iphone-landscape.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait@2x~ipad.png"
    },
    {
      "res/screens/ios/screen-iphone-landscape-2x.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait@2x~ipad.png"
    },
    {
      "res/screens/ios/screen-iphone-portrait.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait@2x~ipad.png"
    },
    {
      "res/screens/ios/screen-iphone-portrait-2x.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait@2x~ipad.png"
    },
    {
      "res/screens/ios/screen-iphone-portrait-568h-2x.png": "platforms/ios/YourAppName/Resources/splash/Default-Portrait@2x~ipad.png"
    }
  ];
//
filestocopy.forEach(function (obj) {
  Object.keys(obj).forEach(function (key) {
    var val = obj[key];
    var srcfile = path.join(rootdir, key);
    var destfile = path.join(rootdir, val);
    console.log("copying " + srcfile + " to " + destfile);
    var destdir = path.dirname(destfile);

    if (key.indexOf('android') != -1) {
      if (fs.existsSync(srcfile)) {
        fs.createReadStream(srcfile).pipe(fs.createWriteStream(destfile));
      }
    }


  });
});
