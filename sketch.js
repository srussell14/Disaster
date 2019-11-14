// code modified based on https://github.com/CodingTrain/website/blob/master/CodingChallenges/CC_057_Earthquake_Viz/P5/sketch.js

var introTime = 60 * 3;

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

var activeFilter = 'All';
var activeImage;
var volcanoImage;

function preload() {

  mapimg = loadImage(`${mapURL}${clon},${clat},${zoom}/${ww}x${hh}?access_token=${accesstoken}`);
  wildfireImage = loadImage('assets/wildfire.png');
  volcanoImage = loadImage('assets/volcano.png');
  stormImage = loadImage('assets/storm.png');
  seaiceImage = loadImage('assets/seaice.png');
  allImage = loadImage('assets/all.png');

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
}

function draw() {
  createCanvas(ww + 600, hh + 200);
  background(100);
  // shifts the draw the reference to the center of the image
  // since latitude and longitude starts from the center
  translate(width / 2, height / 2);
  imageMode(CENTER);
  rectMode(CENTER);
  textSize(20);

  // 0, 0 is now the middle of the canvas due to translate.
  // it would usually be the top left corner
  image(mapimg, 0, 0);

  //Introduction page

  if (frameCount < introTime) {
    background(100);
    textSize(46);
    textStyle(BOLD);
    text('Disaster Tracker', -260, 0);

    return;
  }

  //set the active image based on what button has been selected

	drawActiveImage();

  drawButton(getXFromLeft(150), getYFromTop(50), 200, 40, wildfireImage, 'All');
  drawButton(getXFromLeft(150), getYFromTop(150), 200, 40, wildfireImage, 'Wildfires');
  drawButton(getXFromLeft(150), getYFromTop(250), 200, 40, stormImage, 'Severe Storms');
  drawButton(getXFromLeft(150), getYFromTop(350), 200, 40, seaiceImage, 'Sea and Lake Ice');
  drawButton(getXFromLeft(150), getYFromTop(450), 200, 40, volcanoImage, 'Volcanoes');

  drawCoordinates();
}

//determin what button is being clicked and setting the active filter

function mousePressed() {
  var isOverlappingAllButton = isOverlappingButton(150, 50, 200, 40)
  if (isOverlappingAllButton) {
    activeFilter = 'All'
  }
  var isOverlappingWildfireButton = isOverlappingButton(150, 150, 200, 40)
  if (isOverlappingWildfireButton) {
    activeFilter = 'Wildfires'
  }
  var isOverlappingSevereStormsButton = isOverlappingButton(150, 250, 200, 40)
  if (isOverlappingSevereStormsButton) {
    activeFilter = 'Severe Storms'
  }
  var isOverlappingSeaAndLakeIceButton = isOverlappingButton(150, 350, 200, 40)
  if (isOverlappingSeaAndLakeIceButton) {
    activeFilter = 'Sea and Lake Ice'
  }
  var isOverlappingVolcanoesButton = isOverlappingButton(150, 450, 200, 40)
  if (isOverlappingVolcanoesButton) {
    activeFilter = 'Volcanoes'
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
  if (activeFilter === 'Wildfires') {
    activeImage = wildfireImage;
  }
  else if (activeFilter === 'All') {
    activeImage = allImage;
  }
  else if (activeFilter === 'Volcanoes') {
    activeImage = volcanoImage;
  }
  else if (activeFilter === 'Severe Storms') {
    activeImage = stormImage;
  }
  else if (activeFilter === 'Sea and Lake Ice') {
    activeImage = seaiceImage;
  }

  image(activeImage, getXFromLeft(150), getYFromTop(570), 200, 100);
}

//function to draw event dots

function drawCoordinates() {
	for (var i = 0; i < eonetData.events.length; i++) {
    var lon = eonetData.events[i].geometries[0].coordinates[0]
    var lat = eonetData.events[i].geometries[0].coordinates[1]
    var category = eonetData.events[i].categories[0].title
    var x = mercX(lon) - cx;
    var y = mercY(lat) - cy;

    // checking if the x value is out of bounds and
    // moving it back in
    if(x < -width/2) {
      x += width;
    } else if(x > width / 2) {
      x -= width;
    }

    if ((y + iconHeight / 2) > hh / 2) {
      continue;
    }

    var pink = color(255,0,255);
    var green = color(0,255,0);
    var blue = color(0,0,255);
    var yellow = color(255, 255, 0);

    if (category === 'Wildfires' && (activeFilter === 'All' || activeFilter === 'Wildfires') ) {
      stroke(pink);
      fill(pink);
      ellipse(x, y, iconWidth, iconHeight);
    }
    else if (category === 'Severe Storms' && (activeFilter === 'All' || activeFilter === 'Severe Storms')) {
      stroke(blue);
      fill(blue);
      ellipse(x, y, iconWidth, iconHeight);
    }
    else if (category === 'Sea and Lake Ice' && (activeFilter === 'All' || activeFilter === 'Sea and Lake Ice')) {
      stroke(green);
      fill(green);
      ellipse(x, y, iconWidth, iconHeight);
    }
    else if (category === 'Volcanoes' && (activeFilter === 'All' || activeFilter === 'Volcanoes')) {
      stroke(yellow);
      fill(yellow);
      ellipse(x, y, iconWidth, iconHeight);
    }
  }
}

//displays button

function drawButton(x, y, buttonWidth, buttonHeight, buttonImage, buttonText) {
  noStroke()
  if (activeFilter === buttonText) {
// active button color
    fill(63,80,163);
  }
// default button color
  else {
    fill(128,160,249);
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
