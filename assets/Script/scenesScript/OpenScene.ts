import CommonFun from "../commonScript/CommonFun";
import Global from "../commonScript/Global";
import ConstantOther, { E_STORAGETYPE } from "../commonScript/ConstantOther";
const tt = window["tt"];

const { ccclass, property } = cc._decorator;

@ccclass
export default class OpenScene extends cc.Component {

    nickNode: cc.Node = null;
    avatarNode: cc.Node = null;

    onLoad() {
        let self = this;
        this.nickNode = cc.find("Canvas/PlayerNode").getChildByName("nickName");
        this.avatarNode = cc.find("Canvas/PlayerNode").getChildByName("avatar");
        let pdata: string = cc.sys.localStorage.getItem(E_STORAGETYPE.PlayData);
        if (pdata != "" || pdata != null || pdata != undefined) {
            pdata = JSON.stringify(Global.PlayData);
        }
        this.fillData(pdata, this.nickNode, this.avatarNode);
    }

    start() {

        let date = new Date();
        let time = date.getUTCFullYear() + "-" + date.getUTCMonth() + "-" + date.getUTCDay();
        if (Global.PlayData.PlayInfo.dailyAward.time != time) {
            Global.PlayData.PlayInfo.dailyAward.hasGet = false;
        }
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

    fillData(pdata: string, nickNode: cc.Node, avatarNode: cc.Node) {
        let self = this;
        // if(pdata!=""||pdata!=undefined||pdata!=null){

        if (pdata != "" || pdata != null || pdata != undefined) {
            try {
                tryOne();
            } catch (error) {
                pdata = JSON.stringify(Global.PlayData);
                tryOne();
            }
        }

        function tryOne() {
            pdata = JSON.parse(pdata);
            let nick = pdata["PlayInfo"]["playNick"];
            if (nick == undefined || nick == "") {

            } else {
                let url = pdata["PlayInfo"]["playAvatar"];
                nickNode.getComponent(cc.Label).string = nick;
                cc.loader.load({ url, type: 'png' }, (err, res) => {
                    if (err) {
                        return;
                    }
                    avatarNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
                })
            }
        }
    }

    // update (dt) {}

    OpenMainScene() {
        cc.director.loadScene("MainScene");
    }
}
