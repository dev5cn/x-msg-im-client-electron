<template>
  <div class="chat-panel">
    <div class="chat-box-list">
      <Search class="search-box" @showChat="showSearchChat"></Search>
      <div class="group-box">
        <ul class="user-list">
          <template v-for="(item,index) in list">
            <li :class="active ===item.cgt?'active':''" @click="link(item.cgt,item.name,item.img)" :key="index">
              <div class="headImg">
                <img :src="'static/head/' + item.img + '.jpg'" alt srcset />
              </div>
              <div class="infoBox">
                <div class="name">{{item.name}}</div>
                <div class="msg">{{item.last_msg}}</div>
              </div>
              <!-- <div class="msg">{{item.last_msg}}</div> -->
            </li>
            
          </template>
          <!-- <li v-if="list.length==0" >
            <router-link v-bind:to="'/index/userBox'">
                       暂无聊天记录，快去组织架构找个人聊天吧
                    </router-link></li> -->
        </ul>
      </div>
    </div>
    <div class="chat-box">
      <Top></Top>
          <div class="nodata" v-if="list.length===0" >
						<img src="~@/assets/no_data.png" alt />
					</div>
 
      <msgBox  v-if="list.length!=0" :cgt="active" :name="activeName" :img="activeImg"></msgBox>
    </div>
  </div>
</template>
<script>
import Search from "../components/search.vue";
import Top from "../components/top.vue";
 
import msgBox from "../components/msgBox.vue";
import {
  ChatListUtils,
  imageLoad,
  MessageTargetType
} from "../../../utils/ChatUtils";
import RequestUtils from "../../../utils/RequestUtils";
import conf from "../conf";

export default {
  components: {
    Search,
    Top,
    // UserChat,
    msgBox
  },
  data() {
    return {
      active: "",
      activeName:"",
      activeImg:"1",
      list: []
    };
  },
  computed: {
    currentChat: {
      get: function() {
        // return this.$store.state.currentChat;
        return {};
      },
      set: function(currentChat) {
        this.$store.commit(
          "setCurrentChat",
          JSON.parse(JSON.stringify(currentChat))
        );
      }
    },
    chatList: {
      get: function() {
        // return this.$store.state.chatList;
      },
      set: function(chatList) {
        // this.$store.commit('setChatList', chatList);
      }
    }
    // XmsgChatLis: {
    //   get: function() {
    //     return this.$store.state.XmsgChatLis;
    //   },
    //   set: function(XmsgChatLis) {
    //     // this.$store.commit("setXmsgChatLis", XmsgChatLis);
    //   }
    // }
  },
  methods: {
    showChat: function(chat) {
      let self = this;
      console.log("chat:", chat);
      self.$store.commit("resetUnRead");
      self.currentChat = chat;
      // 每次滚动到最底部
      self.$nextTick(() => {
        imageLoad("message-box");
      });
    },
    link(cgt,name,img) {
      this.active = cgt;
      this.activeName =name
      this.activeImg =img
    },
    showSearchChat: function(chat) {
      let self = this;
      self.$store.commit("resetUnRead");
      self.currentChat = chat;
      // 每次滚动到最底部
      self.$nextTick(() => {
        imageLoad("message-box");
      });
      // ChatListUtils.resetChatList(
      //   self,
      //   chat,
      //   conf.getHostUrl(),
      //   MessageTargetType.FRIEND
      // );
    },
    delChat(chat) {
      this.$store.commit("delChat", chat);
    }
  },

  watch: {
    "$store.state.XmsgChatLis": function(newVal) {
      console.log(newVal, "newVal================================");
      this.list = newVal;
       if(newVal.length==0)
       return
      this.active = newVal[0].cgt;
      this.activeName = newVal[0].name
      this.activeImg =newVal[0].img
      console.log(newVal, "newVal================================");
      //你需要执行的代码
    }
  },
  activated: function() {
    let self = this;
    // 当前聊天室
    // if (self.$route.query.chat) {
    //   self.$store.commit(
    //     "setCurrentChat",
    //     JSON.parse(JSON.stringify(self.$route.query.chat))
    //   );
    // }
    console.log("activated", self.currentChat);
    // 重新设置chatList
    // self.$store.commit(
    //   "setChatList",
    //   ChatListUtils.getChatList(self.$store.state.user.id)
    // );
    // 每次滚动到最底部
    self.$nextTick(() => {
      imageLoad("message-box");
    });
  },
  mounted: function() {
    const self = this;
    self.$XmsgImSdk.XmsgImGroupInfoQueryReq()
  }
};
</script>
<style lang="scss" scoped>
@import "../../../styles/theme";

.ivu-tabs-content {
  height: 100%;
}

.chat-panel {
  width: 26rem;
  background-color: $color-light-gray;
  height: 100%;
  display: flex;
  flex-direction: row;

  .chat-box {
    flex: 1;
    background-color: $color-box-bg;
    display: flex;
    flex-direction: column;
    position: relative;
  }

  .chat-box-list {
    height: 100%;
    width: 22rem;
    display: flex;
    flex-direction: column;

    .search-box {
      margin: 1.5rem;
      width: 19rem;
    }
  }
}
.active {
  background: #f8f8f8;
}
.group-box {
  height: 100%;
  overflow-y: scroll;
  background: #fff;
  .user-list {
    width: 102%;

    li {
      list-style: none;
      position: relative;
      padding: 1rem;
      font-size: 1.6rem;
      cursor: pointer;
      display: flex;
      color: #000;
      .headImg {
        img {
          width: 3rem;
          height: 3rem;
          vertical-align: middle;
          border-radius: 1rem;
        }
        padding: 1rem 2rem 1rem 1.6rem;
      }
      .infoBox {
        padding-top: 6px;
        .name {
          color: #000;
          font-size: 15px;
        }
        .msg {
          color: #666;
          font-size: 13px;

          width: 140px;
          overflow: hidden; //超出的文本隐藏
          text-overflow: ellipsis; //溢出用省略号显示
          white-space: nowrap; //溢出不换行
        }
      }
      // .name {
      //   //  line-height:rem;
      // }
    }
    .hover {
      color: #108ee9;
    }

    li:hover {
      /*background-color: #efefef;*/
      color: #108ee9;
    }
  }
}
</style>
