<template>
  <div class="msgMainBox">
    <div
      style="text-align:center;line-height:30px;color:#000;border-bottom:1px solid #e5e5e5;font-size:14px;"
    >{{name}}</div>
    <div class="msgShowBox">
      <!-- <div class="text_left" >
               <div class="inlineBlock">
                    <img class="imHead" src="static/head//1.jpg" alt="">
               </div>
              <p  class="inlineBlock">test文字</p>
           
      </div>-->
      <template v-for="(item,i) in msgList">
        <div :class="item.scgt==mycgt?'text_right': 'text_left'" :key="i">
          <div class="inlineBlock" v-if="item.scgt!=mycgt">
            <img class="imHead" :src="'static/head/'+img+'.jpg'" alt />
          </div>
          <p class="inlineBlock" v-if="item.type=='text'">
            {{
            item.msg
            }}
          </p>
          <div class="inlineBlock" v-if="item.scgt==mycgt">
            <img class="imHead" src="static/head/20.jpg" alt />
          </div>
        </div>
      </template>
    </div>
    <div class="im-chat-footer">
      <div class="im-chat-tool">
        <Icon type="ios-happy-outline" @click="showFaceBox()"></Icon>
        <div class="ivu-upload">
          <div class="ivu-upload ivu-upload-select">
            <input type="file" class="ivu-upload-input" />
            <i class="ivu-icon ivu-icon-ios-image-outline"></i>
          </div>
          <!---->
        </div>
        <div class="ivu-upload">
          <div class="ivu-upload ivu-upload-select">
            <input type="file" class="ivu-upload-input" />
            <i class="ivu-icon ivu-icon-ios-folder-open-outline"></i>
          </div>
          <!---->
        </div>
        <Faces v-show="faces" @click="faces=false" class="faces-box" @insertFace="insertFace"></Faces>
        <Button class="history-message-btn" @click="getHistoryMessage()">聊天记录</Button>
      </div>
      <textarea v-model="messageContent" class="textarea" @keyup.enter="mineSend()"></textarea>
      <div class="im-chat-send" style="padding-bottom: 20px;">
        <Button @click="mineSend()">发送</Button>
      </div>
    </div>
  </div>
</template>
<script>
import Faces from "./faces.vue";
export default {
  components: {
    Faces
  },
  props: {
    name: {
      type: String,
      default: ""
    },
    cgt: {
      type: String,
      default: ""
    },
    img: {
      type: [String, Number],
      default: ""
    }
  },
  data() {
    return {
      messageContent: "",
      faces: false,
      msgList: [],
      mycgt: this.$XmsgImSdk.cgt
    };
  },
  watch: {
    cgt: {
      handler(newVal) {
        console.log(newVal, "newVal===================handler============");
        const self = this;

        let sql = `select scgt,msgId,msg,gts from tb_usr_group_msg where gcgt='${newVal}' order by gts`;

        self.msgList = [];
        self.$XmsgImSdk.tools.dbFutureUsrDat(sql, function(ret, desc, rsp) {
          if (ret == 0) {
            for (let i = 0; i < rsp.row.length; i++) {
              let msgObj = JSON.parse(
                self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "msg")
              );
              console.log(msgObj);
              let msg = "";
              if (msgObj.type == "text") {
                msg = msgObj.text == undefined ? "" : msgObj.text.text;
              } else {
                msg = msgObj.type + "消息类型暂不支持显示，敬请期待";
              }

              const obj = {
                msgId: self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "msgId"),
                scgt: self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "scgt"),
                msg: msg,
                type: msgObj.type,
                time: self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "gts")
              };

              self.msgList.push(obj);
            }
          }
        });
      }
    },
    immediate: true
    // cgt:this.queryMsg
  },
  methods: {
    sendMsg() {
      console.log("点击发送消息");
    },
    showFaceBox() {
      this.faces = !this.faces;
    },
    insertFace() {
      this.faces = false;
    },
    mineSend() {
      let obj = JSON.parse(
        JSON.stringify({ type: "text", text: { text: this.messageContent } })
      );
      const self = this;
      console.log(obj);
      this.$XmsgImSdk.XmsgImGroupSendMsgReq(this.mycgt, obj, function(
        ret,
        desc,
        rsp
      ) {
        if (ret == 0) {
          self.msgList.push({
            scgt: self.mycgt,
            type: "text",
            msg: obj.text.text
          });
          self.messageContent = "";
          self.$XmsgImSdk.queryVerGroupSyncReq()
          console.log(rsp);
          //   self.queryMsg(self.cgt);
        }
      });
    },
    queryMsg(cgt) {
      const self = this;
      //   self.$XmsgImSdk.groupXmsgImGroupMsgSyncReq(cgt, function(ret) {
      let sql = `select scgt,msgId,msg,gts from tb_usr_group_msg where gcgt='${cgt}' order by gts`;

      self.msgList = [];
      self.$XmsgImSdk.tools.dbFutureUsrDat(sql, function(ret, desc, rsp) {
        if (ret == 0) {
          for (let i = 0; i < rsp.row.length; i++) {
            let msgObj = JSON.parse(
              self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "msg")
            );
            console.log(msgObj);
            let msg = "";
            if (msgObj.type == "text") {
              msg = msgObj.text == undefined ? " " : msgObj.text.text;
            } else {
              msg = msgObj.type + "消息类型暂不支持显示，敬请期待";
            }

            const obj = {
              msgId: self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "msgId"),
              scgt: self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "scgt"),
              msg: msg,
              type: msgObj.type,
              time: self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "gts")
            };

            self.msgList.push(obj);
          }
        }
      });
      //   });
    },
  },mounted(){
    this.queryMsg(this.cgt)
    console.log(this.cgt,"cgt========================================")
  }
};
</script>
<style lang="scss">
    @import '../../../styles/theme';
