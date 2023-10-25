import CommonFun from "../commonScript/CommonFun";
import ConstantOther, { E_STORAGETYPE } from "../commonScript/ConstantOther";
import Global from "../commonScript/Global";
const tt = window["tt"];
const { ccclass, property } = cc._decorator;

@ccclass
export default class MainScene extends cc.Component {

    /** 格子的预制体*/
    @property(cc.Prefab)
    cell: cc.Prefab = null;//格子的预制体
    @property(cc.Node)
    RotateNode: cc.Node = null;
    @property(cc.Prefab)
    Shadow: cc.Prefab = null;//阴影的预制体
    @property(cc.Prefab)
    Chesses: cc.Prefab[] = [];//数字颜色的预制体
    @property(cc.Node)
    Baoxiang: cc.Node = null;
    /**分数预制体 */
    @property(cc.Prefab)
    AddScore: cc.Prefab = null;
    /**锤子预制体 */
    @property(cc.Prefab)
    HammerPre: cc.Prefab = null;
    @property(cc.Node)
    ScoreNode: cc.Node = null;
    @property(cc.Prefab)
    CenterExplo: cc.Prefab = null;
    @property(cc.Prefab)
    CellExplo: cc.Prefab = null;
    @property(cc.Label)
    ToolNum: cc.Label[] = [];
    @property(cc.Node)
    AlertNode: cc.Node = null;
    @property(cc.Prefab)
    MunisGold: cc.Prefab = null;
    @property(cc.Node)
    HelpNode: cc.Node = null;
    @property(cc.Node)
    stopNode: cc.Node = null;
    @property(cc.Node)
    congratuNoe: cc.Node = null;
    /**游戏区域的游戏格子，在这个类中用于存放格子的预制体的实例化，在循环创建格子的时候被复制。 */
    Cell: cc.Node = null;//
    /**第一个六边形的位置 */
    CellPOS: cc.Vec2 = new cc.Vec2(0, 386);//
    /**六边形单边长 */
    CellLine: number = 39 / Math.cos(Math.PI / 6);//
    /**生成的游戏区域的格子的信息 */
    allCellPos = new Array();//
    // thisProp:cc.Node=null;
    /**被填上数字的格子数； */
    FilledGridCount: number = 45;
    /**阴影节点 */
    ShoadowNode: cc.Node = null;
    /**是否填上数字 */
    FilledGrid: boolean = false;
    /**将要被填入游戏区的数字 */
    FilledPos = new Array(2);

    nickNode: cc.Node = null;
    avatarNode: cc.Node = null;
    GoldNode: cc.Node = null;
    ToolNode: cc.Node = null;

    CellZindex: number = 10;
    NewNumZindex: number = 11;
    ToolZindex: number = 1000;
    ScoreZindex: number = 13;
    //移动的RotateNode显示在手指上
    isAdd = false;
    /**当前游戏的最大值 */
    currentMaxNum = 3;
    currentMinNum = 1;

