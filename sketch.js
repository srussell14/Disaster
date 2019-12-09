// using mapbox for map image https://www.mapbox.com/
var mapURL = 'https://api.mapbox.com/styles/v1/mapbox/dark-v9/static/'
// https://docs.mapbox.com/help/glossary/access-token/
var accesstoken = 'pk.eyJ1Ijoic2pydXNzZWxsIiwiYSI6ImNrMm9lbjVwNTEyc3UzbW8zNDZiYm0xZWQifQ.moB7avd4ny_jHoGTGDvASA'

var mapimg;
var wildfireImg;

var clat = 0;
var clon = 0;
var cx;
var cy;

var ww = 1024;
var hh = 512;

var zoom = 1;

var eonetData;

var iconWidth = 8;
var iconHeight = 8;

var activeFilter = 0;
var activeImage;
var activeLanguage = 'English';

var volcanoImage, stormImage, seaiceImage, allImage, earthquakeImage;

var backgroundImage, background2;

var currentPage = 1;
var events;
var eventButtonInitialHeight = 150;

var framesIn5Seconds = 30 * 5; // 30 frames per second * 5 seconds

var pink;
var green;
var blue;
var yellow;
var brown;

function preload() {

  backgroundImage = loadImage('assets/background.png');
  background2 = loadImage('assets/background2.png')
  mapimg = loadImage(`${mapURL}${clon},${clat},${zoom}/${ww}x${hh}?access_token=${accesstoken}`);
  wildfireImage = loadImage('assets/wildfire.png');
  volcanoImage = loadImage('assets/volcano.png');
  stormImage = loadImage('assets/storm.png');
  seaiceImage = loadImage('assets/seaice.png');
  earthquakeImage = loadImage('assets/earthquake.png');
  allImage = loadImage('assets/all.png');
  logo = loadImage('assets/logo.png')

  activeImage = allImage;

  // https://eonet.sci.gsfc.nasa.gov/docs/v2.1
  eonetData = loadJSON('https://eonet.sci.gsfc.nasa.gov/api/v2.1/events');
}

// Formulas for mapping lat and lon to pixels from
// https://en.wikipedia.org/wiki/Web_Mercator_projection

function mercX(lon) {
  // converts longitude from degrees to radians since
  // the formula expects radians to correctly convert
  // the longitude
  // https://p5js.org/reference/#/p5/radians
  lon = radians(lon);

  // https://p5js.org/reference/#/p5/pow
  var a = (256 / PI) * pow(2, zoom);
  var b = lon + PI;
  return a * b;
}

function mercY(lat) {
  // converts lat to radians for the same reason as
  // longitude
  lat = radians(lat);
  var a = (256 / PI) * pow(2, zoom);
  var b = tan(PI / 4 + lat / 2);
  var c = PI - log(b);

  return a * c;
}

function setup() {

  // setting the center of the canvas and the center of the canvas is set to the center
  // longitude and latitude

  cx = mercX(clon);
  cy = mercY(clat);

  pink = color(255, 0, 255);
  green = color(0, 255, 0);
  blue = color(0, 0, 255);
  yellow = color(255, 255, 0);
  brown = color(100, 59, 10);
}

function draw() {
  createCanvas(ww + 600, hh + 200);

  // shifts the draw the reference to the center of the image
  // since latitude and longitude starts from the center
  translate(width / 2, height / 2);
  imageMode(CENTER);
  rectMode(CENTER);
  textSize(20);

  if (currentPage === 1) {
    if (frameCount > framesIn5Seconds) {
      currentPage = 2
    }
    else {
      drawIntro();
    }
  }
  else if (currentPage === 2) {
    drawMap();
  }
}

