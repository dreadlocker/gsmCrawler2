 const { JSDOM } = require('jsdom'),
     initDomParser = (html) => {
         const dom = new JSDOM(html);
         return $ = require('jquery')(dom.window);
     };

 module.exports = initDomParser;