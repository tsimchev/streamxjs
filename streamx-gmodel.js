var PlotView = function(plot){
  var view = {
    zoom : 1,
    x : 0,
    y : 0,
    width : plot.width,
    height : plot.height
  }

  var observer = {};

  this.absoluteToPlotCoords = function(x,y){
    return {
      x : x - offset.left,
      y : y - offset.top
    }
  }

  this.justify = function(point){
    var ds = view.zoom;
    var dx = (point.x + view.x) * ds - (view.width*ds - view.width)/2;
    var dy = (point.y + view.y) * ds - (view.height*ds - view.height)/2;
    return {
      x : dx,
      y : dy
    }
  }

  this.normalize = function(point){
    var ds = view.zoom;
    var dx = (point.x + (view.width*ds - view.width)/2)/ds - view.x;
    var dy = (point.y + (view.height*ds - view.height)/2)/ds - view.y;
    return {
      x : dx,
      y : dy
    }
  }

  this.addObserver = function(name, callback, context){
    observer[name] = {
      fn : callback,
      context : context
    }
  }

  this.removeObserver = function(name){
    if(typeof observer[name] != 'undefined'){
      delete observer[name];
    }
  }

  // TODO - memento has the same property set as view !!!
  this.memento = function(memento){
    if(memento){
      view = $.extend({},memento);
    }else{
      memento = $.extend({},view);
    }
    return memento;
  }

  this.refresh = function(){
    for(var name in observer){
      observer[name].fn.call(
        observer[name].context
      )
    }
  }

  this.x = function(x){
    if(typeof x != 'undefined'){
      view.x = x;
      this.refresh();
      return this;
    }
    return view.x;
  }

  this.y = function(y){
    if(typeof y != 'undefined'){
      view.y = y;
      this.refresh();
      return this;
    }
    return view.y;
  }

  this.zoom = function(zoom){
    if(typeof zoom != 'undefined'){
      view.zoom = zoom;
      this.refresh();
      return this;
    }
    return view.zoom;
  }

  this.width = function(width){
    if(typeof width != 'undefined'){
      throw 'Not supported yet!';
    }
    return view.width;
  }

  this.height = function(height){
    if(typeof height != 'undefined'){
      throw 'Not supported yet!';
    }
    return view.height;
  }
}


var PlotHelper = {
  getObjectAbsolutePath : function(graphic){
    return Raphael.transformPath(
      graphic.attr('path'),
      graphic.transform()
    )
  },
  getObjectAbsolutePathBox : function(graphic){
    return Raphael.pathBBox(
      Raphael.transformPath(
        graphic.attr('path'),
        graphic.transform()
      )
    )
  },
  getObjectsByType : function(plot,type){
    var element = plot.bottom, res = [];
    while (element) {
      var self = element.data('self');
      if(typeof self == 'object' && typeof self.config == 'object' && self.config.type == type){
        res.push(self);
      }
      element = element.next;
    }
    return res;
  }
}

var Intersector = function(){
  this.filter = function(element, elementArray){
    var intersectArray = [];
    for(var index in elementArray){
      if(this.check(element,elementArray[index])){
        intersectArray.push(elementArray[index]);
      }
    }
    return intersectArray;
  }

  this.check = function(elementA, elementB){
    var aPosition = PlotHelper.getObjectAbsolutePathBox(elementA.graphic);
    var bPath = PlotHelper.getObjectAbsolutePath(elementB.graphic);

    return Raphael.isPointInsidePath(bPath,aPosition.x,aPosition.y);
  }
}

var Enclosure = function(){
  this.check = function(parent,child){

    var p = PlotHelper.getObjectAbsolutePathBox(parent.graphic);
    var c = PlotHelper.getObjectAbsolutePathBox(child.graphic);

    var cr = [
    [c.x,c.y],[c.x2,c.y],[c.x,c.y2],[c.x2,c.y2]
    ]

    for(var j in cr){
      if( p.x  < cr[j][0] && p.y  < cr[j][1] &&
        p.x2 > cr[j][0] && p.y2 > cr[j][1])
      {
        return true;
      }
    }
    return false;
  }

  this.checkArray = function(parent,childArray){
    var res = [];
    for(var index in childArray){
      if(this.check(parent,childArray[index])){
        res.push(childArray[index]);
      }
    }
    return res;
  }
}

var PlotState = function(plot){
  var smartSelectQueue = [];

  this.smartSelect = function(element){
    if(smartSelectQueue.length == 0){
      smartSelectQueue.push(element);
      // update context(element.config.id)
      log.info(element.config.id)
      return;
    }

    if(smartSelectQueue[0] !== element){
      smartSelectQueue.unshift(element);

      if(smartSelectQueue.length > 2){
        smartSelectQueue[2].hint('');
      }
      smartSelectQueue[0].hint('end');
      smartSelectQueue[1].hint('begin');
      log.info(
        smartSelectQueue[1].config.id + '\t' + smartSelectQueue[0].config.id
      )
      // update context(smartSelectQueue[1].config.id, smartSelectQueue[0].config.id)
      return;
    }
  }

  this.select = function(elements){
    // TODO
    log.info(elements)
  }
}

