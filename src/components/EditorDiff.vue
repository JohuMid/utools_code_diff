<template>
  <div :class="myEditorStyle">
      <div id="diff_control">
          <el-form :inline="true" ref="form" style="height: 41px;">
              <el-form-item class="select-style1">
                  <el-select v-model="originConfig.theme" size="mini" @change="switchSystem" placeholder="主题">
                      <el-option
                              v-for="item in themeOption"
                              :key="item.value"
                              :label="item.label"
                              :value="item.value">
                      </el-option>
                  </el-select>
              </el-form-item>
              <el-form-item class="select-style2">
                  <el-select v-model="originConfig.language" size="mini" filterable @change="languageChange" placeholder="比对语言">
                      <el-option
                              v-for="item in languageOption"
                              :key="item.id"
                              :label="item.id"
                              :value="item.id">
                      </el-option>
                  </el-select>
              </el-form-item>
              <el-form-item>
                  <el-button size="mini" @click="clearContent" icon="el-icon-delete" title="清除内容 ctrl+D"></el-button>
              </el-form-item>
              <el-form-item>
                  <el-button size="mini" @click="formatContent" icon="el-icon-document-checked" title="文本格式化 ctrl+E"></el-button>
              </el-form-item>
              <el-form-item>
                  <el-button-group>
                      <el-button size="mini" @click="previousDiff" icon="el-icon-arrow-left" title="上一处差异 ctrl+ ←"></el-button>
                      <el-button size="mini" @click="nextDiff" title="下一处差异 ctrl+ →"><i class="el-icon-arrow-right el-icon--right"></i></el-button>
                  </el-button-group>
              </el-form-item>
              <el-form-item>
                <el-dropdown size="mini" split-button type="border">
                    更多操作
                    <el-dropdown-menu slot="dropdown">
                      <el-dropdown-item>
                        <el-checkbox @change="InlineDiffChange" :class="fontStyle" size="mini" v-model="originConfig.inlineDiff">行内对比</el-checkbox>
                      </el-dropdown-item>
                      <el-dropdown-item>
                        <el-checkbox @change="WordWrapChange" :class="fontStyle" size="mini" v-model="originConfig.wordWrap">自动换行</el-checkbox>
                      </el-dropdown-item>
                    </el-dropdown-menu>
                  </el-dropdown>
              </el-form-item>
              <!-- <el-form-item>
                <el-checkbox border @change="InlineDiffChange" :class="fontStyle" size="mini" v-model="inlineDiff">行内对比</el-checkbox>
                <el-checkbox border @change="WordWrapChange" :class="fontStyle" size="mini" v-model="wordWrap">自动换行</el-checkbox>
              </el-form-item> -->
              <el-form-item v-show="diffNum!==0" style="float: right" :class="fontStyle">
                  <el-tag type="warning">{{diffNum}}处差异</el-tag>
              </el-form-item>
          </el-form>
      </div>

      <div id="container" ref="container"></div>
  </div>
