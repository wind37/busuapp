 /**
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 *
 * Chipmunk Demo code:
 *    Original Demo code written in C by Scott Lembcke
 *    Ported to JavaScript by Joseph Gentle
 *    Additions to the demo code by Ricardo Quesada
 */

//
// JavaScript + chipmunk tests
//

var chipmunkTestSceneIdx = -1;


//------------------------------------------------------------------
//
// ChipmunkBaseLayer
//
//------------------------------------------------------------------
var ChipmunkBaseLayer = function() {

	//
	// VERY IMPORTANT
	//
	// Only subclasses of a native classes MUST call cc.associateWithNative
	// Failure to do so, it will crash.
	//
	var parent = BaseTestLayer.call(this, cc.c4b(0,0,0,255), cc.c4b(98*0.5,99*0.5,117*0.5,255) );

	this._title =  "No title";
	this._subtitle = "No Subtitle";

	// Menu to toggle debug physics on / off
    /*
    var item = cc.MenuItemFont.create("Physics On/Off", this.onToggleDebug, this);
    item.setFontSize(24);
    var menu = cc.Menu.create( item );
    this.addChild( menu );
    menu.setPosition( cc._p( winSize.width-100, winSize.height-90 )  );
    */

    // Create the initial space
	this.space = new cp.Space();

	this.setupDebugNode();
};

cc.inherits(ChipmunkBaseLayer, BaseTestLayer );

ChipmunkBaseLayer.prototype.setupDebugNode = function()
{
    // debug only
	this._debugNode = cc.PhysicsDebugNode.create( this.space );
	this._debugNode.setVisible( false );
	this.addChild( this._debugNode );
};

ChipmunkBaseLayer.prototype.onToggleDebug = function(sender) {
    var state = this._debugNode.isVisible();
    this._debugNode.setVisible( !state );
};

//
// Instance 'base' methods
// XXX: Should be defined after "cc.inherits"
//
ChipmunkBaseLayer.prototype.onEnter = function() {
	BaseTestLayer.prototype.onEnter.call(this);
    //cc.base(this, 'onEnter');

    sys.dumpRoot();
    sys.garbageCollect();
};

ChipmunkBaseLayer.prototype.onCleanup = function() {
	// Not compulsory, but recommended: cleanup the scene
	this.unscheduleUpdate();
};

ChipmunkBaseLayer.prototype.onRestartCallback = function (sender) {
	this.onCleanup();
    var s = new ChipmunkTestScene();
    s.addChild(restartChipmunkTest());
    director.replaceScene(s);
};

ChipmunkBaseLayer.prototype.onNextCallback = function (sender) {
	this.onCleanup();
    var s = new ChipmunkTestScene();
    s.addChild(nextChipmunkTest());
    director.replaceScene(s);
};

ChipmunkBaseLayer.prototype.onBackCallback = function (sender) {
	this.onCleanup();
    var s = new ChipmunkTestScene();
    s.addChild(previousChipmunkTest());
    director.replaceScene(s);
};

// automation
ChipmunkBaseLayer.prototype.numberOfPendingTests = function() {
    return ( (arrayOfChipmunkTest.length-1) - chipmunkTestSceneIdx );
};

ChipmunkBaseLayer.prototype.getTestNumber = function() {
    return chipmunkTestSceneIdx;
};

//------------------------------------------------------------------
//
// Chipmunk + Sprite
//
//------------------------------------------------------------------
var ChipmunkSprite = function() {
	ChipmunkBaseLayer.call(this);
	//cc.base(this);

	this.addSprite = function( pos ) {
		var sprite =  this.createPhysicsSprite( pos );
		this.addChild( sprite );
	};

	this._title = 'Chipmunk Sprite Test';
	this._subtitle = 'Chipmunk + cocos2d sprites tests. Tap screen.';

	this.initPhysics();
};
cc.inherits( ChipmunkSprite, ChipmunkBaseLayer );

//
// Instance 'base' methods
// XXX: Should be defined after "cc.inherits"
//

