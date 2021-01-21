<!--
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2021-01-21 14:57:54
-->
<template>
  <div class="map-page" ref="scroll" id="scroll">
    <div class="prevent-wrap" v-show="showPrevent"></div>
    <audio preload src="../assets/music/bgm01.mp3" loop style="display:none" ref="bgmusic"></audio>
    <audio preload src="../assets/music/airplane.mp3" style="display:none" ref="airmusic"></audio>
    <audio preload src="../assets/music/run.mp3" loop style="display:none" ref="runmusic"></audio>

    <img :style="{ width: music ? '40px' : '' }" class="icon-music" :src="music ? require('../assets/icon/music-yes.png') : require('../assets/icon/music-no.png')" alt="" @click="bgMusicChange" />
    <!-- 飞机 -->
    <img class="fly-plane" :class="fly && 'fly'" src="../assets/icon/plane.png" alt="" v-show="fly" @animationEnd="flyEnd" @webkitAnimationEnd="flyEnd" />
    <!-- 指南针 -->
    <img class="icon-compass" src="../assets/icon/compass.png" alt="" />

    <!-- 地图区域 -->
    <div class="map-wrap">
      <!-- 路线图 -->
      <div class="map-line"></div>
      <!-- 标题 -->
      <div class="page-title"></div>
      <!-- 地图说明 -->
      <div class="map-intro"></div>
      <!-- 小人 -->
      <div class="icon-boy" ref="boy" :style="boyStyle"></div>
      <!-- 地点 -->
      <div class="place" v-for="item in placeList" :key="item.name" :style="{ top: item.position.top, left: item.position.left }" @click="bindPlace(item)">
        <div class="place-icon">
          <span class="place-text">{{ item.name }}</span>
        </div>
      </div>
    </div>

    <!-- 领红包倒计次数弹框 -->
    <van-popup v-model="showCountTime">
      <div class="red-packet" v-if="count == 0">
        <img class="img" src="../../public/adImages/2021011902.png" alt="" />
        <img src="@/assets/icon/close-2.png" class="icon-close" alt="" @click="showCountTime = false" />
      </div>
      <div class="count-wrap" v-if="count < 10 && count > 0">
        <img class="img-num" :src="require(`../assets/image/count-${count}.png`)" alt="" />
      </div>
    </van-popup>

    <!-- 详情弹框 -->
    <van-popup v-model="showDetail" :close-on-click-overlay="false">
      <div class="place-detail-wrap popup-wrap">
        <div class="shop-item " v-if="showPlace.shops">
          <img :src="showPlace.shops.banner" alt="" class="img" />
          <p class="text">{{ showPlace.name }}出品</p>
          <!-- <div class="img" :style="'background:url(' + showPlace.shops.banner + ')center center / cover no-repeat'"></div> -->
          <!-- <div style="flex:1">
            <h2 class="title">{{ showPlace.shops.title }}</h2>
            <p class="text">{{ showPlace.name }}出品</p>
            <button class="copy-btn" v-if="showPlace.shops.type == 'taobao'" :data-clipboard-text="showPlace.shops.key" @click="copyTbWord">复制口令</button>
            <a :href="showPlace.shops.link" class="copy-btn" v-if="showPlace.shops.type == '1688'">立即购买</a>
          </div> -->
        </div>
      </div>
      <img src="@/assets/icon/close-2.png" class="icon-close" alt="" @click="closeDetail" />
    </van-popup>

    <!-- 地图弹出动画 -->
    <van-popup v-model="mappup" :close-on-click-overlay="false">
      <div class="map-pup-wrap">
        <div :class="flag2 ? 'map-pup-bg' : null" @webkitAnimationEnd="mapanimateEnd" @animationEnd="mapanimateEnd"></div>
      </div>
    </van-popup>

    <!-- 开始动画 -->
    <van-popup v-model="showAction" :close-on-click-overlay="false" overlay-class="animate-bg-bg">
      <div class="animate-bg" :class="flag && 'animate'" @webkitAnimationEnd="animateEnd" @animationEnd="animateEnd"></div>
    </van-popup>

    <!-- 开始弹框 -->
    <van-popup v-model="showStart" :close-on-click-overlay="false">
      <div class="start-wrap">
        <button class="start-btn" @click="handleStart">打开地图</button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import Clipboard from "clipboard";
