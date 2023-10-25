export default class ConstantOther {
    
    static GLOBAL_EVENTMGR = new cc.EventTarget();
    static GLOBAL_USEHAMMER={
        "UseSN":0,
        "UseNode":[],
        
    }
    static Buy_reGene = 200;
    static Buy_onKey = 700;
    static Buy_hammer = 100;

}

export enum E_STORAGETYPE{
    PlayData="PlayData",
    GameData="GameData",
    TempData="TempData"
}