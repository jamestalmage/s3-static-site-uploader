    'use strict';


    function BufferHelper(chai, utils){
        utils.addProperty(chai.Assertion.prototype,'utf8Contents',function(){

            if(this._obj instanceof Buffer){
                this._obj = this._obj.toString('utf-8');
            }

            return this;

        });
    }

    module.exports = BufferHelper;