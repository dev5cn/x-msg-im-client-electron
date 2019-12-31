import Vue from 'vue';
import Vuex from 'vuex';
 
import modules from './modules';
import { Chat, ChatListUtils, MessageInfoType, MessageTargetType, transform } from '../utils/ChatUtils';
import conf from '../views/im/conf';
let XmsgImSdk = require('../imsdk/libx-msg-im-client-sdk')

Vue.use(Vuex);

export default new Vuex.Store({
  state: {
    XmsgImOrgSyncSubReq:false,
    orgSyncEnd:false,
    XmsgChatLis:[],//所有的聊天窗口
    tableStatus:{
      tb_org_usr:false,
      tb_org_dept:false,
      tb_org_dept_usr:false,
      tb_usr_group:false,  //用户与群组的关系
      tb_usr_group_member:false,
      tb_usr_group_config:false,
      tb_usr_group_msg:false, //群组消息
    },
    ver:{
      ver4usr:0,
      ver4dept:0,
      ver4deptUsr:0
    },
    groupSyncStatus:false, //群组同步状态，群组全部同步完开始同步群组消息，
    msgSyncStatus:false,//群组消息同步状态，同步开始获取有消息的群组消息















    // // =======================================================
    // token: {},
    // // 当前的用户
    // user: {},
    // websocket: {},
    // //内存中的聊天记录
    // messageListMap: new Map(),
    // //聊天群的映射 id->chat
    // chatMap: new Map(),
    // messageList: [],
    // // 当前聊天窗口
    // currentChat: {},
    // // 所有的聊天窗口
    // chatList: [],
    // //好友列表
    // userFriendList: [],
    // //刷新token 定时器
    // flushTokenTimerId: null,
    // //群组列表
    // chatGroupList: []
  },
  mutations: {
    // 设置聊天窗口
    setXmsgChatLis:function(state,XmsgChatLis){
      console.log("setXmsgChatLis")
      state.XmsgChatLis = XmsgChatLis;
    },
    setTableStatus:function(state,key){
      console.log(state.XmsgImOrgSyncSubReq)
 
      state.tableStatus[key] = true;
      const tableStatus =  state.tableStatus
      console.log("setTableStatus",tableStatus)
      //组织架构表创建完
     if(tableStatus.tb_org_usr&&tableStatus.tb_org_dept&&tableStatus.tb_org_dept_usr&&!state.XmsgImOrgSyncSubReq){
        console.log("组织架构同步完")
        state.XmsgImOrgSyncSubReq=true
    
         // 组织架构同步
         let sql = "select max(d.ver), max(du.ver), max(u.ver) from tb_org_dept as d, tb_org_dept_usr as du, tb_org_usr as u";
         XmsgImSdk.tools.dbFutureUsrOrg( sql, (ret, desc, rst) => {
             if (ret != 0) {
                 console.error("select max(d.ver), max(du.ver), max(u.ver) from tb_org_dept as d, tb_org_dept_usr as du, tb_org_usr as u失败:"+desc);
               
                 XmsgImSdk.XmsgImOrgSyncSubReq()
                 return;
             }
             for (let i = 0; i < rst.row.length; ++i) {
                 XmsgImSdk.XmsgImOrgSyncSubReq(XmsgImSdk.tools.getLongFromDbRst(rst, i, 'max(u.ver)'), XmsgImSdk.tools.getLongFromDbRst(rst, i, 'max(d.ver)'), XmsgImSdk.tools.getLongFromDbRst(rst, i, 'max(du.ver)'))
             }
         });
      }
    },
    // XmsgImOrgSyncSubReq
    setXmsgImOrgSyncSubReq:function(state,status){
      state.XmsgImOrgSyncSubReq = status;
    },
    setGroupSyncStatus:function(state,status){
      state.groupSyncStatus = status;
      //所有群组同步完之后，通过更新vuex状态进行全量群组消息同步
      XmsgImSdk.syncGroupInfo()
    },
    // 设置消息同步状态
    setMsgSyncStatus:function(state,status){
      state.msgSyncStatus = status;
    },
// 同步组织架构完毕
    setorgSyncEnd:function(state,status){
      state.orgSyncEnd=true
      if(state.tableStatus.tb_usr_group){
        XmsgImSdk.queryVerGroupSyncReq()
      }else{
        // 如果表还没创建，那就再等一秒
        setTimeout(function(){
          XmsgImSdk.queryVerGroupSyncReq()
        },1000
          )
      }

    },















    // ========================================
 
     
  },
  modules: modules,
 
  strict: process.env.NODE_ENV !== 'production'
});
