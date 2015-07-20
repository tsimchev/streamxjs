/*
 * Testing data
 */

var DElements = {
  'e0001' : {
    type : 'Element',
    description : 'short description',
    source : {
      type : 'text/javascript',
      encoding : 'UTF-8',
      code : 'source code data'
    },
    style : {
      icon : 'star.png'
    }
  },
  'e0002' : {
    type : 'Element',
    description : 'long description',
    source : {
      type : 'text/javascript',
      encoding : 'UTF-8',
      code : 'source code data'
    },
    style : {
      icon : 'home.png'
    }
  },
  'e0003' : {
    type : 'Element',
    description : 'long 3 description',
    source : {
      type : 'text/javascript',
      encoding : 'UTF-8',
      code : 'source code data'
    },
    style : {
      icon : 'ok.png'
		
    }
  }
}

var DConnections = {
  'c1001' : {
    type : 'Connection',
    description : 'convert json to xml',
    input : 'data(json)',
    output : 'data(xml)'
    //condition : 'source code condition',
    //dataMapper: 'source code mapper input to output',
    //style : 'success'
  },
  'c1002' : {
    type : 'Connection',
    description : 'hiding part of data stream',
    input : 'env',
    output : 'modified env'
    //condition : 'source code condition',
    //dataMapper: 'source code mapper input to output',
    //style : 'success'
  }
}


var DStreams = {
  's2001' : {
    type : 'Stream',
    description : 'short description',
    begin : 'e0001',
    end : ['e0002'],
    elements : {
      'e0001' : {
        in : [],
        out : ['c1001','c1002'],
        position : {
          x : 100,
          y : 100
        }
      },
      'e0002' : {
        in : ['c1001'],
        out : [],
        position : {
          x : 300,
          y : 200
        }
      },
      'e0003' : {
        in : ['c1002'],
        out : [],
        position : {
          x : 200,
          y : 400
        }
      }
    },
    connections : {
      'c1001' : {
        in : 'e0001',
        out : 'e0002'
      },
      'c1002' : {
        in : 'e0001',
        out : 'e0003'
      }
    }
  }
}