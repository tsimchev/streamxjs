var PlotStyle = {
  size : {
    element : 50,
    edge : 5,
    connection : 5
  },
  'grid' : {
    fill : 'none',
    stroke : '#0022c2',
    opacity : .2
  },
  'base' : {
    fill: '#FFFFFF',
    stroke:'none',
    opacity: 0
  },
  'selector' : {
    fill: '#D5D5FF',
    stroke : '#000080',
    opacity : '.2'
  },
  'edge' : {
    fill: '#3343BF',
    stroke : 'none',
    opacity : .2,
    r : 50/10
  },
  'connection' : {
    stroke : '#FFFFFF',
    'stroke-width' : 2,
    opacity : 1
  },
  'connection-success' : {
    stroke : '#088A29',
  },
  'connection-failure' : {
    stroke : '#bd0001',
  },
  'element-halo' : {
    fill : '#FFFFFF',
    stroke : 'none',
    opacity: 0,
    r : 50/2
  },
  'element-state' : {
    fill : 'none',
    stroke : 'green',
    opacity: 1,
    r : 50/2
  },
  'element-image' : {
    x : -50/Math.sqrt(2)/2,
    y : -50/Math.sqrt(2)/2,
    width : 50/Math.sqrt(2),
    height : 50/Math.sqrt(2)
  },
  'element-text' : {
    fill : '#3A3CCB',
    'font-size' : 10,
    'font-family' : 'Verdana',
    y : 50/2
  },
  'element-hint' : {
    fill : '#000000',
    'font-size' : 10,
    'font-family' : 'Verdana',
    y : 50/2
  }
}
