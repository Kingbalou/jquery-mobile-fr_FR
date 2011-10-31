<pre>
ATTENTION : Ce d�p�t est une copie du d�p�t officiel sur github du [Framework jQuery Mobile : https://github.com/jquery/jquery-mobile](https://github.com/jquery/jquery-mobile)

Le but de ce d�p�t est de permettre une traduction compl�te de la documentation de jQuery Mobile en fran�ais.

Cette partie de la documentation est en cours de traduction. Cela signifie qu'elle est traduite de mani�re soit incompl�te, soit inexacte. En attendant que cette traduction soit termin�e, vous pouvez consulter la [version en anglais](https://github.com/jquery/jquery-mobile) pour des informations plus fiables.
</pre>

Framework jQuery Mobile (Traduction fran�aise)
==============================================
[Site Officiel: http://jquerymobile.com](http://jquerymobile.com)

[Demos et Documentation](http://jquerymobile.com/test/)

Comment construire vos propres fichiers JS et CSS pour jQuery Mobile CSS and JS files
=====================================================================================
Clonez ce d�p�t et contruisez les fichiers js et css (vous aurez besoin que Git et Make soient install�s) :

    git clone git://github.com/jquery/jquery-mobile.git
    cd jquery-mobile
    make

A full version and a minified version of the jQuery Mobile JavaScript and CSS files will be created 
in a folder named "compiled". There is also now a Structure only css file so you can add your own theme on top of it.

Submitting bugs
===============
If you think you've found a bug, please report it by following these instructions:  

1. Visit the [Issue tracker: https://github.com/jquery/jquery-mobile/issues](https://github.com/jquery/jquery-mobile/issues)
2. Create an issue explaining the problem and expected result
    - Be sure to include any relevant information for reproducing the issue
    - Include information such as:
        * Browser/device (with version #)
        * The version of the jQuery Mobile code you're running
        * If you are running from a git version, include the date and/or hash number
    - Make sure that the bug still exists at http://jquerymobile.com/test/ as it may be fixed already
    - You can use the CDN hosted JS and CSS files to test in your own code by using:
        * [JS](http://code.jquery.com/mobile/latest/jquery.mobile.min.js)
        * [CSS](http://code.jquery.com/mobile/latest/jquery.mobile.min.css)
    - Include a link to some code of the bug in action. You can use either of these services to host your code
        * [jsbin](http://jsbin.com)
        * [jsfiddle](http://jsfiddle.net)
3. Submit the issue.

Submitting patches
==================
To contribute code and bug fixes to jQuery Mobile: fork this project on Github, make changes to the code in your fork, 
and then send a "pull request" to notify the team of updates that are ready to be reviewed for inclusion.

Detailed instructions can be found at [jQuery Mobile Patching](https://gist.github.com/1294035)

Running the jQuery Mobile demos & docs locally
==============================================
To preview locally, you'll need to clone a local copy of this repository and point your Apache & PHP webserver at its 
root directory (a webserver is required, as PHP and .htaccess are used for combining development files).

If you don't currently have a webserver running locally, there are a few options. 

If you're on a Mac, you can try dropping jQuery Mobile into your sites folder and turning on Web Sharing via System 
Prefs. From there, you'll find a URL where you can browse folders in your sites directory from a browser.

Another quick way to get up and running is to download and install MAMP for Mac OSX. Once installed, just open MAMP, 
click preferences, go to the Apache tab, and select your local jQuery Mobile folder as the root. Then you can open a 
browser to http://localhost:8888 to preview the code.

Another alternative is XAMPP (Mac, Windows). You need to actually modify Apache's httpd.conf to point to your checkout:
[Instructions](http://www.apachefriends.org/en/xampp.html)

You need the following Apache modules loaded:

* Rewrite (mod\_rewrite.so)
* Expire (mod\_expires.so)
* Header (mod\_headers.so)

Building With A Custom Theme
============================
To use a custom theme in your own build, you'll need Make installed. You can find the themes in the CSS/Themes folder.
To create a new theme:

1. Copy the `Default` folder from CSS/Themes to a new folder in the same location. The name of the folder will be the
theme's name. For testing locally, make sure the index.php file is copied as well.
2. Edit the `jquery.mobile.theme.css` file so it contains your custom fonts and colors.
3. Once you are done editing your files and saving them, open a terminal.
4. Navigate to the jQuery-Mobile folder's root.
5. Run the following command to build jQuery-Mobile. The CSSTHEME specifies what theme to include. If you leave it off,
it will build using the "default" theme.

    make CSSTHEME=YourThemeName
    
6. The compiled files will be located in the "compiled" folder in the root of jQuery-Mobile.