import Jquery from "jquery";
import mydata from "../../public/data.js";
const Unit_Time = 100; //单位时间
const Delay_Time = 500; //切换方向延迟（X轴，Y轴切换）
const Speed_Time = 200; // 走路速度

import { Popup, Swipe, SwipeItem } from "vant";
export default {
  name: "Home",
  components: {
    [Popup.name]: Popup,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
  },
  data() {
    return {
      count: 10, //还剩多少步可领红包
      showCountTime: false,

      mappup: false,
      flag2: false,

      showAction: false, //动画
      flag: false,

      airInterval: null,
      music: true,
      fly: false,
      showPrevent: false, //小人开始移动时的放触摸遮罩
      showStart: false, //开始弹框
      showDetail: false, //详情弹框

      boyStyle: {
        width: "64px",
        height: "64px",
        top: "50%",
        left: "50%",
        backgroundPosition: "0% 0%",
        transitionDuration: "0ms",
        transitionProperty: "",
      }, //小人属性
      placeList: [], //地点集合
      showPlace: {}, //要展示的地点信息
      initBoy: null, //初始时小人走路动画定时器
    };
  },
  created() {
    this.resourceLoad();
    this.placeList = mydata.list;
  },
  mounted() {
    this.init();
  },
  methods: {
    //关闭详情弹框
    closeDetail() {
      this.showDetail = false;
      if (this.count <= 0) {
        return;
      }
      this.count--;
      this.showCountTime = true;
      if (this.count == 0) {
        return;
      }
      setTimeout(() => {
        this.showCountTime = false;
      }, 2000);
    },

    //打开关闭音乐
    bgMusicChange() {
      const bgMusic = this.$refs.bgmusic;
      const airMusic = this.$refs.airmusic;
      if (this.music) {
        this.music = false;
        bgMusic.pause();
        airMusic.pause();
        clearInterval(this.airInterval);
      } else {
        this.music = true;
        bgMusic.play();
        airMusic.play();
        this.fly = true;
        this.airInterval = setInterval(() => {
          airMusic.play();
          this.fly = true;
        }, 60000);
      }
    },
    //复制口令
    copyTbWord() {
      let copy = new Clipboard(".copy-btn");
      copy.on("success", (e) => {
        console.log(e);
        this.$toast("口令复制成功,请在淘宝打开");
        copy.destroy();
      });
      copy.on("error", function(e) {
        this.$toast("口令复制失败");
        console.log(e);
      });
    },

    //资源加载
    resourceLoad() {
      let loading = this.$toast.loading({
        message: "资源加载中...",
        duration: 0,
        forbidClick: true,
      });
      let imgs = [require("@/assets/image/bg-popup-2.jpg"), require("@/assets/image/map-4000-3.png"), require("@/assets/image/map-circle.png")];
      let count = 0;
      for (let img of imgs) {
        let image = new Image();
        image.src = img;
        image.onload = (e) => {
          console.log("背景图预加载成功");
          count++;
          if (count == imgs.length) {
            loading.clear();
          }
        };
        image.onerror = (e) => {
          console.log("背景图预加载失败", e);
          count++;
          if (count == imgs.length) {
            loading.clear();
          }
        };
      }
    },

    //点击开始
    handleStart() {
      this.showStart = false;
      const bgMusic = this.$refs.bgmusic;
      const airMusic = this.$refs.airmusic;
      const runMusic = this.$refs.runmusic;
      bgMusic.play();
      airMusic.play();
      airMusic.pause();
      runMusic.play();
      runMusic.pause();

      airMusic.pause();
      this.showStart = false;
      this.showAction = true;
      setTimeout(() => {
        this.flag = true;
      }, 500);
    },

    //地球旋转动画结束
    animateEnd() {
      this.showAction = false;
      this.flag2 = true;
    },

    //地图弹出动画结束
    mapanimateEnd() {
      this.mappup = false;
      const airMusic = this.$refs.airmusic;
      airMusic.play();
      this.fly = true;
      this.airInterval = setInterval(() => {
        airMusic.play();
        this.fly = true;
      }, 60000);
      this.$once("hook:beforeDestroy", function() {
        clearInterval(this.airInterval);
      });
    },

    //飞机动画结束
    flyEnd() {
      this.fly = false;
    },

    //初始化
    init() {
      //初始化地图 居中
      const scrollElement = this.$refs.scroll;
      const width = scrollElement.scrollWidth;
      const height = scrollElement.scrollHeight;
      const screenWidth = document.body.clientWidth;
      const screenHeight = document.body.clientHeight;
      scrollElement.scrollLeft = (width - screenWidth) / 2;
      scrollElement.scrollTop = (height - screenHeight) / 2;
      // 小人原地走
      let tag = 0;
      this.initBoy = setInterval(() => {
        if (tag % 2 == 0) {
          this.boyStyle.backgroundPosition = "50% 0%";
        } else {
          this.boyStyle.backgroundPosition = "100% 0%";
        }
        tag++;
      }, Speed_Time);
    },

    //页面横向跟随小人  xtime  小人横向走动时间 pleft 小人要移动到的x轴位置  boyLeft 小人运动前的位置
    movePage(xtime, pleft, boyLeft, boyTop) {
      const scrollElement = this.$refs.scroll;
      const mapWidth = scrollElement.scrollWidth; //地图容器的宽度
      const screenWidth = document.body.clientWidth; //屏幕宽度

      const scaleNum = pleft.replace("%", "") / 100; //将位置转换为小数
      const boyNum = boyLeft.replace("%", "") / 100;

      const startPosition = mapWidth * boyNum - screenWidth / 2;
      const endPosition = mapWidth * scaleNum - screenWidth / 2; //要滚动到的位置

      scrollElement.scrollLeft = startPosition; //移动到小人位置横向

      const mapHeight = scrollElement.scrollHeight; //地图容器的宽度
      const screenHeight = document.body.clientHeight; //屏幕宽度
      const boyNumTop = boyTop.replace("%", "") / 100;
      const startPositionTop = mapHeight * boyNumTop - screenHeight / 2;
      scrollElement.scrollTop = startPositionTop; //移动到小人位置 竖直方向

      Jquery("#scroll").animate({ scrollLeft: endPosition }, xtime, "linear", function() {
        console.log("aaa");
      });
    },

    //页面上下跟随小人
    movePageVertical(ytime, pTop, boyTop) {
      const scrollElement = this.$refs.scroll;

      const mapHeight = scrollElement.scrollHeight; //地图容器的宽度
      const screenHeight = document.body.clientHeight; //屏幕宽度

      const scaleNum = pTop.replace("%", "") / 100; //将位置转换为小数

      const endPosition = mapHeight * scaleNum - screenHeight / 2; //要滚动到的位置

      Jquery("#scroll").animate({ scrollTop: endPosition }, ytime, "linear", function() {
        console.log("bbb");
      });
    },

    //获取小人所在位置
    getBoyPosition() {
      const boy = this.$refs.boy;
      return {
        top: boy.style.top,
        left: boy.style.left,
      };
    },

    /**
     *位置     立正     左脚       右脚
     *向下走 (0 00%) (50% 00%) (100% 00%)
     *向左走 (0 33%) (50% 33%) (100% 33%)
     *向右走 (0 66%) (50% 66%) (100% 66%)
     *向上走 (0 100%) (50% 100%) (100% 100%)
     */
    //小人移动 先左右 再上下  如果xDiff大于0 则向右  yDiff大于0 则向下
    boyMove(place, boyPosition) {
      //播放走路音效
      const runMusic = this.$refs.runmusic;
      runMusic.play();

      const placeLeftNum = place.position.left.split("%")[0]; //地点x轴坐标值
      const placeTopNum = place.position.top.split("%")[0]; //地点y轴坐标值
      const boyLeftNum = boyPosition.left.split("%")[0]; //小人x轴坐标值
      const boyTopNum = boyPosition.top.split("%")[0]; //小人y轴坐标值

      const xDiff = placeLeftNum - boyLeftNum; //横向差值
      const yDiff = placeTopNum - boyTopNum; //纵向差值

      const xTime = Math.abs(xDiff) * Unit_Time; //x轴移动时间
      const yTime = Math.abs(yDiff) * Unit_Time; //y轴移动时间

      let UpInterval, DownInterval, RightInterval, LeftInterval;

      //=======================================================================
      this.showPrevent = true; //打开防止小人运动时用户触摸的遮罩
      //x轴移动
      if (xDiff >= 0) {
        // //向右
        this.boyStyle.backgroundPosition = "0% 66%";
        let tag = 0;
        RightInterval = setInterval(() => {
          if (tag % 2 == 0) {
            this.boyStyle.backgroundPosition = "50% 66%";
          } else {
            this.boyStyle.backgroundPosition = "100% 66%";
          }
          tag++;
        }, Speed_Time);
      } else {
        // //向左
        this.boyStyle.backgroundPosition = "0% 33%";
        let tag = 0;
        RightInterval = setInterval(() => {
          if (tag % 2 == 0) {
            this.boyStyle.backgroundPosition = "50% 33%";
          } else {
            this.boyStyle.backgroundPosition = "100% 33%";
          }
          tag++;
        }, Speed_Time);
      }

      setTimeout(() => {
        this.boyStyle.left = place.position.left;
        this.boyStyle.transitionProperty = "left";
        this.boyStyle.transitionDuration = xTime + "ms";
        this.movePage(xTime, place.position.left, boyPosition.left, boyPosition.top);
      }, Delay_Time);
      //=======================================================================

      //=======================================================================
      //y轴移动
      setTimeout(() => {
        clearInterval(LeftInterval);
        clearInterval(RightInterval);
        if (yDiff >= 0) {
          // //向下
          this.boyStyle.backgroundPosition = "0% 0%";
          let tag = 0;
          DownInterval = setInterval(() => {
            if (tag % 2 == 0) {
              this.boyStyle.backgroundPosition = "50% 0%";
            } else {
              this.boyStyle.backgroundPosition = "100% 0%";
            }
            tag++;
          }, Speed_Time);
        } else {
          // //向上
          this.boyStyle.backgroundPosition = "0% 100%";
          let tag = 0;
          UpInterval = setInterval(() => {
            if (tag % 2 == 0) {
              this.boyStyle.backgroundPosition = "50% 100%";
            } else {
              this.boyStyle.backgroundPosition = "100% 100%";
            }
            tag++;
          }, Speed_Time);
        }

        setTimeout(() => {
          this.boyStyle.top = place.position.top;
          this.boyStyle.transitionProperty = "top";
          this.boyStyle.transitionDuration = yTime + "ms";
          this.movePageVertical(yTime, place.position.top, boyPosition.top);
        }, Delay_Time);
      }, xTime + Delay_Time);
      //=======================================================================

      //动画结束 关闭上下走的定时器
      setTimeout(() => {
        runMusic.pause(); //关闭走路音效
        clearInterval(UpInterval);
        clearInterval(DownInterval);
        this.showPlaceDetail(place);
        this.showPrevent = false; //关闭防止小人运动时用户触摸的遮罩
      }, xTime + yTime + Delay_Time * 2);
    },

    //点击地点
    bindPlace(e) {
      clearInterval(this.initBoy);
      const boyPosition = this.getBoyPosition(); //小人位置
      this.boyMove(e, boyPosition);
    },

    //显示地点详情
    showPlaceDetail(e) {
      this.showPlace = e;
      this.showDetail = true;
    },
  },
};
</script>

