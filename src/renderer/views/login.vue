<template>
    <div class="login">
        <Top></Top>
        <div class="logo">
            <!-- <img src="~@/assets/icon.png" alt="icon"> -->
        </div>
        <div class="login-panel" style="-webkit-app-region: no-drag">
            <div class="title">{{app_name}} 登录</div>
            <Alert v-if="showErr" type="error">{{err}}</Alert>
            <div class="item">
                <label>手机：</label>
                <Input prefix="ios-contact-outline" v-model="username" placeholder="手机" class="item-input"/>
            </div>
            <div class="item">
                <label>密码：</label>
                <Input prefix="ios-lock-outline" type="password" v-model="password" placeholder="密码"
                       class="item-input"/>
            </div>
 
            <div class="btn item">
                <Button type="primary" @click="login()" icon="md-contact" >登录</Button>
            </div>

            <!-- X-MSG-IM-SDK暂时不开放注册功能，账号信息由系统其它网元自动导入 -->
            <div class="item register" v-if="false">
                <a type="info" class="pull-right" @click="showRegister = true"><Icon type="ios-cloud-circle" />注册</a>
            </div>
        </div>

        <Modal closable class="user-model" v-model="showRegister"
               footer-hide title="注册新用户" width="300">
            <Input v-model="registerPhone" class="setting-item" placeholder="手机"/>
            <Input v-model="registerUsername" class="setting-item" placeholder="名称"/>
            <Input v-model="registerPassword" type="password" class="setting-item" placeholder="密码"/>
            <Button type="primary" ghost long @click="saveRegister" style="margin: 1rem 0">保存</Button>
        </Modal>
        <!-- <vue-particles color="#dedede" :particlesNumber="50" class="bg-login"></vue-particles> -->
    </div>
</template>

<script>
import Top from "./im/components/top.vue";
import conf from "./im/conf";
import StoreUtils from "../utils/StoreUtils";
import { ErrorType } from "../utils/ChatUtils";

export default {
  name: "login",
  data() {
    return {
      app_name: conf.app_name,
      username: "usr00",
      password: "password",
      registerPhone: "",
      registerUsername: "",
      registerPassword: "",
      err: "",
      showErr: false,
      showSetting: false,
      showRegister: false
    };
  },
  components: {
    Top
  },
  methods: {
    clickUser() {
      location.reload();
    },
    saveRegister: function() {
      let self = this;
      if (!/^1[34578]\d{9}$/.test(self.registerPhone)) {
        self.$Message.error("手机号码有误，请重填");
        return;
      }
      let formData = new FormData();
      // 请求参数 ('key',value)
      formData.set("phone", self.registerPhone);
      formData.set("name", self.registerUsername);
      formData.set("password", self.registerPassword);
    },
    login: function() {
      let self = this;
      
      if (this.username.trim().length == 0 || this.password.trim().length == 0) {
        self.$Message.error("请填写用户名和密码");
      } else {
        this.$XmsgImSdk.login(
          this.username.trim(),
          this.password.trim(),
          (ret, desc, rsp) => {
            if (ret == 0) {
              // 跳转到index 页面
              this.$router.push({
                path: "/index/chatBox",
                params: {}
              });
            } else {
              self.$Message.error("登录失败, ret: " + ret + ", desc: " + desc);
            }
          }
        );
      }
    }
  },
  created: function() {}
};
</script>

<style lang="scss" scoped>
@import "./../styles/theme.scss";

.login {
  height: 100%;
  background: url("../assets/bg.png") no-repeat;
  background-size: 100% 100%;
  position: relative;

  .bg-login {
    height: 100%;
    position: absolute;
    top: 0;
    width: 100%;
    z-index: 1;
  }

  .logo {
    width: 33rem;
    height: 100%;
    display: flex;
    justify-content: center;
    flex-direction: column;
    text-align: center;
    border-radius: 50%;
  }

  .logo > img {
    width: 10rem;
    height: 10rem;
    margin-left: 15rem;
    border-radius: 50%;
  }

  .login-panel {
    width: 33rem;
    background: rgba(255, 255, 255, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.3);
    padding: 2rem 3rem 3rem 3rem;
    position: absolute;
    right: 8rem;
    top: 12rem;
    z-index: 2;
    box-shadow: 0 0 5px 3px rgba(186, 186, 186, 0.3);
    color: #fff;
    .item {
      margin-top: 2rem;

      label {
        color: "#fff";
        width: 5rem;
        text-align: right;
        display: inline-block;
      }

      .item-input {
        width: auto !important;
      }
    }

    .btn {
      text-align: center;

      button {
        width: 86%;
      }
    }

    .title {
      color: #fff;
      font-size: 20px;
      font-weight: bold;
      text-align: center;
    }
  }

  .setting {
    color: #fff;
    font-size: 2rem;
    display: block;
    right: 1rem;
    position: absolute;
    bottom: 1rem;
    cursor: pointer;
    z-index: 3;
  }

  .save-setting-btn {
    margin: 1rem 0 !important;
  }

  .register {
    padding: 0 2.2rem;
    a {
      color: #ffffff;
      i {
        font-size: 14px;
        letter-spacing: 5px;
      }
    }
  }
}

.setting-item {
  margin-bottom: 1rem;

  .ivu-input {
    border: 1px solid #84eeba !important;
    background-color: #2baee9;
  }
}
</style>