function drawIntro() {
  fill(0)
  image(backgroundImage, 0, 0, width, height);
  image(logo, -width/2 + 390, -height/2 + 120);

  textSize(20);
  textStyle(BOLD);
  text('SELECT LANGUAGE', getXFromLeft(50), getYFromTop(250));
  drawButton(getXFromLeft(150), getYFromTop(250 + 75 * 1), 200, 40, 'English');
  drawButton(getXFromLeft(150), getYFromTop(250 + 75 * 2), 200, 40, 'German');
  drawButton(getXFromLeft(150), getYFromTop(250 + 75 * 3), 200, 40, 'Spanish');
  drawButton(getXFromLeft(150), getYFromTop(250 + 75 * 4), 200, 40, 'French');
  drawButton(getXFromLeft(150), getYFromTop(250 + 75 * 5), 200, 40, 'Chinese');
}

function drawMap() {
  image(background2, 0, 0, width, height);
  // 0, 0 is now the middle of the canvas due to translate.
  // it would usually be the top left corner
  image(mapimg, 0, 0);
  var logoW = 785
  var logoH = 249
  image(logo, -width/2 + 154, -height/2 + 47, logoW / 2.5, logoH / 2.5);

  //set the active image based on what button has been selected

  drawActiveImage();

  var buttonNames = {
    "English": [
      'All',
      'Wildfires',
      'Severe Storms',
      'Sea and Lake Ice',
      'Volcanoes',
      'Earthquakes'
    ],
    "Spanish": [
      'Todos',
      'Incendios Forestales',
      'Tormentas Severas',
      'Mar y Lago de Hielo',
      'Volcanes',
      'Temblores'
    ],
    "German": [
      'Alle',
      'Waldbrände',
      'Schwere Stürme',
      'See- und Seeeis',
      'Vulkane',
      'Erdbeben'
    ],
    "French": [
      'Tout',
      'Incendies de forêt',
      'Tempêtes violentes',
      'Glace de mer et de lac',
      'Volcans',
      'Tremblements de terre'
    ],
    "Chinese": [
      '所有',
      '野火',
      '暴风雨',
      '大海和湖泊冰',
      '火山',
      '大地震'
    ],
  }

  var ids = [0,8,10,15,12,16]

  for (var i = 0; i < buttonNames[activeLanguage].length; i++) {
    drawButton(getXFromLeft(150), getYFromTop(eventButtonInitialHeight + 75 * i), 230, 40, buttonNames[activeLanguage][i], ids[i]);
  }

  drawCoordinates();
}

//determin what button is being clicked and setting the active filter

function mousePressed() {
  if (currentPage === 1) {
    if (isOverlappingButton(150, 250 + 75 * 1, 200, 40)) {
      activeLanguage = 'English'
      currentPage = 2;
    }
    else if (isOverlappingButton(150, 250 + 75 * 2, 200, 40)) {
      activeLanguage = 'German'
      currentPage = 2;
    }
    else if (isOverlappingButton(150, 250 + 75 * 3, 200, 40)) {
      activeLanguage = 'Spanish'
      currentPage = 2;
    }
    else if (isOverlappingButton(150, 250 + 75 * 4, 200, 40)) {
      activeLanguage = 'French'
      currentPage = 2;
    }
    else if (isOverlappingButton(150, 250 + 75 * 5, 200, 40)) {
      activeLanguage = 'Chinese'
      currentPage = 2;
    }
  }

  else if (currentPage === 2) {
    var isOverlappingAllButton = isOverlappingButton(150, eventButtonInitialHeight, 200, 40)
    var isOverlappingWildfireButton = isOverlappingButton(150, eventButtonInitialHeight + 75 * 1, 200, 40)
    var isOverlappingSevereStormsButton = isOverlappingButton(150, eventButtonInitialHeight + 75 * 2, 200, 40)
    var isOverlappingSeaAndLakeIceButton = isOverlappingButton(150, eventButtonInitialHeight + 75 * 3, 200, 40)
    var isOverlappingVolcanoesButton = isOverlappingButton(150, eventButtonInitialHeight + 75 * 4, 200, 40)
    var isOverlappingEarthquakesButton = isOverlappingButton(150, eventButtonInitialHeight + 75 * 5, 200, 40)

    if (isOverlappingAllButton) {
      activeFilter = 0
    }
    else if (isOverlappingWildfireButton) {
      activeFilter = 8
    }
    else if (isOverlappingSevereStormsButton) {
      activeFilter = 10
    }
    else if (isOverlappingSeaAndLakeIceButton) {
      activeFilter = 15
    }
    else if (isOverlappingVolcanoesButton) {
      activeFilter = 12
    }
    else if (isOverlappingEarthquakesButton) {
      activeFilter = 16
    }
  }
}

