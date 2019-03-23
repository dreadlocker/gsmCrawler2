"use strict";

//#region get URLs for shown phones on this page
const samsungPhonesURLs = 'https://www.gsmarena.com/samsung-phones-9.php';
let phonesArr = [];
let id = 1;

require('isomorphic-fetch');

fetch(samsungPhonesURLs)
  .then((response) => {
    return response.text();
  })
  .then((html) => {
    require('./dom-parser')(html);
    const allPhonesUrlArr = Array.from($(".makers a")).map(html => html.href);
    return Promise.resolve(allPhonesUrlArr);
    //#endregion
  })
  .then((allPhonesUrlArr) => {
    for (let index = 0; index < allPhonesUrlArr.length; index++) {  
      const link = `https://www.gsmarena.com/${allPhonesUrlArr[index]}`;
      const phoneObj = {
        model: "",
        image: "",
        description: "",
        timesLiked: 0,
        id: id
      };

      const timeOut = ((Math.floor(Math.random() * (3 - 1 + 1)) + 1) + index) * 1000;
      const waiting = `${index} of ${allPhonesUrlArr.length}`;
      setTimeout(() => {
        //#region go through every phone web page and get data for it
        fetch(link)
          .then((response) => {
            return response.text();
          })
          .then((html) => {
            require('./dom-parser')(html);

            phoneObj.model = $('.specs-phone-name-title')[0].innerHTML;
            if ($('.specs-photo-main > a > img')[0] === undefined) {
              phoneObj.image = $('.specs-photo-main > img')[0].src;
            } else {
              phoneObj.image = $('.specs-photo-main > a > img')[0].src;
            }

            const descriptionObj = {};
            const specsAnchorTagArr = Array.from($('.ttl')).slice(1, ).map(obj => obj.innerHTML);
            const infoAnchorTagArr = Array.from($('.nfo')).slice(1, ).map(obj => obj.innerHTML);
            let prevKeyOfDescriptionObj = '';
            for (let i = 0; i < specsAnchorTagArr.length; i++) {
              let specsStr = specsAnchorTagArr[i].trim();
              let infoStr = infoAnchorTagArr[i].trim();

              if (infoStr.includes('<br>')) infoStr = infoStr.replace(/<br>/gm, ', ');
              if (infoStr.includes('&nbsp;')) infoStr = infoStr.replace(/ &nbsp;/gm, '');
              if (infoStr.includes('&amp;')) infoStr = infoStr.replace(/&amp;/gm, '&');
              if (infoStr.includes('<sup>')) infoStr = infoStr.replace(/<sup>\d+<\/sup>/gm, '²');
              if (infoStr.includes('\n')) infoStr = infoStr.replace(/\n/gm, '');
              if (specsStr === '&nbsp;') {
                (descriptionObj[prevKeyOfDescriptionObj] === undefined) 
                  ? descriptionObj[' '] = infoStr 
                  : descriptionObj[prevKeyOfDescriptionObj] += `, ${infoStr}`;
              }
              if (specsStr.includes('href')) {
                specsStr = (/(>)(\w+|\w+\s+\w+|\w+.\w+\s+\w+|\w+-\w+)(<)/g).exec(specsStr)[2];
                descriptionObj[specsStr] = infoStr;
              }

              prevKeyOfDescriptionObj = specsStr;
            }

            phoneObj.description = descriptionObj;
            phonesArr.push(phoneObj);
            return Promise.resolve();
          })
          .then(() => {
            console.log(waiting);
            if (index === allPhonesUrlArr.length - 1) {
              phonesArr = phonesArr.sort((a, b) => a.id - b.id);
              // paste logged phonesArr in pasteJSONhere.js to align the array
              console.log(JSON.stringify(phonesArr));
            }
          })
          //#endregion
      }, timeOut); // get data from webpages every 1 to 3 seconds so you don't get banned

      id++;
    }
  });