// init physics
ChipmunkSprite.prototype.initPhysics = function() {
	var space = this.space ;
	var staticBody = space.staticBody;

	// Walls
	var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(winSize.width,0), 0 ),				// bottom
			new cp.SegmentShape( staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 0),	// top
			new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,winSize.height), 0),				// left
			new cp.SegmentShape( staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 0)	// right
			];
	for( var i=0; i < walls.length; i++ ) {
		var shape = walls[i];
		shape.setElasticity(1);
		shape.setFriction(1);
		space.addStaticShape( shape );
	}

	// Gravity
	space.gravity = cp.v(0, -100);
};

ChipmunkSprite.prototype.createPhysicsSprite = function( pos ) {
	var body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
	body.setPos( pos );
	this.space.addBody( body );
	var shape = new cp.BoxShape( body, 48, 108);
	shape.setElasticity( 0.5 );
	shape.setFriction( 0.5 );
	this.space.addShape( shape );

	var sprite = cc.PhysicsSprite.create("res/grossini.png");
	sprite.setBody( body );
	return sprite;
};

ChipmunkSprite.prototype.onEnter = function () {
	ChipmunkBaseLayer.prototype.onEnter.call(this);
	//cc.base(this, 'onEnter');

    var num = 3;
	this.scheduleUpdate();
	for(var i=0; i< num ; i++) {
		this.addSprite( cp.v(winSize.width/2, winSize.height/2) );
	}

    if( 'touches' in sys.capabilities )
        this.setTouchEnabled(true);
    else if( 'mouse' in sys.capabilities )
        this.setMouseEnabled(true);
};

ChipmunkSprite.prototype.update = function( delta ) {
	this.space.step( delta );
};

ChipmunkSprite.prototype.onMouseDown = function( event ) {
	this.addSprite( event.getLocation() );
};

ChipmunkSprite.prototype.onTouchesEnded = function( touches, event ) {
	var l = touches.length;
	for( var i=0; i < l; i++) {
		this.addSprite( touches[i].getLocation() );
	}
};

//------------------------------------------------------------------
//
// Chipmunk + Sprite + Batch
//
//------------------------------------------------------------------
var ChipmunkSpriteBatchTest = function() {
	ChipmunkSprite.call(this);
	// cc.base(this);

	// batch node
	this.batch = cc.SpriteBatchNode.create(s_pathGrossini, 50 );
	this.addChild( this.batch );

	this.addSprite = function( pos ) {
		var sprite =  this.createPhysicsSprite( pos );
		this.batch.addChild( sprite );
	};

	this._title = 'Chipmunk SpriteBatch Test';
	this._subtitle = 'Chipmunk + cocos2d sprite batch tests. Tap screen.';
};
cc.inherits( ChipmunkSpriteBatchTest, ChipmunkSprite );