<style lang="scss" scoped>
.map-line {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url("../assets/image/map-line.png");
  background-size: cover;
  background-repeat: no-repeat;
}

.red-packet {
  width: 80vw;
  // background-color: #fff;

  .img {
    width: 100%;
    display: block;
  }
}
.count-wrap {
  width: 300px;
  height: 400px;
  background-image: url("../assets/image/bg-count.png");
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  .img-num {
    width: 80px;
    position: absolute;
    top: 25px;
    right: 35px;
  }
}

.map-pup-wrap {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background-color: #fff2c6;
  position: relative;
  .map-pup-bg {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%) scale(0.01);
    width: 456vh;
    height: 190vh;
    background-image: url("~@/assets/image/map-4000-3.png");
    background-size: contain;
    background-position: center center;
    background-repeat: no-repeat;
    animation: scal 2s ease-in forwards;
  }
  @keyframes scal {
    0% {
      transform: translate(-50%, -50%) scale(0.01);
    }
    100% {
      transform: translate(-50%, -50%) scale(1);
    }
  }
}

/deep/.animate-bg-bg {
  background: url("../assets/image/bg-2.jpg") center center / cover no-repeat;
  // background: #45aff7;
}
.animate-bg {
  width: 200px;
  height: 200px;
  background-image: url("../assets/image/map-circle.png");
  background-size: cover;
  background-repeat: no-repeat;
}
.animate {
  animation: map-circle 3s ease-in forwards;
}
@keyframes map-circle {
  0% {
    transform: rotate(0);
    width: 200px;
    height: 200px;
    opacity: 1;
  }
  80% {
    opacity: 1;
  }
  100% {
    transform: rotate(-180deg);
    width: 600px;
    height: 600px;
    opacity: 0.2;
  }
}

