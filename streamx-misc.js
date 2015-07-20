var log = new (function(){
  var level = 'info';

  this.level = function(newLevel){
    if(typeof newLevel != 'undefined'){
      return level;
    }else{
      if(!newLevel.match(/(info)|(debug)|(severe)/i)){
        throw 'Log level must be one of info,debug,severe - ' + newLevel;
      }
      level = newLevel;
    }
  }
  this.info = function(msg){
    console.log(msg);
  }
  this.debug = function(msg){
    console.log(msg);
  }
  this.severe = function(msg){
    console.log(msg);
  }
})();

var Shapes = {
  rect : function(x,y,width,height){
    return  'M' + x + ',' + y +
    'H' + (x+width) +
    'V' + (y+height) +
    'H' + x +
    'V' + y +
    'Z';
  },
  circle : function(x , y, r){
    return  'M'+x+','+(y-r)+
    'A'+r+','+r+',0,1,1,'+(x-0.1)+','+(y-r)+'Z';
  },
  line : function(x1,y1,x2,y2){
    return  'M' + x1 + ',' + y1 +
    'L'  + x2 + ',' + y2;
  },
  text : function(x,y,text){

  }
}
