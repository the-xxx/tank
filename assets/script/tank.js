// Learn cc.Class:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/class.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/class.html
// Learn Attribute:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/reference/attributes.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/reference/attributes.html
// Learn life-cycle callbacks:
//  - [Chinese] http://docs.cocos.com/creator/manual/zh/scripting/life-cycle-callbacks.html
//  - [English] http://www.cocos2d-x.org/docs/creator/en/scripting/life-cycle-callbacks.html

cc.Class({
    extends: cc.Component,

    properties: {
        // foo: {
        //     // ATTRIBUTES:
        //     default: null,        // The default value will be used only when the component attaching
        //                           // to a node for the first time
        //     type: cc.SpriteFrame, // optional, default is typeof default
        //     serializable: true,   // optional, default is true
        // },
        // bar: {
        //     get () {
        //         return this._bar;
        //     },
        //     set (value) {
        //         this._bar = value;
        //     }
        // },
        firepoint:cc.Node,
        bekillednode:cc.Node,
        btn_up:cc.Node,
        btn_down:cc.Node,
        btn_left:cc.Node,
        btn_right:cc.Node,
        btn_fire:cc.Node,
        moveEff:{
            default:null,
            type:cc.AudioClip,
        },
        shootEff:{
            default:null,
            type:cc.AudioClip,
        },
        killEff:{
            default:null,
            type:cc.AudioClip,
        },
        bulletprefab:cc.Prefab,
        speedV:0,
        speedH:0,
        speedMove:100,
        btnkeys:[],
    },

    initlisten () {
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.on(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);

        this.btnkeys = [];
        this.btnkeys.push([this.btn_up,"touchstart",this.btn_up.on("touchstart", ()=>{this.speedV = 1;})]);
        this.btnkeys.push([this.btn_up,"touchend",this.btn_up.on("touchend", ()=>{this.speedV = 0;})]);
        this.btnkeys.push([this.btn_down,"touchstart",this.btn_down.on("touchstart", ()=>{this.speedV = -1;})]);
        this.btnkeys.push([this.btn_down,"touchend",this.btn_down.on("touchend", ()=>{this.speedV = 0;})]);
        this.btnkeys.push([this.btn_left,"touchstart",this.btn_left.on("touchstart", ()=>{this.speedH = -1;})]);
        this.btnkeys.push([this.btn_left,"touchend",this.btn_left.on("touchend", ()=>{this.speedH = 0;})]);
        this.btnkeys.push([this.btn_right,"touchstart",this.btn_right.on("touchstart", ()=>{this.speedH = 1;})]);
        this.btnkeys.push([this.btn_right,"touchend",this.btn_right.on("touchend", ()=>{this.speedH = 0;})]);
        this.btnkeys.push([this.btn_fire,"touchstart",this.btn_fire.on("touchstart", ()=>{this.dofire()})]);
        // this.btn_fire.on("touchend", ()=>{});
    },

    onKeyDown (event) {
        if (event.keyCode == cc.macro.KEY.w){
            this.speedV = 1;
        }
        else if (event.keyCode == cc.macro.KEY.s){
            this.speedV = -1;
        }
        else if (event.keyCode == cc.macro.KEY.a){
            this.speedH = -1;
        }
        else if (event.keyCode == cc.macro.KEY.d){
            this.speedH = 1;
        }
        else if (event.keyCode == cc.macro.KEY.j){
            this.dofire();
        }
    },

    onKeyUp (event) {
        if (event.keyCode == cc.macro.KEY.w && this.speedV == 1){
            this.speedV = 0;
        }
        else if (event.keyCode == cc.macro.KEY.s && this.speedV == -1){
            this.speedV = 0;
        }
        else if (event.keyCode == cc.macro.KEY.a && this.speedH == -1){
            this.speedH = 0;
        }
        else if (event.keyCode == cc.macro.KEY.d && this.speedH == 1){
            this.speedH = 0;
        }
    },

    dofire () {
        let newbullet = cc.instantiate(this.bulletprefab);
        newbullet.speedMove = this.speedMove * 5;
        newbullet.angle = this.node.angle;
        cc.director.getScene().addChild(newbullet);
        let pos = this.firepoint.convertToWorldSpaceAR(cc.v2(0,0));
        newbullet.x = pos.x;
        newbullet.y = pos.y;
        cc.audioEngine.playEffect(this.shootEff);
    },

    dobekilled () {
        if (this.bekillflag){
            return;
        }
        this.bekillflag = true;
        let self = this;
        this.bekillednode.active = true;
        let ani = this.getComponent(cc.Animation);
        ani.once(cc.Animation.EventType.FINISHED, ()=>{
            self.onDestroy();
            self.node.destroy();
        });
        ani.play("bekilled");
        cc.audioEngine.playEffect(this.killEff);
    },

    // LIFE-CYCLE CALLBACKS:

    onLoad () {
        cc.director.getPhysicsManager().enabled = true;
    },

    start () {
        this.initlisten();
        this.bekillednode.active = false;
        this.bekillflag = false;
    },

    update (dt) {
        if (this.speedH){
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(this.speedMove*this.speedH, 0);
            if (cc.audioEngine.isMusicPlaying() == false){
                cc.audioEngine.playMusic(this.moveEff, true);
            }
            this.node.angle = this.speedH>0?270:90;
        }
        else if (this.speedV){
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, this.speedMove*this.speedV);
            if (cc.audioEngine.isMusicPlaying() == false){
                cc.audioEngine.playMusic(this.moveEff, true);
            }
            this.node.angle = this.speedV>0?0:180;
        }
        else{
            this.getComponent(cc.RigidBody).linearVelocity = cc.v2(0, 0);
            cc.audioEngine.stopMusic();
        }
    },

    onBeginContact (contact, selfcollider, othercollider) {
        if (othercollider.tag == 1){
            // wall
            // return;
        }
        else if (othercollider.tag == 2){
            // tank
        }
        else if (othercollider.tag == 3){
            // bullet
        }
        this.dobekilled();
        // cc.audioEngine.stopMusic();
        // cc.audioEngine.playEffect(this.killEff);
        // this.node.destroy();
    },

    onDestroy () {
        for(let data of this.btnkeys){
            let [btn, etype, k] = data;
            btn.off(etype, k);
        }
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN, this.onKeyDown, this);
        cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP, this.onKeyUp, this);
        // cc.systemEvent.off(cc.SystemEvent.EventType.KEY_DOWN);
        // cc.systemEvent.off(cc.SystemEvent.EventType.KEY_UP);
    },
});