.icon-music {
  position: fixed;
  top: 80px;
  left: 20px;
  z-index: 11;
}
.prevent-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 50;
}
//弹框
/deep/ .van-popup {
  background-color: rgba(0, 0, 0, 0);
}
.popup-wrap {
  width: 350px;
  height: 453px;
  background-image: url("~@/assets/image/bg-popup-2.jpg");
  background-size: contain;
  background-repeat: no-repeat;
}
.start-wrap {
  width: 100vw;
  height: 100vh;
  background-color: #c8290c;
  overflow: hidden;
  background-image: url("~@/assets/image/start.jpg");
  background-position: top center;
  background-size: contain;
  background-repeat: no-repeat;
  position: relative;
  .start-btn {
    position: absolute;
    top: 600px;
    left: 25%;
    width: 50%;
    line-height: 40px;
    background-color: #fff0bd;
    color: #333;
    font-size: 16px;
    font-weight: bold;
    letter-spacing: 2px;
    border: none;
    border-radius: 6px;
  }
}
.place-detail-wrap {
  padding: 50px 24px;
  .shop-item {
    background-color: #fff;
    text-align: center;
    .img {
      width: 80%;
    }
    .title {
      font-size: 16px;
      text-align: center;
    }
    .text {
      margin: 0;
      background-color: #fff;
      font-size: 12px;
      text-align: center;
      padding-bottom: 5px;
    }
    .copy-btn {
      margin: 0 auto;
      display: block;
      width: 80px;
      height: 34px;
      line-height: 34px;
      background-color: #ce6738;
      color: #fff;
      border: none;
      border-radius: 4px;
      font-size: 12px;
      text-align: center;
    }
  }
}
.icon-close {
  display: block;
  width: 50px;
  margin: 30px auto 0 auto;
}

