
Type.createNamespace('LocalStorage');LocalStorage.Storage=function(){this.$0=eval('window[\'localStorage\']');if(!isUndefined(this.$0)&&this.$0!=null){this.$1=true;}}
LocalStorage.Storage.prototype={$0:null,$1:false,isSupported:function(){return this.$1;},get_length:function(){return this.$0.length;},setItem:function(key,value){this.$0.setItem(key,value);},setObjectItem:function(key,value){this.$0.setItem(key,ScriptFX.JSON.serialize(value));},getItem:function(key){return this.$0.getItem(key);},getObjectItem:function(key){return ScriptFX.JSON.deserialize(this.$0.getItem(key));},removeItem:function(key){this.$0.removeItem(key);},clear:function(){this.$0.clear();},key:function(n){return this.$0.key(n);},hasKey:function(key){return !isNull(this.$0.getItem(key));}}
LocalStorage.Storage.createClass('LocalStorage.Storage');
// ---- Do not remove this footer ----
// This script was generated using Script# v0.5.5.0 (http://projects.nikhilk.net/ScriptSharp)
// -----------------------------------
