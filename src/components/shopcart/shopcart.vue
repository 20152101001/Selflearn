<template>
  <div class="shopcart">
    <div class="content">
      <div class="content-left">
        <div class="logo-wrapper"  @click="toggleList">
          <div class="logo" :class="{ highlight: totalCount > 0 }">
            <span class="icon-shopping_cart"></span>
          </div>
          <div class="num" v-show="totalCount > 0">
            {{ totalCount }}
          </div>
        </div>
        <div class="price" :class="{ highlight: totalPrice > 0 }">
          {{ totalPrice }}元
        </div>
        <div class="decs">另需配送费{{ deliveryPrice }}元</div>
      </div>
      <div class="content-right">
        <div class="pay" :class="payClass">
          {{ payDesc }}
        </div>
      </div>
      <div class="ball-container">
        <div v-for="ball in balls" :key="ball.id">
          <transition
            name="drop"
            @before-enter="beforeEnter"
            @enter="enter"
            @after-enter="afterEnter"
          >
            <div v-show="ball.show" class="ball">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="fold">
      <div class="shopcart-list" v-show="listShow">
        <div class="list-header">
          <h1 class="title">购物车</h1>
          <span class="empty">清空</span>
        </div>
        <div class="list-content" ref="listContent">
          <ul>
            <li class="food" v-for="food in selectFoods" :key="food.id">
              <span class="name">{{ food.name }}</span>
              <div class="price">
                <span>￥{{ food.price * food.count }}</span>
              </div>
              <div class="cartcontrol-wrapper">
                <cartcontrol :food="food"></cartcontrol>
              </div>
            </li>
          </ul>
        </div>
      </div>
      </transition>
    </div>
  </div>
</template>

<script type="text/ecmascript-6">
import cartcontrol from '../cartcontrol/cartcontrol.vue';
import BScroll from 'better-scroll';
export default
{
  props: {
    selectFoods: {
      type: Array,
      default () {
        return [
        ];
      }

    },
    deliveryPrice: {
      type: Number,
      default: 0
    },
    minPrice: {
      type: Number,
      default: 0
    }
  },
  components: {
    cartcontrol
  },
  data () {
    return {
      balls: [
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        },
        {
          show: false
        }
      ],
      dropBalls: [],
      fold: true
    };
  },
  computed: {
    totalPrice () {
      let total = 0;
      this.selectFoods.forEach((food) => {
        total += food.price * food.count;
      });
      return total;
    },
    totalCount () {
      let total = 0;
      this.selectFoods.forEach((food) => {
        total += food.count;
      });
      return total;
    },
    payDesc () {
      if (this.totalPrice === 0) {
        return `￥${this.minPrice}元起送`;
      } else if (this.totalPrice < this.minPrice) {
        let diff = this.minPrice - this.totalPrice;
        return `还差￥${diff}元起送`;
      } else {
        return '去结算';
      }
    },
    payClass () {
      if (this.totalPrice < this.minPrice) {
        return 'not-enough';
      } else {
        return 'enough';
      }
    },
    listShow () {
      if (!this.totalCount) {
        // eslint-disable-next-line vue/no-side-effects-in-computed-properties
        this.fold = true;
        return false;
      }
      console.log(this.fold);
      let show = !this.fold;
      if (show) {
        this.$nextTick(() => {
          if (!this.scroll) {
            // eslint-disable-next-line vue/no-side-effects-in-computed-properties
            this.scroll = new BScroll(this.$refs.listContent, {
              click: true
            });
          } else {
            this.scroll.refresh();
          }
        });
      }
      return show;
    }
  },
  methods: {
    drop (el) {
      for (let i = 0; i < this.balls.length; i++) {
        let ball = this.balls[i];
        if (!ball.show) {
          ball.show = true;
          ball.el = el;
          this.dropBalls.push(ball);
          return;
        }
      }
    },
    beforeEnter (el) {
      let count = this.balls.length;
      while (count--) {
        let ball = this.balls[count];
        if (ball.show) {
          // drop() 里 给 ball添加的el属性（存放点击的加号的DOM）
          // getBoundingClientRect() 浏览器接口，获取【加号】相对于视窗的距离
          let rect = ball.el.getBoundingClientRect();
          // 购物车与加号的水平距离 = 购物车横坐标 - 小球.ball的left大小
          let x = rect.left - 32;
          // y 是负数
          // 购物车与加号的垂直距离 = -(窗口高度 - 购物纵坐标 - 小球.ball的bottom大小)
          let y = -(window.innerHeight - rect.top - 22);
          // 先不显示
          el.style.display = '';
          // 外面纵向偏移，内部横向偏移，最终达到整体抛物线的动画
          // 外面的DOM做纵向动画
          // 注意：字符串拼接，有变量的时候不用单引号，用`
          el.style.webkitTransform = `translate3d(0,${y}px,0)`;
          el.style.transform = `translate3d(0,${y}px,0)`;
          // 内部的DOM做横向动画
          let inner = el.getElementsByClassName('inner-hook')[0];
          inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
          inner.style.transform = `translate3d(${x}px,0,0)`;
        }
      }
    },
    enter (el, done) {
      // el.offsetHeight 触发浏览器重绘(当获取一些属性时，浏览器为取得 正确的值会触发重绘重排，如offsetTop、offsetLeft、 offsetWidth、offsetHeight、scrollTop、scrollLeft、scrollWidth、scrollHeight、 clientTop、clientLeft、clientWidth、clientHeight、getComputedStyle() (currentStyle in IE))
      // 触发重绘，下面
      // 但是变量rf不用，所以加个eslint的注释不做变量是否使用的检查
      /* eslint-disable no-unused-vars */
      let rf = el.offsetHeight;
      // 重置属性
      this.$nextTick(() => {
        el.style.webkitTransform = 'translate3d(0,0,0)';
        el.style.transform = 'translate3d(0,0,0)';
        let inner = el.getElementsByClassName('inner-hook')[0];
        inner.style.webkitTransform = 'translate3d(0,0,0)';
        inner.style.transform = 'translate3d(0,0,0)';
        el.addEventListener('transitionend', done);
      });
    },
    afterEnter (el) {
      // 把dropBalls的这个元素删除
      let ball = this.dropBalls.shift();
      // 重置小球属性
      if (ball) {
        ball.show = false;
        el.style.display = 'none';
      }
    },
    toggleList () {
      if (!this.totalCount) {
        return;
      }
      this.fold = !this.fold;
    }
  }
};
</script>

