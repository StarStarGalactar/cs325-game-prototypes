"use strict";
// Missile constructor

var Missile = function(game, x, y) {
    Phaser.Sprite.call(this, game, x, y, 'rocket');

    // Set the pivot point for this sprite to the center
    this.anchor.setTo(0.5, 0.5);

    // Enable physics on the missile
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.enableBody = true; 

    // Define constants that affect motion
    this.SPEED = 180; // missile speed pixels/second
    this.TURN_RATE = 4; // turn rate in degrees/frame
    this.WOBBLE_LIMIT = 15; // degrees
    this.WOBBLE_SPEED = 250; // milliseconds
    this.SMOKE_LIFETIME = 3000; // milliseconds

    // Create a variable called wobble that tweens back and forth between
    // -this.WOBBLE_LIMIT and +this.WOBBLE_LIMIT forever
    this.wobble = this.WOBBLE_LIMIT;
    this.game.add.tween(this)
        .to(
            { wobble: -this.WOBBLE_LIMIT },
            this.WOBBLE_SPEED, Phaser.Easing.Sinusoidal.InOut, true, 0,
            Number.POSITIVE_INFINITY, true
        );

    // Add a smoke emitter with 100 particles positioned relative to the
    // bottom center of this missile
    this.smokeEmitter = this.game.add.emitter(0, 0, 100);

    // Set motion parameters for the emitted particles
    this.smokeEmitter.gravity = 0;
    this.smokeEmitter.setXSpeed(0, 0);
    this.smokeEmitter.setYSpeed(-80, -50); // make smoke drift upwards

    // Make particles fade out after 1000ms
    this.smokeEmitter.setAlpha(1, 0, this.SMOKE_LIFETIME, Phaser.Easing.Linear.InOut);

    // Create the actual particles
    this.smokeEmitter.makeParticles('smoke');

    // Start emitting smoke particles one at a time (explode=false) with a
    // lifespan of this.SMOKE_LIFETIME at 50ms intervals
    this.smokeEmitter.start(false, this.SMOKE_LIFETIME, 50);
};

BasicGame.Game = function (game) {

    //  When a State is added to Phaser it automatically has the following properties set on it, even if they already exist:
    /*
    this.game;      //  a reference to the currently running game (Phaser.Game)
    this.add;       //  used to add sprites, text, groups, etc (Phaser.GameObjectFactory)
    this.camera;    //  a reference to the game camera (Phaser.Camera)
    this.cache;     //  the game cache (Phaser.Cache)
    this.input;     //  the global input manager. You can access this.input.keyboard, this.input.mouse, as well from it. (Phaser.Input)
    this.load;      //  for preloading assets (Phaser.Loader)
    this.math;      //  lots of useful common math operations (Phaser.Math)
    this.sound;     //  the sound manager - add a sound, play one, set-up markers, etc (Phaser.SoundManager)
    this.stage;     //  the game stage (Phaser.Stage)
    this.time;      //  the clock (Phaser.Time)
    this.tweens;    //  the tween manager (Phaser.TweenManager)
    this.state;     //  the state manager (Phaser.StateManager)
    this.world;     //  the game world (Phaser.World)
    this.particles; //  the particle manager (Phaser.Particles)
    this.physics;   //  the physics manager (Phaser.Physics)
    this.rnd;       //  the repeatable random number generator (Phaser.RandomDataGenerator)
    
    //  You can use any of these from any function within this State.
    //  But do consider them as being 'reserved words', i.e. don't create a property for your own game called "world" or you'll over-write the world reference.
    */
    
    // For optional clarity, you can initialize
    // member variables here. Otherwise, you will do it in create().
    this.MAX_MISSILES = 7;
    this.playerX = 200; 
    this.playerY = 22;
 
};

