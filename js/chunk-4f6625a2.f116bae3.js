(window["webpackJsonp"]=window["webpackJsonp"]||[]).push([["chunk-4f6625a2"],{"09b5":function(e,i,t){"use strict";t.d(i,"a",function(){return a}),t.d(i,"c",function(){return n}),t.d(i,"b",function(){return s});var a={initapp:{}};a.initapp.html='<div id="app">\n  <clipper-basic class="my-clipper" src="example.jpg"></clipper-basic>\n</div>',a.initapp.js="new Vue({\n  el: '#app'\n})",a.initapp.css=".my-clipper {\n  width: 100%;\n  max-width: 700px;\n}",a.upload={},a.upload.html='<div id="app">\n  <input type="file" @change="upload($event)">\n  <clipper-basic class="my-clipper" :src="imgURL">\n    <div class="placeholder" slot="placeholder">No image</div>\n  </clipper-basic>\n</div>',a.upload.js="new Vue({\n  el: '#app',\n  data: {\n    imgURL: ''\n  },\n  methods: {\n    upload: function(e){\n      if (e.target.files.length !== 0) {\n        if(this.imgURL) URL.revokeObjectURL(this.imgURL)\n        this.imgURL = window.URL.createObjectURL(e.target.files[0]);\n      }\n    }\n  }\n})",a.upload.css=".placeholder {\n  text-align: center;\n  padding: 20px;\n  background-color: lightgray;\n}",a.upload2={},a.upload2.html='<div id="app">\n  <clipper-upload v-model="imgURL">upload image</clipper-upload>\n  <clipper-basic class="my-clipper" :src="imgURL">\n    <div class="placeholder" slot="placeholder">No image</div>\n  </clipper-basic>\n</div>',a.upload2.js="new Vue({\n    el: '#app',\n    data: {\n      imgURL: ''\n    }\n})",a.result={},a.result.html='<button @click="getResult">clip image</button>\n<clipper-basic class="my-clipper" ref="clipper" :src="imgURL">\n    <div class="placeholder" slot="placeholder">No image</div>\n</clipper-basic>\n<div>\n    <div>result:</div>\n    <img class="result" :src="resultURL" alt="">\n</div>',a.result.js1="data: {\n  imgURL: '',\n  resultURL: ''\n}",a.result.js='getResult: function () {\n  const canvas = this.$refs.clipper.clip();//call component\'s clip method\n  this.resultURL = canvas.toDataURL("image/jpg", 1);//canvas->image\n}',a.preview={},a.preview.html='<clipper-basic \n  class="my-clipper" \n  ref="clipper" \n  :src="imgURL" \n  preview="my-preview" >\n  <div class="placeholder" slot="placeholder">No image</div>\n</clipper-basic>\n<div>\n  <div>preview:</div>\n  <clipper-preview name="my-preview" class="my-clipper">\n    <div class="placeholder" slot="placeholder">preview area</div>\n  </clipper-preview>\n</div>',a.full='<meta charset="utf-8">\n<title>vuejs-clipper demo</title>\n<script src="https://cdn.jsdelivr.net/npm/vue@2.5.17/dist/vue.js"><\/script>\n<script src="./vuejs-clipper.umd.js"><\/script>\n<link rel="stylesheet" href="./vuejs-clipper.css">\n<div id="app">\n    <button>\n      <clipper-upload v-model="imgURL">upload image</clipper-upload>\n    </button>\n    <button @click="getResult">clip image</button>\n    <clipper-basic class="my-clipper" ref="clipper" :src="imgURL" preview="my-preview">\n        <div class="placeholder" slot="placeholder">No image</div>\n    </clipper-basic>\n    <div>\n        <div>preview:</div>\n        <clipper-preview name="my-preview" class="my-clipper">\n            <div class="placeholder" slot="placeholder">preview area</div>\n        </clipper-preview>\n    </div>\n    <div>\n        <div>result:</div>\n        <img class="result" :src="resultURL" alt="">\n    </div>\n</div>\n<script>\n    new Vue({\n        el: \'#app\',\n        data: {\n            imgURL: \'\',\n            resultURL: \'\'\n        },\n        methods: {\n            getResult: function () {\n                const canvas = this.$refs.clipper.clip();//call component\'s clip method\n                this.resultURL = canvas.toDataURL("image/jpg", 1);//canvas->image\n            }\n        }\n    })\n<\/script>\n<style>\n    .my-clipper {\n        width: 100%;\n        max-width: 700px;\n    }\n\n    .placeholder {\n        text-align: center;\n        padding: 20px;\n        background-color: lightgray;\n    }\n</style>';var n={html:'<clipper-basicref="clipper" \n  ref="clipper"\n  @load="imgLoad" \n  :style="basicStyle" \n  src="long.jpg">\n</clipper-basic>',js:"data: () => {\n  return {\n      maxWidth: 700,\n      maxHeight: 500,\n      based: 850\n  };\n},\nmethods: {\n  imgLoad: function() {\n      const imgRatio = this.$refs.clipper.imgRatio;\n      if(imgRatio < 1) this.based =  this.maxHeight*imgRatio;\n      else this.based = this.maxWidth;\n  },\n},\ncomputed: {\n  basicStyle : function() {\n      return {\n          maxWidth: this.based + 'px'\n      }\n  }\n}"},s={const:"const canvas = this.$refs.clipper.clip();",durl:'const jpgURL = canvas.toDataURL("image/jpeg")//to jpg\nconst pngURL = canvas.toDataURL("image/png", 1)//to png',blob:"canvas.toBlob(function(blob) {\n  //...\n});",url:"const vm = this;\nconst canvas = this.$refs.clipper.clip();\ncanvas.toBlob(function(blob){\n    if(vm.resultURL)\n      URL.revokeObjectURL(vm.resultURL)\n    vm.resultURL = URL.createObjectURL(blob)\n})",urles6:"this.$refs.clipper.clip().toBlob(blob=>{\n  if(this.resultURL) URL.revokeObjectURL(this.resultURL)\n  this.resultURL = URL.createObjectURL(blob)\n})",reader:"const vm = this;\nconst canvas = this.$refs.clipper.clip();\ncanvas.toBlob(function(blob){\n    const reader = new FileReader()\n    reader.addEventListener('load' ,function(){\n        vm.resultURL = this.result;\n    })\n    reader.readAsDataURL(blob);\n})"}},"0f89":function(e,i,t){},"2ae4":function(e,i,t){"use strict";t.r(i);var a=function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("div",{staticClass:"list-content content"},[t("div",{staticClass:"area"},[t("h2",[e._v("Verticle images")]),e._m(0),t("p",[e._v("Clipper-basic will set it’s layout ratio same as image.")]),t("p",[e._v("Clipper-fixed will set it’s layout ratio same as its “ratio” attribute.")]),e._m(1),e._m(2),e._m(3),t("h3",[e._v("upload image")]),t("img",{staticClass:"pic",attrs:{src:"long.jpg"}}),t("h3",[e._v("Clipper-fixed")]),t("p",[e._v("Clipper-fixed will set it’s layout ratio same as its “ratio” attribute (default 1).")]),t("clipper-fixed",{staticClass:"sample",attrs:{src:"long.jpg"}}),t("h3",[e._v("Clipper-basic")]),t("p",[e._v("Clipper-basic will set it’s layout ratio same as image.")]),t("p",[e._v("It becomes too long.")]),t("clipper-basic",{staticClass:"sample",attrs:{src:"long.jpg"}}),t("p",[e._v("To avoid this, just use clipper-fixed instead, or you need to do some extra work.")])],1),t("div",{staticClass:"area"},[t("h2",[e._v("Clipper-basic based on height")]),t("h3",[e._v("implement load event")]),e._m(4),t("pre",{directives:[{name:"highlightjs",rawName:"v-highlightjs",value:e.code.html,expression:"code.html"}]},[t("code",{staticClass:"html"})]),t("p",[e._v("then you can implement the load event, if it's a verticle image, calc max-width based on your maxHeight, otherwise use maxWidth directly.")]),t("pre",{directives:[{name:"highlightjs",rawName:"v-highlightjs",value:e.code.js,expression:"code.js"}]},[t("code",{staticClass:"javascript"})]),t("clipper-upload",{staticClass:"btn",model:{value:e.src,callback:function(i){e.src=i},expression:"src"}},[e._v("upload image")]),t("clipper-basic",{ref:"clipper",style:e.basicStyle,attrs:{src:e.src},on:{load:e.imgLoad}},[t("div",{attrs:{slot:"placeholder"},slot:"placeholder"},[e._v("No image")])])],1)])},n=[function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("p",[e._v("Clipper-basic, which acts like a "),t("i",[e._v("img")]),e._v(" element, will automatically set its height "),t("b",[e._v("based on width")]),e._v(". ")])},function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("p",[e._v("For example you set both clipper-basic and clipper-fixed to have max-width 500 pixels, \n        upload a image which width and height are "),t("u",[e._v("4:3")]),e._v(", then clipper-basic will be "),t("u",[e._v("500 x 375")]),e._v(".")])},function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("p",[e._v("Assume clipper-fixed has attribute ratio set to 1, then clipper-fixed will be "),t("u",[e._v("500 x 500")]),e._v(".")])},function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("p",[e._v("This might not be an good idea for clipper-basic when uploading a verticle image, if you upload an image which is 1:2, \n        clipper-basic will become "),t("u",[e._v("500 x 1000")]),e._v(" that might ruin the layout of the page.\n        ")])},function(){var e=this,i=e.$createElement,t=e._self._c||i;return t("p",[e._v("First add a "),t("i",[e._v("v-on")]),e._v(" to clipper-basic's load event, and binding style to a style object.")])}],s=(t("cadf"),t("551c"),t("097d"),t("09b5")),l={data:function(){return{code:s["c"],src:"long.jpg",maxWidth:700,maxHeight:500,based:850}},methods:{imgLoad:function(){var e=this.$refs.clipper.imgRatio;this.based=e<1?this.maxHeight*e:this.maxWidth}},computed:{basicStyle:function(){return{maxWidth:this.based+"px"}}}},c=l,p=(t("2fbe"),t("2877")),r=Object(p["a"])(c,a,n,!1,null,"3cab2364",null);r.options.__file="Ex-verticle-images.vue";i["default"]=r.exports},"2fbe":function(e,i,t){"use strict";var a=t("0f89"),n=t.n(a);n.a}}]);
//# sourceMappingURL=chunk-4f6625a2.f116bae3.js.map