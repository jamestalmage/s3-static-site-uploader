if (typeof define !== 'function') {
    var define = require('amdefine')(module);
}

define([],
function(){
    'use strict';


    function BufferHelper(chai, utils){
        utils.addProperty(chai.Assertion.prototype,'utf8Contents',function(){

            if(this._obj instanceof Buffer){
                this._obj = this._obj.toString('utf-8');
            }

            return this;

        });
    }

    return BufferHelper;

});