BasicGame.Game.prototype = {
    
    create: function () {
    // Set stage background color
    var background = this.game.add.tileSprite(-300,-400,1920,1080,"backgroundsky");
    this.cursors = this.game.input.keyboard.createCursorKeys(); 
    this.game.score = 0; 
    this.game.world.setBounds(0, 0, 848, 450);
    this.death = false; 
    // Create a group to hold the missile
    this.missileGroup = this.game.add.group();
    this.impact = this.game.add.audio('hit', .2);
    this.boom = this.game.add.audio('boom', .2);
    this.shoot = this.game.add.audio('shoot', .2);

    // Create a group for explosions
    this.explosionGroup = this.game.add.group();

    // Define constants
    this.SHOT_DELAY = 300; // milliseconds (10 bullets/second)
    this.BULLET_SPEED = 700; // pixels/second
    this.NUMBER_OF_BULLETS = 20;

    // Create an object representing our gun
    this.gun = this.game.add.sprite(this.game.width/2, 50, 'player');
    this.game.physics.enable(this.gun, Phaser.Physics.ARCADE);
    this.gun.body.collideWorldBounds=true; 

    // Set the pivot point to the center of the gun
    this.gun.anchor.setTo(0.0, 0.5);

    this.playerX = this.gun.x;
    this.playerY = this.gun.y;

    // Create an object pool of bullets
    this.bulletPool = this.game.add.group();
    this.bulletPool.enableBody = true; 
    this.bulletPool.physicsBodyType = Phaser.Physics.ARCADE;
    
    for(var i = 0; i < this.NUMBER_OF_BULLETS; i++) {
        // Create each bullet and add it to the group.
        var bullet = this.game.add.sprite(0, 0, 'bullet');
        this.bulletPool.add(bullet);

        // Set its pivot point to the center of the bullet
        bullet.anchor.setTo(0.5, 0.5);

        // Enable physics on the bullet
        this.game.physics.enable(bullet, Phaser.Physics.ARCADE);

        // Set its initial state to "dead".
        bullet.kill();
    }

    // Simulate a pointer click/tap input at the center of the stage
    // when the example begins running.
    this.game.input.activePointer.x = this.game.width/2;
    this.game.input.activePointer.y = this.game.height/2;

    },

    shootBullet : function () {
    // Enforce a short delay between shots by recording
    // the time that each bullet is shot and testing if
    // the amount of time since the last shot is more than
    // the required delay.
    if (this.lastBulletShotAt === undefined) this.lastBulletShotAt = 0;
    if (this.game.time.now - this.lastBulletShotAt < this.SHOT_DELAY) return;
    this.lastBulletShotAt = this.game.time.now;

    // Get a dead bullet from the pool
    var bullet = this.bulletPool.getFirstDead();

    // If there aren't any bullets available then don't shoot
    if (bullet === null || bullet === undefined) return;

    // Revive the bullet
    // This makes the bullet "alive"
    bullet.revive();

    // Bullets should kill themselves when they leave the world.
    // Phaser takes care of this for me by setting this flag
    // but you can do it yourself by killing the bullet if
    // its x,y coordinates are outside of the world.
    bullet.checkWorldBounds = true;
    bullet.outOfBoundsKill = true;

    // Set the bullet position to the gun position.
    bullet.reset(this.gun.x, this.gun.y);
    bullet.rotation = this.gun.rotation;

    // Shoot it in the right direction
    bullet.body.velocity.x = Math.cos(bullet.rotation) * this.BULLET_SPEED;
    bullet.body.velocity.y = Math.sin(bullet.rotation) * this.BULLET_SPEED;

    },

    collisionHandler : function (bullet, veg) {

        bullet.kill();
        veg.kill();
        this.game.global.score = this.game.global.score + 1; 

        this.getExplosion(veg.x, veg.y);
        this.impact.play(); 
    
    },

    collisionHandler2 : function (bullet, veg) {

        bullet.kill();
        veg.kill();
        this.death = true; 
        this.getExplosion(veg.x, veg.y);
        this.game.camera.shake(0.05, 500);
        this.boom.play(); 
        this.game.time.events.add(Phaser.Timer.SECOND * 1.2, this.dead, this);
        
        
        
        
    
    },


    update : function() {
        // Aim the gun at the pointer.
        // All this function does is calculate the angle using
        // Math.atan2(yPointer-yGun, xPointer-xGun)
        this.gun.rotation = this.game.physics.arcade.angleToPointer(this.gun);
    
        // Shoot a bullet
        if (this.game.input.activePointer.isDown & (this.death == false)) {
            this.shootBullet();
            this.shoot.play();
        }

        // If there are fewer than MAX_MISSILES, launch a new one
        if (this.missileGroup.countLiving() < this.MAX_MISSILES) {
        // Set the launch point to a random location below the bottom edge
        // of the stage
        this.launchMissile(this.game.rnd.integerInRange(50, this.game.width-50),
            this.game.height + 50);
        }
        

        
        this.physics.arcade.collide(this.bulletPool, this.missileGroup, this.collisionHandler, null, this);
        this.physics.arcade.collide(this.gun, this.missileGroup, this.collisionHandler2, null, this);
        

        // if (this.cursors.left.isDown)
        // {
        //    this.gun.body.velocity.x = -300;
        // }
        // else if (this.cursors.right.isDown)
        // {
        //     this.gun.body.velocity.x = 300
        // }
        



    },

    render : function() {

    this.game.debug.text("Time until event: ")
    this.game.debug.text("Next tick: "  )

    },


    launchMissile: function (x,y) {
    // Get the first dead missile from the missileGroup
    var missile = this.missileGroup.getFirstDead();

    // If there aren't any available, create a new one
    if (missile === null) {
        missile = new Missile(this.game);
        this.missileGroup.add(missile);
    }

    // Revive the missile (set it's alive property to true)
    // You can also define a onRevived event handler in your explosion objects
    // to do stuff when they are revived.
    missile.revive();

    // Move the missile to the given coordinates
    missile.x = x;
    missile.y = y;

    return missile;
    },
    
    getExplosion : function(x, y) {
        // Get the first dead explosion from the explosionGroup
        var explosion = this.explosionGroup.getFirstDead();
    
        // If there aren't any available, create a new one
        if (explosion === null) {
            explosion = this.game.add.sprite(0, 0, 'explosion');
            explosion.anchor.setTo(0.5, 0.5);
    
            // Add an animation for the explosion that kills the sprite when the
            // animation is complete
            var animation = explosion.animations.add('boom', [0,1,2,3], 60, false);
            animation.killOnComplete = true;
    
            // Add the explosion sprite to the group
            this.explosionGroup.add(explosion);
            
        }
    
        // Revive the explosion (set it's alive property to true)
        // You can also define a onRevived event handler in your explosion objects
        // to do stuff when they are revived.
        explosion.revive();
    
        // Move the explosion to the given coordinates
        explosion.x = x;
        explosion.y = y;
    
        // Set rotation of the explosion at random for a little variety
        explosion.angle = this.game.rnd.integerInRange(0, 360);
    
        // Play the animation
        explosion.animations.play('boom');
    
        // Return the explosion itself in case we want to do anything else with it
        return explosion;
    },



    quitGame: function () {

        //  Here you should destroy anything you no longer need.
        //  Stop music, delete sprites, purge caches, free resources, all that good stuff.

        //  Then let's go back to the main menu.
        this.state.start('MainMenu');

    },

    dead: function () {

        this.state.start('Over');
        
    },

};

