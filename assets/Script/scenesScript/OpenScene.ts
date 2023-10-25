import CommonFun from "../commonScript/CommonFun";
import Global from "../commonScript/Global";
import ConstantOther, { E_STORAGETYPE } from "../commonScript/ConstantOther";
const wx=window["wx"];
const tt=window["tt"];

const {ccclass, property} = cc._decorator;

@ccclass
export default class OpenScene extends cc.Component {

    @property(cc.WXSubContextView)
    subContextV:cc.WXSubContextView=null;

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
        this.fillData(pdata,this.nickNode,this.avatarNode);
    }

    nickNode:cc.Node=null;
    avatarNode:cc.Node=null;
    start () {
        tt.checkSession({
            success() {
              console.log(`session 未过期`);
            },
            fail() {
              console.log(`session 已过期，需要重新登录`);
              tt.login({
                success: (res) => {
                  console.log("登录成功", res);
                },
                fail: (err) => {
                  console.log("登录失败", err);
                },
              });
            },
          });
          
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
            pdata = JSON.parse(pdata);
            let nick = pdata["PlayInfo"]["playNick"];
            if(nick==undefined||nick==""){
                if(cc.sys.platform==cc.sys.WECHAT_GAME){
                    CommonFun.getWxPlayer(self,nickNode,avatarNode);
                    console.log("mei you");
                }
            }else{
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
                            let subview = this.node.getChildByName("WXSubContextNode");
                            subview.active = true;
                            // wx.postMessage("friend_rank");
                            let wxContent = wx.getOpenDataContext()
                            wxContent.postMessage({
                                value: 'MESSAGE FROM MAIN PROJECT',
                            });
                            
                        }
                    }else{
                        //show a msg -->you should sign in used your wechat account
                        console.log("is null");
                    }
                    break;
                }
                case "closerank":{
                    let subview = this.node.getChildByName("WXSubContextNode");
                    subview.active = false;
                    break;
                }
            }
        }
    }
}