var PlotServices = function(plot,screen){
  this.plot = plot;
  this.view = new PlotView(plot);;
  this.state = new PlotState(plot);
  this.screen = null;

  this.intersect = new Intersector();
  this.enclosure = new Enclosure();
}

var Edge = function(connection,callback,plotService){
  var halo = plotService.plot.path(Shapes.circle(0,0,PlotStyle.size.edge)).attr(PlotStyle['edge']);
  halo.data('self',this);

  this.refresh = function(){
    var j = plotService.view.justify(this.position);
    halo.transform('t' + j.x + ',' + j.y + " s" + plotService.view.zoom());
  }

  var onstart = function(x,y,eventDOM){
    callback.selected(connection.config.id);
    this.position = plotService.view.justify(this.self.position);

    this.min = {
      x : PlotStyle.size.edge*plotService.view.zoom(),
      y : PlotStyle.size.edge*plotService.view.zoom()
    }

    this.max = {
      x : plotService.view.width() - this.min.x,
      y : plotService.view.height() - this.min.y
    }
  }

  var onmove = function(dx,dy,x,y,eventDOM){
    var point = {
      x : Math.min(Math.max(this.position.x + dx, this.min.x), this.max.x),
      y : Math.min(Math.max(this.position.y + dy, this.min.y), this.max.y)
    }

    this.self.position = plotService.view.normalize(point)
    this.self.refresh()
    connection.refresh(this.self);
  }

  var onend = function(eventDOM){
    if(this.position.x != this.self.position.x || this.position.y != this.self.position.y){
      callback.moved(connection.config.id);
    }
    log.info(plotService.intersect.filter(this.self,PlotHelper.getObjectsByType(plotService.plot,'Element')))
    delete this.position, this.min, this.max;
  }

  var context = {
    self : this
  }

  halo.drag(onmove,onstart,onend,context,context,context);

  // Public properties
  this.graphic = halo;
  this.position = {
    x : 0,
    y : 0
  }
}

var Connection = function(config,callback,plotService){
  var line = plotService.plot.path('').attr(PlotStyle['connection']).attr(PlotStyle[config.style]);
  line.data('self',this);

  var set = plotService.plot.set();
  set.push(line);

  // Register connection to its Elements
  config.fromElement.connection[config.id] = this;
  config.toElement.connection[config.id] = this;

  this.refresh = function(notifier){
    var sizeElement = PlotStyle.size.element*plotService.view.zoom();
    var sizeEdge = PlotStyle.size.edge*plotService.view.zoom();

    var fromObject = this[notifier === this.fromEdge ? 'fromEdge' : 'from'];
    var toObject = this[notifier === this.toEdge ? 'toEdge' : 'to'];

    var fromPoint = plotService.view.justify(fromObject.position);
    var toPoint = plotService.view.justify(toObject.position);

    var fromOffset = (notifier === this.fromEdge ? sizeEdge : sizeElement) / 2
    var toOffset = (notifier === this.toEdge ? sizeEdge : sizeElement) / 2

    var path = Shapes.line(fromPoint.x,fromPoint.y, toPoint.x, toPoint.y);
    var pathLength = Raphael.getTotalLength(path);

    var lineIsVisible = pathLength > sizeElement*1.2;

    var newPath = lineIsVisible ?
    Raphael.getSubpath(path,fromOffset+sizeEdge,pathLength - (toOffset + sizeEdge)) :
    path;

    // Update Line position
    set.attr({path : newPath})

    // Update Edges position
    var fromEdgePoint = Raphael.getPointAtLength(path, lineIsVisible ? fromOffset : 0);
    this.fromEdge.position = plotService.view.normalize(fromEdgePoint);
    this.fromEdge.refresh();

    var toEdgePoint = Raphael.getPointAtLength(path,lineIsVisible ? pathLength - toOffset : pathLength);
    this.toEdge.position = plotService.view.normalize(toEdgePoint);
    this.toEdge.refresh();
  }

  // Public properties
  this.config = config;
  this.graphic = line;

  this.from = config.fromElement;
  this.to = config.toElement;

  this.fromEdge = new Edge(this,callback,plotService);
  this.toEdge = new Edge(this,callback,plotService);
  this.refresh();
}


