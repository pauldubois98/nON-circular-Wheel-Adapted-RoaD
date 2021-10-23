var wheel_canvas = document.getElementById("wheel_canvas");
var wheel_ctx = wheel_canvas.getContext('2d');

// wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft + wheel_canvas.width/2;
// wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop + wheel_canvas.height/2;
var wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft;
var wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop;
var wheelCenter_x = wheel_canvas.width/2;
var wheelCenter_y = wheel_canvas.height/2;

var road_canvas = document.getElementById("road_canvas");
var road_ctx = road_canvas.getContext('2d');
var roadLeft = road_canvas.offsetLeft + road_canvas.clientLeft;
var roadTop = road_canvas.offsetTop + road_canvas.clientTop;

var road_canvas_bis = document.getElementById("road_canvas_bis");
var road_ctx_bis = road_canvas_bis.getContext('2d');
var roadLeft_bis = road_canvas_bis.offsetLeft + road_canvas_bis.clientLeft;
var roadTop_bis = road_canvas_bis.offsetTop + road_canvas_bis.clientTop;

var new_wheel_btn = document.getElementById("new_wheel_btn");
var finish_wheel_btn = document.getElementById("finish_wheel_btn");
var edit_wheel_btn = document.getElementById("edit_wheel_btn");
var WHEEL_DRAWING = false;
var WHEEL_EDITING = false;
var WHEEL_EDITING_ON = false;
var editing_point_index;
var editing_start_x;
var editing_start_y;

var radius_max = 0;

var wheel_cartesian = [[138,73], [265,77], [269,237], [147,186]];
var wheel_polar = [];

var road_pattern = [];
var road_pattern_length = 0;

var road = [];
var road_wheel_x = road_canvas.width/2;
var road_wheel_y = 0;
var road_wheel_angle = 0;
var road_wheel_cartesian = [[0,0]];
var road_wheel_polar = [[0,0]];
var ROAD_MOUSE_DOWN = false;

var road_bis_x = 0;
var road_bis = 0;
var road_wheel_bis_cartesian = 0;
var road_wheel_bis_x = road_canvas.width/2;
var road_wheel_bis_y = 0;
var road_wheel_bis_angle = 0;
var ROAD_MOUSE_DOWN_BIS = false;
var ROAD_MOUSE_DOWN_BIS_X = 0;



road_canvas.addEventListener('mousedown', function(event) {
    ROAD_MOUSE_DOWN = true;
    road_wheel_x = event.pageX-roadLeft;
    calculate_road_wheel();
    redrawRoad();
});
road_canvas.addEventListener('mousemove', function(event) {
    if(ROAD_MOUSE_DOWN){
        road_wheel_x = event.pageX-roadLeft;
        calculate_road_wheel();
        redrawRoad();
    }
});
road_canvas.addEventListener('mouseup', function(event) {
    ROAD_MOUSE_DOWN = false;
    road_wheel_x = event.pageX-roadLeft;
    calculate_road_wheel();
    redrawRoad();
});

road_canvas_bis.addEventListener('mousedown', function(event) {
    ROAD_MOUSE_DOWN_BIS = true;
    ROAD_MOUSE_DOWN_BIS_X = event.pageX-roadLeft;
    calculate_road_bis();
    redrawRoadBis();
});
road_canvas_bis.addEventListener('mousemove', function(event) {
    if(ROAD_MOUSE_DOWN_BIS){
        road_bis_x -= (event.pageX-roadLeft)-ROAD_MOUSE_DOWN_BIS_X;
        ROAD_MOUSE_DOWN_BIS_X = event.pageX-roadLeft;
        calculate_road_bis();
        redrawRoadBis();
    }
});
road_canvas_bis.addEventListener('mouseup', function(event) {
    ROAD_MOUSE_DOWN_BIS = false;
    road_bis_x -= (event.pageX-roadLeft)-ROAD_MOUSE_DOWN_BIS_X;
    calculate_road_bis();
    redrawRoadBis();
});



