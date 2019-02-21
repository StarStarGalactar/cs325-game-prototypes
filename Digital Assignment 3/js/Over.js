"use strict";

BasicGame.Over = function (game) {



};

BasicGame.Over.prototype = {

	create: function () {

        this.text = this.add.text(260, 100, "You felled " + this.game.global.score + " Demons", { font: "30px Arial", fill: "#FFFFFF", align: "center" });
        this.playButton = this.add.button( 303, 200, 'restartButton', this.startGame, this);
        this.menuButton = this.add.button( 303, 300, 'menuButton', this.menu, this);
	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
        //	And start the actual game
        this.game.global.score = 0; 
        this.state.start('Game');
        

    },
    
    menu: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
	
        //	And start the actual game
        this.game.global.score = 0; 
        this.game.global.firstload = false; 
        this.state.start('MainMenu');
        

	},

};
