import MainScene from "../scenesScript/MainScene";
import Global from "./Global";
import ConstantOther, { E_STORAGETYPE } from "./ConstantOther";

export default class CommonFun {


    /**
     * 转向函数
     * @param node 转向的节点
     * @param rotate1 可选参数，角度
     */
    static RotaFun(node,rotate1?,self?,airPos?){
        //tipNode是转圈节点
        let tipNode:cc.Node = node;
        if (tipNode.getNumberOfRunningActions() != 0)return;
        let childs = tipNode.children;
        //条件运算：前面条件不满足就不执行后面
        let runCount=0;
        childs.length > 1 && childs.forEach(v => {
            runCount++
            let vRun:cc.Action;
            //mul函数是系统函数：用于坐标分量乘上因子，所以因子不能丢，基本上是谁调用就用谁乘因子。也可以传入需要乘上的坐标参数
            if(rotate1==undefined){
                let p1 = v.position.mul(2);
                //注：这里的rotate函数是旋转函数：参数是弧度，返回值是角度，注意与rotateTo和rotateBy函数区别
                let tp = cc.v2(v.position).rotate(-60 * Math.PI / 180);
                let p2 = tp.mul(2);
                vRun = v.runAction(cc.bezierTo(.2, [p1, p2, tp]));
                // v.setPosition(tp)
            }
            else{
                // //注：这里的rotate函数是旋转函数：参数是弧度，返回值是角度，注意与rotateTo和rotateBy函数区别
                let p1 = v.position.mul(2);
                //注：这里的rotate函数是旋转函数：参数是弧度，返回值是角度，注意与rotateTo和rotateBy函数区别
                let tp = cc.v2(v.position).rotate(-60 * Math.PI / 180);
                let p2 = tp.mul(2);
                vRun = v.runAction(cc.bezierTo(.2, [p1, p2, tp]));
                if(vRun.isDone){
                    tipNode.setPosition(0,-366);
                }
                //tp是旋转之后的坐标。
                // v.setPosition(tp)
            }
        });
        self.scheduleOnce(()=>{
            self.RotateNode.setPosition(0,-366)
            self.RotateNode.on(cc.Node.EventType.TOUCH_END, self.MoveEnd,self.RotateNode.parent.getComponent("MainScene"));
            self.RotateNode.on(cc.Node.EventType.TOUCH_CANCEL, self.MoveEnd,self.RotateNode.parent.getComponent("MainScene"));
            self.RotateNode.on(cc.Node.EventType.TOUCH_MOVE, self.Move,self.RotateNode.parent.getComponent("MainScene"));
        },0.5);
    }

    /**
     * 图片加载
     * @param pngurl png路径
     * @param node 节点
     */
    static loadPng(pngurl,node:cc.Node){
        cc.loader.loadRes(pngurl,cc.SpriteFrame,function(err,sp){
            if(err){
                console.error(err);
                return;
            }
            else{
                let sprite = node.getComponent(cc.Sprite);
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                sprite.spriteFrame = sp;
            }
        });
    }


    static ShareGame(){
        // wx.worker.postMessage();
    }

