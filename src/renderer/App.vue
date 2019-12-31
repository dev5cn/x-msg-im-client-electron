<template>
  <div id="app">
    <router-view></router-view>
  </div>
</template>

<script>
export default {
  name: 'v-im'
};
</script>
<style lang="scss">
  #app{
    position: relative;
  .nodata {
		width: 100%;
		height: 100%;
		text-align: center;
		line-height: 100vh;
		img {
			width: 20rem;
		}
	}
  }
  
</style>

