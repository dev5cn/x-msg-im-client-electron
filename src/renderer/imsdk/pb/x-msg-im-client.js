/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.setOptions({
  java_package: "x.msg.pb",
  java_outer_classname: "XmsgImSdkEventPb"
})
.addJSON({
  XmsgImClientDbCrudReq: {
    fields: {
      sql: {
        type: "string",
        id: 1
      },
      row: {
        rule: "repeated",
        type: "XmsgImClientDbRow",
        id: 2
      }
    }
  },
  XmsgImClientDbCrudRsp: {
    fields: {
      change: {
        type: "uint32",
        id: 1
      },
      column: {
        keyType: "string",
        type: "uint32",
        id: 2
      },
      row: {
        rule: "repeated",
        type: "XmsgImClientDbRow",
        id: 4
      }
    }
  },
  XmsgImClientDbRow: {
    fields: {
      col: {
        rule: "repeated",
        type: "XmsgImClientDbFiled",
        id: 1
      }
    }
  },
  XmsgImClientDbFiled: {
    fields: {
      type: {
        type: "XmsgImClientDbFiledType",
        id: 1
      },
      valInt: {
        type: "uint64",
        id: 2
      },
      valText: {
        type: "string",
        id: 3
      },
      valBlob: {
        type: "bytes",
        id: 4
      }
    }
  },
  XmsgImClientDbFiledType: {
    values: {
      X_MSG_IM_CLIENT_DB_FILED_TYPE_BIGINT: 0,
      X_MSG_IM_CLIENT_DB_FILED_TYPE_TEXT: 1,
      X_MSG_IM_CLIENT_DB_FILED_TYPE_BLOB: 2,
      X_MSG_IM_CLIENT_DB_FILED_TYPE_NULL: 3
    }
  },
  XmsgImClientKv: {
    fields: {
      kv: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgChannelStatusQueryReq: {
    fields: {
      cgt: {
        rule: "repeated",
        type: "string",
        id: 1
      }
    }
  },
  XmsgChannelStatusQueryRsp: {
    fields: {
      usrStatus: {
        keyType: "string",
        type: "XmsgChannelStatusUsrStatus",
        id: 1
      },
      groupStatus: {
        keyType: "string",
        type: "XmsgChannelStatusGroupStatus",
        id: 2
      }
    }
  },
  XmsgChannelStatusSubReq: {
    fields: {
      cgt: {
        rule: "repeated",
        type: "string",
        id: 1
      }
    }
  },
  XmsgChannelStatusSubRsp: {
    fields: {
      usrStatus: {
        keyType: "string",
        type: "XmsgChannelStatusUsrStatus",
        id: 1
      },
      groupStatus: {
        keyType: "string",
        type: "XmsgChannelStatusGroupStatus",
        id: 2
      }
    }
  },
  XmsgChannelStatusUnSubReq: {
    fields: {
      cgt: {
        rule: "repeated",
        type: "string",
        id: 1
      }
    }
  },
  XmsgChannelStatusUnSubRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgChannelStatusPubUsrStatusNotice: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      plat: {
        type: "string",
        id: 2
      },
      did: {
        type: "string",
        id: 3
      },
      status: {
        type: "string",
        id: 4
      }
    }
  },
  XmsgChannelStatusPubGroupStatusNotice: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      status: {
        type: "string",
        id: 2
      }
    }
  },
  XmsgChannelStatusUsrStatus: {
    fields: {
      client: {
        rule: "repeated",
        type: "XmsgChannelStatusUsrClientStatus",
        id: 2
      }
    },
    nested: {
      XmsgChannelStatusUsrClientStatus: {
        fields: {
          plat: {
            type: "string",
            id: 1
          },
          did: {
            type: "string",
            id: 2
          },
          status: {
            type: "string",
            id: 3
          }
        }
      }
    }
  },
  XmsgChannelStatusGroupStatus: {
    fields: {
      status: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgFileUploadSimpleReq: {
    fields: {
      fileName: {
        type: "string",
        id: 1
      },
      fileSize: {
        type: "uint64",
        id: 2
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 3
      }
    }
  },
  XmsgFileUploadSimpleRsp: {
    fields: {
      fid: {
        type: "string",
        id: 1
      },
      hashVal: {
        type: "string",
        id: 2
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 3
      }
    }
  },
  XmsgFileDownloadSimpleReq: {
    fields: {
      fid: {
        type: "string",
        id: 1
      },
      cgt: {
        type: "string",
        id: 2
      },
      offset: {
        type: "uint64",
        id: 3
      },
      len: {
        type: "uint64",
        id: 4
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 5
      }
    }
  },
  XmsgFileDownloadSimpleRsp: {
    fields: {
      fileName: {
        type: "string",
        id: 1
      },
      fileSize: {
        type: "uint64",
        id: 2
      },
      hashVal: {
        type: "string",
        id: 3
      },
      gts: {
        type: "uint64",
        id: 4
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 5
      }
    }
  },
  XmsgFileUsrFileInfoQueryReq: {
    fields: {
      sts: {
        type: "uint64",
        id: 1
      },
      ets: {
        type: "uint64",
        id: 2
      },
      page: {
        type: "uint32",
        id: 3
      },
      pageSize: {
        type: "uint32",
        id: 4
      }
    }
  },
  XmsgFileUsrFileInfoQueryRsp: {
    fields: {
      fileInfo: {
        rule: "repeated",
        type: "XmsgFileUsrFileInfo",
        id: 1
      }
    }
  },
  XmsgFileUsrFileInfo: {
    fields: {
      fid: {
        type: "string",
        id: 1
      },
      fileName: {
        type: "string",
        id: 2
      },
      fileSize: {
        type: "uint64",
        id: 3
      },
      hashVal: {
        type: "string",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      }
    }
  },
  XmsgImAuthSimpleReq: {
    fields: {
      usr: {
        type: "string",
        id: 1
      },
      salt: {
        type: "string",
        id: 2
      },
      sign: {
        type: "string",
        id: 3
      },
      dev: {
        type: "XmsgImClientDeviceInfo",
        id: 4
      }
    }
  },
  XmsgImAuthSimpleRsp: {
    fields: {
      token: {
        type: "string",
        id: 1
      },
      secret: {
        type: "string",
        id: 2
      },
      expired: {
        type: "uint64",
        id: 3
      },
      apAddr: {
        rule: "repeated",
        type: "XmsgImClientServiceAddress",
        id: 4
      },
      ossAddr: {
        rule: "repeated",
        type: "XmsgImClientServiceAddress",
        id: 5
      },
      cgt: {
        type: "string",
        id: 7
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 8
      }
    }
  },
  XmsgImAuthRegSimpleReq: {
    fields: {
      usr: {
        type: "string",
        id: 1
      },
      salt: {
        type: "string",
        id: 2
      },
      pwd: {
        type: "string",
        id: 3
      },
      dev: {
        type: "XmsgImClientDeviceInfo",
        id: 4
      }
    }
  },
  XmsgImAuthRegSimpleRsp: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImClientDeviceInfo: {
    fields: {
      plat: {
        type: "string",
        id: 1
      },
      did: {
        type: "string",
        id: 2
      },
      ver: {
        type: "string",
        id: 3
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 4
      }
    }
  },
  XmsgImClientServiceAddress: {
    fields: {
      weight: {
        type: "uint32",
        id: 1
      },
      host: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupMemberAddReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      member: {
        rule: "repeated",
        type: "XmsgImGroupAddMember",
        id: 2
      }
    }
  },
  XmsgImGroupMemberAddRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupMemberQueryReq: {
    fields: {
      gcgt: {
        type: "string",
        id: 1
      },
      mcgt: {
        rule: "repeated",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupMemberQueryRsp: {
    fields: {
      member: {
        rule: "repeated",
        type: "XmsgImGroupInfoMember",
        id: 1
      }
    }
  },
  XmsgImGroupMemberUpdateReq: {
    fields: {
      gcgt: {
        type: "string",
        id: 1
      },
      mcgt: {
        type: "string",
        id: 2
      },
      upsert: {
        keyType: "string",
        type: "string",
        id: 3
      },
      remove: {
        rule: "repeated",
        type: "string",
        id: 4
      }
    }
  },
  XmsgImGroupMemberUpdateRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupMemberDeleteReq: {
    fields: {
      gcgt: {
        type: "string",
        id: 1
      },
      mcgt: {
        rule: "repeated",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupMemberDeleteRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupUsrGroupQueryReq: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupUsrGroupQueryRsp: {
    fields: {
      group: {
        rule: "repeated",
        type: "XmsgImGroupUsrGroupInfo",
        id: 1
      }
    }
  },
  XmsgImGroupUsrGroupInfo: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      name: {
        type: "string",
        id: 2
      },
      info: {
        keyType: "string",
        type: "string",
        id: 3
      },
      ver: {
        type: "uint64",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      },
      uts: {
        type: "uint64",
        id: 6
      },
      usr2usr: {
        type: "bool",
        id: 7
      }
    }
  },
  XmsgImGroupCreateReq: {
    fields: {
      info: {
        keyType: "string",
        type: "string",
        id: 1
      },
      member: {
        rule: "repeated",
        type: "XmsgImGroupAddMember",
        id: 2
      }
    }
  },
  XmsgImGroupCreateRsp: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      gts: {
        type: "uint64",
        id: 2
      }
    }
  },
  XmsgImGroupAddMember: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      info: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupSyncReq: {
    fields: {
      ver4usr: {
        type: "uint64",
        id: 1
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupSyncRsp: {
    fields: {
      event: {
        rule: "repeated",
        type: "XmsgImGroupSyncEvent",
        id: 1
      }
    }
  },
  XmsgImGroupSyncEvent: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      oper: {
        type: "string",
        id: 2
      },
      info: {
        keyType: "string",
        type: "string",
        id: 3
      },
      ver4usr: {
        type: "uint64",
        id: 4
      },
      gts4usr: {
        type: "uint64",
        id: 5
      },
      uts4usr: {
        type: "uint64",
        id: 6
      },
      gts4group: {
        type: "uint64",
        id: 7
      }
    }
  },
  XmsgImGroupSyncNotice: {
    fields: {
      event: {
        type: "XmsgImGroupSyncEvent",
        id: 1
      }
    }
  },
  XmsgImGroupSyncGroupReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      ver: {
        type: "uint64",
        id: 2
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 3
      }
    }
  },
  XmsgImGroupSyncGroupRsp: {
    fields: {
      info: {
        type: "XmsgImGroupSyncGroupEventInfo",
        id: 1
      },
      member: {
        rule: "repeated",
        type: "XmsgImGroupSyncGroupEventMember",
        id: 2
      }
    }
  },
  XmsgImGroupSyncGroupEventInfo: {
    fields: {
      info: {
        keyType: "string",
        type: "string",
        id: 1
      },
      ver: {
        type: "uint64",
        id: 2
      },
      gts: {
        type: "uint64",
        id: 3
      },
      uts: {
        type: "uint64",
        id: 4
      }
    }
  },
  XmsgImGroupSyncGroupEventMember: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      oper: {
        type: "string",
        id: 2
      },
      info: {
        keyType: "string",
        type: "string",
        id: 3
      },
      ver: {
        type: "uint64",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      },
      uts: {
        type: "uint64",
        id: 6
      }
    }
  },
  XmsgImGroupEventNotice: {
    fields: {
      info: {
        type: "XmsgImGroupSyncGroupEventInfo",
        id: 1
      },
      member: {
        type: "XmsgImGroupSyncGroupEventMember",
        id: 2
      }
    }
  },
  XmsgImGroupInfoQueryReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      member: {
        type: "bool",
        id: 2
      }
    }
  },
  XmsgImGroupInfoQueryRsp: {
    fields: {
      info: {
        type: "XmsgImGroupInfoSelfInfo",
        id: 1
      },
      member: {
        rule: "repeated",
        type: "XmsgImGroupInfoMember",
        id: 2
      }
    }
  },
  XmsgImGroupInfoSelfInfo: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      enable: {
        type: "bool",
        id: 2
      },
      info: {
        keyType: "string",
        type: "string",
        id: 3
      },
      ver: {
        type: "uint64",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      },
      uts: {
        type: "uint64",
        id: 6
      }
    }
  },
  XmsgImGroupInfoMember: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      enable: {
        type: "bool",
        id: 2
      },
      info: {
        keyType: "string",
        type: "string",
        id: 3
      },
      ver: {
        type: "uint64",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      },
      uts: {
        type: "uint64",
        id: 6
      }
    }
  },
  XmsgImGroupInfoUpdateReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      upsert: {
        keyType: "string",
        type: "string",
        id: 2
      },
      remove: {
        rule: "repeated",
        type: "string",
        id: 3
      }
    }
  },
  XmsgImGroupInfoUpdateRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupMsgRecvCfgReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      type: {
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupMsgRecvCfgRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupSendMsgReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      localMsgId: {
        type: "uint64",
        id: 2
      },
      msg: {
        type: "XmsgImMsg",
        id: 3
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 4
      }
    }
  },
  XmsgImGroupSendMsgRsp: {
    fields: {
      msgId: {
        type: "uint64",
        id: 1
      },
      gcgt: {
        type: "string",
        id: 2
      },
      gts: {
        type: "uint64",
        id: 3
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 4
      }
    }
  },
  XmsgImMsg: {
    fields: {
      type: {
        type: "string",
        id: 1
      },
      text: {
        type: "XmsgImMsgText",
        id: 2
      },
      html: {
        type: "XmsgImMsgHtml",
        id: 3
      },
      image: {
        type: "XmsgImMsgImage",
        id: 4
      },
      voice: {
        type: "XmsgImMsgVoice",
        id: 5
      },
      video: {
        type: "XmsgImMsgVideo",
        id: 6
      },
      file: {
        type: "XmsgImMsgFile",
        id: 7
      },
      merge: {
        type: "XmsgImMsgMerge",
        id: 8
      },
      atx: {
        type: "XmsgImMsgAt",
        id: 9
      }
    }
  },
  XmsgImMsgText: {
    fields: {
      text: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImMsgHtml: {
    fields: {
      html: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImMsgImage: {
    fields: {
      uri: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImMsgVoice: {
    fields: {
      uri: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImMsgVideo: {
    fields: {
      uri: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImMsgFile: {
    fields: {
      from: {
        type: "string",
        id: 1
      },
      fid: {
        type: "string",
        id: 2
      }
    }
  },
  XmsgImMsgMerge: {
    fields: {
      msg: {
        rule: "repeated",
        type: "XmsgImMsg",
        id: 1
      }
    }
  },
  XmsgImMsgAt: {
    fields: {
      cgt: {
        rule: "repeated",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImGroupMsgNotice: {
    fields: {
      gcgt: {
        type: "string",
        id: 1
      },
      scgt: {
        type: "string",
        id: 2
      },
      msgId: {
        type: "uint64",
        id: 3
      },
      msg: {
        type: "XmsgImMsg",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 6
      }
    }
  },
  XmsgImGroupMsgSyncReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      msgId: {
        type: "uint64",
        id: 2
      },
      latest: {
        type: "uint32",
        id: 3
      }
    }
  },
  XmsgImGroupMsgSyncRsp: {
    fields: {
      msg: {
        rule: "repeated",
        type: "XmsgImGroupMsgHistory",
        id: 1
      }
    }
  },
  XmsgImGroupMsgHistory: {
    fields: {
      scgt: {
        type: "string",
        id: 1
      },
      msgId: {
        type: "uint64",
        id: 2
      },
      msg: {
        type: "XmsgImMsg",
        id: 3
      },
      gts: {
        type: "uint64",
        id: 4
      },
      isRead: {
        type: "bool",
        id: 5
      }
    }
  },
  XmsgImGroupMsgQueryReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      msgId: {
        type: "uint64",
        id: 2
      },
      before: {
        type: "bool",
        id: 3
      },
      pageSize: {
        type: "uint32",
        id: 4
      }
    }
  },
  XmsgImGroupMsgQueryRsp: {
    fields: {
      msg: {
        rule: "repeated",
        type: "XmsgImGroupMsgQueryRspItem",
        id: 1
      }
    },
    nested: {
      XmsgImGroupMsgQueryRspItem: {
        fields: {
          scgt: {
            type: "string",
            id: 1
          },
          msgId: {
            type: "uint64",
            id: 2
          },
          msg: {
            type: "XmsgImMsg",
            id: 3
          },
          gts: {
            type: "uint64",
            id: 4
          }
        }
      }
    }
  },
  XmsgImGroupMsgReadReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      msgId: {
        type: "uint64",
        id: 2
      }
    }
  },
  XmsgImGroupMsgReadRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImGroupMsgReadNotice: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      msgId: {
        type: "uint64",
        id: 2
      }
    }
  },
  XmsgImHlrAttachSimpleReq: {
    fields: {
      token: {
        type: "string",
        id: 1
      },
      salt: {
        type: "string",
        id: 2
      },
      sign: {
        type: "string",
        id: 3
      },
      alg: {
        type: "string",
        id: 4
      },
      cgt: {
        type: "string",
        id: 5
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 6
      }
    }
  },
  XmsgImHlrAttachSimpleRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrDetachSimpleReq: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrDetachSimpleRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrOtherClientAttachReq: {
    fields: {
      dev: {
        type: "XmsgImClientDeviceInfo",
        id: 1
      },
      host: {
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrOtherClientAttachRsp: {
    fields: {
      action: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrOtherClientAttachNotice: {
    fields: {
      dev: {
        type: "XmsgImClientDeviceInfo",
        id: 1
      },
      host: {
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrContractsAddDirectlyReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      info: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrContractsAddDirectlyRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrContractsAddReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrContractsAddRsp: {
    fields: {
      ver: {
        type: "uint64",
        id: 1
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrContractsAddNotice: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      info: {
        keyType: "string",
        type: "string",
        id: 2
      },
      ver: {
        type: "uint64",
        id: 3
      },
      gts: {
        type: "uint64",
        id: 4
      }
    }
  },
  XmsgImHlrContractsAddReplyReq: {
    fields: {
      ver: {
        type: "uint64",
        id: 1
      },
      oper: {
        type: "string",
        id: 2
      },
      desc: {
        type: "string",
        id: 3
      },
      info: {
        keyType: "string",
        type: "string",
        id: 4
      }
    }
  },
  XmsgImHlrContractsAddReplyRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrContractsAddReplyNotice: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      oper: {
        type: "string",
        id: 2
      },
      desc: {
        type: "string",
        id: 3
      },
      ver: {
        type: "uint64",
        id: 4
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 5
      }
    }
  },
  XmsgImHlrContractsDelReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrContractsDelRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrContractsDelNotice: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrContractsUpdateInfoReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      upsert: {
        keyType: "string",
        type: "string",
        id: 2
      },
      remove: {
        rule: "repeated",
        type: "string",
        id: 3
      }
    }
  },
  XmsgImHlrContractsUpdateInfoRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrContractsSearchReq: {
    fields: {
      keyword: {
        type: "string",
        id: 1
      },
      hint: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrContractsSearchRsp: {
    fields: {
      rst: {
        rule: "repeated",
        type: "XmsgImHlrContractsSearchRst",
        id: 1
      }
    }
  },
  XmsgImHlrContractsSearchRst: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      name: {
        type: "string",
        id: 2
      },
      info: {
        keyType: "string",
        type: "string",
        id: 3
      }
    }
  },
  XmsgImHlrGroupMsgReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      type: {
        type: "string",
        id: 2
      },
      msg: {
        type: "string",
        id: 3
      },
      dat: {
        type: "bytes",
        id: 4
      }
    }
  },
  XmsgImHlrGroupMsgRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrOtherUsrInfoQueryReq: {
    fields: {
      cgt: {
        rule: "repeated",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrOtherUsrInfoQueryRsp: {
    fields: {
      usrInfo: {
        keyType: "string",
        type: "XmsgImHlrOtherUsrInfo",
        id: 1
      }
    }
  },
  XmsgImHlrOtherUsrInfo: {
    fields: {
      info: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrUsrDat: {
    fields: {
      uid: {
        type: "string",
        id: 1
      },
      ver: {
        type: "uint64",
        id: 2
      },
      pri: {
        type: "XmsgImHlrUsrDatPri",
        id: 3
      },
      pub: {
        type: "XmsgImHlrUsrDatPub",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      },
      uts: {
        type: "uint64",
        id: 6
      }
    }
  },
  XmsgImHlrUsrDatPri: {
    fields: {
      enable: {
        type: "bool",
        id: 1
      },
      info: {
        keyType: "string",
        type: "string",
        id: 2
      },
      sysEventVerRead: {
        type: "uint64",
        id: 3
      }
    }
  },
  XmsgImHlrUsrDatPub: {
    fields: {
      name: {
        type: "string",
        id: 1
      },
      info: {
        keyType: "string",
        type: "string",
        id: 2
      }
    }
  },
  XmsgImHlrUsrInfoQueryReq: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrUsrInfoQueryRsp: {
    fields: {
      info: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrUsrInfoUpdateReq: {
    fields: {
      info: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrUsrInfoUpdateRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrEventUsrSubReq: {
    fields: {
      ver: {
        type: "uint64",
        id: 1
      }
    }
  },
  XmsgImHlrEventUsrSubRsp: {
    fields: {
      latestVer: {
        type: "uint64",
        id: 1
      }
    }
  },
  XmsgImHlrEventSysSubReq: {
    fields: {
      ver: {
        type: "uint64",
        id: 1
      }
    }
  },
  XmsgImHlrEventSysSubRsp: {
    fields: {
      latestVer: {
        type: "uint64",
        id: 1
      }
    }
  },
  XmsgImHlrEventUsrNotice: {
    fields: {
      msg: {
        type: "string",
        id: 1
      },
      dat: {
        type: "bytes",
        id: 2
      },
      ver: {
        type: "uint64",
        id: 3
      },
      gts: {
        type: "uint64",
        id: 4
      }
    }
  },
  XmsgImHlrEventSysNotice: {
    fields: {
      msg: {
        type: "string",
        id: 1
      },
      dat: {
        type: "bytes",
        id: 2
      },
      ver: {
        type: "uint64",
        id: 3
      },
      gts: {
        type: "uint64",
        id: 4
      }
    }
  },
  XmsgImHlrEventUsrReadReq: {
    fields: {
      ver: {
        type: "uint64",
        id: 1
      }
    }
  },
  XmsgImHlrEventUsrReadRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImHlrEventSysReadReq: {
    fields: {
      ver: {
        type: "uint64",
        id: 1
      }
    }
  },
  XmsgImHlrEventSysReadRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImOrgSyncSubReq: {
    fields: {
      ver4dept: {
        type: "uint64",
        id: 1
      },
      ver4deptUsr: {
        type: "uint64",
        id: 2
      },
      ver4usr: {
        type: "uint64",
        id: 3
      }
    }
  },
  XmsgImOrgSyncSubRsp: {
    fields: {
      ver4deptLatest: {
        type: "uint64",
        id: 1
      },
      ver4deptUsrLatest: {
        type: "uint64",
        id: 2
      },
      ver4usrLatest: {
        type: "uint64",
        id: 3
      }
    }
  },
  XmsgImOrgSyncPubReq: {
    fields: {
      event: {
        rule: "repeated",
        type: "XmsgImOrgEvent",
        id: 1
      }
    }
  },
  XmsgImOrgSyncPubRsp: {
    fields: {
      ext: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImOrgChangedNotice: {
    fields: {
      event: {
        type: "XmsgImOrgEvent",
        id: 1
      }
    }
  },
  XmsgImOrgNodeChildQueryReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImOrgNodeChildQueryRsp: {
    fields: {
      child: {
        rule: "repeated",
        type: "XmsgImOrgNodeChild",
        id: 1
      }
    }
  },
  XmsgImOrgNodeDeptUsrQueryReq: {
    fields: {
      dcgt: {
        type: "string",
        id: 1
      },
      ucgt: {
        type: "string",
        id: 2
      }
    }
  },
  XmsgImOrgNodeDeptUsrQueryRsp: {
    fields: {
      name: {
        type: "string",
        id: 2
      },
      enable: {
        type: "bool",
        id: 3
      },
      info: {
        type: "XmsgImOrgNodeInfo",
        id: 4
      },
      ver: {
        type: "uint64",
        id: 5
      },
      gts: {
        type: "uint64",
        id: 6
      },
      uts: {
        type: "uint64",
        id: 7
      }
    }
  },
  XmsgImOrgNodeQueryReq: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      }
    }
  },
  XmsgImOrgNodeQueryRsp: {
    fields: {
      pgt: {
        type: "string",
        id: 1
      },
      name: {
        type: "string",
        id: 2
      },
      enable: {
        type: "bool",
        id: 3
      },
      type: {
        type: "XmsgImOrgNodeType",
        id: 4
      },
      info: {
        type: "XmsgImOrgNodeInfo",
        id: 5
      },
      ver: {
        type: "uint64",
        id: 6
      },
      gts: {
        type: "uint64",
        id: 7
      },
      uts: {
        type: "uint64",
        id: 8
      }
    }
  },
  XmsgImOrgEvent: {
    fields: {
      dept: {
        type: "XmsgImOrgEventDept",
        id: 1
      },
      deptUsr: {
        type: "XmsgImOrgEventDeptUsr",
        id: 2
      },
      usr: {
        type: "XmsgImOrgEventUsr",
        id: 3
      }
    }
  },
  XmsgImOrgEventDept: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      pcgt: {
        type: "string",
        id: 2
      },
      name: {
        type: "string",
        id: 3
      },
      enable: {
        type: "bool",
        id: 4
      },
      info: {
        type: "XmsgImOrgNodeInfo",
        id: 5
      },
      ver: {
        type: "uint64",
        id: 6
      },
      gts: {
        type: "uint64",
        id: 7
      },
      uts: {
        type: "uint64",
        id: 8
      }
    }
  },
  XmsgImOrgEventDeptUsr: {
    fields: {
      dcgt: {
        type: "string",
        id: 1
      },
      ucgt: {
        type: "string",
        id: 2
      },
      name: {
        type: "string",
        id: 3
      },
      enable: {
        type: "bool",
        id: 4
      },
      info: {
        type: "XmsgImOrgNodeInfo",
        id: 5
      },
      ver: {
        type: "uint64",
        id: 6
      },
      gts: {
        type: "uint64",
        id: 7
      },
      uts: {
        type: "uint64",
        id: 8
      }
    }
  },
  XmsgImOrgEventUsr: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      name: {
        type: "string",
        id: 2
      },
      enable: {
        type: "bool",
        id: 3
      },
      info: {
        type: "XmsgImOrgNodeInfo",
        id: 4
      },
      ver: {
        type: "uint64",
        id: 5
      },
      gts: {
        type: "uint64",
        id: 6
      },
      uts: {
        type: "uint64",
        id: 7
      }
    }
  },
  XmsgImOrgNodeType: {
    values: {
      X_MSG_IM_ORG_NODE_TYPE__RESERVED__: 0,
      X_MSG_IM_ORG_NODE_TYPE_BRANCH: 1,
      X_MSG_IM_ORG_NODE_TYPE_LEAF: 2
    }
  },
  XmsgImOrgNodeInfo: {
    fields: {
      kv: {
        keyType: "string",
        type: "string",
        id: 1
      }
    }
  },
  XmsgImOrgNodeChild: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      name: {
        type: "string",
        id: 2
      },
      enable: {
        type: "bool",
        id: 3
      },
      type: {
        type: "XmsgImOrgNodeType",
        id: 4
      },
      info: {
        type: "XmsgImOrgNodeInfo",
        id: 5
      },
      ver: {
        type: "uint64",
        id: 6
      },
      gts: {
        type: "uint64",
        id: 7
      },
      uts: {
        type: "uint64",
        id: 8
      }
    }
  },
  XmsgOssUploadSimpleReq: {
    fields: {
      objName: {
        type: "string",
        id: 1
      },
      objSize: {
        type: "uint64",
        id: 2
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 3
      }
    }
  },
  XmsgOssUploadSimpleRsp: {
    fields: {
      oid: {
        type: "string",
        id: 1
      },
      hashVal: {
        type: "string",
        id: 2
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 3
      }
    }
  },
  XmsgOssDownloadSimpleReq: {
    fields: {
      oid: {
        type: "string",
        id: 1
      },
      cgt: {
        type: "string",
        id: 2
      },
      offset: {
        type: "uint64",
        id: 3
      },
      len: {
        type: "uint64",
        id: 4
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 5
      }
    }
  },
  XmsgOssDownloadSimpleRsp: {
    fields: {
      objName: {
        type: "string",
        id: 1
      },
      objSize: {
        type: "uint64",
        id: 2
      },
      hashVal: {
        type: "string",
        id: 3
      },
      gts: {
        type: "uint64",
        id: 4
      },
      ext: {
        keyType: "string",
        type: "string",
        id: 5
      }
    }
  },
  XmsgOssUsrObjInfoQueryReq: {
    fields: {
      sts: {
        type: "uint64",
        id: 1
      },
      ets: {
        type: "uint64",
        id: 2
      },
      page: {
        type: "uint32",
        id: 3
      },
      pageSize: {
        type: "uint32",
        id: 4
      }
    }
  },
  XmsgOssUsrObjInfoQueryRsp: {
    fields: {
      objInfo: {
        rule: "repeated",
        type: "XmsgOssUsrObjInfo",
        id: 1
      }
    }
  },
  XmsgOssUsrObjInfo: {
    fields: {
      oid: {
        type: "string",
        id: 1
      },
      objName: {
        type: "string",
        id: 2
      },
      objSize: {
        type: "uint64",
        id: 3
      },
      hashVal: {
        type: "string",
        id: 4
      },
      gts: {
        type: "uint64",
        id: 5
      }
    }
  },
  XmsgClientTokenInfo: {
    fields: {
      cgt: {
        type: "string",
        id: 1
      },
      token: {
        type: "string",
        id: 2
      },
      alg: {
        type: "string",
        id: 3
      },
      slat: {
        type: "string",
        id: 4
      },
      plat: {
        type: "string",
        id: 5
      },
      did: {
        type: "string",
        id: 6
      },
      sign: {
        type: "string",
        id: 7
      }
    }
  },
  XmsgImSdkEventAdapter: {
    fields: {
      apiId: {
        type: "uint32",
        id: 1
      },
      evnType: {
        type: "XmsgImSdkEventType",
        id: 2
      },
      netNotice: {
        type: "XmsgImSdkEventNetNotice",
        id: 3
      },
      netReq: {
        type: "XmsgImSdkEventNetReq",
        id: 4
      },
      netRsp: {
        type: "XmsgImSdkEventNetRsp",
        id: 5
      },
      dbRsp: {
        type: "XmsgImSdkEventDbRsp",
        id: 6
      },
      cxxLog: {
        type: "XmsgImSdkEventCxxLog",
        id: 7
      }
    },
    nested: {
      XmsgImSdkEventNetNotice: {
        fields: {
          msg: {
            type: "string",
            id: 1
          },
          dat: {
            type: "bytes",
            id: 2
          }
        }
      },
      XmsgImSdkEventNetReq: {
        fields: {
          tid: {
            type: "uint32",
            id: 1
          },
          msg: {
            type: "string",
            id: 2
          },
          dat: {
            type: "bytes",
            id: 3
          }
        }
      },
      XmsgImSdkEventNetRsp: {
        fields: {
          tid: {
            type: "uint32",
            id: 1
          },
          ret: {
            type: "uint32",
            id: 2
          },
          desc: {
            type: "string",
            id: 3
          },
          msg: {
            type: "string",
            id: 4
          },
          dat: {
            type: "bytes",
            id: 5
          }
        }
      },
      XmsgImSdkEventDbRsp: {
        fields: {
          tid: {
            type: "uint32",
            id: 1
          },
          ret: {
            type: "uint32",
            id: 2
          },
          desc: {
            type: "string",
            id: 3
          },
          dat: {
            type: "XmsgImClientDbCrudRsp",
            id: 5
          }
        }
      },
      XmsgImSdkEventCxxLog: {
        fields: {
          lev: {
            type: "uint32",
            id: 1
          },
          log: {
            type: "string",
            id: 2
          }
        }
      }
    }
  },
  XmsgImSdkEventXmsgImAuth: {
    fields: {
      evn: {
        type: "string",
        id: 1
      },
      times: {
        type: "uint32",
        id: 2
      },
      addr: {
        type: "string",
        id: 3
      }
    }
  },
  XmsgImSdkEventXmsgAp: {
    fields: {
      evn: {
        type: "string",
        id: 1
      },
      times: {
        type: "uint32",
        id: 2
      },
      addr: {
        type: "string",
        id: 3
      }
    }
  },
  XmsgImSdkEventType: {
    values: {
      X_MSG_IM_SDK_EVENT_TYPE_NET_NOTICE: 0,
      X_MSG_IM_SDK_EVENT_TYPE_NET_REQ: 1,
      X_MSG_IM_SDK_EVENT_TYPE_NET_RSP: 2,
      X_MSG_IM_SDK_EVENT_TYPE_DB_RSP: 3,
      X_MSG_IM_SDK_EVENT_TYPE_CXX_LOG: 4
    }
  }
});

module.exports = $root;