    /**
     * 获取用户信息
     * @param self 
     * @param nickNode 
     * @param avatarNode 
     */
    static getWxPlayer(self?,nickNode?,avatarNode?){
        let width = cc.director.getWinSize().width;
        let height = cc.director.getWinSize().height;
        let button;
        // let result;
        let pdata = (cc.sys.localStorage.getItem(E_STORAGETYPE.PlayData));
        // if(pdata==""||pdata==null){ 
            // getUserInfo();
            if( cc.sys.platform==cc.sys.WECHAT_GAME){
                wx.getSetting({
                    success: (result)=>{
                        console.log(result);
                        if(result.authSetting['scope.userInfo']){
                            getUserInfo(nickNode,avatarNode);
                        }else{
                            Btn_getInfo();
                        }
                    },
                    fail: (err)=>{
                        console.log(err);
                        Btn_getInfo();
                    },
                    complete: ()=>{}
                });
            }else{
                pdata = JSON.parse(pdata);
                if(pdata.playNick==""){
                    // getUserInfo();
                    Btn_getInfo();
                }
        }

        function Btn_getInfo(){
            if( cc.sys.platform==cc.sys.WECHAT_GAME){
                console.log("获取用户信息");
                button = wx.createUserInfoButton({
                    type: 'text',
                    text: '',
                    visiable: true,
                    style: {
                        left: 0,
                        top: 0,
                        width: width,
                        height: height,
                        lineHeight :40,
                        backgroundColor: '#00000000',
                        color: '#00000000',
                        textAlign: 'center',
                        fontSize: 10,
                        borderRadius: 4
                    }
                });
                button.onTap( (res)=>{
                    console.log(res);
                    let userInfo = res.userInfo;
                    if(!userInfo){
                        console.log(res.errMsg);
                        return;
                    }
                    Global.PlayData.PlayInfo.playNick = userInfo.nickName;
                    Global.PlayData.PlayInfo.playAvatar = userInfo.avatarUrl;
                    if(cc.sys.platform = cc.sys.WECHAT_GAME){
                        Global.PlayData["PlayInfo"]["playAvatar"] = userInfo.avatarUrl;
                        Global.PlayData["PlayInfo"]["playNick"] = userInfo.nickName;
                        let str:string = JSON.stringify(Global.PlayData);
                        wx.setStorage({
                            key: 'PlayData',
                            data: str,
                            success: (result)=>{
                                
                            },
                            fail: (result)=>{
                                console.log(result);
                                cc.sys.localStorage.setItem(E_STORAGETYPE,JSON.stringify(Global.PlayData));
                            },
                            complete: ()=>{}
                        });
                    }else{
                        Global.PlayData["PlayInfo"]["playAvatar"] = userInfo.avatarUrl;
                        Global.PlayData["PlayInfo"]["playNick"] = userInfo.nickName;
                        cc.sys.localStorage.setItem(E_STORAGETYPE,JSON.stringify(Global.PlayData));
                    }
                    if(nickNode!=undefined){
                        nickNode.getComponent(cc.Label).string = userInfo.nickName;
                        let url = userInfo.avatarUrl;
                        cc.loader.load({url,type:'png'},(err,texture)=>{
                            if(err){
                                console.log(err);
                                return;
                            }
                            Global.wx_PlayerInfo = userInfo;
                            self.res = userInfo;
                            avatarNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(texture);
                            ConstantOther.GLOBAL_EVENTMGR.emit("getInfo");
                        });
                    }
                    button.hide();
                    button.destroy();
                });
            }
            cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData,JSON.stringify(Global.PlayData));
        }
        function getUserInfo(nickNode?,avaNode?){
            wx.getUserInfo({
                withCredentials: 'false',
                lang: 'zh_CN',
                timeout:10000,
                success: (result)=>{
                    console.log("getUserInfo");
                    // console.log(result);
                    if(nickNode!=undefined){
                        nickNode.getComponent(cc.Label).stirng = result.userInfo.nickName;
                        let url = result.userInfo.avatarUrl;
                        cc.loader.load({url,type:'png'},(err,res)=>{
                            if(err){
                                console.log(err);
                            }else{
                                avaNode.getComponent(cc.Sprite).spriteFrame = new cc.SpriteFrame(res);
                            }
                        });
                    }
                    Global.PlayData.PlayInfo.playNick = result.userInfo.nickName;
                    Global.PlayData.PlayInfo.playAvatar = result.userInfo.avatarUrl;
                    cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData,JSON.stringify(Global.PlayData));
                },
                fail: (err)=>{
                    console.log(err);
                },
                complete: ()=>{}
            });
        }
    }

    /**
     * 分数上传函数
     * @param score 需要上传的分数
     */
    static UpdateScore(score:number){
        if(cc.sys.platform==cc.sys.WECHAT_GAME){
            wx.setUserCloudStorage({
                KVDataList:[
                    {key:'score',value:(String(score))}
                ],
                success:res=>{
                    console.log("上传成功"+res);
                },
                fail:res=>{
                    console.log("上传失败"+res);
                }
            })
        }
    }
}
