<template>
  <ul class="orgList">
    <li v-for="(item, i) in dataList" :key="i" class="list">
      <div class="headImg">
        <img :src="'static/head/' + getRandomNumber() + '.jpg'" alt srcset />
      </div>
      <div class="name flex1">{{ item.name }}</div>
      <div class="click flex1">
        <div v-if="item.type === 'dept'" @click="queryChild(item.cgt, item.name)">下级</div>
        <div v-if="item.type === 'usr'">
          <span @click="sendMsg(item.cgt, item.name)">发送信息</span>
          <span>查看信息</span>
        </div>
      </div>
    </li>
  </ul>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => {
        return [];
      }
    }
  },
  data() {
    return {
      dataList: this.list
    };
  },
  watch: {
    list: {
      handler(newV) {
        this.dataList = newV;
      }
    }
  },
  mounted() {},
  methods: {
    //   生成随机图片
    getRandomNumber() {
      return Math.floor(Math.random() * (120 - 1 + 1)) + 1;
    },
    queryChild(cgt, name) {
      const self = this;
      self.$emit("breadcrumbFn", name);
      this.$XmsgImSdk.XmsgImOrgNodeChildQueryReq(cgt, function(ret, desc, rsp) {
        self.dataList = [];
        console.log(rsp);
        rsp.map((item, i) => {
          if (item.enable) {
            self.dataList.push({
              cgt: item.cgt,
              type: item.type == "2" ? "dept" : "usr"
            });
            self.queryName(
              item.cgt,
              item.type == "2" ? "tb_org_dept" : "tb_org_usr",
              i
            );
          }
        });
      });
    },
    queryName(cgt, type, i) {
      const sql = `select name from ${type} where cgt='${cgt}'`;

      const self = this;
      const index = i;
      this.$XmsgImSdk.tools.dbFutureUsrOrg(sql, function(ret, desc, rsp) {
        // console.log(rsp)
        for (let i = 0; i < rsp.row.length; ++i) {
          self.dataList[index].name = self.$XmsgImSdk.tools.getStrFromDbRst(
            rsp,
            i,
            "name"
          );
          self.$forceUpdate();
        }
      });
    },
    sendMsg(cgt, name) {
      // 		m.setCgt("im.xmsg.dev5.cn.szu0@6b6af75527c14b2884bcd4128cd29b93"); /* usr01. */
      // m.putInfo("name", "usr01");
      // m.putInfo("phone", "15889700000");
      // m.putInfo("email", "dev5@qq.com");
      // req.addMember(m);
      // req.putInfo("name", Misc.printf2str("测试群%02d", 0));
      // Main.netApi.future(req.build(), (ret, desc, rsp) -> Misc.donothing());
    //   let str = JSON.stringify({
    //     private: true,
    //     name: "测试群"
	//   });
	
	//  let testMap =new Map()

      const self = this;
   let arr = JSON.parse(JSON.stringify(self.$store.state.XmsgChatLis));
          arr.unshift({
            name: name,
            cgt:"null",
            last_msg: "",
            last_msg_time: "",
            info: {
              private: "true"
            },
            img: Math.floor(Math.random() * (120 - 1 + 1)) + 1
          });
          console.log(arr);

          self.$store.commit("setXmsgChatLis", arr);
          self.$router.push({
            path: "/index/chatBox"
          });
 
      let obj = {
        info:{"info" :{
        private:"true",
	  }} ,
        member: [
          {
            cgt: cgt,

            info: {
              name: name
            }
          }
        ]
      };
  
    //   self.$XmsgImSdk.XmsgImGroupCreateReq(obj, function(ret, desc, data) {
    //     console.log("创建===========", ret, desc, data, obj);
    //     if (ret == 0) {
    //       let arr = JSON.parse(JSON.stringify(self.$store.state.XmsgChatLis));
    //       arr.unshift({
    //         name: name,
    //         cgt: data.cgt,
    //         last_msg: "",
    //         last_msg_time: "",
    //         info: {
    //           private: "true"
    //         },
    //         img: Math.floor(Math.random() * (120 - 1 + 1)) + 1
    //       });
    //       console.log(arr);

    //       self.$store.commit("setXmsgChatLis", arr);
    //       self.$router.push({
    //         path: "/index/chatBox"
    //       });
    //     }
	//   });
	  



      // let arr = this.$store.XmsgChatLis
      // this.$store.commit('setXmsgChatLis',[arr.push()])
      //  this.$router.push({
      // 	 path:'/index/chatBox'
      //  })
    }
  }
};
</script>

<style lang="scss" scoped>
.orgList {
  height: 100%;
  width: 100%;
  overflow: auto;
  ul,
  li {
    list-style: none;
  }
  li {
    line-height: 5rem;
    font-size: 1.6rem;
    display: flex;
    .click {
      color: #108ee9;
      cursor: pointer;
      text-align: right;
      padding-right: 2rem;
      span {
        padding-left: 1.6rem;
      }
    }
    .click:hover {
      opacity: 0.8;
    }
    .flex1 {
      flex: 1;
    }
  }
  .list {
    border-bottom: 1px solid #e5e5e5;
  }
  .headImg {
    width: 7rem;
    img {
      width: 3rem;
      height: 3rem;
      vertical-align: middle;
      border-radius: 0.6rem;
    }
    padding: 0rem 2rem 1rem 1.6rem;
  }
}
</style
>>