//------------------------------------------------------------------
//
// Chipmunk Collision Test
// Using Object Oriented API.
// Base your samples on the "Object Oriented" API.
//
//------------------------------------------------------------------
var ChipmunkCollisionTest = function() {

	ChipmunkBaseLayer.call(this);
	// cc.base(this);

	this._title = 'Chipmunk Collision test';
	this._subtitle = 'Using Object Oriented API. ** Use this API **';

	// init physics
	this.initPhysics = function() {
		var staticBody = this.space.staticBody;

		// Walls
		var walls = [ new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(winSize.width,0), 0 ),				// bottom
				new cp.SegmentShape( staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 0),	// top
				new cp.SegmentShape( staticBody, cp.v(0,0), cp.v(0,winSize.height), 0),				// left
				new cp.SegmentShape( staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 0)	// right
				];
		for( var i=0; i < walls.length; i++ ) {
			var wall = walls[i];
			wall.setElasticity(1);
			wall.setFriction(1);
			this.space.addStaticShape( wall );
		}

		// Gravity:
		// testing properties
		this.space.gravity = cp.v(0,-100);
		this.space.iterations = 15;
	};

	this.createPhysicsSprite = function( pos, file, collision_type ) {
		var body = new cp.Body(1, cp.momentForBox(1, 48, 108) );
		body.setPos(pos);
		this.space.addBody(body);
		var shape = new cp.BoxShape( body, 48, 108);
		shape.setElasticity( 0.5 );
		shape.setFriction( 0.5 );
		shape.setCollisionType( collision_type );
		this.space.addShape( shape );

		var sprite = cc.PhysicsSprite.create(file);
		sprite.setBody( body );
		return sprite;
	};

	this.onEnter = function () {
		ChipmunkBaseLayer.prototype.onEnter.call(this);
		// cc.base(this, 'onEnter');

        this.initPhysics();
		this.scheduleUpdate();

		var sprite1 = this.createPhysicsSprite( cc.p(winSize.width/2, winSize.height-20), s_pathGrossini, 1);
		var sprite2 = this.createPhysicsSprite( cc.p(winSize.width/2, 50), s_pathSister1, 2);

		this.addChild( sprite1 );
		this.addChild( sprite2 );

		this.space.addCollisionHandler( 1, 2,
			this.collisionBegin.bind(this),
			this.collisionPre.bind(this),
			this.collisionPost.bind(this),
			this.collisionSeparate.bind(this)
			);
	};

	this.onExit = function() {
		this.space.removeCollisionHandler( 1, 2 );
        ChipmunkBaseLayer.prototype.onExit.call(this);
	};

	this.update = function( delta ) {
		this.space.step( delta );
	};

	this.collisionBegin = function ( arbiter, space ) {

		if( ! this.messageDisplayed ) {
			var label = cc.LabelBMFont.create("Collision Detected", s_bitmapFontTest5_fnt);
			this.addChild( label );
			label.setPosition( winSize.width/2, winSize.height/2 );
			this.messageDisplayed = true;
		}
		cc.log('collision begin');
		var shapes = arbiter.getShapes();
		var collTypeA = shapes[0].collision_type;
		var collTypeB = shapes[1].collision_type;
		cc.log( 'Collision Type A:' + collTypeA );
		cc.log( 'Collision Type B:' + collTypeB );
		return true;
	};

	this.collisionPre = function ( arbiter, space ) {
		cc.log('collision pre');
		return true;
	};

	this.collisionPost = function ( arbiter, space ) {
		cc.log('collision post');
	};

	this.collisionSeparate = function ( arbiter, space ) {
		cc.log('collision separate');
	};

};
cc.inherits( ChipmunkCollisionTest, ChipmunkBaseLayer );


