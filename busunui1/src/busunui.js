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
		ChipmunkSprite
		];

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
