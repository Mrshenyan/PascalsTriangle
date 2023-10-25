import MainScene from "../scenesScript/MainScene";
import Global from "./Global";
import ConstantOther, { E_STORAGETYPE } from "./ConstantOther";
export default class CommonFun {


    static actionIsDone = true;
    /**
     * 转向函数
     * @param node 转向的节点
     * @param rotate1 可选参数，角度
     */
    static RotaFun(node, rotate1?, self?, airPos?) {
        //tipNode是转圈节点
        if (!CommonFun.actionIsDone) return;
        CommonFun.actionIsDone = false;
        let tipNode: cc.Node = node;
        if (tipNode.getNumberOfRunningActions() != 0) return;
        let childs = tipNode.children;
        //条件运算：前面条件不满足就不执行后面
        let runCount = 0;
        childs.length > 1 && childs.forEach(v => {
            runCount++
            let vRun: cc.Action;
            //mul函数是系统函数：用于坐标分量乘上因子，所以因子不能丢，基本上是谁调用就用谁乘因子。也可以传入需要乘上的坐标参数
            if (rotate1 == undefined) {
                let p1 = cc.v2(v.position.mul(2));
                //注：这里的rotate函数是旋转函数：参数是弧度，返回值是角度，注意与rotateTo和rotateBy函数区别
                let tp = cc.v2(v.position).rotate(-60 * Math.PI / 180);
                let p2 = tp.mul(2);
                vRun = v.runAction(cc.bezierTo(.2, [p1, p2, tp]));
                cc.tween(v).bezierTo(0.2, p1, p2, tp).call(() => {
                    self.RotateNode.setPosition(airPos);
                    CommonFun.actionIsDone = true;
                }).start();
                // v.setPosition(tp)
            }
            else {
                // //注：这里的rotate函数是旋转函数：参数是弧度，返回值是角度，注意与rotateTo和rotateBy函数区别
                let p1 = cc.v2(v.position.mul(2));
                //注：这里的rotate函数是旋转函数：参数是弧度，返回值是角度，注意与rotateTo和rotateBy函数区别
                let tp = cc.v2(v.position).rotate(-60 * Math.PI / 180);
                let p2 = tp.mul(2);
                vRun = v.runAction(cc.bezierTo(.2, [p1, p2, tp]));
                cc.tween(v).bezierTo(0.2, p1, p2, tp).call(() => {
                    self.RotateNode.setPosition(airPos);
                    CommonFun.actionIsDone = true;
                }).start();
            }
        });
    }

    /**
     * 图片加载
     * @param pngurl png路径
     * @param node 节点
     */
    static loadPng(pngurl, node: cc.Node) {
        cc.loader.loadRes(pngurl, cc.SpriteFrame, function (err, sp) {
            if (err) {
                console.error(err);
                return;
            }
            else {
                let sprite = node.getComponent(cc.Sprite);
                sprite.sizeMode = cc.Sprite.SizeMode.CUSTOM;
                sprite.spriteFrame = sp;
            }
        });
    }


    static ShareGame() {
        
    }

    /**
     * 分数上传函数
     * @param score 需要上传的分数
     */
    static UpdateScore(score: number) {
        
    }
}