.msgMainBox {
  .inlineBlock {
    display: inline-block;
    min-width: 7rem;
  }
  height: 100%;
  .text_left {
    text-align: left;
    padding: 2rem;
  }

  .imHead {
    width: 30px;
    height: 30px;
  }
  .text_right {
    padding: 2rem;
    text-align: right;
  }
  .msgShowBox {
    height: 70%;
    line-height: 30px;
    overflow: auto;
    p {
      background: #ffffff;
      padding: 10px;
      border-radius: 10px;
    }
  }
  .msgSendBox {
    flex-direction: column;
    height: 30%;
    min-height: 100px;
    border-top: 1px solid #999;
    .sendContent {
      padding: 10px;
      text-align: left;
    }
    .sendBtn {
      height: 20px;
      padding: 10px 20px 20px 20px;
      text-align: right;
    }
  }
}

    .im-chat {
        flex: 1;
        display: flex;
        flex-direction: column;
        margin-top: 4rem;
        overflow: hidden;
    }

    .im-chat-top {
        border-bottom: 1px solid #cccccc;
        color: $color-default;
        padding: 0 0 0.2rem 1rem;
        font-size: 1.6rem;
        font-weight: bold;
        height: 40px;
        .menu {
            color: $color-default;
            display: inline-block;
            padding: 0 10px;
        }
    }

    .user-model {
        .user-model-img {
            padding: 30px;
            text-align: center;

            img {
                border-radius: 50%;
            }
        }

        .user-model-item {
            display: flex;
            padding: 5px 0;

            label {
                flex: 2;
                font-weight: bold;
                text-align: right;
            }

            span {
                flex: 3;
            }
        }
    }

    .im-chat-main {
        flex: 1;
        display: flex;
        flex-direction: row;
        height: calc(100% - 40px);

        .im-chat-main-left {
            flex: 4;
            display: flex;
            flex-direction: column;

            .im-chat-main-box {
                flex: 1;
                padding-top: 1rem;
                overflow-x: hidden;
                overflow-y: auto;
            }
        }

        .message-img {
            max-width: 20rem;
        }

        .im-chat-users {
            flex: 1;
            border-left: 1px solid #cccccc;
            overflow-y: scroll;
        }

        .messages {
            width: 100%;
            height: calc(100% - 3rem);
            overflow-y: scroll;

            ul {
                width: 100%;

                li {
                    position: relative;
                    font-size: 0;
                    margin-bottom: 10px;
                    padding-left: 60px;
                    min-height: 68px;

                    .im-chat-text {
                        position: relative;
                        line-height: 22px;
                        margin-top: 25px;
                        padding: 0.8rem 1.5rem;
                        background-color: #e2e2e2;
                        border-radius: 3px;
                        color: #333;
                        word-break: break-all;
                        display: inline-block;
                        vertical-align: top;
                        font-size: 14px;

                        &:after {
                            content: '';
                            position: absolute;
                            left: -10px;
                            top: 13px;
                            width: 0;
                            height: 0;
                            border-style: solid dashed dashed;
                            border-color: #e2e2e2 transparent transparent;
                            overflow: hidden;
                            border-width: 10px;
                        }

                        pre {
                            width: 100%;
                            white-space: pre-wrap;
                            word-break: break-all;
                        }
                    }
                }
            }

            .im-chat-user {
                width: 4rem;
                height: 4rem;
                position: absolute;
                display: inline-block;
                vertical-align: top;
                font-size: 14px;
                left: 3px;
                right: auto;

                cite {
                    position: absolute;
                    left: 60px;
                    top: -2px;
                    width: 500px;
                    line-height: 24px;
                    font-size: 12px;
                    white-space: nowrap;
                    color: #999;
                    text-align: left;
                    font-style: normal;

                    i {
                        font-style: normal;
                        padding-left: 15px;
                    }
                }

                img {
                    width: 4rem;
                    height: 4rem;
                    border-radius: 100%;
                }
            }

            .im-chat-mine {
                text-align: right;
                padding-left: 0;
                padding-right: 60px;

                .im-chat-text {
                    margin-left: 0;
                    text-align: left;
                    background-color: $color-message-bg;
                    color: #fff;
                    display: inline-block;
                    vertical-align: top;
                    font-size: 14px;

                    &:after {
                        left: auto;
                        right: -10px;
                        border-top-color: $color-message-bg;
                    }
                }

                .im-chat-user {
                    left: auto;
                    right: 3px;

                    cite {
                        left: auto;
                        right: 60px;
                        text-align: right;

                        i {
                            padding-left: 0;
                            padding-right: 15px;
                        }
                    }
                }
            }
        }
    }

    .im-chat-footer {
        border-top: 1px solid $color-gray;
        height: 26%;
        display: flex;
        flex-direction: column;

        .im-chat-tool {
            padding: 0.5rem 1rem;
            height: 3.4rem;
            position: relative;

            i {
                font-size: 2.4rem;
                cursor: pointer;
                margin-left: 1rem;
            }

            .faces-box {
                position: absolute;
                bottom: 3.8rem;
            }

            .ivu-upload {
                display: inline-block;
            }

            .history-message-btn {
                float: right;
            }


        }

        textarea {
            border: 0;
            padding: 0.5rem;
            width: 100%;
            flex: 1;
            resize: none;
            background-color: $color-box-bg !important;
            &:focus {
                border: 0;
            }
        }

        .im-chat-send {
            height: 4rem;
            text-align: right;
            padding: 0 1rem 1rem 0;
        }
    }

    .ivu-scroll-wrapper {
        margin: 0 !important;
    }

    .ivu-scroll-container {
        padding: 15px 15px 5px;
        overflow-y: visible !important;
    }

    /* 重新覆盖iview 里面的 model 小于768px 时候 宽度变100% 的问题 */
    @media (max-width: 768px) {
        .user-model {
            .ivu-modal {
                width: 30rem !important;
                margin: 0 auto;
            }
        }
    }

    .history-message {
        width: 80%;
        height: calc(100% - 30px);
    }

    .page {
        position: fixed;
        bottom: 0;
        width: 100%;
        margin: 0.5rem;
    }

    .ivu-drawer-body {
        padding: 0 !important;

        .messages {
            height: calc(100% - 3rem);
        }
    }

    .chat-user-list {
        list-style: none;
        margin: 0;
        padding: 1rem;

        & > li {
            margin-bottom: 1rem;
            cursor: pointer;

            & > .im-chat-avatar {
                width: 3.2rem;
                height: 3.2rem;
                display: inline-block;
                vertical-align: middle;

                & > img {
                    width: 100%;
                    height: 100%;
                }
            }
        }
    }
</style>

