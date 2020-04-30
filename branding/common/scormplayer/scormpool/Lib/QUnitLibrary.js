
Type.createNamespace('QUnitLibrary');QUnitLibrary.QTest=function(){}
QUnitLibrary.QTest.prototype={run:function(moduleName){var $0={};$0.setup = Delegate.create(this,this.setup);$0.teardown = Delegate.create(this,this.teardown);module(moduleName,$0);this.tests();}}
QUnitLibrary.QTest.createClass('QUnitLibrary.QTest');
// ---- Do not remove this footer ----
// This script was generated using Script# v0.5.5.0 (http://projects.nikhilk.net/ScriptSharp)
// -----------------------------------
