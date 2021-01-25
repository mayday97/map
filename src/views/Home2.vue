<!--
 * @Author: xiaoyu
 * @Date: 2020-12-22 09:54:41
 * @LastEditTime: 2021-01-25 18:21:59
-->
<template>
  <div class="map-page" ref="scroll" id="scroll">
    <audio preload src="../assets/music/bgm01.mp3" loop style="display:none" ref="bgmusic"></audio>
    <audio preload src="../assets/music/airplane.mp3" style="display:none" ref="airmusic"></audio>
    <audio preload src="../assets/music/run.mp3" loop style="display:none" ref="runmusic"></audio>
    <audio preload src="../assets/music/dice1.mp3" loop style="display:none" ref="dicemusic"></audio>
    <audio preload src="../assets/music/close.mp3" style="display:none" ref="closemusic"></audio>
    <audio preload src="../assets/music/start-btn.mp3" style="display:none" ref="startbtnmusic"></audio>
    <!-- 普通弹框声音 -->
    <audio preload src="../assets/music/pup.mp3" style="display:none" ref="pupmusic"></audio>
    <!-- 最后领取红包声音 -->
    <audio preload src="../assets/music/puphb.mp3" style="display:none" ref="puphbmusic"></audio>

    <!-- 防触摸遮罩 -->
    <div class="prevent-wrap" v-show="showPrevent"></div>

    <!-- 筛子 -->
    <div class="dice-box" :style="diceStyle" @click="bindDice"></div>

    <!-- 音乐按钮 -->
    <img :style="{ width: music ? '40px' : '' }" class="icon-music" :src="music ? require('../assets/icon/music-yes.png') : require('../assets/icon/music-no.png')" alt="" @click="bgMusicChange" />

    <!-- 飞机 -->
    <img class="fly-plane" :class="fly && 'fly'" src="../assets/icon/plane.png" alt="" v-show="fly" @animationEnd="flyEnd" @webkitAnimationEnd="flyEnd" />

    <!-- 指南针 -->
    <img class="icon-compass" src="../assets/icon/compass.png" alt="" />

    <!-- 地图区域 -->
    <div class="map-wrap">
      <img src="../assets/icon/start.png" alt="" class="map-line-start" />
      <img src="../assets/icon/end.png" alt="" class="map-line-end" />
      <!-- 路线图 -->
      <div class="map-line"></div>
      <!-- 标题 -->
      <div class="page-title"></div>
      <!-- 地图说明 -->
      <div class="map-intro"></div>
      <!-- 小人 -->
      <div class="icon-boy" ref="boy" :style="boyStyle">
        <div class="head-text" v-show="showBoyHead">{{ boyHeadText }}</div>
      </div>
      <!-- 地点 -->
      <div class="place" v-for="item in placeList" :key="item.name" :style="{ top: item.position.top, left: item.position.left }">
        <div class="place-icon">
          <span class="place-text">{{ item.name }}</span>
        </div>
      </div>
      <!-- 线路上的盒子 -->
      <div class="box-point" v-for="item in boxList" :key="item.num" :style="{ top: item.position.top, left: item.position.left }">
        <!-- <div :style="{ width: '100%', height: '100%', background: item.shops ? '#333' : null }"></div> -->
      </div>
    </div>

    <!-- 领奖励弹框 -->
    <van-popup v-model="showReward">
      <img src="../assets/image/hb-bg.png" class="reward-wrap" />
    </van-popup>

    <!-- 详情弹框 -->
    <van-popup v-model="showDetail" :close-on-click-overlay="false">
      <div class="place-detail-wrap popup-wrap">
        <div class="shop-item " v-if="showPlace.shops">
          <h2 class="title">{{ showPlace.shops.intro }}</h2>
          <p class="text">{{ showPlace.name }}出品</p>
          <img :src="showPlace.shops.banner" alt="" class="img" />
        </div>
      </div>
      <img src="@/assets/icon/close-2.png" class="icon-close" alt="" @click="closeDetail" />
    </van-popup>

    <!-- 选人物弹框 -->
    <van-popup v-model="selectChildpup" :close-on-click-overlay="false">
      <div class="select-child">
        <div class="child" @click="selectChild('boy')"></div>
        <div class="child" @click="selectChild('girl')"></div>
      </div>
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
    <van-popup v-model="showStart" :close-on-click-overlay="false" style="width:100%;height:100%">
      <div class="start-wrap">
        <button class="start-btn" @click="handleStart">打开地图</button>
      </div>
    </van-popup>
  </div>
