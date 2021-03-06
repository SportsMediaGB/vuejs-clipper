<template>
  <div class="clipper-fixed">
    <div
      class="wrap"
      :style="wrapStyle"
    >
      <canvas
        class="stem-outer"
        :width="stemArea.width"
        :height="stemArea.height"
      />
      <div class="img-center">
        <canvas class="stem-bg" />
        <div
          class="img-scale"
          :style="scaleStyle"
        >
          <div
            class="img-translate"
            :style="translateStyle"
          >
            <img
              :src="src"
              class="img"
              :style="bgStyle"
              @load="imgLoaded(); emit('load',$event)"
              @error="emit('error',$event)"
            >
          </div>
        </div>
      </div>
      <div class="cover">
        <div
          class="area"
          :style="areaStyle"
        >
          <canvas
            class="stem-area"
            :width="stemArea.width"
            :height="stemArea.height"
            :style="stemStyle"
          />
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
        </div>
      </div>
    </div>
    <canvas class="hidden-canvas" />
  </div>
</template>

<script>
import {
  fixedMethods,
  rxEventListeners,
  rxWheelListeners,
  pluginMethods
} from './extends/clippo'
import {
  map,
  filter,
  startWith,
  concatMap,
  merge,
  takeUntil
} from 'rxjs/operators'
import { Subject } from 'rxjs'
export default {
  extends: {
    methods: fixedMethods,
    mixins: [rxEventListeners, rxWheelListeners, pluginMethods]
  },
  subscriptions () {
    this.setWH$ = new Subject()
    this.setTL$ = new Subject()
    this.change$ = new Subject()
    /** basic */
    this.mousedownDrag$ = this.mousedown$.pipe(
      filter(this.isDragElement),
      map(this.prevent),
      map(this.dragDownPos),
      concatMap(
        () => this.mousemove$.pipe(map(this.prevent), takeUntil(this.mouseup$)),
        (down, move) => {
          return { down, move }
        }
      )
    )
    this.touchdownDrag$ = this.touchstart$.pipe(
      filter(this.isDragElement),
      map(this.prevent),
      filter(e => e.touches.length === 1),
      map(e => e.touches[0]),
      map(this.dragDownPos),
      concatMap(
        () =>
          this.touchmove$.pipe(
            takeUntil(this.touchend$),
            filter(e => e.touches.length === 1)
          ),
        (down, move) => {
          return { down, move: move.touches[0] }
        }
      )
    )
    this.wheelEvent$ = this.wheel$.pipe(
      filter(this.isDragElement),
      map(this.prevent),
      map(e => e.deltaY),
      map(deltaY => (deltaY >= 0 ? -1 : 1))
    )
    this.touchTwoFinger$ = this.touchstart$.pipe(
      filter(this.isDragElement),
      filter(e => e.touches.length === 2),
      map(this.prevent),
      map(this.towPointsTouches),
      map(this.setOrigin),
      concatMap(
        () =>
          this.touchmove$.pipe(
            takeUntil(this.touchend$),
            filter(e => e.touches.length === 2),
            map(this.towPointsTouches)
          ),
        ({ down, origin }, move) => {
          return { down, move, origin }
        }
      ),
      map(this.twoPointsDelta)
    )
    /** Zoom Subject */
    this.wheelZoom$ = new Subject().pipe(
      startWith(1),
      merge(this.wheelEvent$),
      map(this.calcWheelScaling)
    )
    this.touchZoom$ = new Subject().pipe(
      startWith(1),
      merge(this.touchTwoFinger$),
      map(this.calcTouchScaling)
    )
    this.zoomSubject$ = new Subject().pipe(
      merge(this.setWH$),
      merge(this.wheelZoom$),
      merge(this.touchZoom$)
    )
    /** Drag Subject */
    this.dragSubject$ = new Subject().pipe(
      startWith({ left: 0, top: 0 }),
      merge(this.setTL$),
      merge(
        this.mousedownDrag$.pipe(
          merge(this.touchdownDrag$),
          map(this.delta),
          map(this.toPercentage)
          // map(this.validateTL)
        )
      )
    )

    this.onChange$ = new Subject().pipe(
      merge(this.zoomSubject$),
      merge(this.dragSubject$),
      merge(this.change$)
    )

    return {
      bgWH$: this.zoomSubject$,
      bgTL$: this.dragSubject$
    }
  },
  props: {
    src: {
      type: String,
      default: ''
    },
    rotate: {
      type: Number,
      default: 0
    },
    ratio: {
      type: Number,
      default: 1
    },
    zoomRate: {
      type: Number,
      default: 0.04
    },
    minScale: {
      type: Number,
      default: 0.1
    },
    bgColor: {
      type: String,
      default: 'white'
    },
    border: {
      type: Number,
      default: 1
    },
    borderColor: {
      type: String,
      default: 'white'
    },
    grid: {
      type: Boolean,
      default: true
    },
    shadow: {
      type: String,
      default: 'rgba(0, 0, 0, 0.4)'
    },
    round: {
      type: Boolean,
      default: false
    },
    preview: {
      type: String,
      default: ''
    }
  },
  data: () => {
    return {
      imgRatio: NaN
    }
  },
  computed: {
    areaStyle: function () {
      const style = {
        color: this.shadow,
        borderWidth: this.border + 'px',
        borderColor: this.borderColor,
        boxShadow: '0 0 0 ' + this._shadow,
        borderRadius: (this.round) ? '50%' : ''
      }
      this.ratio >= 1 ? (style.width = '50%') : (style.height = '50%')
      return style
    },
    scaleStyle: function () {
      let width = this.bgWH$
      return {
        transform: `scale(${width})`
      }
    },
    translateStyle: function () {
      let left = this.bgTL$.left
      let top = this.bgTL$.top
      return {
        transform: `translate(${left}%,${top}%)`
      }
    },
    bgStyle: function () {
      this.change$.next(0)
      return {
        transform: `rotate(${this.rotate}deg)`
      }
    },
    wrapStyle: function () {
      return {
        backgroundColor: this.watchPreData.bgColor
      }
    },
    stemArea: function () {
      return {
        width: 10,
        height: 10 / this.ratio
      }
    },
    stemStyle: function () {
      const style = {}
      this.ratio >= 1 ? (style.width = '100%') : (style.height = '100%')
      return style
    },
    _shadow: function () {
      return (this.imgRatio >= 1 ? 100 : 100 / this.imgRatio) + 'vw'
    },
    watchPreData: function () { // use computed watch bgColor
      this.callPreview('setData', { bgColor: this.bgColor })
      return {
        bgColor: this.bgColor
      }
    }
  },
  watch: {
    ratio () {
      this.change$.next(0)
    }
  },
  mounted () {
    this.imgEl = this.$el.querySelector('.img')
    this.wrapEl = this.$el.querySelector('.wrap')
    this.areaEl = this.$el.querySelector('.area')
    this.scaleEl = this.$el.querySelector('.img-scale')
    this.translateEl = this.$el.querySelector('.img-translate')
    this.stemEl = this.$el.querySelector('.stem-bg')
    this.canvasEl = this.$el.querySelector('.hidden-canvas')
    this.$subscribeTo(
      this.onChange$,
      () => {
        this.$nextTick(() => {
          const result = this.getDrawPos().pos
          const rotate = this.rotate
          if (this.invalidDrawPos(result)) return
          this.callPreview('locateImage', result, rotate)
        })
      }
    )
  },
  methods: {
    imgLoaded: function () {
      this.resetData()
      this.imgRatio = this.imgEl.naturalWidth / this.imgEl.naturalHeight
      this.stemEl.width = this.imgEl.naturalWidth
      this.stemEl.height = this.imgEl.naturalHeight
      this.callPreview('setData', {
        src: this.src,
        bgColor: this.bgColor
      })
    },
    resetData: function () {
      this.setTL$.next({ left: 0, top: 0 })
      this.setWH$.next(1)
    }
  }
}
</script>
