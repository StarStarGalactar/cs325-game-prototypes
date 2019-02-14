// mods by Patrick OReilly 
// Twitter: @pato_reilly Web: http://patricko.byethost9.com

var game = new Phaser.Game(650, 555, Phaser.CANVAS, 'game', { preload: preload, create: create, update: update, render: render });

function preload() {

    this.game.add.text(0, 0, "hack", {font:"1px futile", fill: "#FFFFFF"}); 
    game.load.audio('music', ['assets/The Dark Amulet.mp3', 'assets/The Dark Amulet.ogg']);
    game.load.audio('deathnoise', ['assets/Magic Death.mp3', 'assets/Magic Death.ogg']);
    game.load.audio('deathnoise2', ['assets/Magic Death2.mp3', 'assets/Magic Death2.ogg']);
    game.load.spritesheet('skeletonIdle', 'assets/sprites/Skeleton Idle.png', 24, 32, 11);
    game.load.spritesheet('skeletonIdle2', 'assets/sprites/Skeleton Idle 2.png', 24, 32, 11);
    game.load.spritesheet('skeletonDead', 'assets/sprites/Skeleton Dead.png', 33, 32, 15);
    game.load.spritesheet('skeletonDead2', 'assets/sprites/Skeleton Dead 2.png', 33, 32, 15);
    game.load.spritesheet('skeletonReact', 'assets/sprites/Skeleton React.png', 22, 32, 4);
    game.load.spritesheet('skeletonReact2', 'assets/sprites/Skeleton React 2.png', 22, 32, 4);
    game.load.image('background', 'assets/sprites/Background.png');
    
}


var timer;
var countdone = 0;
var text; 
var player1;
var deadplayer1; 
var deadplayer2; 
var background;
var player2;
var idle; 
var idle2; 
var death;
var death2; 
var player1press = 1; 
var player2press = 1; 
var key1;
var key2; 
var player1text; 
var player2text;
var deathnoise; 
var deathnoise2; 
var keyrestart;
var restartcount = 0;  
var instructiontext; 

function create() {


    background = game.add.tileSprite(0,0,650,555,"background");
    
    player1 = game.add.sprite((game.world.centerX - 40), 477, 'skeletonIdle');
    idle = player1.animations.add('idle');
    player1.animations.play('idle', 15, true); 

    deadplayer1 = game.add.sprite((game.world.centerX - 50), 477, 'skeletonDead');
    death = deadplayer1.animations.add('death');
    deadplayer1.visible = false;
    
    player2 = game.add.sprite((game.world.centerX + 40), 477, 'skeletonIdle2');
    idle2 = player2.animations.add('idle2');
    player2.animations.play('idle2', 15, true);

    deadplayer2 = game.add.sprite((game.world.centerX + 40), 477, 'skeletonDead2');
    death2 = deadplayer2.animations.add('death2');
    deadplayer2.visible = false;

    key1 = game.input.keyboard.addKey(Phaser.Keyboard.A);
    key2 = game.input.keyboard.addKey(Phaser.Keyboard.L);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.A);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.L);
    key1.onDown.add(press1,this);
    key2.onDown.add(press2,this); 

    keyrestart = game.input.keyboard.addKey(Phaser.Keyboard.R);
    game.input.keyboard.removeKeyCapture(Phaser.Keyboard.R);
    keyrestart.onDown.add(restart,this); 

    //  Create our Timer
    timer = game.time.create(false);

    //  Set a TimerEvent to occur
    timer.loop(game.rnd.integerInRange(1000,4000), countDone, this);

    if (restartcount == 1){
    timer.start();
    }
    
    var style = { font: "65px futile", fill: "#eeeeee", align: "center" };
    var style1 = { font: "65px futile", fill: "#000000", align: "center" };
    var style2 = { font: "65px futile", fill: "#eb1414", align: "center" };
    var instructions = { font: "30px futile", fill: "#eeeeee", align: "center", wordWrap: true, wordWrapWidth: 500};
    
    text = game.add.text(game.world.centerX, 175, "ANNIHILATED\n\nPress 'R' to Restart", style);
    text.anchor.set(0.5);
    text.visible = false; 

    player2text = game.add.text(game.world.centerX, 70, "PLAYER 2", style2);
    player2text.anchor.set(0.5);
    player2text.visible = false; 

    player1text = game.add.text(game.world.centerX, 70, "PLAYER 1", style1);
    player1text.anchor.set(0.5);
    player1text.visible = false; 

    instructiontext = game.add.text(game.world.centerX, 260, "This is a two-player versus game\n\nBe the quickest to press your key after the countdown leaves the screen\n\nIf you press your key while the countdown is running, you lose\n\n Player 1's Key is 'A'\n Player 2's Key is 'L'\n\nPress 'R' to Start", instructions);
    instructiontext.anchor.set(0.5);
    instructiontext.visible = false;
    deathnoise = game.add.audio('deathnoise');
    deathnoise2 = game.add.audio('deathnoise2');
    
    if (restartcount == 0 ){
        instructiontext.visible = true; 
        music = game.add.audio('music',0.3,true);
        music.play();
    }

    

}

function countDone ()
{
    countdone = 1; 
    timer.stop();
 
}

function update () {
    
}

function press1 () {
   
    if (player1press == 0) {
        player1press = 1; 

        if (countdone == 1) {
            death2.isReversed = true; 
            deadplayer2.visible = true; 
            deadplayer2.animations.play('death2', 15);
            death2.onComplete.add(deadplayer2stop, this);
            player2.visible = false; 
            text.visible = true;  
            player2press = 1; 
            countdone = 1
            player2text.visible = true; 
            deathnoise2.play(); 
        }

        if (countdone == 0) {
            deadplayer1.visible = true; 
            deadplayer1.animations.play('death', 15);
            death.onComplete.add(deadplayer1stop, this);
            player1.visible = false; 
            text.visible = true;
            player2press = 1;
            countdone = 1
            player1text.visible = true;
            deathnoise.play(); 
        }
    }



}

function press2 () {
   
    if (player2press == 0) {
        player2press = 1; 
        if (countdone == 1) {
            deadplayer1.visible = true; 
            deadplayer1.animations.play('death', 15);
            death.onComplete.add(deadplayer1stop, this);
            player1.visible = false; 
            text.visible = true;  
            player1press = 1;
            countdone = 1
            player1text.visible = true;
            deathnoise.play(); 
        }
        if (countdone == 0) {
            death2.isReversed = true; 
            deadplayer2.visible = true; 
            deadplayer2.animations.play('death2', 15);
            death2.onComplete.add(deadplayer2stop, this);
            player2.visible = false; 
            text.visible = true;  
            player1press = 1;
            countdone = 1
            player2text.visible = true; 
            deathnoise2.play(); 
        }
    }



}

function restart () 
{
    game.world.removeAll();
    countdone = 0; 
    player1press = 0; 
    player2press= 0; 
    restartcount = 1;
    this.game.state.restart();
}

function deadplayer1stop () 
{
    deadplayer1.animations.stop(); 
}
function deadplayer2stop () {
    deadplayer2.animations.stop(); 
}
    
    




function render () {
    
    if (countdone == 0) {
        if(restartcount == 1){
        game.debug.text(timer.duration.toFixed(0),250, 450,"#eeeeee", "65px futile");
        }
    }
    
   
}

