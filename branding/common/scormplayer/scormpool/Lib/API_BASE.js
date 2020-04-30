
Type.createNamespace('API_BASE');API_BASE.BaseActivityTreeNodeEventType=function(){};API_BASE.BaseActivityTreeNodeEventType.prototype = {finaL_STORE:0,COMMIT:1,deliverY_REQUEST:2,EXIT:3,UNLOAD:4,enD_SESSION:5}
API_BASE.BaseActivityTreeNodeEventType.createEnum('API_BASE.BaseActivityTreeNodeEventType',false);API_BASE.IActivityTreeNode=function(){};API_BASE.IActivityTreeNode.createInterface('API_BASE.IActivityTreeNode');API_BASE.IActivityTree=function(){};API_BASE.IActivityTree.createInterface('API_BASE.IActivityTree');API_BASE.IAPI=function(){};API_BASE.IAPI.createInterface('API_BASE.IAPI');API_BASE.BaseActivityTreeNodeEventArgs=function(treeNode,eventType){API_BASE.BaseActivityTreeNodeEventArgs.constructBase(this);this.$1_0=treeNode;this.$1_1=eventType;}
API_BASE.BaseActivityTreeNodeEventArgs.prototype={$1_0:null,$1_1:0,get_treeNode:function(){return this.$1_0;},get_eventType:function(){return this.$1_1;}}
API_BASE.BaseUtils=function(){}
API_BASE.BaseUtils.utf8Decode=function(utftext){var $0='';var $1=0;var $2,$3,$4=0;while($1<utftext.length){$2=utftext.charCodeAt($1);if($2<128){$0+=String.fromCharCode($2);$1++;}else if(($2>191)&&($2<224)){$3=utftext.charCodeAt($1+1);$0+=String.fromCharCode((($2&31)<<6)|($3&63));$1+=2;}else{$3=utftext.charCodeAt($1+1);$4=utftext.charCodeAt($1+2);$0+=String.fromCharCode((($2&15)<<12)|(($3&63)<<6)|($4&63));$1+=3;}}return $0;}
API_BASE.BaseUtils.getXMLNodeAttribut=function(node,attribut){if(isNullOrUndefined(node)||isNullOrUndefined(attribut)){return null;}for(var $0=0;$0<node.attributes.length;$0++){var $1=node.attributes.item($0);if(API_BASE.BaseUtils.getBaseName($1).toLowerCase()===attribut.toLowerCase()){return API_BASE.BaseUtils.getText($1).trim();}}return null;}
API_BASE.BaseUtils.getBaseName=function(attrNode){if(isNullOrUndefined(attrNode)){return null;}if(!isNullOrUndefined(attrNode.baseName)){return attrNode.baseName;}return attrNode.localName;}
API_BASE.BaseUtils.getText=function(attrNode){if(isNullOrUndefined(attrNode)){return null;}if(!isNullOrUndefined(attrNode.text)){return attrNode.text;}return attrNode.textContent;}
API_BASE.BaseUtils.getBaseOfUrl=function(url){var $0=url.match(new RegExp('^(?:f|ht)tp(?:s)?\\://([^/]+)','im'));return ($0!=null&&$0.length>=1)?$0[0]:'';}
API_BASE.BaseUtils.addParameters=function(iURL,iParameters){if((iURL.length===0)||(iParameters.length===0)){return iURL;}while(iParameters.startsWith('?')||iParameters.startsWith('&')){iParameters=iParameters.substr(1);}if(iParameters.startsWith('#')){if(iURL.indexOf('#')!==-1||iURL.indexOf('?')!==-1){return iURL;}}if(iURL.indexOf('?')!==-1){iURL=iURL+'&';}else{iURL=iURL+'?';}iURL=iURL+iParameters;return iURL;}
API_BASE.BaseUtils.getChildNodeByName=function(node,nodeName){for(var $0=0;$0<node.childNodes.length;$0++){if(node.childNodes[$0].nodeType!==1){continue;}if(API_BASE.BaseUtils.getBaseName(node.childNodes[$0]).toLowerCase()===nodeName.toLowerCase()){return node.childNodes[$0];}}return null;}
API_BASE.BaseUtils.getChildSiblingsByName=function(node,nodeName){var $0=[];for(var $1=0;$1<node.childNodes.length;$1++){if(node.childNodes[$1].nodeType!==1){continue;}if(API_BASE.BaseUtils.getBaseName(node.childNodes[$1]).toLowerCase()===nodeName.toLowerCase()){$0.add(node.childNodes[$1]);}}return $0;}
API_BASE.LogEventArgs=function(){API_BASE.LogEventArgs.constructBase(this);}
API_BASE.LogEventArgs.prototype={message:null,errorCode:null,errorDescription:null}
API_BASE.LOG=function(){}
API_BASE.LOG.add_logEvent=function(value){API_BASE.LOG.$1=Delegate.combine(API_BASE.LOG.$1,value);}
API_BASE.LOG.remove_logEvent=function(value){API_BASE.LOG.$1=Delegate.remove(API_BASE.LOG.$1,value);}
API_BASE.LOG.displayMessage=function(message,errorCode,errorDescription){if(!API_BASE.LOG.silent&&API_BASE.LOG.$1!=null){API_BASE.LOG.$0.message=message;API_BASE.LOG.$0.errorCode=errorCode;API_BASE.LOG.$0.errorDescription=errorDescription;API_BASE.LOG.$1.invoke(API_BASE.LOG.$0);}}
API_BASE.BaseActivityTreeNodeEventArgs.createClass('API_BASE.BaseActivityTreeNodeEventArgs',EventArgs);API_BASE.BaseUtils.createClass('API_BASE.BaseUtils');API_BASE.LogEventArgs.createClass('API_BASE.LogEventArgs',EventArgs);API_BASE.LOG.createClass('API_BASE.LOG');API_BASE.BaseUtils.ncName='[A-Za-z_][\\w\\\\.\\\\-]*';API_BASE.LOG.silent=false;API_BASE.LOG.$0=new API_BASE.LogEventArgs();API_BASE.LOG.$1=null;
// ---- Do not remove this footer ----
// This script was generated using Script# v0.5.5.0 (http://projects.nikhilk.net/ScriptSharp)
// -----------------------------------