<style lang="stylus" rel="stylesheet/stylus">
@import "../../common/stylus/mixin.styl"
.shopcart
    position fixed
    left 0
    bottom 0
    z-index 50
    width 100%
    height 48px
    .content
        display flex
        background #141d27
        font-size 0
        .content-left
            flex 1
            .logo-wrapper
                display inline-block
                position relative
                top -10px
                margin 0 12px
                padding 6px
                width 56px
                height 56px
                box-sizing border-box
                border-radius 50%
                background #141d27
                .logo
                    width 100%
                    height 100%
                    border-radius 50%
                    text-align center
                    background #2b343c
                    &.highlight
                        background #ffff00
                    .icon-shopping_cart
                        inline-height 44px
                        font-size 24px
                        color #80858a
                        &.highlight
                            color #fff
                .num
                    position absolute
                    top 0
                    right 0
                    width 24px
                    height 16px
                    line-height 16px
                    text-align center
                    border-radius 16px
                    font-size 9px
                    font-weight 700
                    color #fff
                    background rgb(240,20,20)
                    box-shadow 0 4px 8px 0 rgba(0,0,0,0.4)
            .price
                display inline-block
                vertical-align top
                margin-top 12px
                line-height 24px
                padding-right 12px
                box-sizing border-box
                border-right 1px solid rgba(255,255,255,0.1)
                font-size 16px
                font-weight 700
                color rgba(255,255,255,0.4)
                &.highlight
                    color #fff
            .decs
                display inline-block
                vertical-align top
                margin 12px 0 0 12px
                line-height 24px
                color rgba(255,255,255,0.4)
                font-size 10px
        .content-right
            flex 0 0 105px
            width 105px
            .pay
                height 48px
                line-height 48px
                text-align center
                font-size 12px
                color rgba(255,255,255,0.4)
                font-weight 700
                &.not-enough
                    background: #2b333b
                &.enough
                    background: #00b43c
                    color: #fff
        .ball-container
          .ball
            position: fixed
            left: 32px
            bottom: 22px
            z-index: 200
            // 配合js写的小球下落的transition，这里定义了完成时间、弧度用贝塞尔曲线速度，来使效果出现抛物线效果
            transition: all 0.4s cubic-bezier(0.49, -0.29, 0.75, 0.41)
            .inner
              width: 16px
              height: 16px
              border-radius: 50%
              background: rgb(0, 160, 220)
              // 配合js写的小球下落的transition
              transition: all 0.4s linear
        .shopcart-list
          position: absolute
          left: 0
          top: 0
          width: 100%
          z-index: -1
          transform: translate3d(0, -100%, 0);
          &.fold-enter-active,&.fold-leave-active
            transition: all 0.5s linear;
            transform: translate3d(0, -100%, 0);
          &.fold-enter,&.fold-leave-active
            transform: translate3d(0, 0, 0);
          .list-header
            height: 40px
            line-height: 40px
            padding: 0 18px
            background: #f3f5f7
            border-bottom: 1px solid rgba(7, 17, 27, 0.1)
            .title
              float: left
              font-size: 14px
              color: rgb(7, 17, 27)
            .empty
              float: right
              font-size: 12px
              color: rgb(0, 160, 220)
          .list-content
            padding: 0 18px
            max-height: 217px
            overflow: hidden
            background: #fff
            .food
              position: relative
              padding: 12px 0
              box-sizing border-box
              border-1px(rgba(7, 17, 27, 0.1))
              .name
                line-height: 24px
                font-size: 14px
                color: rgb(7, 17, 27)
              .price
                position: absolute
                right: 90px
                bottom: 12px
                line-height: 24px
                font-size: 14px
                font-weight: 700
                color: rgb(240, 20, 20)
              .cartcontrol-wrapper
                position: absolute
                right: 0
                bottom: 6px
</style>