</template>

<script>
import Jquery from "jquery";
import mydata from "../../public/data.js";
const Unit_Time = 100; //单位时间
const Delay_Time = 200; //切换方向延迟（X轴，Y轴切换）
const Speed_Time = 200; // 走路速度

import { Popup, Swipe, SwipeItem } from "vant";
export default {
  name: "Home2",
  components: {
    [Popup.name]: Popup,
    [Swipe.name]: Swipe,
    [SwipeItem.name]: SwipeItem,
  },

  data() {
    return {
      showBoyHead: true,
      boyHeadText: "一张“萧山年货地图”带你配齐萧山地道年货！和我们一起走完全程，领取百元现金红包！",

      showReward: false, //领奖弹框

      stepCount: 0, //记录当前走到第几步
      diceStyle: {
        width: "150px",
        height: "100px",
        backgroundPosition: "0% 0%",
      },

      selectChildpup: true, //选人物弹框

      mappup: true,
      flag2: false,

      showAction: false, //动画
      flag: false,

      airInterval: null,
      music: true,
      fly: false,
      showPrevent: false, //小人开始移动时的放触摸遮罩
      showStart: true, //开始弹框
      showDetail: false, //详情弹框

      boyStyle: {
        width: "64px",
        height: "64px",
        top: "75.5%",
        left: "10.3%",
        backgroundPosition: "0% 0%",
        transitionDuration: "0ms",
        transitionProperty: "",
        backgroundImage: `url(${require("../assets/icon/man-7.png")})`,
      }, //小人属性
      placeList: [], //地点集合
      showPlace: {}, //要展示的地点信息

      boxList: [],

      detailPupCount: 0, //记录弹出多少个产品
    };
  },
  created() {
    this.resourceLoad();
    this.placeList = mydata.list;
    this.boxList = mydata.listLine;
  },
  mounted() {
    this.init();
  },
  methods: {
    //摇筛子
    bindDice() {
      this.showBoyHead = false;
      //到终点了
      if (this.stepCount >= this.boxList.length) {
        console.log("到终点了");
        this.showReward = true;
        return;
      }
      const diceMusic = this.$refs.dicemusic;
      diceMusic.play();

      this.showPrevent = true;
      // let num = parseInt(Math.random() * 6) + 1; //生成骰子随机数
      let num = 6;

      let temArr = this.boxList.slice(this.stepCount, this.stepCount + num); //本次走的盒子区间
      console.log("起始", temArr);

      let hasArr = temArr.filter((item) => {
        if (typeof item.shops == "object") {
          return item;
        }
      });
      if (hasArr.length != 0) {
        const randomNum = parseInt(Math.random() * hasArr.length);
        let hasitem = hasArr[randomNum];
        num = hasitem.num - this.stepCount;
        temArr = temArr.filter((item) => {
          if (item.num <= hasitem.num) {
            return item;
          }
        });
      }

      //骰子动画切换
      let tag = 1;
      const runInterval = setInterval(() => {
        if (tag == 1) {
          this.diceStyle.backgroundPosition = "0% 100%";
          tag++;
        } else if (tag == 2) {
          this.diceStyle.backgroundPosition = "50% 100%";
          tag++;
        } else if (tag == 3) {
          this.diceStyle.backgroundPosition = "100% 100%";
          tag = 1;
        }
      }, 100);

      setTimeout(() => {
        diceMusic.pause();
        clearInterval(runInterval);
        switch (num) {
          case 1:
            this.diceStyle.backgroundPosition = "0% 0%";
            break;
          case 2:
            this.diceStyle.backgroundPosition = "50% 0%";
            break;
          case 3:
            this.diceStyle.backgroundPosition = "100% 0%";
            break;
          case 4:
            this.diceStyle.backgroundPosition = "0% 50%";
            break;
          case 5:
            this.diceStyle.backgroundPosition = "50% 50%";
            break;
          case 6:
            this.diceStyle.backgroundPosition = "100% 50%";
            break;
          default:
            this.diceStyle.backgroundPosition = "0% 0%";
        }

        let arr2 = temArr.filter((item) => {
          return item.type === 1;
        });
        console.log("拐点", arr2);

        if (arr2.length == 0) {
          //没有拐点
          this.runStep([temArr[temArr.length - 1]], 1);
        } else {
          //有拐点
          if (temArr[temArr.length - 1] == arr2[arr2.length - 1]) {
            this.runStep(arr2, 1);
          } else {
            this.runStep([...arr2, temArr[temArr.length - 1]], 1);
          }
        }

        this.stepCount = this.stepCount + num;
        //
      }, 2000);
    },

    async runStep(arr, step) {
      console.log(arr, step, arr.length);

      const boyPosition = this.getBoyPosition(); //小人位置
      let res = await this.boyMove(arr[step - 1], boyPosition);
      if (res == "走完" && step < arr.length) {
        let c = step + 1;
        console.log("c", c);
        this.runStep(arr, c);
      } else {
        console.log("全程结束", arr[step - 1]);
        let target = arr[step - 1];
        if (target.shops) {
          const pupMusic = this.$refs.pupmusic;
          pupMusic.play();
          setTimeout(() => {
            this.showPlaceDetail(target);
          }, 400);
        }
        this.showPrevent = false;
        if (this.stepCount >= this.boxList.length) {
          console.log("到终点了");
          const bgMusic = this.$refs.bgmusic;
          bgMusic.pause();
          const puphbMusic = this.$refs.puphbmusic;
          puphbMusic.play();
          setTimeout(() => {
            this.showReward = true;
          }, 400);

          return;
        }
      }
    },

    //移动到盒子
    async bindPlace(e, count) {
      const boyPosition = this.getBoyPosition(); //小人位置
      let res = await this.boyMove(e, boyPosition);
      console.log(res, count);
      return count--;
    },

    //选择人物
    selectChild(e) {
      if (e == "boy") {
        this.boyStyle.backgroundImage = `url(${require("../assets/icon/man-8.png")})`;
      } else {
        this.boyStyle.backgroundImage = `url(${require("../assets/icon/man-7.png")})`;
      }
      this.selectChildpup = false;
    },

    //关闭详情弹框
    closeDetail() {
      const closeMusic = this.$refs.closemusic;
      closeMusic.play();
      setTimeout(() => {
        this.showDetail = false;
      }, 500);
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
      const startBtnMusic = this.$refs.startbtnmusic;
      const bgMusic = this.$refs.bgmusic;
      const airMusic = this.$refs.airmusic;
      const runMusic = this.$refs.runmusic;
      const diceMusic = this.$refs.dicemusic;
      const closeMusic = this.$refs.closemusic;
      const pupMusic = this.$refs.pupmusic;
      const puphbMusic = this.$refs.puphbmusic;
      startBtnMusic.play();
      setTimeout(() => {
        this.showStart = false;
        this.showAction = true;
        setTimeout(() => {
          this.flag = true;
        }, 500);
        bgMusic.play();
      }, 700);

      airMusic.play();
      airMusic.pause();
      runMusic.play();
      runMusic.pause();
      diceMusic.play();
      diceMusic.pause();
      closeMusic.play();
      closeMusic.pause();
      pupMusic.play();
      pupMusic.pause();
      puphbMusic.play();
      puphbMusic.pause();
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
      scrollElement.scrollLeft = (width - screenWidth) / 10;
      scrollElement.scrollTop = height - screenHeight;
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
      return new Promise((resolve, reject) => {
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
        //x轴移动
        if (xDiff > 0) {
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
        } else if (xDiff < 0) {
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
          if (yDiff > 0) {
            //向下
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
          } else if (yDiff < 0) {
            //向上
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
          resolve("走完");
          // this.showPlaceDetail(place);
        }, xTime + yTime + Delay_Time * 2);
      });
    },

    //显示地点详情
    showPlaceDetail(e) {
      this.showPlace = e;
      this.showDetail = true;
      this.detailPupCount = this.detailPupCount + 1;

      // 判断走到哪里 显示文字

      if (this.stepCount > 0 && this.stepCount < 27) {
        this.showBoyHead = false;
      } else if (this.stepCount >= 27 && this.stepCount < 37) {
        if (this.boyHeadText == "一张“萧山年货地图”带你配齐萧山地道年货！和我们一起走完全程，领取百元现金红包！") {
          this.boyHeadText = "真厉害，你已经走过半程，走完全程就可以领取现金红包啦！";
          this.showBoyHead = true;
        } else {
          this.showBoyHead = false;
        }
      } else if (this.stepCount > 60) {
        if (this.boyHeadText == "真厉害，你已经走过半程，走完全程就可以领取现金红包啦！") {
          this.boyHeadText = "再接再厉，马上就要到达终点啦！优惠券等你来领！";
          this.showBoyHead = true;
        } else {
          this.showBoyHead = false;
        }
      }
    },
  },
};
</script>

