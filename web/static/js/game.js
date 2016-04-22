import _ from 'lodash';
var game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: preload, create: create, update: update });

function preload() {
  game.load.image('sky', 'images/sky.png');
  game.load.image('ground', 'images/platform.png');
  game.load.image('star', 'images/star.png');
  game.load.spritesheet('dude', 'images/dude.png', 32, 48);
  game.stage.disableVisibilityChange = true;
}

var thisPlayer;
var players = {};
var platforms;
var cursors;
var stars;
var score = 0;
var scoreText;

function create() {
  game.time.advancedTiming = true;
  //  We're going to be using physics, so enable the Arcade Physics system
  game.physics.startSystem(Phaser.Physics.ARCADE);

  //  A simple background for our game
  game.add.sprite(0, 0, 'sky');
  scoreText = game.add.text(16, 16, 'Score: 0', { fontSize: '32px', fill: '#000' });

  platforms = game.add.group();
  platforms.enableBody = true;

  var ground = platforms.create(0, game.world.height - 64, 'ground');
  ground.scale.setTo(2, 2);
  ground.body.immovable = true; //  This stops it from falling away when you jump on it

  thisPlayer = addPlayer();
  game.physics.arcade.enable(thisPlayer);
  thisPlayer.body.gravity.y = 300;
  thisPlayer.body.collideWorldBounds = true;

  thisPlayer.animations.add('left', [0, 1, 2, 3], 10, true);
  thisPlayer.animations.add('right', [5, 6, 7, 8], 10, true);
  players[window.playerId] = thisPlayer;

  //  Now let's create two ledges
  var ledge = platforms.create(400, 400, 'ground');
  ledge.body.immovable = true;
  ledge = platforms.create(-150, 250, 'ground');
  ledge.body.immovable = true;

  cursors = game.input.keyboard.createCursorKeys();
  stars = game.add.group();
  stars.enableBody = true;
  for (var i = 0; i < 12; i++) {
    //  Create a star inside of the 'stars' group
    var star = stars.create(i * 70, 0, 'star');

    //  Let gravity do its thing
    star.body.gravity.y = 60;

    //  This just gives each star a slightly random bounce value
    star.body.bounce.y = Math.random() * 0.2;
  }
}

function update() {
  game.physics.arcade.collide(thisPlayer, platforms);
  game.physics.arcade.collide(stars, platforms);
  game.physics.arcade.overlap(thisPlayer, stars, collectStar, null, this);

  thisPlayer.body.velocity.x = 0;
  if (cursors.left.isDown) {
    //  Move to the left
    thisPlayer.body.velocity.x = -200;
    thisPlayer.animations.play('left');
  } else if (cursors.right.isDown) {
    thisPlayer.body.velocity.x = 200;
    thisPlayer.animations.play('right');
  } else {
    thisPlayer.animations.stop();
    thisPlayer.frame = 4;
  }
  if (cursors.up.isDown && thisPlayer.body.touching.down) {
    thisPlayer.body.velocity.y = -300;
  }

  if (!Phaser.Point.equals(thisPlayer.body.prev.floor(), thisPlayer.body.position.floor())) {
    window.movePlayer(thisPlayer.body.x, thisPlayer.body.y);
  }

  updateRemotePlayerPositions();
}

function updateRemotePlayerPositions() {
  addNewPlayers();
  _.each(players, function(playerObj, playerId) {
    if (playerId !== window.playerId) {
      playerObj.x = window.serverState[playerId].x;
      playerObj.y = window.serverState[playerId].y;
    }
  });
}

function addNewPlayers() {
  _.each(window.serverState, function(locationObj, playerId) {
    if (!_.includes(Object.keys(players), playerId)) {
      players[playerId] = addPlayer();
    }
  });
}

function collectStar (thisPlayer, star) {
  // Removes the star from the screen
  star.kill();
  score += 10;
  scoreText.text = 'Score: ' + score;
}

function addPlayer() {
  var player = game.add.sprite(32, game.world.height - 150, 'dude');
  return player;
}
