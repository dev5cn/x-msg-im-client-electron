<template>
    <div class="v-im">
        <div class="left-bar" style="-webkit-app-region: drag">
            <ul>
                <li class="userPhoto" @click="modal = true">
                    <img src="static/head//20.jpg" />
                </li>
                <li>
                    <router-link v-bind:to="'/index/chatBox'">
                        <Icon type="ios-text-outline" />
                    </router-link>
                </li>
                <li>
                    <router-link v-bind:to="'/index/userBox'">
                        <Icon type="ios-contacts-outline" />
                    </router-link>
                </li>
                <li v-if="false">
                    <router-link v-bind:to="'/index/chatGroupBox'">
                        <Icon type="ios-contacts-outline" />
                    </router-link>
                </li>
            </ul>
        </div>
        <keep-alive>
            <router-view class="content" />
        </keep-alive>
        <Modal closable class="user-model" v-model="modal" footer-hide :title="user.name" width="300">
            <p class="user-model-img">
                <img src="static/head/20.jpg" style="width:60px;height:60px" class="userImg" />
            </p>
            <p class="user-model-item">
                <label>姓名：</label>
                <span>{{user.name}}</span>
            </p>
            <p class="user-model-item">
                <label>手机：</label>
                <span>18888888888</span>
            </p>
            <p class="user-model-item">
                <label>邮箱：</label>
                <span>981597696@qq.com</span>
            </p>
            <p class="user-model-item">
                <label>qq群：</label>
                <span>721779037</span>
            </p>
            <p style="margin:20px;">
                <Button type="error" long @click="myLogout">退出</Button>
            </p>
        </Modal>
    </div>
</template>
<script>
import { logout } from '../utils/ChatUtils';

export default {
    data() {
        return {
            user: {name:this.$XmsgImSdk.usrName},
            modal: false
        };
    },
    methods: {
        myLogout() {
            let self = this;
            self.$router.push({
                        path: '/',
                        params: {}
                      });
            this.$XmsgImSdk.XmsgImHlrDetachSimpleReq((ret,desc,rsp)=>{
                console.log(desc,"调用去附着")
                if(ret ==0 ){
                    this.$XmsgImSdk.attachSuccess = false
                     this.$XmsgImSdk.isFirstAttach=true
                    this.$store.commit("setXmsgImOrgSyncSubReq",false)
 
                     logout(self);
                    //   win.reload
                }else{
                    console.error(desc,"退出登录失败")
                }
            })
        }
    },
    created: function() {
        // this.user = this.$store.state.user;   
    },
    mounted: function() {

    }
};
</script>
<style lang="scss">
@import './../styles/theme.scss';
@import './../styles/v-im.scss';

.v-im {
    display: flex;
    flex-direction: row;
   .user-model .user-model-img {
        .userImg{
        width: 6rem;
        height: 6rem;
        border-radius:50%; 
    }
    }   
    .left-bar {
        background-color: #1c2438;
        width: 6rem;
        height: 100%;

        ul {
            margin: 3rem 1.2rem 1.2rem 1.2rem;
            list-style: none;

            li {
                -webkit-app-region: no-drag;
                display: block;
                width: 3.6rem;
                height: 3.6rem;
                text-align: center;
                margin-bottom: 2rem;
                cursor: pointer;

                .ivu-icon {
                    font-size: 3rem !important;
                    color: $color-default;
                    margin: 0.3rem;
                    cursor: pointer;

                    &:hover {
                        color: $color-write;
                    }
                }

                .router-link-active {
                    .ivu-icon {
                        color: $color-write;
                    }
                }
            }

            .userPhoto {
                margin-bottom: 2rem;

                img {
                    width: 3.6rem;
                    height: 3.6rem;
                }
            }
        }
    }

    .content {
        flex: 1;
    }
}
</style>