<style lang="scss" scoped>
.reward-wrap {
  width: 320px;
}
.map-line-start {
  position: absolute;
  top: 73.7%;
  left: 9.5%;
  width: 50px;
}
.map-line-end {
  position: absolute;
  top: 56%;
  left: 73.3%;
  width: 50px;
}
.prevent-wrap {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0);
  z-index: 1000;
}
.dice-box {
  position: fixed;
  left: 50%;
  bottom: 30px;
  transform: translateX(-50%);
  background-image: url("../assets/image/dice.png");
  z-index: 999;
}
.select-child {
  width: 260.8px;
  height: 327.2px;
  background-image: url("../assets/image/select-child.png");
  background-size: cover;
  background-repeat: no-repeat;

  display: flex;
  .child {
    width: 50%;
    height: 100%;
  }
}

.box-point {
  position: absolute;
  width: 5px;
  height: 5px;
}

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

//弹框
/deep/ .van-popup {
  background-color: rgba(0, 0, 0, 0);
}
.popup-wrap {
  // width: 350px;
  // height: 453px;
  // background-image: url("~@/assets/image/bg-popup-2.jpg");
  // background-size: contain;
  // background-repeat: no-repeat;
  width: 80vw;
  padding: 10px 16px;
  background-color: #fff;
  border-radius: 12px;
}
.start-wrap {
  width: 100%;
  height: 100%;
  background-color: #c8290c;
  overflow: hidden;
  background-image: url("~@/assets/image/start.jpg");
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
  position: relative;
  .start-btn {
    position: absolute;
    top: 90%;
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
  .shop-item {
    background-color: #fff;
    position: relative;
    .img {
      width: 88%;
      display: block;
      margin: 0 auto;
    }
    .title {
      font-size: 14px;
      padding: 0 30px;
      position: relative;
      &::before {
        position: absolute;
        top: 0;
        left: 0;
        content: "";
        display: inline-block;
        width: 30px;
        height: 30px;
        background-image: url("../assets/icon/yh-left.png");
        background-size: cover;
        background-repeat: no-repeat;
      }
    }
    .text {
      margin: 0;
      background-color: #fff;
      font-size: 12px;
      position: relative;
      padding-left: 30px;
      &::after {
        position: absolute;
        bottom: 0;
        right: 0;
        content: "";
        display: inline-block;
        width: 30px;
        height: 30px;
        background-image: url("../assets/icon/yh-right.png");
        background-size: cover;
        background-repeat: no-repeat;
      }
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
  //   background-image: url("~@/assets/icon/man-7.png");
  background-repeat: no-repeat;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition-timing-function: linear;
  z-index: 100;
  .head-text {
    position: absolute;
    top: -100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #f88e48;
    color: #fff;
    font-size: 12px;
    width: 170px;
    min-height: 50px;
    padding: 5px;
    border-radius: 6px;
  }
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
