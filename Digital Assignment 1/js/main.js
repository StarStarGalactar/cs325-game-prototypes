// mods by Patrick OReilly 
// Twitter: @pato_reilly Web: http://patricko.byethost9.com

var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    game.load.image('dude', 'assets/sprites/MK1.gif');
    game.load.image('ball', 'assets/sprites/KingBaka.png');
    game.load.image('avoid','assets/sprites/whatabaka.png');
    game.load.image('background', 'assets/sprites/bombbackground.jpg');
    
}

var image;
var score = 50;
var scoreString = '';
var scoreText;
var knocker; 
var ball; 
var stateText; 
var stateText2;
var background; 

function create() {

    game.physics.startSystem(Phaser.Physics.ARCADE);
    background = game.add.tileSprite(0,0,800,600,"background");

    cursors = game.input.keyboard.createCursorKeys();
    
    //  This creates a simple sprite that is using our loaded image and
    //  displays it on-screen
    //  and assign it to a variable
    ball = game.add.sprite(200, 200, 'ball');
    balltwo = game.add.sprite(400, 200, 'avoid');
    ballthree =game.add.sprite(600, 200, 'avoid');

    knocker = game.add.sprite(0, 600, 'dude');

    game.physics.enable([knocker,ball,balltwo,ballthree], Phaser.Physics.ARCADE);

    knocker.body.immovable = true;
    knocker.body.collideWorldBounds = true; // character cannot go out of bounds
  
    scoreString = 'Rendezvous Left: ';
    scoreText = game.add.text(10, 10, scoreString + score, { font: '34px Baskerville', fill: '#fff' });
    
    stateText = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '84px Baskerville', fill: '#fff' });
    stateText.anchor.setTo(0.5, 0.5);
    stateText.visible = false;

    stateText2 = game.add.text(game.world.centerX,game.world.centerY,' ', { font: '32px Baskerville', fill: '#fff' });
    stateText2.anchor.setTo(0.5, 0.5);
    stateText2.visible = false;

    //  This gets it moving
    ball.body.velocity.setTo(300, -200);
    balltwo.body.velocity.setTo(300, 500);
    ballthree.body.velocity.setTo(300, -50);

    //  This makes the game world bounce-able
    ball.body.collideWorldBounds = true;
    balltwo.body.collideWorldBounds = true;
    ballthree.body.collideWorldBounds = true;

    //  This sets the image bounce energy for the horizontal 
    //  and vertical vectors (as an x,y point). "1" is 100% energy return
    ball.body.bounce.setTo(1, 1);
    balltwo.body.bounce.setTo(1, 1);
    ballthree.body.bounce.setTo(1, 1);



}

//  Move the knocker with the arrow keys
function update () {

    //  Enable physics between the knocker and the ball
    game.physics.arcade.collide(knocker, ball, collisionHandler, null, this);
    game.physics.arcade.collide(knocker, balltwo, dead3, null, this);
    game.physics.arcade.collide(knocker, ballthree, dead3, null, this);
    game.physics.arcade.collide(ball, balltwo);
    game.physics.arcade.collide(ball, ballthree);
    game.physics.arcade.collide(ballthree, balltwo);

    if (cursors.up.isDown)
    {
        knocker.body.velocity.y = -500;
    }
    else if (cursors.down.isDown)
    {
        knocker.body.velocity.y =  500;
    }
    else if (cursors.left.isDown)
    {
        knocker.body.velocity.x = -500;
    }
    else if (cursors.right.isDown)
    {
        knocker.body.velocity.x = 500;
    } 
    else
    {
        knocker.body.velocity.setTo(0, 0);
    }
    


}

function collisionHandler (knocker, ball) {
    if (score == 1) {
        restartWin();
    }
    else {
        score -= 1;
    }
    
    scoreText.text = scoreString + score;


}

function dead3 (knocker, ballthree) {

stateText.text=" GAME OVER \n Click to restart";
stateText.visible = true;
knocker.kill(); 
//the "click to restart" handler
game.input.onTap.addOnce(restart,this);

}

function restart () {
    scoreText.visible = true; 
    ball.kill(); 
    balltwo.kill(); 
    ballthree.kill(); 
    stateText.visible = false;
    stateText2.visible = false;
    ball.reset(200,200); 
    balltwo.reset(400,200); 
    ballthree.reset(600,200); 
    ball.body.velocity.setTo(300, -200);
    balltwo.body.velocity.setTo(300, 500);
    ballthree.body.velocity.setTo(300, -50);
    knocker.reset(0,600);
    score = 50;
    scoreText.text = scoreString + score;

}

function restartWin () {
    ball.kill()
    balltwo.kill(); 
    ballthree.kill();
    scoreText.visible = false; 
    stateText2.visible = true;
    stateText2.text = " You've Escaped The Tobbogan Brothers. Nice One. \n                               Click to restart";
    game.input.onTap.addOnce(restart,this);
}

function render () {

}