</template>
<script>
import * as monaco from 'monaco-editor'
const mammoth = require('mammoth')
export default {
  data () {
    return {
      themeOption: [
        {
          value: 'vs',
          label: '默认'
        },
        {
          value: 'hc-black',
          label: '高亮'
        },
        {
          value: 'vs-dark',
          label: '深色'
        },
        {
          value: 'system',
          label: '跟随uTools'
        }
      ],
      myEditorStyle: 'myEditorW',
      languageOption: [],
      fontStyle: 'fontB',
      diffNum: 0,
      originConfig: {
        theme: 'vs',
        language: 'plaintext',
        inlineDiff: false,
        wordWrap: false,
      }
    }
  },
  mounted () {
    const self = this
    self.initEditor()
    self.initModel('', '')
    self.languageOption = monaco.languages.getLanguages()
    document.ondrop = function(e){
      e.preventDefault();
    }
    // 这个阻止默认事件是为了让drop事件得以触发
    document.ondragover = function(e){
      e.preventDefault();
    }
    const domEditor = document.getElementById('container')
    domEditor.ondrop = (e)=>{
      let positionFlag = (e.target.parentNode.parentNode.parentNode.parentNode.parentNode.getAttribute("class").split(' ')[1]);
      // 得到拖拽过来的文件
      // console.log(e.dataTransfer.files[0]);
      let originalModel=self.monacoEditor.getModel().original
      let modifiedModel=self.monacoEditor.getModel().modified

      console.log(originalModel.getLineCount());
      console.log(modifiedModel.getLineCount());
      // 存储之前的结果
      let prevOriginal = originalModel.getValue()
      let prevModified = modifiedModel.getValue()
      if (e.dataTransfer.files[0] !== undefined){
        let dataFile = e.dataTransfer.files[0];
        if (dataFile.name.split(".")[1] === 'docx'){
          const reader = new FileReader()
          reader.onload = function (loadEvent) {
            const arrayBuffer = loadEvent.target.result;// arrayBuffer
            mammoth.extractRawText({ arrayBuffer: arrayBuffer })
              .then(res => {
                if (positionFlag === 'original'){
                  originalModel.setValue(prevOriginal + res.value)
                } else if (positionFlag === 'modified'){
                  modifiedModel.setValue(prevModified + res.value)
                }
              })
              .done()
          }
          reader.readAsArrayBuffer(dataFile)
        } else {
          // FileReader实例化
          let fr = new FileReader();
          // 异步读取文件
          fr.readAsText(dataFile,"utf-8");
          // 读取完毕之后执行
          fr.onload = function(){
            if (positionFlag === 'original'){
              originalModel.setValue(prevOriginal + fr.result)
            } else if (positionFlag === 'modified'){
              modifiedModel.setValue(prevModified + fr.result)
            }
          }
        }
      } else {
        if (positionFlag === 'original'){
          originalModel.setValue(prevOriginal + e.dataTransfer.getData('text'))
        } else if (positionFlag === 'modified'){
          modifiedModel.setValue(prevModified + e.dataTransfer.getData('text'))
        }
      }
    }
    // eslint-disable-next-line no-undef
    utools.onPluginEnter(() => {
      // eslint-disable-next-line no-undef
        const config = utools.db.get('config') && utools.db.get('config').data

        if (config) {
          self.originConfig = config
          self.switchSystem(config.theme)
          self.languageChange(config.language)
          self.InlineDiffChange(config.inlineDiff)
          self.WordWrapChange(config.wordWrap)
        } else {
          self.updateConfigDb()
        }
    })
  },
  methods: {
    updateConfigDb(){
      // eslint-disable-next-line no-undef
      console.log(utools.db.get('config'));
      // eslint-disable-next-line no-undef
      if (!utools.db.get('config')) {
        // eslint-disable-next-line no-undef
        utools.db.put({
          _id: "config",
          data: this.originConfig
        })
      } else {
        // eslint-disable-next-line no-undef
        const config = utools.db.get('config')
        // eslint-disable-next-line no-undef
        utools.db.put({
          _id: "config",
          data: this.originConfig,
          _rev: config._rev
        })
      }
    },
    switchSystem(theme){
      if (theme === 'system') {
          // eslint-disable-next-line no-undef
          if(utools.isDarkColors()){
            this.themeChange('vs-dark')
          } else {
            this.themeChange('vs')
          }
        } else {
          this.themeChange(theme)
        }
    },
    initEditor () {
      const self = this
      const domEditor = document.getElementById('container')
      self.monacoEditor = monaco.editor.createDiffEditor(domEditor, {
        theme: self.theme,
        readOnly: false,
        domReadOnly: false,
        originalEditable: true,
        automaticLayout: true,
        mouseWheelZoom: true,
        diffWordWrap:"off"
      })
      self.monacoEditor.onDidUpdateDiff(()=>{
        self.diffNum = this.monacoEditor.getLineChanges().length
      })
      self.diffNavigator = monaco.editor.createDiffNavigator(this.monacoEditor,{
        alwaysRevealFirst:true
      })
      // 增加快捷键
      self.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.LeftArrow, function() {
        self.previousDiff()
      });
      self.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.RightArrow, function() {
        self.nextDiff()
      });
      self.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_D, function() {
        self.clearContent()
      });
      self.monacoEditor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KEY_E, function() {
        self.formatContent()
      });
    },
    themeChange (val) {
      monaco.editor.setTheme(val)
      this.myEditorStyle = val
      if (val === 'vs'){
        this.fontStyle = 'fontB'
        this.changeClass(document.body, "custom-FEB84A");
      } else {
        this.fontStyle = 'fontW'
        this.changeClass(document.body, "custom-08E6B9");
      }
      this.updateConfigDb()
    },
    changeClass(element, className) {
      if (!element || !className) return;
      element.className = className;
    },
    languageChange (val) {
      console.log(val);
      monaco.editor.setModelLanguage(this.monacoEditor.getModel().original, val)
      monaco.editor.setModelLanguage(this.monacoEditor.getModel().modified, val)
      this.updateConfigDb()
    },
    clearContent(){
      this.monacoEditor.getModel().original.setValue('')
      this.monacoEditor.getModel().modified.setValue('')
    },
    formatContent(){
      console.log('格式化');
       
      this.monacoEditor.getOriginalEditor().trigger('','editor.action.formatDocument');
      this.monacoEditor.getModifiedEditor().trigger('','editor.action.formatDocument');
    }, 
    InlineDiffChange(val){
      this.monacoEditor.updateOptions({
        renderSideBySide: !val
      });
      this.updateConfigDb()
    },
    WordWrapChange(val){
      this.monacoEditor.updateOptions({
        diffWordWrap: val?'on':'off'
      });
      this.updateConfigDb()
    },
    initModel (original, modified) {
      this.monacoEditor.setModel({
        original: monaco.editor.createModel(original, this.language),
        modified: monaco.editor.createModel(modified, this.language)
      })
    },
    previousDiff(){
      this.diffNavigator.previous()
    },
    nextDiff(){
      this.diffNavigator.next()
    }
  }
}
</script>
<style scoped>
    .select-style1{
        width: 100px;
    }
    .select-style2{
        width: 150px;
    }
    .vs{
        width: calc(100vw - 1px);
        height: calc(100vh - 41px);
        background: white;
    }
    .hc-black{
        width: calc(100vw - 1px);
        height: calc(100vh - 41px);
        background: #000000;
    }
    .vs-dark{
        width: calc(100vw - 1px);
        height: calc(100vh - 41px);
        background: #1E1E1E;
    }
    .fontW{
        color: white;
    }
    .fontB{
        color: #606266;
    }
    #container{
        width: calc(100vw - 1px);
        height: calc(100vh - 41px);
        text-align: left;
    }
  .el-form-item{
      margin-bottom: 0;
      margin-left: 10px;
  }
</style>
