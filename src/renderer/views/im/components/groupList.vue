<template>
  <ul class="groupList">
    <li v-for="(item,i) in list" :key="i" class>
         <div class="headImg">
              <img :src="'static/head/'+getRandomNumber()+'.jpg'" alt srcset />
            </div>
            <div class="name">{{item.name}}({{item.len}}人)</div>
    </li>
    <div class="nodata" v-if="list.length===0" >
						<img src="~@/assets/no_data.png" alt />
					</div>
  </ul>
</template>

<script>
export default {
  props: {
    list: {
      type: Array,
      default: () => {
        return [
        //   {
        //     name:'测试群',
        //     len:10

        // },{
        //     name:'测试群',
        //     len:10

        // }
        ];
      }
    }
  },
  data() {
    return {};
  },
  methods:{
    //   生成随机图片
      getRandomNumber() {
         
          return   Math.floor(Math.random() * (120 -1 + 1)) +1;
       
       }
  }
};
</script>

<style lang="scss" scoped>
.groupList {
    height: 100%;
    width: 100%;
    ul,li{
        list-style: none;
    }
    li{
        display: flex;

    }
    li:hover{
        color: #108ee9;
        cursor: pointer;
    }
  .headImg {
    img {
      width: 3rem;
      height: 3rem;
      vertical-align: middle;
      border-radius: .6rem;
    }
    padding: 1rem 2rem 1rem 1.6rem;
  }
  .name {
    line-height: 5rem;
    font-size: 1.6rem;
  }
}
</style>>
 