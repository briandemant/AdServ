"use strict";

// IE7 was the last not to have JSON.parse so we can remove the backup (loog in git if you need it)
var parseJSON = JSON.parse;

AdServ.parseJSON = parseJSON;