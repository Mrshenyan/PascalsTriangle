import CommonFun from "../commonScript/CommonFun";
import Global from "../commonScript/Global";
import ConstantOther, { E_STORAGETYPE } from "../commonScript/ConstantOther";

const {ccclass, property} = cc._decorator;

@ccclass
export default class OpenScene extends cc.Component {


    res;
    onLoad () {
        let self = this;
        if(cc.sys.platform!=cc.sys.WECHAT_GAME){
            this.node.getChildByName("BtnNode").children[0].active = false;
        }
        this.nickNode = cc.find("Canvas/PlayerNode").getChildByName("nickName");
        this.avatarNode = cc.find("Canvas/PlayerNode").getChildByName("avatar");
        // CommonFun.getWxPlayer(self,this.nickNode,this.avatarNode);
        let pdata:string = cc.sys.localStorage.getItem(E_STORAGETYPE.PlayData);
        if(pdata!=""||pdata!=null||pdata!=undefined){
            pdata = JSON.stringify(Global.PlayData);
        }
        console.log("have err2")
        this.fillData(pdata,this.nickNode,this.avatarNode);
    }

    nickNode:cc.Node=null;
    avatarNode:cc.Node=null;
    start () {

    }

    fillData(pdata:string,nickNode:cc.Node,avatarNode:cc.Node){
        let self = this;
        // if(pdata!=""||pdata!=undefined||pdata!=null){

        if(pdata!=""||pdata!=null||pdata!=undefined){
            try {
                tryOne();
            } catch (error) {
                pdata = JSON.stringify(Global.PlayData);
                tryOne();
            }
        }else{
            CommonFun.getWxPlayer(this,this.nickNode,this.avatarNode);
        }

        function  tryOne() {
            console.log("have err1")
            console.log(pdata);
            pdata = JSON.parse(pdata);
            console.log("have err")
            let nick = pdata["PlayInfo"]["playNick"];
            if(nick==undefined||nick==""){
                if(cc.sys.platform==cc.sys.WECHAT_GAME){
                    CommonFun.getWxPlayer(self,nickNode,avatarNode);
                    console.log("mei you");
                }
            }else{
                console.log("you a" );
                let url = pdata["PlayInfo"]["playAvatar"];
                nickNode.getComponent(cc.Label).string = nick;
                cc.loader.load({url,type:'png'},(err,res)=>{
                    if(err){
                        return;
                    }
                    avatarNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
                })
            }
        }
    }

    // update (dt) {}

    OpenMainScene(){
        cc.director.loadScene("MainScene");
    }

    /**排行榜信息 */
    GameRank(event,customEventData){
        if(cc.sys.platform==cc.sys.WECHAT_GAME){
            switch(customEventData){
                case "openrank":{
                    let info = (cc.sys.localStorage.getItem(E_STORAGETYPE.PlayData));
                    if(info!=""){
                        info = JSON.parse(info);
                        if(info.PlayInfo.playNick==""){
                            //show a msg -->you should sign in used your wechat account
                        }else{
                            let subview = this.node.getChildByName("WXSubContextView");
                            subview.active = true;
                            wx.postMessage("friend_rank");
                            
                        }
                    }else{
                        //show a msg -->you should sign in used your wechat account
                        console.log("is null");
                    }
                    break;
                }
                case "closerank":{
                    let subview = this.node.getChildByName("WXSubContextView");
                    subview.active = false;
                    break;
                }
            }
        }
    }
}
