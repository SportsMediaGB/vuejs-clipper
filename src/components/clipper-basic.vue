<template>
  <div class="clipper-basic">
    <canvas class="hidden-canvas" />
    <div
      class="clip-area"
      :style="areaStyle"
    >
      <div
        class="img-scale"
        :style="scaleStyle"
      >
        <img
          :src="src"
          class="img"
          :style="rotateStyle"
          @load="imgLoaded();emit('load',$event)"
          @error="emit('error',$event)"
        >
      </div>
      <div
        class="zoom-area shadow"
        :style="posObj"
      >
        <div
          class="extend outer"
          :style="exOuterStyle"
        />
        <div
          class="extend inner"
          :style="exInnerStyle"
        >
          <div class="drag-inset" />
        </div>
        <div v-if="corner">
          <div
            v-for="index in 4"
            :key="'corner'+index"
            class="corner"
            :class="`corner${index}`"
          />
        </div>
        <div
          v-if="grid"
          class="grid"
        >
          <div
            v-for="index in 4"
            :key="'gridItem'+index"
            class="grid-item"
          />
        </div>
        <slot name="area" />
      </div>
    </div>
    <div
      class="placeholder"
      :style="eptStyle"
    >
      <slot name="placeholder" />
    </div>
  </div>
</template>
<script>
import { basicMethods, rxEventListeners, pluginMethods } from './extends/clippo'
import { Subject } from 'rxjs'
import {
  map,
  filter,
  takeUntil,
  concatMap,
  startWith,
  merge
} from 'rxjs/operators'
export default {
  extends: {
    methods: basicMethods,
    mixins: [ rxEventListeners, pluginMethods ]// mousedown$,mousemove$...
  },
  subscriptions () {
    this.change$ = new Subject()
    // set value
    this.setWH$ = new Subject()
    this.setTL$ = new Subject()
    this.initWHTL$ = new Subject().pipe(map(this.$set_initWHTL))
    // interupter
    this.stop$ = new Subject()
    /* events */
    this.mousedownDrag$ = new Subject().pipe(// moving left, top
      merge(this.mousedown$),
      filter(this.isDragElement),
      map(e => {
        e.preventDefault()
        return e
      }), // deal with down, we want to calc down just for once.
      map(e => this.eInZoom(e)), // 點擊時zoom的position,rect
      concatMap(// 將down (zoom rect), move交給後續
        () => this.mousemove$.pipe(takeUntil(this.mouseup$)),
        (down, move) => {
          return { down, move }
        }
      )
    )
    this.touchdownDrag$ = this.touchstart$.pipe(
      filter(this.isDragElement),
      filter(e => e.touches.length === 1), // 單指
      map(e => {
        e.preventDefault()
        return e
      }), // deal with down, we want to calc down just for once.
      map(e => this.eInZoom(e.touches[0])),
      concatMap(
        () =>
          this.touchmove$.pipe(
            takeUntil(this.touchend$),
            filter(e => e.touches.length === 1), // 單指
            map(e => e.touches[0])
          ),
        (down, move) => {
          return { down, move }
        }
      )
    )
    this.mousedownZoom$ = new Subject().pipe(
      merge(this.mousedown$),
      filter(this.isZoomElement),
      map(e => {
        e.preventDefault()
        return e
      }),
      map(this.setDownPosition),
      concatMap(
        () => this.mousemove$.pipe(takeUntil(this.mouseup$)),
        (down, move) => {
          return { down, move }
        }
      )
    )
    this.touchdownZoom$ = this.touchstart$.pipe(
      filter(this.isZoomElement),
      filter(e => e.touches.length === 1),
      map(e => {
        e.preventDefault()
        return e.touches[0]
      }),
      map(this.setDownPosition),
      concatMap(
        () =>
          this.touchmove$.pipe(
            takeUntil(this.touchend$),
            filter(e => e.touches.length === 1),
            map(e => e.touches[0])
          ),
        (down, move) => {
          return { down, move }
        }
      )
    )
    this.touchTwoFingersZoom$ = this.touchstart$.pipe(
      filter(e => {
        return e.touches.length === 2
      }),
      filter(this.isTwoPointZoomElement),
      map(this.prevent),
      map(() => {
        this.stop$.next(0) // stop drag create event
        const freezeZoom = this.zoomPos() // get zoom position at down
        return { event, zoom: freezeZoom }
      }),
      concatMap(
        () =>
          this.touchmove$.pipe(
            filter(e => e.touches.length === 2),
            map(this.prevent),
            takeUntil(this.touchend$)
          ),
        (down, move) => {
          return this.getTwoTouchesPos(down.event, move, down.zoom)
        }
      )
    )
    this.mousedownCreate$ = this.mousedown$.pipe(
      filter(this.isCreateElement),
      map(this.prevent),
      map(this.getFakeDown),
      concatMap(
        () => this.mousemove$.pipe(takeUntil(this.mouseup$)),
        (down, move) => {
          return { down, move }
        }
      )
    )
    this.touchstartCreate$ = this.touchstart$.pipe(
      filter(this.isCreateElement),
      map(this.prevent),
      map(e => e.touches[0]),
      map(this.getFakeDown),
      concatMap(
        () =>
          this.touchmove$.pipe(
            takeUntil(this.touchend$),
            takeUntil(this.stop$), // 兩指事件觸發時停止
            filter(e => e.touches.length === 1), // 單指
            filter(() => this.touchCreate)
          ),
        (down, move) => {
          // down is fake
          return { down, move: move.touches[0] }
        }
      )
    )
    /** *************MAIN SUBJECT (1)************
     position: left, top, right, bottom (2 of 4) */
    this.dragSubject$ = new Subject().pipe(
      merge(this.mousedownDrag$),
      merge(this.touchdownDrag$),
      map(this.dragMoving) /* @down: eInZoom. @move: mouse/touch move event */,
      map(this.repositionDrag), // validate & reposition @down
      merge(this.setTL$), // this must be validate pos!!!! (in range)
      startWith({ left: 0, top: 0 }) // vm view not init yet (this.zoomEl===null). To prevent "cannot read 'left' of undefined"
    )
    /** *************MAIN SUBJECT (3)************
    Subject 3, 起始event不同，處理後傳給zoomSubject$
    直接subscribe()
    */
    this.dragCreateSubject$ = this.mousedownCreate$
      .pipe(
        merge(this.touchstartCreate$),
        map(({ down, move }) => {
          return { down, move }
        })
      )
      // .subscribe(); //直接subscribe

    /** *************MAIN SUBJECT (2)************
     width, height */
    this.zoomSubject$ = new Subject().pipe(
      merge(this.mousedownZoom$), // mouse event
      merge(this.touchdownZoom$), // touch event 1 finger
      merge(this.dragCreateSubject$), // dragCreateSubject$
      map(this.reverseDownPos),
      map(({ down, move }) => {
        const fakeDown = this.getCreatePos(down, move) // 根據down, move,創造一個zoom rect (不限於一開始狀態))
        return this.zoomingPosition(fakeDown, move) // 用創造的zoom rect去計算拖拉後的位置
      }),
      merge(
        this.touchTwoFingersZoom$
      ) /* touch event 2 fingers(兩指縮放)*  和上面事件分開，算法不同 */,
      map(this.splitPos),
      map(pos => {
        // set position
        this.setTL$.next(this.toPercentage(pos.tl))
        return pos.wh
      }),
      map(this.$set_ratioWH),
      map(this.toPercentage),
      startWith({ width: 0, height: 0 }),
      merge(this.initWHTL$),
      merge(this.setWH$),
      map(wh => this.$set_minWH(wh)) // width,height -> 1%
    )
    this.onChange$ = new Subject().pipe(
      merge(this.dragSubject$),
      merge(this.change$)
    )
    return {
      // subscriptions
      zoomTL$: this.dragSubject$,
      zoomWH$: this.zoomSubject$
    }
  },
  props: {
    preview: {
      type: String,
      default: ''
    },
    src: {
      type: String,
      default: ''
    },
    border: {
      type: Number,
      default: 1
    },
    outline: {
      type: Number,
      default: 6
    },
    corner: {
      type: Boolean,
      default: true
    },
    grid: {
      type: Boolean,
      default: true
    },
    mode: {
      type: String,
      default: 'normal'
    },
    ratio: {
      type: Number,
      default: NaN
    },
    touchCreate: {
      // enable/disable create new zoom area in touch device;
      type: Boolean,
      default: true
    },
    rotate: {
      type: Number,
      default: 0
    },
    bgColor: {
      type: String,
      default: 'white'
    },
    shadow: {
      type: String,
      default: 'rgba(0, 0, 0, 0.4)'
    },
    scale: {
      type: Number,
      default: 1
    }
  },
  data: () => {
    return {
      imgRatio: NaN
    }
  },
  computed: {
    posObj: function () {
      let style = {
        borderWidth: this.border + 'px',
        width: this.zoomWH$.width + '%',
        height: this.zoomWH$.height + '%',
        color: this.shadow,
        boxShadow: '0 0 0 ' + this._shadow
      }
      for (let k in this.zoomTL$) {
        if (typeof this.zoomTL$[k] === 'number') { style[k] = this.zoomTL$[k] + '%' }
      }
      return style
    },
    scaleStyle: function () {
      this.change$.next(0)
      return {
        transform: `scale(${this.scale})`
      }
    },
    rotateStyle: function () {
      this.change$.next(0)
      return {
        transform: `rotate(${this.rotate}deg)`
      }
    },
    areaStyle: function () {
      const _border = this.border + 'px'
      const display = (this.src) ? 'block' : 'none'
      const backgroundColor = this.watchPreData.bgColor
      return { padding: _border, display, backgroundColor }
    },
    eptStyle: function () {
      const display = (this.src) ? 'none' : 'block'
      return { display }
    },
    exOuterStyle: function () {
      const _outline = this.outline + this.border + 'px'
      return {
        borderWidth: _outline,
        transform: `translate(-${_outline},-${_outline})`
      }
    },
    exInnerStyle: function () {
      const _inline = this.outline + 'px'
      return { padding: _inline }
    },
    _shadow: function () {
      return (this.imgRatio >= 1 ? 100 : (100 / this.imgRatio)) + 'vw'
    },
    watchPreData: function () {
      this.callPreview('setData', { bgColor: this.bgColor })
      return {
        bgColor: this.bgColor
      }
    }
  },
  watch: {
    ratio () {
      this.initWHTL$.next(0)
    }
  },
  mounted () {
    this.imgEl = this.$el.querySelector('.clipper-basic .img')
    this.canvasEl = this.$el.querySelector('.clipper-basic .hidden-canvas')
    this.areaEl = this.$el.querySelector('.clipper-basic .clip-area')
    this.zoomEl = this.$el.querySelector('.clipper-basic .zoom-area')
    this.scaleEl = this.$el.querySelector('.img-scale')
    if (this.preview) {
      this.$subscribeTo(this.onChange$, () => {
        this.$nextTick(() => {
          // wait for vue render dom.
          const result = this.getDrawPos().pos
          const rotate = this.rotate
          if (this.invalidDrawPos(result)) return
          this.callPreview('locateImage', result, rotate)
        })
      })
    }
  },
  methods: {
    imgLoaded: function () {
      // reset
      this.callPreview('setData', {
        src: this.src,
        bgColor: this.bgColor
      })
      this.imgRatio = this.imgEl.naturalWidth / this.imgEl.naturalHeight
      this.initWHTL$.next(true)
    }
  }
}
</script>
