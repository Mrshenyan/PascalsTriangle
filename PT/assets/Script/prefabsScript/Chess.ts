const {ccclass, property} = cc._decorator;

@ccclass
export default class Chess extends cc.Component {

    /**棋子的数字 */
    @property(cc.Label)
    ChessNum:cc.Label=null;
}