var Element = function(config,callback,plotService){
  var image = plotService.plot.image(config.icon,0,0,0,0);
  var halo = plotService.plot.path(Shapes.circle(0,0,0)).attr(PlotStyle['element-halo']);
  var state = plotService.plot.path(Shapes.circle(0,0,0)).attr(PlotStyle['element-state']);
  var text = plotService.plot.text(0,0,config.description).attr(PlotStyle['element-text']);
  var hint = plotService.plot.text(0,0,'.').attr(PlotStyle['element-hint']);

  halo.data('self',this);

  var set = plotService.plot.set();
  set.push(image,text,hint,state,halo);

  var resize = function(size){
    var imageSize = size / Math.sqrt(2);

    image.attr({
      x : -imageSize/2,
      y : -imageSize/2,
      width : imageSize,
      height : imageSize
    })

    halo.attr({
      path : Shapes.circle(0,0,size/2)
    })

    state.attr({
      path : Shapes.circle(0,0,size/2)
    })

    text.attr({
      y : size/2
    })

    hint.attr({
      y : -size/2
    })
  }

  var refresh = function(){
    resize(PlotStyle.size.element)

    var textOffset = PlotStyle.size.element/2 * plotService.view.zoom();

    text.attr({y : textOffset})
    hint.attr({y : -textOffset})

    var j = plotService.view.justify(this.position);
    set.transform('t' + j.x + ',' + j.y + " s" + plotService.view.zoom());

    // refresh its connections
    for(var id in this.connection){
      this.connection[id].refresh();
    }
  }

  var setHint = function(newHint){
    hint.attr({text : newHint})
  }

  var select = function(selected){
    selected ? state.show() : state.hide();
  }

  var onstart = function(x,y,eventDOM){
    callback.selected(config.id);
    this.position = plotService.view.justify(this.self.position);

    this.min = {
      x : PlotStyle.size.element*plotService.view.zoom()/2,
      y : PlotStyle.size.element*plotService.view.zoom()/2
    }

    this.max = {
      x : plotService.view.width() - this.min.x,
      y : plotService.view.height() - this.min.y
    }
  }

  var onmove = function(dx,dy,x,y,eventDOM){
    var point = {
      x : Math.min(Math.max(this.position.x + dx, this.min.x), this.max.x),
      y : Math.min(Math.max(this.position.y + dy, this.min.y), this.max.y)
    }

    this.self.position = plotService.view.normalize(point)
    this.self.refresh()
  }

  var onend = function(eventDOM){
    if(this.position.x != this.self.position.x || this.position.y != this.self.position.y){
      callback.moved(config.id);
    }
    delete this.position, this.min, this.max;
    plotService.state.smartSelect(this.self);
  }

  var context = {
    self : this
  }

  halo.drag(onmove,onstart,onend,context,context,context);

  // Re-render when VIEW got changed
  plotService.view.addObserver(config.id, refresh, this);

  // Public properties
  this.config = config;
  this.graphic = halo;
  this.connection = {}
  this.position = {
    x : config.x,
    y : config.y
  }
  this.select = select;
  this.hint = setHint;
  this.refresh = refresh;
  // Render element on screen
  this.refresh();
}

var Base = function(plotService,selector){
  var base = plotService.plot.path(Shapes.rect(
    0,0,plotService.view.width(),plotService.view.height())).attr(PlotStyle['base']).toBack();

    // Public properties
    this.graphic = base;
}

var Selector = function(plotService,screenService){
  var rect = plotService.plot.path(Shapes.rect(0,0,0,0)).attr(PlotStyle['selector']).hide();

  var onstart = function(x,y,eventDOM){
    // TODO -
    var relative = screenService.getRelativeCoords(plotService.plot.canvas,x,y);
    this.x = relative.x;
    this.y = relative.y;
  }

  var onend = function(eventDOM){
    if(this.self.attr('path') == ''){
      return;
    }

    var selected = rect.getBBox();
    var elements = PlotHelper.getObjectsByType(plotService.plot,'Element');

    plotService.state.select(
      plotService.enclosure.checkArray({ graphic : rect },elements)
    );

    delete this.x;
    delete this.y;
    this.self.attr({path : ''})
    this.self.hide();
  }

  var onmove = function(dx,dy,x,y,eventDOM){
    var path = Shapes.rect(
      this.x + (dx < 0 ? dx : 0),
      this.y + (dy < 0 ? dy : 0),
      Math.abs(dx),
      Math.abs(dy)
    )
    this.self.attr({path : path}).show();
  }

  var context = {
    self : rect
  }

  rect.drag(onmove,onstart,onend,context,context,context);

  this.mousedown = function(e){
    rect.events[0].f.call(rect,e)
  }

}

var Scroller = function(plotService,screenService){
  var dot = plotService.plot.path(Shapes.circle(0,0,PlotStyle.size.edge)).attr(PlotStyle.edge).hide();

  var onstart = function(x,y,eventDOM){
    this.x = plotService.view.x();
    this.y = plotService.view.y();
    this.newPoint = screenService.getRelativeCoords(plotService.plot.canvas,x,y);

    dot.show();
    this.self.position = this.newPoint;
    this.self.refresh();
  }

  var onend = function(eventDOM){
    delete this.x;
    delete this.y;
  }

  var onmove = function(dx,dy,x,y,eventDOM){
    plotService.view.x(this.x + dx/plotService.view.zoom())
    plotService.view.y(this.y + dy/plotService.view.zoom())
    this.self.position = {
      x : this.newPoint.x + dx,
      y : this.newPoint.y + dy
    }
    this.self.refresh();
  }

  var context = {
    self : this
  }

  dot.drag(onmove,onstart,onend,context,context,context);

  this.mousedown = function(e){
    dot.events[0].f.call(dot,e)
  }

  this.refresh = function(){
    dot.transform('t' + this.position.x + ',' + this.position.y);
  }

  this.graphic = dot;
  this.position = {
    x : 0,
    y : 0
  }

}
