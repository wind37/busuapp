cc.game.onStart = function(){
    cc.loader.resPath = "res";
    //load resources
    cc.LoaderScene.preload(g_resources, function () {
        cc.director.runScene(new MyScene());
    }, this);
};
cc.game.run();
