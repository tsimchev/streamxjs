var StreamxService = function(appConnection, elements, connections, streams){
  var findElementById = function(id){
    return elements[id];
  }
  var findConnectionById = function(id){
    return connections[id];
  }
  var findStreamById = function(id){
    return streams[id];
  }

  return {
    // streamConfig, draft=true
    saveElement : null,
    saveConnection : null,
    saveStream : null,

    findElementById : findElementById,
    findConnectionById : findConnectionById,
    findStreamById : findStreamById,

    findElementByDescription : null,
    findConnectionByDescription : null,
    findStreamByDescription : null

    //This is only editor no-delete features here
  }
}



////////////// Data End ////////////////////

var AppScreen = function(window, document){
  var observer = {};

  this.addObserverCallback = function(name, context, callback){
    if(typeof observer[name] != 'undefined'){
      console.log('Overwriting observer');
    }
    observer[name] = {
      fn : callback,
      context : context
    };
  }

  this.removeObserverCallback = function(name){
    delete observer[name];
  }

  var width = 0;
  var height = 0;
  var scroll = {
    x : 0,
    y : 0
  }

  this.refresh = function(){
    var doc = $(document);
    width = doc.width();
    height = doc.height();
    scroll.x = doc.scrollLeft();
    scroll.y = doc.scrollTop();
    for(key in observer){
      observer[key].fn.call(observer[key].context);
    }
  }

  this.getRelativeCoords = function(element,x,y){
    var offset = $(element).offset();
    return {
      x : x - offset.left,
      y : y - offset.top
    }
  }

  this.getScroll = function(){
    return {
      x : scroll.x,
      y : scroll.y
    }
  }

  this.getWidth = function(){
    return width;
  }

  this.getHeight = function(){
    return height;
  }

  $(document).scroll(this.refresh);
  $(window).resize(this.refresh);

}


//////////////// Main ////////////////


var StreamEditorCallback = {
  element : {
    // new : '', // will be handled by load function
    load : function(streamId){
      //TODO load from UI
      //TODO add element to stream
      //TODO return eid
    },
    // select : '',
    delete : function(streamId,eid){
      //TODO delete element and its connections
    }
  },
  connection : {
    // new : '', // will be handled by load function
    load : function(streamId,eFromId,eToId){
      //TODO add connection to stream
      //TODO return connId
    },
    //select : '',
    delete : function(streamId,connId){
      //TODO delete connection
    },
    reconnect : function(streamId,connId,reconnectedElementId){
      //TODO reconnect
    }
  }
}

var StreamEditor = function(containerId, streamId, streamxService){

  var elementCallback = {
    selected : function(elementId){
      console.log('Element ' + elementId + ' is selected!');
    },
    moved : function(elementId){
      console.log('Element ' + elementId + ' is moved!');
    }
  }

  var edgeCallback = {
    selected : function(connectionId){
      console.log('Connection ' + connectionId + ' is selected!');
    },
    moved : function(connectionId){
      console.log('Connection ' + connectionId + ' is moved!');
    }
  }


  var plot = Raphael(
    $('#' + containerId).get(0)
  );

  var screenService = new AppScreen(window,document);
  var plotService = new PlotServices(plot);

  var selector = new Selector(plotService,screenService)
  var scroller = new Scroller(plotService,screenService)

  var base = new Base(plotService);

  base.graphic.dblclick(function(e,x,y){
    selector.mousedown(e);
  })

  base.graphic.mousedown(function(e){
    scroller.mousedown(e);
  })


  var elements = [];
  var connections = [];

  function loadElement(eid){
    //TODO - check for cyclic dependencies
    var e = streamxService.findElementById(eid);

    var ge = {
      type : 'Element',
      id : eid,
      description : e.description,
      icon : e.style.icon,
      x : stream.elements[eid].position.x,
      y : stream.elements[eid].position.y
    }

    //TODO - check for duplicate
    elements[eid] = new Element(ge,elementCallback,plotService);
    for(var i in stream.elements[eid].out){
      var connId = stream.elements[eid].out[i];
      var c = streamxService.findConnectionById(connId);
      loadElement(stream.connections[connId].out);
      loadConnection(connId);
    }
  }

  function loadConnection(connId){
    var conn = streamxService.findConnectionById(connId);
    var c = stream.connections[connId];

    var gc = {
      id : connId,
      description : conn.description,
      // TODO - have to be in stream config
      style : 'connection-success',
      fromElement : elements[c.in],
      toElement : elements[c.out]
    }

    connections[connId] = new Connection(gc,edgeCallback,plotService);
  }

  var stream = streamxService.findStreamById(streamId);
  var elementBeginId = stream.begin;
  loadElement(elementBeginId);
}

var appInit = function(){
  //TODO Check for dependencies
  var appHeight = $('#app').height()

  $('#plot').height($(document).height() - appHeight);

  //TODO remove hardcoded values DElements, DConnections, DStreams and setup datasource.
  var datasource = null;
  var streamxService = new StreamxService(datasource, DElements, DConnections, DStreams);
  var streamEditor = new StreamEditor('plot','s2001',streamxService);

}

$(document).ready(appInit);
