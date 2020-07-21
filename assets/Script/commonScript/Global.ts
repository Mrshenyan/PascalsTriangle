export default class Global {

    static TempData = {
        tempPlayInfo: {
            playScore: 0,
        },
        PlayerAvatar:{
            Url:[],
            Sp:[],
        },
    }

    static PlayData = {
        PlayInfo: {
            playId:     "",
            playNick:   "",
            playAvatar: "",
            playGold:   500000,
            playScore:  0,
            /**道具个数 */
            playTool: {
                oneKey: 1,
                hammer: 1,
                reGene: 1
            }
        }
    }

    static GameData={
        chessPos:[]
    }

    static wx_PlayerInfo={
        
    }
}