// functions to make it easier to get x
// and y positions from left and top like normal

function getXFromLeft(x) {
  return -width / 2 + x;
}

function getYFromTop(y) {
  return -height / 2 + y;
}

//switching out the image of the active event

function drawActiveImage() {
  if (activeFilter === 8) {
    activeImage = wildfireImage;
  } else if (activeFilter === 0) {
    activeImage = null;
  } else if (activeFilter === 12) {
    activeImage = volcanoImage;
  } else if (activeFilter === 10) {
    activeImage = stormImage;
  } else if (activeFilter === 15) {
    activeImage = seaiceImage;
  } else if (activeFilter === 16) {
    activeImage = earthquakeImage;
  }

  if (activeImage) {
    image(activeImage, getXFromLeft(150), getYFromTop(620), 200, 100);
  }
}

//function to draw event dots

function drawCoordinates() {
  for (var i = 0; i < eonetData.events.length; i++) {
    var lon = eonetData.events[i].geometries[0].coordinates[0]
    var lat = eonetData.events[i].geometries[0].coordinates[1]
    var category = eonetData.events[i].categories[0].id
    var x = mercX(lon) - cx;
    var y = mercY(lat) - cy;

    // checking if the x value is out of bounds and
    // moving it back in
    if (x < -width / 2) {
      x += width;
    } else if (x > width / 2) {
      x -= width;
    }

    if ((y + iconHeight / 2) > hh / 2) {
      continue;
    }

    if (category === 8 && (activeFilter === 0 || activeFilter === 8)) {
      stroke(pink);
      fill(pink);
      ellipse(x, y, iconWidth, iconHeight);
    } else if (category === 10 && (activeFilter === 0 || activeFilter === 10)) {
      stroke(blue);
      fill(blue);
      ellipse(x, y, iconWidth, iconHeight);
    } else if (category === 15 && (activeFilter === 0 || activeFilter === 15)) {
      stroke(green);
      fill(green);
      ellipse(x, y, iconWidth, iconHeight);
    } else if (category === 12 && (activeFilter === 0 || activeFilter === 12)) {
      stroke(yellow);
      fill(yellow);
      ellipse(x, y, iconWidth, iconHeight);
    } else if (category === 16 && (activeFilter === 0 || activeFilter === 16)) {
      stroke(brown);
      fill(brown);
      ellipse(x, y, iconWidth, iconHeight);
    }
  }
}

//displays button

function drawButton(x, y, buttonWidth, buttonHeight, buttonText, id) {
  textSize(20)
  noStroke()

  if (activeFilter === id) {
    fill(255)
  }
  // default button color
  else {
    fill(128, 160, 249);
  }
  rect(x, y, buttonWidth, buttonHeight);
  // image(buttonImage, x + buttonWidth / 2 - 10, y, 40, 20);
  fill(0);
  text(buttonText, x - buttonWidth / 2 + 10, y + 6);
}

//detects if a click occures in a certain region

function isOverlappingButton(buttonX, buttonY, buttonWidth, buttonHeight) {
  var isInsideLeftEdge = mouseX > (buttonX - buttonWidth / 2);
  var isInsideRightEdge = mouseX < (buttonX + buttonWidth / 2);
  var isAboveBottomEdge = mouseY < (buttonY + buttonHeight / 2);
  var isBelowTopEdge = mouseY > (buttonY - buttonHeight / 2);

  var isOverlapping = isInsideLeftEdge && isInsideRightEdge &&
    isAboveBottomEdge && isBelowTopEdge

  return isOverlapping;
}