    gameover = false;
    onLoad() {
        let self = this;
        this.ToolNode = cc.find("Canvas/ToolNode");
        this.ToolNode.zIndex = 46;
        this.nickNode = cc.find("Canvas/PlayerNode").getChildByName("nickName");
        this.avatarNode = cc.find("Canvas/PlayerNode/AvatarMask").children[0].children[0].getChildByName("avatar");
        this.GoldNode = cc.find("Canvas/GoldNode");
        this.ShoadowNode = cc.instantiate(this.Shadow)
        this.ShoadowNode.active = false;
        this.Cell = cc.instantiate(this.cell);
        this.generaterCell();
        this.RotateNode.on(cc.Node.EventType.TOUCH_MOVE, this.Move, this);
        this.RotateNode.on(cc.Node.EventType.TOUCH_END, this.MoveEnd, this);
        this.RotateNode.on(cc.Node.EventType.TOUCH_CANCEL, this.moveCancle, this);


    }
    /**
     * 初始化
     */
    init() {
        let self = this;
        this.RotateNode.zIndex = 46;
        this.schedule(() => {
            let time = Math.random() * 5;
            self.scheduleOnce(() => {
                self.Baoxiang.getComponent(cc.Animation).play();
            }, time);
        }, 5);
        let data = (cc.sys.localStorage.getItem(E_STORAGETYPE.PlayData))
        if (data == undefined || data == "") {
            data = Global.PlayData;
        } else {
            data = JSON.parse(data);
            let nick = data["PlayInfo"]["playNick"];
            let url = data["PlayInfo"]["playAvatar"];
            Global.PlayData["PlayInfo"]["playAvatar"] = url;
            Global.PlayData["PlayInfo"]["playNick"] = nick;
            cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData, JSON.stringify(Global.PlayData));
        }
        let Tdata = cc.sys.localStorage.getItem(E_STORAGETYPE.TempData)
        if (Tdata == undefined || Tdata == "") {
            Tdata = Global.TempData;
        } else {
            Global.TempData = JSON.parse(Tdata);
        }
        let gamedata = (cc.sys.localStorage.getItem(E_STORAGETYPE.GameData));
        if (gamedata == undefined || gamedata == "") {
            gamedata = Global.GameData;
        } else {
            Global.TempData.tempPlayInfo.playScore = Global.PlayData.PlayInfo.playScore
            gamedata = JSON.parse(gamedata)
            self.currentMaxNum = gamedata.chessPos[1][0]
            for (let i = 1; i < gamedata.chessPos.length; i++) {
                for (let j = 0; j < gamedata.chessPos[i].length; j++) {
                    let num = gamedata.chessPos[i][j];
                    if (!(num == null)) {
                        let attr = { theNum: num };
                        if (num > self.currentMaxNum) {
                            self.currentMaxNum = num;
                        }
                        if (num < self.currentMinNum) {
                            self.currentMinNum = num;
                        }
                        let isFilled = { isFilled: true };
                        let row = -Math.floor((i - 1) / 2);//向下取整
                        let n = i;
                        let sn = j
                        let tag = { tag: { n, row, sn } }
                        let color: cc.Node;
                        if (num % 10 == 0) {
                            color = cc.instantiate(this.Chesses[3]);
                            color.attr(attr);
                            color.attr(tag);
                            color.children[0].getComponent(cc.Label).string = num.toString();
                            color.on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                            this.allCellPos[i][j][0].attr(isFilled);
                            this.allCellPos[i][j][0].addChild(color);
                        }
                        else {
                            if (num > self.currentMaxNum) {
                                self.currentMaxNum = num;
                            }
                            if (num < self.currentMinNum) {
                                self.currentMinNum = num;
                            }
                            switch (num % 3) {
                                case 0: {
                                    color = cc.instantiate(this.Chesses[0]);
                                    color.attr(attr);
                                    color.attr(tag);
                                    color.children[0].getComponent(cc.Label).string = num.toString();
                                    color.on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                                    this.allCellPos[i][j][0].attr(isFilled);
                                    this.allCellPos[i][j][0].addChild(color);
                                    break;
                                }
                                case 1: {
                                    color = cc.instantiate(this.Chesses[1]);
                                    color.attr(attr);
                                    color.attr(tag);
                                    color.children[0].getComponent(cc.Label).string = num.toString();
                                    color.on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                                    this.allCellPos[i][j][0].attr(isFilled);
                                    this.allCellPos[i][j][0].addChild(color);
                                    break;
                                }
                                case 2: {
                                    color = cc.instantiate(this.Chesses[2]);
                                    color.attr(attr);
                                    color.attr(tag);
                                    color.children[0].getComponent(cc.Label).string = num.toString();
                                    color.on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                                    this.allCellPos[i][j][0].attr(isFilled);
                                    this.allCellPos[i][j][0].addChild(color);
                                    break;
                                }
                            }
                        }
                    }
                }
            }
        }

    }

    start() {
        let self = this;
        this.init();
        let data = (cc.sys.localStorage.getItem(E_STORAGETYPE.PlayData));
        if (data == undefined || data == "") {
            data = Global.PlayData;
        } else {
            data = JSON.parse(data);
        }
        this.generateChess();
        this.GoldNode.children[0].getComponent(cc.Label).string = data.PlayInfo.playGold.toString();
        this.ScoreNode.children[0].getComponent(cc.Label).string = data.PlayInfo.playScore.toString();
        this.ToolNum[0].string = data.PlayInfo.playTool.oneKey.toString();
        this.ToolNum[1].string = data.PlayInfo.playTool.hammer.toString();
        this.ToolNum[2].string = data.PlayInfo.playTool.reGene.toString();
        this.ScoreNode.children[1].getComponent(cc.Label).string = Global.PlayData.PlayInfo.playScore.toString();

        this.Baoxiang.active = !Global.PlayData.PlayInfo.dailyAward;
    }
    /**游戏区生成函数 */
    generaterCell() {
        // let a = Math.pow(4, 0.5);
        let self = this;
        let j = -1;
        let gap = 4;
        for (let n = 1; n < 10; n++) {
            let i = 0;
            let limit = Math.floor((n - 1) / 2);
            let remainder = (n / 2) - parseInt((n / 2).toString());
            if (remainder != 0) {
                i = -Math.floor((n - 1) / 2);//向下取整
                let count = 0;
                this.allCellPos[n] = new Array();//一整行
                for (; i <= limit; i++) {
                    let cellPos: cc.Vec2 = new cc.Vec2();
                    let newCell = cc.instantiate(this.Cell);
                    newCell.zIndex = self.CellZindex;
                    cellPos.x = this.CellPOS.x + 2 * this.CellLine * Math.cos(Math.PI / 6) * i;
                    if (i != 0) {
                        cellPos.x += i * gap;
                    }
                    cellPos.y = this.CellPOS.y - 3 * this.CellLine * (n - 1) / 2 - 3 * n;
                    newCell.setPosition(cellPos);
                    let shadownode = cc.instantiate(this.ShoadowNode);
                    shadownode.name = "shadow"
                    if (!newCell.getChildByName("shadow")) {
                        newCell.addChild(shadownode);
                    }
                    this.node.addChild(newCell);
                    j++;
                    let row = i;
                    let sn = count;
                    let attr = { tag: { n, row, sn } };
                    let attr2 = { isFilled: false };
                    newCell.attr(attr);
                    newCell.attr(attr2);
                    this.allCellPos[n][count] = new Array();
                    this.allCellPos[n][count].push(newCell);
                    this.allCellPos[n][count].push(cellPos);
                    this.allCellPos[n][count]["SN"] = new Array();
                    this.allCellPos[n][count]["SN"].push(n);
                    this.allCellPos[n][count]["SN"].push(i);
                    this.allCellPos[n][count]["SN"].push(count);
                    count++;
                }
            }
            else {
                i = -n / 2;//向下取整
                let count = 0;
                this.allCellPos[n] = new Array();
                for (; i <= n / 2; i++) {
                    if (i != 0) {
                        let x = 0;//x是正负因子
                        if (i < 0) {
                            x = -1;
                        }
                        else {
                            x = 1;
                        }
                        let cellPos: cc.Vec2 = new cc.Vec2();
                        let newCell = cc.instantiate(this.Cell);
                        newCell.zIndex = self.CellZindex;
                        cellPos.x = this.CellPOS.x + this.CellLine * Math.cos(Math.PI / 6) * x + 2 * this.CellLine * Math.cos(Math.PI / 6) * (Math.abs(i) - 1) * x;
                        if (i == -1 || i == 1) {
                            cellPos.x += (i * gap) / 2;
                        }
                        else {
                            cellPos.x += ((i * gap) - x * gap / 2)
                        }
                        cellPos.y = this.CellPOS.y - 1.5 * this.CellLine * (n - 1) - 3 * n;
                        newCell.setPosition(cellPos);
                        // newCell.on(cc.Node.EventType.TOUCH_START, this.CellClickCallBack, this, false);
                        let shadownode = cc.instantiate(this.ShoadowNode);
                        shadownode.name = "shadow"
                        if (!newCell.getChildByName("shadow")) {
                            newCell.addChild(shadownode);
                        }
                        this.node.addChild(newCell);
                        j++;
                        let row = i;//中间向两边
                        let sn = count;//自左向右，从0开始
                        let attr = { tag: { n, row, sn } };
                        let attr2 = { isFilled: false };
                        newCell.attr(attr);
                        newCell.attr(attr2);
                        this.allCellPos[n][count] = new Array();
                        this.allCellPos[n][count].push(newCell);
                        this.allCellPos[n][count].push(cellPos);
                        this.allCellPos[n][count]["SN"] = new Array();
                        this.allCellPos[n][count]["SN"].push(n);
                        this.allCellPos[n][count]["SN"].push(i);
                        this.allCellPos[n][count]["SN"].push(count);
                        count++;
                    }
                }
            }


        }
    }

    CellClickCallBack(event, customEventTarget) {
        let tag = event.currentTarget.tag;
        //这里的this是调用的时候传入的响应节点
        let nodes = this.FindCell(tag);//tag是点击的游戏格的位置属性和第几个
    }

    /**
     * 获取点击的单元格的周围游戏格。
     * @param tag 被点击的单元格信息
     * @param toolKind 使用的道具类型，1.0：一键消除，2.1,2.2,2.3：小导弹，3.0：强制合成
     * 注：小导弹有三种：横向，左斜向，右斜向，分别对应2.1，2.2，2.3
     * 这个查找函数用于返回使用道具之后的需要消除的游戏格
     */
    FindCell(tag, toolKind?): cc.Node[] {
        if (tag == undefined) {
            return;
        }
        let lineNum = tag.n;
        let RowNum = tag.row;
        let CellSN = tag.sn;
        let x = lineNum / 2 - parseInt((lineNum / 2).toString());
        let RoundSixCellSN = new Array(6);
        for (let o = 0; o < RoundSixCellSN.length; o++) {
            RoundSixCellSN[o] = new Array();
        }
        /**使用技能返回的游戏格 */
        let ToolKindNodes = new Array<cc.Node>();
        RoundSixCellSN[0].push(lineNum - 1);
        RoundSixCellSN[0].push(CellSN - 1);
        RoundSixCellSN[1].push(lineNum - 1);
        RoundSixCellSN[1].push(CellSN);
        RoundSixCellSN[2].push(lineNum);
        RoundSixCellSN[2].push(CellSN - 1);
        RoundSixCellSN[3].push(lineNum);
        RoundSixCellSN[3].push(CellSN + 1);
        RoundSixCellSN[4].push(lineNum + 1);
        RoundSixCellSN[4].push(CellSN);
        RoundSixCellSN[5].push(lineNum + 1);
        RoundSixCellSN[5].push(CellSN + 1);
        let RoundSixCellNodes = new Array();

        for (let i = 0; i < RoundSixCellSN.length; i++) {
            let cellsn = RoundSixCellSN[i][1];
            let linenum = RoundSixCellSN[i][0];
            try {
                if (this.allCellPos[linenum][cellsn]) {
                    RoundSixCellNodes.push(this.allCellPos[linenum][cellsn]);
                }
            } catch (error) {
                continue;
            }
        }
        RoundSixCellNodes[RoundSixCellNodes.length] = this.allCellPos[lineNum][CellSN]
        switch (toolKind) {
            case "1": {
                ToolKindNodes = RoundSixCellNodes;
                break;
            }
            case "2.1": {
                ToolKindNodes[0] = RoundSixCellNodes[2];
                ToolKindNodes[1] = RoundSixCellNodes[3];
                ToolKindNodes[2] = RoundSixCellNodes[6];
                break;
            }
            case "2.2": {
                ToolKindNodes[0] = RoundSixCellNodes[0];
                ToolKindNodes[1] = RoundSixCellNodes[5];
                ToolKindNodes[2] = RoundSixCellNodes[6];
                break;
            }
            case "2.3": {
                ToolKindNodes[0] = RoundSixCellNodes[1];
                ToolKindNodes[1] = RoundSixCellNodes[4];
                ToolKindNodes[2] = RoundSixCellNodes[6];
                break;
            }
            case "3": {
                //强制合成要另外处理，等第二次选择结束
                ToolKindNodes[0] = RoundSixCellNodes[2];
                ToolKindNodes[1] = RoundSixCellNodes[3];
                ToolKindNodes[2] = RoundSixCellNodes[6];
                break;
            }
            default: {
                return RoundSixCellNodes;
            }
        }
        return ToolKindNodes;
    }

    FindMinNum() {
        let tempMinnum = 0
        let isT = false;
        for (let i = 1; i < this.allCellPos.length; i++) {
            for (let j = 0; j < this.allCellPos[i].length; j++) {
                if (this.allCellPos[i][j][0].childrenCount > 1) {
                    let num = this.allCellPos[i][j][0].children[1].theNum;
                    if (num != null || num != undefined) {
                        if (!isT) {
                            tempMinnum = num;
                            isT = true;
                        }
                        if (num < tempMinnum) {
                            tempMinnum = num;
                        }
                    }
                }
            }
        }
        this.currentMinNum = tempMinnum;
        if (this.currentMinNum == this.currentMaxNum || this.currentMinNum == 0) {
            this.currentMinNum = 1;
        }
    }
    /**
     * 棋子生成函数，
     * @param count 需要生成的个数
     * @param rotate 生成的初始角度
     */
    generateChess() {
        this.FindMinNum();
        let self = this;
        let count = 0;
        let rotate = 0;
        let genedNumGrid: Array<cc.Node> = new Array();
        let tag = { tag: null };
        let num = { theNum: 0 };
        // if (!count) {
        count = parseInt((Math.random() * 2).toString()) + 1, rotate = parseInt((Math.random() * 6).toString()) * 60;
        // }
        this.RotateNode.removeAllChildren();//该节点是新生成的棋子的父节点
        //生成棋子的时候需要判断游戏区域剩余的空格数
        switch (this.FilledGridCount) {
            case 0: {//gameover
                this.gameover = true;
                let node = cc.find("Canvas/StopNode");
                node.x = 0;
                node.active = true;
                node.zIndex = self.ToolZindex;
                node.children[3].children[0].active = false;
                let titleover = node.getChildByName("gameover");
                titleover.runAction(cc.sequence(cc.scaleBy(0.15, 1.5, 1.5), cc.scaleBy(0.2, 0.85, 0.85), cc.scaleBy(0.1, 1, 1)));
                tt.setImRankData({
                    dataType: 0,
                    value: Global.PlayData.PlayInfo.playScore
                });


                break;
            }
            case 1: {//generate one number grid，这里只生成一个棋子
                geneFun()
                break;
            }
            default: {//generate two number grid,要说明的是这里生成1个或者两个棋子
                geneFun();
                break;
            }
        }

        function numPoolFun(GeneNumPool): number {

            let poolSn = 0;
            let numpool1 = new Array(), numpool2 = new Array(), numpool3 = new Array();
            for (let px = 0; px < 3; px++) { numpool1[px] = GeneNumPool[px]; }
            for (let px = numpool1.length; px < GeneNumPool.length - 3; px++) { numpool2[px] = GeneNumPool[px]; }
            for (let px = GeneNumPool.length - 3; px < GeneNumPool.length; px++) { numpool3[px] = GeneNumPool[px]; }
            let geneRom = Math.random();
            if (geneRom < 0.15) {
                poolSn = 0;
            } else if (geneRom <= 0.95) {
                poolSn = 1;
            } else { poolSn = 2; }

            let subgenenum = 0;
            switch (poolSn) {
                case 0: {
                    subgenenum = parseInt((Math.random() * numpool1.length).toString());
                    break;
                }
                case 1: {
                    subgenenum = parseInt((Math.random() * numpool2.length).toString());
                    break;
                }
                case 2: {
                    subgenenum = parseInt((Math.random() * numpool3.length).toString());
                    break;
                }
            }
            return subgenenum;
        }
        function geneFun() {
            let genePos = new Array<cc.Vec2>(2);
            let GeneNumPool = self.ChangeGeneMumPool(self.currentMinNum, self.currentMaxNum, self.FilledGridCount);
            let geneKind = 0;
            let genedNum = numPoolFun(GeneNumPool);

            if (GeneNumPool[genedNum] % 10 == 0) {
                geneKind = 3;
            } else {
                geneKind = GeneNumPool[genedNum] % 3;
            }
            let geneID = [0, 1, 2, 3];
            if (count == 1) {
                genedNumGrid = new Array(1);
                genedNumGrid[0] = new cc.Node();
            } else {
                genedNumGrid = new Array(2);
                genedNumGrid[0] = new cc.Node();
                genedNumGrid[1] = new cc.Node();
            }
            if (!count || count == 1) {
                genedNumGrid[0] = cc.instantiate(self.Chesses[geneID[geneKind]]);
                genedNumGrid[0].on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                genedNumGrid[0].attr(tag);
                num.theNum = GeneNumPool[genedNum];
                genedNumGrid[0].attr(num);
                genedNumGrid[0].children[0].getComponent(cc.Label).string = GeneNumPool[genedNum].toString();
                GeneNumPool.splice(genedNum, 1)
                genePos[0] = genedNumGrid[0].position.rotate(rotate);

            }
            else {
                genedNumGrid[0] = cc.instantiate(self.Chesses[geneID[geneKind]]);
                genedNumGrid[0].on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                genedNumGrid[0].attr(tag);
                num.theNum = GeneNumPool[genedNum];
                genedNumGrid[0].attr(num);
                genedNumGrid[0].children[0].getComponent(cc.Label).string = GeneNumPool[genedNum].toString();
                GeneNumPool.splice(genedNum, 1)
                // genedNum = parseInt((Math.random() * GeneNumPool.length).toString());
                genedNum = numPoolFun(GeneNumPool);
                if (GeneNumPool[genedNum] % 10 == 0) {
                    geneKind = 3;
                } else {
                    geneKind = GeneNumPool[genedNum] % 3;
                }
                genedNumGrid[1] = cc.instantiate(self.Chesses[geneID[geneKind]]);
                genedNumGrid[1].on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
                genedNumGrid[1].attr(tag);
                num.theNum = GeneNumPool[genedNum];
                genedNumGrid[1].attr(num);
                genedNumGrid[1].children[0].getComponent(cc.Label).string = GeneNumPool[genedNum].toString();
                GeneNumPool.splice(genedNum, 1)
                genedNumGrid[0].x = 39;
                genedNumGrid[1].x = -39
                let temp1 = cc.v2(genedNumGrid[0].position);
                let temp2 = cc.v2(genedNumGrid[1].position);
                genePos[0] = temp1.rotate(rotate * Math.PI / 180);
                genePos[1] = temp2.rotate(rotate * Math.PI / 180);
            }
            for (let i = genedNumGrid.length - 1; i >= 0; i--) {
                if (genedNumGrid[i] == undefined || genedNumGrid[i] == null) {
                    continue;
                }
                else {
                    genedNumGrid[i].setPosition(genePos[i]);
                    self.RotateNode.addChild(genedNumGrid[i]);
                }
            }
        }
    }

    ChangeGeneMumPool(cMinNum, cMaxNum, FilledGrid): Array<number> {
        let newPool = new Array();
        // if(cMinNum<5)cMinNum=1;
        if (FilledGrid > 25) {

        } else if (FilledGrid > 8) {
            cMinNum -= 2;
            if (cMinNum < 1) cMinNum = 1;
        } else {
            if (cMinNum > 6) { cMinNum /= 2; }
        }
        for (let i = cMinNum; i < cMinNum + 8; i++) {
            newPool.push(i);
        }
        newPool.push(cMaxNum);
        return newPool
    }

    /**
     * 移动函数
     * @param event 
     */
    Move(event) {
        let self = this;
        let touchpos = event.touch.getDelta();
        // this.RotateNode.getComponent(cc.Widget).enabled = false;
        if (!this.isAdd) {
            // this.RotateNode.y+=60;
            this.isAdd = true;
        }
        this.RotateNode.x += touchpos.x;
        this.RotateNode.y += touchpos.y;
        self.FilledPos = [];
        RotateLoop:
        for (let n = 0; n < this.RotateNode.childrenCount; n++) {
            allCellLoop:
            for (let i = 1; i < this.allCellPos.length; i++) {
                for (let j = 0; j < this.allCellPos[i].length; j++) {
                    let node = this.allCellPos[i][j][0];
                    let nodeworldpos = node.parent.convertToWorldSpaceAR(node.getPosition())
                    let theNode = this.RotateNode.children[n]
                    let vpos = theNode.parent.convertToWorldSpaceAR(theNode.getPosition());
                    let s = this.FilledGrid = alignPos(vpos, nodeworldpos, node, n, this.RotateNode.childrenCount);
                    if (s) {
                        i = 1, j = 0;
                        break allCellLoop;
                    }
                }
            }
        }
        function alignPos(pos1, pos2, node, n, count): boolean {
            let v = new cc.Vec2(pos1.x - pos2.x, pos1.y - pos2.y)
            let det = cc.v2().sub(v).mag();;
            if (det < (node.width / 2 - 10)) {
                node.getChildByName("shadow").active = true;
                self.FilledPos.push(node);
                if (node.isFilled && count == 2) {
                    self.FilledPos = [];
                }
                return true;
            }
            else {
                if ((n != 1) || (count < 2)) {
                    node.getChildByName("shadow").active = false;
                    self.FilledPos = [];
                }
                return false;
            }
        }
    }

    moveCancle(event) {

        let wiget: cc.Widget = this.RotateNode.getComponent(cc.Widget);
        wiget.updateAlignment();
        this.MoveEnd(event);
    }

    /**
     * 移动结束
     * @param event 
     */
    MoveEnd(event?) {
        let self = this;
        let fpos = new Array();
        let startPos = event.touch._startPoint
        let prevPoint = event.touch._prevPoint
        let deltaPos = new cc.Vec2(startPos.x - prevPoint.x, startPos.y - prevPoint.y);
        let delta = deltaPos.mag();
        let wiget: cc.Widget = this.RotateNode.getComponent(cc.Widget);
        wiget.updateAlignment();
        if (delta < 4) {
            let pos = this.RotateNode.position;
            CommonFun.RotaFun(this.RotateNode, undefined, self, pos);
        }
        else if (!this.FilledGrid) {//当前格子有数字，返回
            CommonFun.actionIsDone = true;
        }
        else if (this.FilledPos.length < 1) {//需要填充的格子不够，返回
            CommonFun.actionIsDone = true;
        } else {
            CommonFun.actionIsDone = true;
            for (let i = 0; i < this.FilledPos.length; i++) {
                if (this.FilledPos[i] == null || this.FilledPos[i] == undefined) {
                    //不在格子区，返回
                }
                else if (this.FilledPos.length != this.RotateNode.childrenCount) {
                    this.FilledPos[i].children[0].active = false;
                }
                else if (!this.FilledPos[i].isFilled) {
                    this.FilledPos[i].isFilled = true;
                    this.RotateNode.children[i].setPosition(0, 0);
                    this.RotateNode.children[i]["tag"] = this.FilledPos[i].tag;
                    this.RotateNode.children[i].parent = this.FilledPos[i];
                    fpos[fpos.length] = this.FilledPos[i];
                    this.FilledPos.shift();
                    i = -1;
                    this.FilledGridCount -= 1;
                } else {
                    this.FilledPos[i].children[0].active = false;
                }
            }
        }
        for (let i = 0; i < fpos.length; i++) {
            let tag = fpos[i].children[1].tag;
            if (tag == undefined) {
                tag = fpos[i].children[2].tag
            }
            self.Eliminate(tag, fpos.length, i);
        }
        self.isAdd = false;
        this.FilledGrid = false;
        this.FilledPos = []
    }
    /**
     * 消除预处理函数
     * @param tag 数字在游戏区域的位置
     */
    Eliminate(tag: { n, row, sn }, len?, sn?, Elim?) {
        let ArroundNodes = this.FindCell(tag);
        let self = this;
        let leftNode = this.allCellPos[tag.n][tag.sn - 1], rightNode = this.allCellPos[tag.n][tag.sn + 1];
        let downLeftNode, downRightNode;
        let theNode = this.allCellPos[tag.n][tag.sn];
        if (tag.n == 9) {
            downLeftNode = undefined;
            downRightNode = undefined;
        } else {
            downLeftNode = this.allCellPos[tag.n + 1][tag.sn]
            downRightNode = this.allCellPos[tag.n + 1][tag.sn + 1];
        }
        /** 左，右，左下，右下,0表示为空，可以填入数字*/
        let leftIsFilled, rightIsFilled, downLeftIsFilled, downRightIsFilled;
        if (leftNode == undefined) {
            leftIsFilled = 0b1111;
        }
        else {
            if (!leftNode[0].isFilled) {
                leftIsFilled = 0b0000;
            }
            else {
                leftIsFilled = 0b0010;
            }
        }
        if (rightNode == undefined) {
            rightIsFilled = 0b1111;
        }
        else {
            if (!rightNode[0].isFilled) {
                rightIsFilled = 0b0000;
            }
            else {
                rightIsFilled = 0b0001;
            }
        }
        if (downLeftNode == undefined) {
            downLeftIsFilled = 0b1111;
        }
        else {
            if (!downLeftNode[0].isFilled) {
                downLeftIsFilled = 0b0000;
            }
            else {
                downLeftIsFilled = 0b1000;
            }
        }
        if (downRightNode == undefined) {
            downRightIsFilled = 0b1111;
        }
        else {
            if (!downRightNode[0].isFilled) {
                downRightIsFilled = 0b0000;
            }
            else {
                downRightIsFilled = 0b0100;
            }
        }
        let LPulsR = leftIsFilled + rightIsFilled;
        let x = LPulsR | 0b0000//按位于之后结果为0表示左右都有空，即不需要消除
        if (!x) {
            self.generateChess();
        } else {
            switch (x) {
                case 0b0010: {
                    subElinate(theNode[0].children[1], leftNode[0].children[1], downLeftIsFilled);
                    break;
                }
                case 0b0001: {
                    subElinate(theNode[0].children[1], rightNode[0].children[1], downRightIsFilled);
                    break;
                }
                case 0b0011: {
                    let lorR = Math.random();
                    LorRElinate(lorR);
                    break;
                }
                default: {
                    if (leftIsFilled && leftIsFilled > 5) {
                        if (rightIsFilled) {
                            try {
                                subElinate(theNode[0].children[1], rightNode[0].children[1], downRightIsFilled);
                            }
                            catch {
                                self.generateChess();
                            }
                        }
                        else {
                            //边界情况，为空直接重新生成
                            self.generateChess();
                        }
                    }
                    else if (rightIsFilled && rightIsFilled > 5) {
                        if (leftIsFilled) {
                            try {
                                subElinate(theNode[0].children[1], leftNode[0].children[1], downLeftIsFilled);
                            }
                            catch {
                                self.generateChess();
                            }
                        }
                        else {
                            //边界情况，为空直接重新生成
                            self.generateChess();
                        }
                    }
                }
            }
        }

        /**
         * 
         * @param node1 当前棋子
         * @param node2 左或右棋子
         * @param downFilled 左下或右下游戏格
         * @param both 是否左右都有棋子
         */
        function subElinate(node1, node2, downFilled, both?: boolean) {
            if (both == undefined) {
                if (node1.theNum == node2.theNum) {
                    console.log("相等，可以相消");
                    if (!downFilled) {
                        console.log("下是空的，可以填入");
                        let addNum = node1.theNum + node2.theNum;
                        let pos = node1.getPosition();
                        let tag;
                        self.AddNum(node1, node2);
                        if (node1.tag.sn < node2.tag.sn) {
                            tag = { n: node2.tag.n + 1, row: node2.tag.row, sn: node2.tag.sn };
                        } else {
                            tag = { n: node1.tag.n + 1, row: node1.tag.row, sn: node1.tag.sn };
                        }
                        // if(len!=undefined){
                        if (len < 2) {
                            self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                        } else {
                            if (sn == 1) {
                                self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                            } else {
                                self.EliminateGene(node1.parent, node2.parent, addNum, tag, false);
                            }
                        }

                    } else {
                        let addNum = node1.theNum + node2.theNum;
                        let pos = node1.getPosition();
                        let tag = node1.tag;
                        self.AddNum(node1, node2);
                        // if(len!=undefined){
                        if (len < 2) {
                            self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                        } else {
                            if (sn == 1) {
                                self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                            } else {
                                self.EliminateGene(node1.parent, node2.parent, addNum, tag, false);
                            }
                        }
                    }
                } else {
                    self.generateChess();
                }
            } else {
                if (!downFilled) {
                    let addNum = node1.theNum + node2.theNum;
                    self.AddNum(node1, node2);
                    let pos = node1.getPosition();
                    let tag;
                    if (node1.tag.sn < node2.tag.sn) {
                        tag = { n: node2.tag.n + 1, row: node2.tag.row, sn: node2.tag.sn };
                    } else {
                        tag = { n: node1.tag.n + 1, row: node1.tag.row, sn: node1.tag.sn };
                    }
                    // if(len!=undefined){
                    if (len < 2) {
                        self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                    } else {
                        if (sn == 1) {
                            self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                        } else {
                            self.EliminateGene(node1.parent, node2.parent, addNum, tag, false);
                        }
                    }
                    // }else{
                    //     self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                    // }
                } else {
                    let addNum = node1.theNum + node2.theNum;
                    let pos = node1.getPosition();
                    let tag = node1.tag;
                    self.AddNum(node1, node2);
                    // if(len!=undefined){
                    if (len < 2) {
                        self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                    } else {
                        if (sn == 1) {
                            self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                        } else {
                            self.EliminateGene(node1.parent, node2.parent, addNum, tag, false);
                        }
                    }
                    // }else{
                    //     self.EliminateGene(node1.parent, node2.parent, addNum, tag);
                    // }
                }
            }
        }

        /**
         * 左右都可以消除的时候的判断
         * @param lorR 判断左右
         */
        function LorRElinate(lorR) {
            if (lorR < 0.5) {//需要进一步判断左右数字是否相等，<0.5为左
                if (theNode[0].children[1].theNum == leftNode[0].children[1].theNum) {
                    subElinate(theNode[0].children[1], leftNode[0].children[1], downLeftIsFilled, true);
                } else if (theNode[0].children[1].theNum == rightNode[0].children[1].theNum) {
                    subElinate(theNode[0].children[1], rightNode[0].children[1], downRightIsFilled, true);
                }
                else {
                    self.generateChess();
                }
            }
            else {
                if (theNode[0].children[1].theNum == rightNode[0].children[1].theNum) {
                    subElinate(theNode[0].children[1], rightNode[0].children[1], downRightIsFilled, true);
                } else if (theNode[0].children[1].theNum == leftNode[0].children[1].theNum) {
                    subElinate(theNode[0].children[1], leftNode[0].children[1], downLeftIsFilled, true);
                }
                else {
                    self.generateChess();
                }
            }
        }
    }

    /**
     * 分数动画函数
     * @param node1 分数添加节点
     * @param node2 次节点
     * @param addNum 分数
     */
    AddNum(node1, node2?, addNum?) {
        let addScore = cc.instantiate(this.AddScore);
        if (addNum == undefined) {
            addNum = (node1.theNum + node2.theNum);
            if (node1.tag.sn < node2.tag.sn) {
                addScore.x += (this.CellLine + 2);
            } else {
                addScore.x -= (this.CellLine - 2);
            }
            addScore.parent = node1.parent;
        }
        else {
            addScore.parent = node1;
        }
        addScore.getComponent(cc.Label).string = addNum.toString();
        addScore.zIndex = 46;

        addScore.runAction(cc.spawn(cc.moveBy(0.5, 0, 100), cc.fadeOut(0.5)));
        this.scheduleOnce(() => {
            addScore.removeFromParent();
            addScore.destroy();
        }, 0.51);
        Global.TempData.tempPlayInfo.playScore += addNum;
        let getGold = parseInt((addNum / 2).toString());
        Global.PlayData.PlayInfo.playGold += getGold;
        this.GoldNode.children[0].getComponent(cc.Label).string = Global.PlayData.PlayInfo.playGold.toString();
        if (Global.PlayData.PlayInfo.playScore < Global.TempData.tempPlayInfo.playScore) {
            Global.PlayData.PlayInfo.playScore = Global.TempData.tempPlayInfo.playScore
            this.ScoreNode.children[0].getComponent(cc.Label).string = Global.PlayData.PlayInfo.playScore.toString();
            cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData, JSON.stringify(Global.PlayData));
        }
        this.ScoreNode.children[1].getComponent(cc.Label).string = Global.TempData.tempPlayInfo.playScore.toString();
    }

    ElimCount = 0;
    /**
    * 消除后生成数字格函数,这里可以直接传入位置的左边，也可以传入行位置列位置，后者需要进一步处理
    * 注意：pos不是必须的，在直接消除的时候不需要传入坐标参数
    * @param node1
    * @param node1
    * @param Addnum 相加之后的数字大小
    * @param tag 新生成的数字的位置
    * @param geneOrNot 
    */
    EliminateGene(node1, node2, Addnum, tag?, geneOrNot?) {
        let self = this;
        let geneID = [0, 1, 2, 3];
        /**用于加载新生成的颜色 */
        let colorNum = Addnum % 3;
        let thetag = { tag: null };
        let num = { theNum: 0 };
        if (Addnum % 10 == 0) {
            colorNum = 3;
        }
        let addedNode = cc.instantiate(this.Chesses[geneID[colorNum]]);
        addedNode.children[0].getComponent(cc.Label).string = Addnum;
        addedNode.on(cc.Node.EventType.TOUCH_END, self.UseToolListener, self);
        num.theNum = Addnum;
        if (Addnum > self.currentMaxNum) {
            self.currentMaxNum = Addnum;
        }
        thetag.tag = tag;
        addedNode.attr(thetag);
        addedNode.attr(num);
        node1.isFilled = false;
        node2.isFilled = false;
        node1.removeChild(node1.children[1]);
        node2.removeChild(node2.children[1]);
        node1.getChildByName("shadow").active = false;
        node2.getChildByName("shadow").active = false;
        this.allCellPos[tag.n][tag.sn][0].addChild(addedNode);
        this.allCellPos[tag.n][tag.sn][0].isFilled = true;
        this.FilledGridCount += 1;
        this.scheduleOnce(() => {
            self.Eliminate(thetag.tag, undefined, undefined, "Elim");
        }, 0.2);
        self.ElimCount++;
        if (geneOrNot == undefined) {
            if (self.ElimCount > 2) return
            self.generateChess();
        }
        cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData, JSON.stringify(Global.PlayData));
    }


    isUseTool = false;
    UseTool(event, customEventTarget) {
        let self = this;
        let BtnNode = cc.find("Canvas/ToolBtnNode");
        switch (customEventTarget) {
            case "1": {
                if (Global.PlayData.PlayInfo.playTool.oneKey > 0) {
                    oneKeyE();
                } else {
                    let gold = parseInt(self.GoldNode.children[0].getComponent(cc.Label).string);
                    let buyonekey = 700
                    if (gold < buyonekey) {
                        self.AlertNode.active = true;
                        self.AlertNode.opacity = 255;
                        cc.tween(this.AlertNode).to(1, { opacity: 1 }).call(() => {
                            self.AlertNode.opacity = 255;
                            self.AlertNode.active = false;
                        }).start()
                    } else {
                        self.ToolKind = "reGene"
                        Global.PlayData.PlayInfo.playGold -= ConstantOther.Buy_onKey;
                        self.GoldNode.children[0].getComponent(cc.Label).string = Global.PlayData.PlayInfo.playGold.toString();
                        let node = cc.instantiate(self.MunisGold);
                        node.getComponent(cc.Label).string = "-" + ConstantOther.Buy_onKey;
                        self.GoldNode.addChild(node);
                        cc.tween(node)
                            .parallel(
                                cc.tween(node).by(1, { position: cc.v3(0, -100, 0) }),
                                cc.tween(node).to(1, { opacity: 1 }))
                            .call(() => {
                                node.removeFromParent();
                                node.destroy();
                                oneKeyE();
                            }).start();
                    }
                }
                break;
            }
            case "2": {

                break;
            }
            case "3": {
                //后期加上消耗金币
                self.ToolKind = "reGene"
                if (Global.PlayData.PlayInfo.playTool.reGene > 0) {
                    Global.PlayData.PlayInfo.playTool.reGene -= 1;
                    self.ToolNum[2].string = Global.PlayData.PlayInfo.playTool.reGene.toString();
                    this.generateChess();
                    self.ToolKind = "oneKey"
                }
                else {
                    if (Global.PlayData.PlayInfo.playGold < ConstantOther.Buy_reGene) {
                        self.AlertNode.active = true;
                        cc.tween(this.AlertNode).to(1, { opacity: 1 }).call(() => {
                            self.AlertNode.opacity = 255;
                            self.AlertNode.active = false;
                        }).start()
                    } else {
                        self.ToolKind = "oneKey"
                        Global.PlayData.PlayInfo.playGold -= ConstantOther.Buy_reGene;
                        self.GoldNode.children[0].getComponent(cc.Label).string = Global.PlayData.PlayInfo.playGold.toString();
                        let node = cc.instantiate(self.MunisGold);
                        node.getComponent(cc.Label).string = "-" + ConstantOther.Buy_reGene;
                        self.GoldNode.addChild(node);
                        cc.tween(node)
                            .parallel(
                                cc.tween(node).by(1, { position: cc.v3(0, -100, 0) }),
                                cc.tween(node).to(1, { opacity: 1 }))
                            .call(() => {
                                node.removeFromParent();
                                node.destroy();
                            }).start();
                        this.generateChess();
                    }
                }
                break;
            }
            case "4": {
                if (Global.PlayData.PlayInfo.playTool.hammer > 0) {
                    self.ToolKind = "Hammer"
                    hammerE()
                } else {
                    let gold = parseInt(self.GoldNode.children[0].getComponent(cc.Label).string);
                    let buyhammer = 700
                    if (gold < buyhammer) {
                        self.AlertNode.active = true;
                        cc.tween(this.AlertNode).to(1, { opacity: 1 }).call(() => {
                            self.AlertNode.opacity = 255;
                            self.AlertNode.active = false;
                        }).start()
                    }
                    else {
                        Global.PlayData.PlayInfo.playGold -= ConstantOther.Buy_hammer;
                        self.GoldNode.children[0].getComponent(cc.Label).string = Global.PlayData.PlayInfo.playGold.toString();
                        let node = cc.instantiate(self.MunisGold);
                        node.getComponent(cc.Label).string = "-" + ConstantOther.Buy_hammer;
                        self.GoldNode.addChild(node);
                        cc.tween(node)
                            .parallel(
                                cc.tween(node).by(1, { position: cc.v3(0, -100, 0) }),
                                cc.tween(node).to(1, { opacity: 1 }))
                            .call(() => {
                                node.removeFromParent();
                                node.destroy();
                            }).start();
                        self.ToolKind = "Hammer"
                        hammerE()
                    }
                }
                // this.generateChess();
                break;
            }
        }
        function oneKeyE() {
            self.ToolKind = "oneKey"
            if (self.isUseTool) {
                return;
            }
            self.isUseTool = true;
            for (let i = 0; i < BtnNode.childrenCount; i++) {
                BtnNode.children[i].getComponent(cc.Button).enabled = false;
            }
            if (Global.PlayData.PlayInfo.playTool.oneKey > 0) {
                Global.PlayData.PlayInfo.playTool.oneKey -= 1;
            }
            else {
                Global.PlayData.PlayInfo.playTool.oneKey = 0;
            }
            self.ToolNum[0].string = Global.PlayData.PlayInfo.playTool.oneKey.toString();
            ConstantOther.GLOBAL_EVENTMGR.on("oneKey", (tag) => {
                let nodes = self.FindCell(tag);
                let addNum = 0;
                let centerEx;
                let cellEx;
                let centAni;
                let cellAni;
                for (let i = nodes.length - 1; i > -1; i--) {
                    if (nodes[i][0].children[1] != undefined) {
                        if (i == nodes.length - 1) {
                            centerEx = cc.instantiate(self.CenterExplo);
                            centerEx.zIndex = self.ToolZindex;
                            centAni = centerEx.getComponent(cc.Animation);
                            nodes[i][0].addChild(centerEx);
                            centerEx.setPosition(0, 0);
                            centAni.play();
                            centAni.on("finished", () => {
                                centerEx.removeFromParent();
                                centerEx.destroy();
                                nodes[i][0].children[0].active = false;
                                if (nodes[i][0].childrenCount > 1) {
                                    nodes[i][0].children[1].removeFromParent();
                                }
                                nodes[i][0].isFilled = false;
                                ConstantOther.GLOBAL_EVENTMGR.off("oneKey");
                                for (let i = 0; i < BtnNode.childrenCount; i++) {
                                    BtnNode.children[i].getComponent(cc.Button).enabled = true;
                                }
                            });

                        } else {
                            self.scheduleOnce(() => {
                                cellEx = cc.instantiate(self.CellExplo);
                                cellAni = cellEx.getComponent(cc.Animation);
                                self.node.addChild(cellEx);
                                cellEx.setPosition(nodes[i][1]);
                                cellAni.play();
                                cellAni.on("finished", () => {
                                    cellEx.removeFromParent();
                                    cellEx.destroy();
                                    nodes[i][0].children[0].active = false;
                                    if (nodes[i][0].childrenCount > 1) {
                                        if (nodes[i][0].childrenCount > 1) {
                                            nodes[i][0].children[1].removeFromParent();
                                        }
                                    }
                                    nodes[i][0].isFilled = false;
                                    ConstantOther.GLOBAL_EVENTMGR.off("oneKey");
                                    for (let i = 0; i < BtnNode.childrenCount; i++) {
                                        BtnNode.children[i].getComponent(cc.Button).enabled = true;
                                    }
                                });
                            }, 0.5);
                        }
                        addNum += nodes[i][0].children[1].theNum;
                        self.FilledGridCount += 1;
                    }
                }
                self.AddNum(nodes[nodes.length - 1][0], null, addNum)
            });
        }
        function hammerE() {
            for (let i = 0; i < BtnNode.childrenCount; i++) {
                BtnNode.children[i].getComponent(cc.Button).enabled = false;
            }
            if (self.isUseTool) {
                return;
            }
            self.isUseTool = true;
            self.ToolKind = "Hammer"
            if (Global.PlayData.PlayInfo.playTool.hammer > 0) {
                Global.PlayData.PlayInfo.playTool.hammer -= 1;
            }
            else {
                Global.PlayData.PlayInfo.playTool.hammer = 0;
            }
            self.ToolNum[1].string = Global.PlayData.PlayInfo.playTool.hammer.toString();
            ConstantOther.GLOBAL_EVENTMGR.once("Hammer", (tag) => {
                //使用锤子
                let nodes = self.FindCell(tag);
                let hammer = cc.instantiate(self.HammerPre);
                let addNum = nodes[nodes.length - 1][0].children[1].theNum;
                hammer.parent = self.ToolNode;
                hammer.position = nodes[nodes.length - 1][0].getPosition();
                let hammerAni = hammer.getComponent(cc.Animation);
                hammerAni.play();
                hammerAni.on("finished", () => {
                    self.AddNum(nodes[nodes.length - 1][0], null, addNum);
                    if (nodes[nodes.length - 1][0].childrenCount > 1) {
                        nodes[nodes.length - 1][0].children[1].removeFromParent();
                    }
                    nodes[nodes.length - 1][0].children[0].active = false;
                    nodes[nodes.length - 1][0].isFilled = false;
                    hammer.removeFromParent();
                    hammer.destroy();
                    self.FilledGridCount += 1;
                    ConstantOther.GLOBAL_EVENTMGR.off("Hammer");
                    for (let i = 0; i < BtnNode.childrenCount; i++) {
                        BtnNode.children[i].getComponent(cc.Button).enabled = true;
                    }
                });
            });
        }
        cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData, JSON.stringify(Global.PlayData));
    }

    /**道具使用信息 */
    ToolKind = "";
    UseToolListener(event, customEventTarget) {
        this.isUseTool = false;
        let tag = event.currentTarget.tag;
        if (tag == undefined) {

            return;
        }
        switch (this.ToolKind) {
            case "oneKey": {
                ConstantOther.GLOBAL_EVENTMGR.emit("oneKey", tag);
                break;
            }
            case "Hammer": {
                ConstantOther.GLOBAL_EVENTMGR.emit("Hammer", tag);
                break;
            }
            case "Fusion": {
                ConstantOther.GLOBAL_EVENTMGR.emit("Fusion", tag);
                break;
            }
        }
    }

    AndroidBackListen() {
        if (cc.sys.os == cc.sys.OS_ANDROID) {
            let className = "org/cocos2dx/javascript/AppActivity";
            let methodName = "showAlertDialog";
            let methodSignature = "()V";
            jsb.reflection.callStaticMethod(className, methodName, methodSignature);
        }
    }

    Stop(event, customEventTarget) {
        let self = this;
        this.stopNode.zIndex = self.ToolZindex;
        this.stopNode.getChildByName("gameover").active = false;
        this.stopNode.children[3].children[0].active = true;
        switch (customEventTarget) {
            case "stop": {//游戏内的暂停按钮
                this.stopNode.active = true;
                break;
            }
            case "reNew": {//游戏暂停的重新开始按钮
                this.stopNode.active = false;
                cc.sys.localStorage.removeItem(E_STORAGETYPE.TempData);
                Global.TempData.tempPlayInfo.playScore = 0;
                this.ScoreNode.children[1].getComponent(cc.Label).string = "0";
                for (let i = 1; i < this.allCellPos.length; i++) {
                    for (let j = 0; j < this.allCellPos[i].length; j++) {
                        let child0 = this.allCellPos[i][j][0].children[0];
                        child0.active = false;
                        this.allCellPos[i][j][0].removeAllChildren();
                        this.allCellPos[i][j][0].addChild(child0);
                        this.allCellPos[i][j][0].isFilled = false;
                        this.FilledGridCount = 45;
                    }
                }
                this.generateChess();
                break;
            }
            case "return": {//游戏暂停的返回首页按钮
                for (let i = 1; i < this.allCellPos.length; i++) {
                    Global.GameData.chessPos[i] = new Array();
                    for (let j = 0; j < this.allCellPos[i].length; j++) {
                        try {
                            Global.GameData.chessPos[i][j] = this.allCellPos[i][j][0].children[1].theNum;
                        } catch (error) {
                            Global.GameData.chessPos[i][j] = undefined;
                        }
                    }
                }
                CommonFun.UpdateScore();
                cc.sys.localStorage.setItem(E_STORAGETYPE.GameData, JSON.stringify(Global.GameData));
                cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData, JSON.stringify(Global.PlayData));
                cc.sys.localStorage.setItem(E_STORAGETYPE.TempData, JSON.stringify(Global.TempData));
                cc.director.loadScene("OpenScene");
                break;
            }
            case "continue": {//游戏暂停的继续游戏按钮
                this.stopNode.active = false;
                break;

            }
            case "help": {
                this.HelpNode.active = true;
                this.stopNode.active = false;
                this.HelpNode.zIndex = this.stopNode.zIndex;
                break;
            }
        }
    }

    CloseHelp() {
        this.HelpNode.active = false;
    }

    onClickShare() {
        tt.shareAppMessage({
            title: "你能得多少分？",
            desc: "这小游戏还挺有意思，点击就能玩",
            imageUrl: "",
            query: "",
            success() {
                console.log("分享成功");

            },
            fail(e) {
                console.log("分享失败");
            },
        });
    }

    /**
     * 领取宝箱------>广告点
     */
    onClickBaoxiang() {
        //需要一个恭喜获得弹窗，简单点
        this.congratuNoe.active = true;
        this.Baoxiang.active = false;
        let date = new Date();
        Global.PlayData.PlayInfo.dailyAward.hasGet = true;
        Global.PlayData.PlayInfo.dailyAward.time = date.getUTCFullYear() + "-" + date.getUTCMonth() + "-" + date.getUTCDay();
        Global.PlayData.PlayInfo.playTool.hammer += 3;
        Global.PlayData.PlayInfo.playTool.oneKey += 1;
        Global.PlayData.PlayInfo.playTool.reGene += 3;
        cc.sys.localStorage.setItem(E_STORAGETYPE.PlayData, JSON.stringify(Global.PlayData));

        let itemPre = cc.find("Canvas/CongratulateNode/itemPre");
        let zdItem = cc.instantiate(itemPre);
        zdItem.children[1].children[0].getComponent(cc.Label).string = "+1";
        let czItem = cc.instantiate(itemPre);
        czItem.children[1].children[0].getComponent(cc.Label).string = "+3";
        let csItem = cc.instantiate(itemPre);
        csItem.children[1].children[0].getComponent(cc.Label).string = "+3";

        let itemRoot = cc.find("Canvas/CongratulateNode/itemNode");
        itemRoot.removeAllChildren();
        itemRoot.addChild(zdItem);
        itemRoot.addChild(czItem);
        itemRoot.addChild(csItem);
    }

    onClickCloseCongratu() {
        this.congratuNoe.active = false;
    }

    onClickTest() {
        //跑酷游戏自动生成好友跑酷榜

        //跑酷游戏自动生成好友跑酷榜
        tt.getImRankList({
            relationType: "friend", //只展示好友榜
            dataType: 0, //只圈选type为数字类型的数据进行排序
            rankType: "month", //每月1号更新，只对当月1号到现在写入的数据进行排序
            suffix: "分", //数据后缀，成绩后续默认带上 “分”
            rankTitle: "rankTitle", //标题
            success(res) {
                console.log(`getImRankData success res: `, res);
            },
            fail(res) {
                console.log(`getImRankData fail res: `, res.errMsg);
            },
        });

    }
}