var playerpostionx = function (x) {

    return x;
};

var playerpostionx = function (y) {

    return y; 
};


// Missiles are a type of Phaser.Sprite
Missile.prototype = Object.create(Phaser.Sprite.prototype);
Missile.prototype.constructor = Missile;

Missile.prototype.update = function(game) {
    // If this missile is dead, don't do any of these calculations
    // Also, turn off the smoke emitter
    if (!this.alive) {
        this.smokeEmitter.on = false;
        return;
    } else {
        this.smokeEmitter.on = true;
    }

    // Position the smoke emitter at the center of the missile
    this.smokeEmitter.x = this.x;
    this.smokeEmitter.y = this.y;

    // Calculate the angle from the missile to the mouse cursor game.input.x
    // and game.input.y are the mouse position; substitute with whatever
    // target coordinates you need.
    var targetAngle = this.game.math.angleBetween(
        this.x, this.y,
        this.game.width/2, 50
    );

    // Add our "wobble" factor to the targetAngle to make the missile wobble
    // Remember that this.wobble is tweening (above)
    targetAngle += this.game.math.degToRad(this.wobble);

    // Gradually (this.TURN_RATE) aim the missile towards the target angle
    if (this.rotation !== targetAngle) {
        // Calculate difference between the current angle and targetAngle
        var delta = targetAngle - this.rotation;

        // Keep it in range from -180 to 180 to make the most efficient turns.
        if (delta > Math.PI) delta -= Math.PI * 2;
        if (delta < -Math.PI) delta += Math.PI * 2;

        if (delta > 0) {
            // Turn clockwise
            this.angle += this.TURN_RATE;
        } else {
            // Turn counter-clockwise
            this.angle -= this.TURN_RATE;
        }

        // Just set angle to target angle if they are close
        if (Math.abs(delta) < this.game.math.degToRad(this.TURN_RATE)) {
            this.rotation = targetAngle;
        }
    }

    // Calculate velocity vector based on this.rotation and this.SPEED
    this.body.velocity.x = Math.cos(this.rotation) * this.SPEED;
    this.body.velocity.y = Math.sin(this.rotation) * this.SPEED;
};