//页面标题
.page-title {
  position: absolute;
  left: 2%;
  top: 10%;
  //2.58
  width: 500px;
  height: 193px;
  background-image: url("~@/assets/image/title.png");
  background-size: contain;
  background-repeat: no-repeat;
}
//地图说明
.map-intro {
  position: absolute;
  left: 40%;
  top: 70%;
  width: 300px;
  height: 300px;
  background-image: url("~@/assets/image/intro.png");
  background-size: contain;
  background-repeat: no-repeat;
}
// 飞行飞机
.fly-plane {
  position: absolute;
  top: 100px;
  left: 0;
  width: 50px;
  z-index: 50;
}
.fly {
  animation: flyAnimation 2s ease-in;
}
@keyframes flyAnimation {
  from {
    left: 0;
  }
  to {
    left: 100%;
  }
}
// 指南针
.icon-compass {
  position: fixed;
  top: 20px;
  left: 20px;
  width: 30px;
  z-index: 11;
  transform: rotate(30deg);
}

.map-page {
  background-color: #fff2c6;
  height: 100vh;
  overflow-x: scroll;
}

// 地图容器
.map-wrap {
  width: 456vh;
  height: 190vh;
  background-image: url("~@/assets/image/map-4000-3.png");
  background-size: contain;
  background-position: center center;
  background-repeat: no-repeat;
  position: relative;
  // top: 10%;
}

// 小人
.icon-boy {
  // width: 64px; /* no */
  // height: 64px; /* no */
  background-image: url("~@/assets/icon/man-7.png");
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition-timing-function: linear;
  z-index: 100;
}

.place {
  position: absolute;
  transform: translate(-50%, -50%);
  .place-icon {
    width: 25px;
    height: 37.3px;
    background-image: url("~@/assets/icon/location.png");
    background-size: contain;
    background-repeat: no-repeat;
  }
  .place-text {
    background-color: #ce6738;
    color: #fff;
    font-size: 12px;
    display: block;
    // background-color: rgba(0, 0, 0, 0);
    position: absolute;
    top: 90%;
    width: 90px;
    text-align: center;
    transform: scale(0.8);
    left: -30px;
    line-height: 1;
    font-weight: bold;
    padding: 2px;
    border-radius: 4px;
  }
}
</style>
