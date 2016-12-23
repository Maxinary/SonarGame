function shuffle(arr){
  for(var i=0;i<arr.length;i++){
    var ind = Math.floor(Math.random()*arr.length);
    var temp = arr[i];
    arr[i] = arr[ind];
    arr[ind] = temp;
  }
  return arr;
}

class Maze{
  constructor(width, height){
    this.drawMap = []
    this.map = [];
    for(var i=0; i<width; i++){
      this.map.push([]);
      for(var j=0; j<height; j++){
        this.map[i].push(1);
      }
    }
    
    this.generate(0,0);
  }
  
  generate(x0, y0){
    var pos_stack = [[x0,y0]];
    
    while(pos_stack.length > 0){
      this.map[pos_stack[pos_stack.length-1][0]][pos_stack[pos_stack.length-1][1]] = 0;

      var x = pos_stack[pos_stack.length-1][0];
      var y = pos_stack[pos_stack.length-1][1];
      
      var k = shuffle([[-1, 0], [0, -1], [1, 0], [0, 1]]);
      var left = false;
      for(var i=0; i<k.length && left === false; i++){
        var positions = [x+k[i][0], y+k[i][1]];
        if(this.exists(positions[0], positions[1]) && this.map[positions[0]][positions[1]] == 1 && this.neighbors(positions[0], positions[1]) > 6){
          pos_stack.push(positions);
          left = true;
        }
      }
      if(left === false){
        pos_stack.pop();
      }
    }
  }
  
  exists(x, y){
    return x >= 0 && x < this.map.length && y >= 0 && y < this.map[x].length;
  }
  
  neighbors(x, y){
    var count = 0;
    for(var i=-1; i<2; i++){
      for(var j=-1; j<2; j++){
        if(!this.exists(x+i, y+j) || this.map[x+i][y+j] == 1){
          count++;
        }
      }
    }
    return count;
  }
}