//------------------------------------------------------------------
//
// Chipmunk Collision Test
// Using "C" API.
// XXX  DO NOT USE THE "C" API.
// XXX  IT WAS ADDED FOR TESTING PURPOSES ONLY
//
//------------------------------------------------------------------
var ChipmunkCollisionTestB = function() {

	ChipmunkBaseLayer.call(this);
	// cc.base(this);

	this.messageDisplayed = false;

	this._title = 'Chipmunk Collision Test';
	this._subtitle = 'using "C"-like API. ** DO NOT USE THIS API **';

	// init physics
	this.initPhysics = function() {
		this.space =  cp.spaceNew();

		// update Physics Debug Node with new space
		this._debugNode.setSpace(this.space);

		var staticBody = cp.spaceGetStaticBody( this.space );

		// Walls using "C" API. DO NO USE THIS API
		var walls = [cp.segmentShapeNew( staticBody, cp.v(0,0), cp.v(winSize.width,0), 0 ),				// bottom
				cp.segmentShapeNew( staticBody, cp.v(0,winSize.height), cp.v(winSize.width,winSize.height), 0),	// top
				cp.segmentShapeNew( staticBody, cp.v(0,0), cp.v(0,winSize.height), 0),				// left
				cp.segmentShapeNew( staticBody, cp.v(winSize.width,0), cp.v(winSize.width,winSize.height), 0)	// right
				];

		for( var i=0; i < walls.length; i++ ) {
			// 'properties' using "C" API. DO NO USE THIS API
			var wall = walls[i];
			cp.shapeSetElasticity(wall, 1);
			cp.shapeSetFriction(wall, 1);
			cp.spaceAddStaticShape( this.space, wall );
		}

		// Gravity
		cp.spaceSetGravity( this.space, cp.v(0, -30) );
	};

	this.createPhysicsSprite = function( pos, file, collision_type ) {
		// using "C" API. DO NO USE THIS API
		var body = cp.bodyNew(1, cp.momentForBox(1, 48, 108) );
		cp.bodySetPos( body, pos );
		cp.spaceAddBody( this.space, body );
		var shape = cp.boxShapeNew( body, 48, 108);
		cp.shapeSetElasticity( shape, 0.5 );
		cp.shapeSetFriction( shape, 0.5 );
		cp.shapeSetCollisionType( shape, collision_type );
		cp.spaceAddShape( this.space, shape );

		var sprite = cc.PhysicsSprite.create(file);
		sprite.setBody( body );
		return sprite;
	};

	this.onEnter = function () {
		ChipmunkBaseLayer.prototype.onEnter.call(this);
		// cc.base(this, 'onEnter');

        this.initPhysics();
		this.scheduleUpdate();

		var sprite1 = this.createPhysicsSprite( cc.p(winSize.width/2, winSize.height-20), s_pathGrossini, 1);
		var sprite2 = this.createPhysicsSprite( cc.p(winSize.width/2, 50), s_pathSister1, 2);

		this.addChild( sprite1 );
		this.addChild( sprite2 );

		cp.spaceAddCollisionHandler( this.space, 1, 2,
			this.collisionBegin.bind(this),
			this.collisionPre.bind(this),
			this.collisionPost.bind(this),
			this.collisionSeparate.bind(this) );
	};

	this.onExit = function() {
		cp.spaceRemoveCollisionHandler( this.space, 1, 2 );
        cp.spaceFree( this.space );
        ChipmunkBaseLayer.prototype.onExit.call(this);
	};

	this.update = function( delta ) {
		cp.spaceStep( this.space, delta );
	};

	this.collisionBegin = function ( arbiter, space ) {

		if( ! this.messageDisplayed ) {
			var label = cc.LabelBMFont.create("Collision Detected", s_bitmapFontTest5_fnt);
			this.addChild( label );
			label.setPosition( winSize.width/2, winSize.height/2 );
			this.messageDisplayed = true;
		}
		cc.log('collision begin');
		var bodies = cp.arbiterGetBodies( arbiter );
		var shapes = cp.arbiterGetShapes( arbiter );
		var collTypeA = cp.shapeGetCollisionType( shapes[0] );
		var collTypeB = cp.shapeGetCollisionType( shapes[1] );
		cc.log( 'Collision Type A:' + collTypeA );
		cc.log( 'Collision Type B:' + collTypeB );
		return true;
	};

	this.collisionPre = function ( arbiter, space ) {
		cc.log('collision pre');
		return true;
	};

	this.collisionPost = function ( arbiter, space ) {
		cc.log('collision post');
	};

	this.collisionSeparate = function ( arbiter, space ) {
		cc.log('collision separate');
	};

};
cc.inherits( ChipmunkCollisionTestB, ChipmunkBaseLayer );



//
// Entry point
//

var ChipmunkTestScene = function() {
	TestScene.call(this);
	//var parent = cc.base(this);
};
cc.inherits(ChipmunkTestScene, TestScene );

ChipmunkTestScene.prototype.runThisTest = function () {
    chipmunkTestSceneIdx = -1;
    var layer = nextChipmunkTest();
    this.addChild(layer);
    director.replaceScene(this);
};

//
// Flow control
//

// Chipmunk Demos
var arrayOfChipmunkTest =  [

// Chipmunk "C" Tests
    /*
		// Planet,
		Buoyancy,
		PyramidStack,
		PyramidTopple,
		Joints,
		Balls,
    */

// Custom Tests
		ChipmunkSprite ,
		//ChipmunkSpriteBatchTest ,
    /*
		ChipmunkCollisionTest,
		ChipmunkCollisionMemoryLeakTest,
		ChipmunkSpriteAnchorPoint
		*/
		];

if( sys.platform !== 'browser' ) {
	arrayOfChipmunkTest.push( ChipmunkCollisionTestB );
}

var nextChipmunkTest = function () {
    chipmunkTestSceneIdx++;
    chipmunkTestSceneIdx = chipmunkTestSceneIdx % arrayOfChipmunkTest.length;

    return new arrayOfChipmunkTest[chipmunkTestSceneIdx]();
};
var previousChipmunkTest = function () {
    chipmunkTestSceneIdx--;
    if (chipmunkTestSceneIdx < 0)
        chipmunkTestSceneIdx += arrayOfChipmunkTest.length;

    return new arrayOfChipmunkTest[chipmunkTestSceneIdx]();
};
var restartChipmunkTest = function () {
    return new arrayOfChipmunkTest[chipmunkTestSceneIdx]();
};