wheel_canvas.addEventListener('click', function(event) {
    // console.log('[' + (event.pageX-wheelLeft) + ',' + (event.pageY-wheelTop) +']');
    // console.log('[' + (event.pageX-wheelLeft-wheelCenter_x) + ',' + -(event.pageY-wheelTop-wheelCenter_y) +']');
    // console.log('[' + polar(event.pageX-wheelLeft,event.pageY-wheelTop) +']');
    if(WHEEL_DRAWING){
        wheel_cartesian = wheel_cartesian.concat( [[event.pageX-wheelLeft, event.pageY-wheelTop]] );
        calculate_polars();
        calculate_cartesian();
        redrawWheel(false);
        if(wheel_cartesian.length>2){
            calculate_road_pattern();
            calculate_road();
            calculate_road_wheel();
            redrawRoad();
            calculate_road_bis();
            redrawRoadBis();
        }
    };
    
});
wheel_canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX-wheelLeft;
    var y = event.pageY-wheelTop;
    if(WHEEL_EDITING){
        editing_point_index = -1
        for(i=0; i<wheel_cartesian.length; i++){
            var pt = wheel_cartesian[i];
            var dist = Math.sqrt( (x-pt[0])**2 + (y-pt[1])**2 );
            if(dist<10 && editing_point_index==-1){
                editing_point_index = -2;
            }
            if(dist<5){
                editing_point_index = i;
            }
        }
        if(event.button == 0 && editing_point_index>=0){
            WHEEL_EDITING_ON = true;
            editing_start_x = x;
            editing_start_y = y;
            drawCircle(wheel_ctx,
                wheel_cartesian[editing_point_index][0],
                wheel_cartesian[editing_point_index][1], 5, "#FFF0", "#F00");
        }
        if(event.button == 2){
            if(editing_point_index>=0){
                wheel_cartesian = wheel_cartesian.slice(0,editing_point_index).concat(wheel_cartesian.slice(editing_point_index+1));
                calculate_polars();
            } else if(editing_point_index==-1){
                wheel_cartesian = wheel_cartesian.concat([[x,y]]);
                calculate_polars();
                calculate_cartesian();
            }
            redrawWheel();
            calculate_road_pattern();
            calculate_road();
            calculate_road_wheel();
            calculate_road_bis();
            redrawRoad();
            redrawRoadBis();
        }
    };
    
});
wheel_canvas.addEventListener('mousemove', function(event) {
    if(WHEEL_EDITING_ON){
        wheel_cartesian[editing_point_index][0] += event.pageX-wheelLeft-editing_start_x;
        wheel_cartesian[editing_point_index][1] += event.pageY-wheelTop-editing_start_y;
        calculate_polars();
        editing_start_x = event.pageX-wheelLeft;
        editing_start_y = event.pageY-wheelTop;
        redrawWheel();
        drawCircle(wheel_ctx,
            wheel_cartesian[editing_point_index][0],
            wheel_cartesian[editing_point_index][1], 5, "#FFF0", "#F00");
    };
    
});
wheel_canvas.addEventListener('mouseup', function(event) {
    if(WHEEL_EDITING_ON){
        WHEEL_EDITING_ON = false;
        calculate_cartesian();
        redrawWheel();
        calculate_road_pattern();
        calculate_road();
        calculate_road_wheel();
        calculate_road_bis();
        redrawRoad();
        redrawRoadBis();
    };
    
});
wheel_canvas.oncontextmenu = function(e){
    e.preventDefault();
    e.stopPropagation();
}

new_wheel_btn.addEventListener('click', function(event){
    wheel_cartesian = [];
    wheel_polar = [];
    WHEEL_DRAWING=true;
    WHEEL_EDITING=false;
    edit_wheel_btn.textContent = "Edit Wheel OFF";
});

finish_wheel_btn.addEventListener('click', function(event){
    WHEEL_DRAWING=false;
    WHEEL_EDITING=false;
    redrawWheel();
    calculate_road_pattern();
    calculate_road();
    calculate_road_wheel();
    calculate_road_bis();
    redrawRoad();
    redrawRoadBis();
});

edit_wheel_btn.addEventListener('click', function(event){
    WHEEL_DRAWING=false;
    if (WHEEL_EDITING){
        WHEEL_EDITING=false;
        edit_wheel_btn.textContent = "Edit Wheel OFF";
    } else{
        WHEEL_EDITING=true;
        edit_wheel_btn.textContent = "Edit Wheel ON";
    };
    redrawWheel();
    calculate_road_pattern();
    calculate_road();
    calculate_road_wheel();
    calculate_road_bis();
    redrawRoad();
    redrawRoadBis();
});





calculate_polars();
redrawWheel();
calculate_road_pattern();
calculate_road();
calculate_road_wheel();
redrawRoad();
calculate_road_bis();
redrawRoadBis();
