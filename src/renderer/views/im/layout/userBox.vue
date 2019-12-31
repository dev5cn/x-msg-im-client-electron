<template>
  <div class="user-box">
    <div class="user-box-list">
      <Search class="search-box" @showChat="showChat"></Search>
      <div class="group-box">
        <ul class="group-list">
          <li :class="active === 'group' ? 'hover' : ''" @click="link('group')">
            <div class="headImg">
              <img src="~@/assets/head/group.png" alt srcset />
            </div>
            <div class="name">群组</div>
          </li>
          <li :class="active === 'org' ? 'hover' : ''" @click="link('org')">
            <div class="headImg">
              <img src="~@/assets/head/org.png" alt srcset />
            </div>
            <div class="name">组织架构</div>
          </li>
        </ul>
      </div>
    </div>
    <div class="content">
      <Top></Top>
      <ul class="listBigBox">
        <li class="breadcrumb">
          <span
            v-for="(item, i) in breadcrumb"
            :key="i"
          >{{ item }}{{ i === breadcrumb.length - 1 ? '' : '/' }}</span>
        </li>
      
        <li class="listBox">
          <groupList v-if="active === 'group'"></groupList>
          <orgList v-if="active === 'org'" :list="orgList" @breadcrumbFn="breadcrumbFn"></orgList>
        </li>
      </ul>

 
    </div>
  </div>
</template>
<script>
import Search from "../components/search.vue";
import Top from "../components/top.vue";
import Welcome from "../components/welcome.vue";
import groupList from "../components/groupList.vue";
import orgList from "../components/orgList.vue";

import conf from "../conf";
import { MessageTargetType } from "../../../utils/ChatUtils";

const { ChatListUtils } = require("../../../utils/ChatUtils.js");

export default {
  components: {
    Search,
    Top,
    Welcome,
    groupList,
    orgList
  },
 
  data() {
    return {
      breadcrumb: ["组织架构"],
      active: "org",
      orgList: []
    };
  },
  mounted() {
    this.getDept();
  
    const self = this;
  },
  methods: {
    link(name) {
      this.active = name;
      if (name == "group") {
        this.breadcrumb = ["群组"];
      } else {
        this.breadcrumb = ["组织架构"];
      }
    },
    getDept() {
     
      this.orgList = [];
      const sql = `select cgt from tb_org_dept where pcgt is null`;
      const self = this;
      this.$XmsgImSdk.tools.dbFutureUsrOrg(sql, function(ret, desc, rsp) {
        let arr = [];
        console.log("select")
        for (let i = 0; i < rsp.row.length; ++i) {
          arr.push(self.$XmsgImSdk.tools.getStrFromDbRst(rsp, i, "cgt"));
        }
        var instring = "'" + arr.join("','") + "'";
        const sql2 = `select name,cgt from tb_org_dept where cgt in (${instring})`;
        self.$XmsgImSdk.tools.dbFutureUsrOrg(sql2, function(ret2, desc2, rsp2) {
          for (let j = 0; j < rsp.row.length; ++j) {
            const obj = {};

            obj.cgt = self.$XmsgImSdk.tools.getStrFromDbRst(rsp2, j, "cgt");
            obj.name = self.$XmsgImSdk.tools.getStrFromDbRst(rsp2, j, "name");
            obj.type = "dept";
            self.orgList.push(obj);
          }
        });
      });
    },
    breadcrumbFn(name) {
      this.breadcrumb.push(name);
    
      this.$forceUpdate();
    },
    showChat() {}
  }
};
</script>
<style lang="scss" scoped>
@import "../../../styles/theme";

.ivu-tabs-content {
  height: 100%;
}

.user-box {
  width: 26rem;
  background-color: $color-write;
  height: 100%;
  display: flex;

  flex-direction: row;

  .user-box-list {
    height: 100%;
    width: 22rem;
    display: flex;
    flex-direction: column;
    border-right: 1px solid #e5e5e5e5;
    .search-box {
      margin: 1.5rem;
      width: 19rem;
    }

    .group-box {
      overflow-y: scroll;
      flex: 1;

      .group-list {
        margin: 0 1rem;

        .count {
          color: #aaaaaa;
        }

        li {
          list-style: none;
          position: relative;
          font-size: 1.2rem;
          cursor: pointer;
          font-weight: 200;
          display: flex;
          color: #000;
          border-bottom: 1px dashed #e5e5e5;
          padding-bottom: 1rem;
          .headImg {
            img {
              width: 3rem;
              height: 3rem;
              vertical-align: middle;
              border-radius: 1rem;
            }
            padding: 1rem 2rem 1rem 1.6rem;
          }
          .name {
            line-height: 5rem;
            font-size: 2rem;
          }
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
  }
  .content {
    .breadcrumb {
      //    margin-top: 4rem;
      border-bottom: 1px solid #e5e5e5;
      font-size: 1.6rem;
      color: #000;
      padding: 1.6rem;
    }
  }
  .listBigBox {
    list-style: none;
    height: 100%;
  }
  .listBox {
    height: 100%;
  }
}
</style>
