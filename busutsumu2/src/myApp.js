var MyLayer = cc.LayerColor.extend({
    helloLabel_:null,
    sprite_:null,
    space_:null,

    init:function (space) {
        this._super();
        this.setColor(cc.color(255,255,255));
        this.space_ = space;

        var size = cc.director.getWinSize();

        this.helloLabel_ = cc.LabelTTF.create("Hello Octcat", "Impact", 24);
        this.helloLabel_.setColor(cc.color(0,0,0));
        this.helloLabel_.setPosition(size.width / 2, size.height - 40);
        this.addChild(this.helloLabel_, 5);
    },

    onEnter:function() {
        cc.eventManager.addListener({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            onTouchBegan: function(touch, event) {
                this.addSprite(touch.getLocation());
            }.bind(this)
        }, this);


        this._debugNode = cc.PhysicsDebugNode.create(this.space_);
        this._debugNode.setVisible(false);
        this.addChild(this._debugNode);


        var size = cc.director.getWinSize();
        this.addSprite(cc.p(size.width/2, size.height/2));
    },

    addSprite: function(position) {
        var body = new cp.Body(100, cp.momentForBox(1, 64, 64));
        body.setPos(position);
        this.space_.addBody(body);
        var shape = new cp.BoxShape(body, 64, 64);
        shape.setElasticity(0.7);
        shape.setFriction(0.7);
        shape.setCollisionType(1);
        this.space_.addShape(shape);

        this.sprite_ && this.sprite_.removeFromParent() && this.sprite_.getBody().removeFromParent();
        this.sprite_ = cc.PhysicsSprite.create(s_Octcat);
        this.sprite_.setBody(body);

        this.sprite_.setScale(0.5);
        this.addChild(this.sprite_);
    }
});

var MyScene = cc.Scene.extend({
    onEnter:function () {
        this._super();

        this.space = this.createPhysics_();

        this.layer = new MyLayer();
        this.layer.init(this.space);
        this.addChild(this.layer);

        this.scheduleUpdate();
    },

    createPhysics_: function () {
        var space = new cp.Space();

        var size = cc.director.getWinSize();
        // Walls
        var walls = [
            new cp.SegmentShape(space.staticBody, cp.v(0, 0), cp.v(size.width, 0), 0),				// bottom
            new cp.SegmentShape(space.staticBody, cp.v(0, size.height), cp.v(size.width, size.height), 0),	// top
            new cp.SegmentShape(space.staticBody, cp.v(0, 0), cp.v(0, size.height), 0),				// left
            new cp.SegmentShape(space.staticBody, cp.v(size.width, 0), cp.v(size.width, size.height), 0)	// right
        ];
        for (var i = 0; i < walls.length; i++) {
            var shape = walls[i];
            shape.setElasticity(1.1);
            shape.setFriction(1.5);
            space.addStaticShape(shape);
            shape.setCollisionType(0);
        }

        space.gravity = cp.v(0, -100);

        space.addCollisionHandler(0,1, function(arb) {
            var shapes = arb.getShapes();
            var collTypeA = shapes[0].collision_type;
            var collTypeB = shapes[1].collision_type;
            // cc.log("hit "+collTypeA + collTypeB);
            return true;
        } );

        return space;
    },

    update: function(dt) {
        this.space && this.space.step(dt);
    }
});
