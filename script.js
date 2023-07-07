var wheel_canvas = document.getElementById("wheel_canvas");
var wheel_ctx = wheel_canvas.getContext('2d');
var demo_canvas = document.getElementById("demo_canvas");
var demo_ctx = demo_canvas.getContext('2d');
var demo_canvas_bis = document.getElementById("demo_canvas_bis");
var demo_ctx_bis = demo_canvas_bis.getContext('2d');
var wheelLeft;
var wheelTop;
var wheelCenter_x;
var wheelCenter_y;
var demoLeft;
var demoTop;
var demoLeft_bis;
var demoTop_bis;
document.addEventListener('DOMContentLoaded', function() {
    wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft;
    wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop;
    wheelCenter_x = wheel_canvas.width/2;
    wheelCenter_y = wheel_canvas.height/2;
    demoLeft = demo_canvas.offsetLeft + demo_canvas.clientLeft;
    demoTop = demo_canvas.offsetTop + demo_canvas.clientTop;
    demoLeft_bis = demo_canvas_bis.offsetLeft + demo_canvas_bis.clientLeft;
    demoTop_bis = demo_canvas_bis.offsetTop + demo_canvas_bis.clientTop;
    calculate_all();
});

var new_wheel_btn = document.getElementById("new_wheel_btn");
var finish_wheel_btn = document.getElementById("finish_wheel_btn");
var edit_wheel_btn = document.getElementById("edit_wheel_btn");
var draw_polygon_btn = document.getElementById("draw_polygon");
var number_sides_polygon_input = document.getElementById("number_sides_polygon");
var draw_star_btn = document.getElementById("draw_star");
var number_spikes_star_input = document.getElementById("number_spikes_star");
var draw_heart_btn = document.getElementById("draw_heart");
var collision_btn = document.getElementById("collision_btn");
var collision_icon = document.getElementById("collision_icon");
var local_collision_btn = document.getElementById("local_collision_btn");
var local_collision_icon = document.getElementById("local_collision_icon");
var global_collision_btn = document.getElementById("global_collision_btn");
var global_collision_icon = document.getElementById("global_collision_icon");
var edit_move_btn = document.getElementById("edit_move_btn");
var WHEEL_EDITING = true;
var WHEEL_EDITING_ON = false;
var WHEEL_EDITING_MOVE = true;
var SELECT_DISTANCE = 5;
if (
  navigator.userAgent.match(/Android/i) ||
  navigator.userAgent.match(/webOS/i) ||
  navigator.userAgent.match(/iPhone/i) ||
  navigator.userAgent.match(/iPad/i) ||
  navigator.userAgent.match(/iPod/i) ||
  navigator.userAgent.match(/BlackBerry/i) ||
  navigator.userAgent.match(/Windows Phone/i)
) {
  SELECT_DISTANCE = 25;
}
var editing_point_index;
var editing_start_x;
var editing_start_y;

var radius_max = 0;

var wheel_cartesian = [[138,73], [265,77], [269,237], [147,186]];
var wheel_polar = [];

var road_pattern = [];
var road_pattern_length = 0;
var ROAD_FLOOR = 25;

var road = [];
var demo_wheel_x = demo_canvas.width/2;
var demo_wheel_y = 0;
var demo_wheel_angle = 0;
var demo_wheel_cartesian = [[0,0]];
var demo_wheel_polar = [[0,0]];
var DEMO_MOUSE_DOWN = false;

var demo_bis_x = 0;
var road_bis = 0;
var demo_wheel_bis_cartesian = 0;
var demo_wheel_bis_x = demo_canvas.width/2;
var demo_wheel_bis_y = 0;
var demo_wheel_bis_angle = 0;
var DEMO_MOUSE_DOWN_BIS = false;
var DEMO_MOUSE_DOWN_BIS_X = 0;

var local_collision_points_indexes = [];
var global_collision_points_indexes = [];

function addListenerMulti(element, eventNames, listener) {
    var events = eventNames.split(" ");
    for (var i = 0, iLen = events.length; i < iLen; i++) {
        element.addEventListener(events[i], listener, false);
    }
}

addListenerMulti(demo_canvas, "pointerdown mousedown", function (event) {
    DEMO_MOUSE_DOWN = true;
    demo_wheel_x = event.pageX-demoLeft;
    calculate_demo_wheel();
    redrawDemo();
});
addListenerMulti(demo_canvas, "pointermove mousemove", function (event) {
    if(DEMO_MOUSE_DOWN){
        demo_wheel_x = event.pageX-demoLeft;
        calculate_demo_wheel();
        redrawDemo();
    }
});
demo_canvas.addEventListener('mouseleave', function(event) {
    if(DEMO_MOUSE_DOWN){
        DEMO_MOUSE_DOWN = false;
        demo_wheel_x = event.pageX-demoLeft;
        calculate_demo_wheel();
        redrawDemo();
    }
});
addListenerMulti(demo_canvas, "pointerup mouseup", function (event) {
    if(DEMO_MOUSE_DOWN){
        DEMO_MOUSE_DOWN = false;
        demo_wheel_x = event.pageX-demoLeft;
        calculate_demo_wheel();
        redrawDemo();
    }
});

addListenerMulti(demo_canvas_bis, "pointerdown mousedown", function (event) {
    DEMO_MOUSE_DOWN_BIS = true;
    DEMO_MOUSE_DOWN_BIS_X = event.pageX-demoLeft_bis;
    calculate_demo_bis();
    redrawDemoBis();
});
addListenerMulti(demo_canvas_bis, "pointermove mousemove", function (event) {
    if(DEMO_MOUSE_DOWN_BIS){
        demo_bis_x -= (event.pageX-demoLeft_bis)-DEMO_MOUSE_DOWN_BIS_X;
        DEMO_MOUSE_DOWN_BIS_X = event.pageX-demoLeft_bis;
        calculate_demo_bis();
        redrawDemoBis();
    }
});
demo_canvas_bis.addEventListener('mouseleave', function(event) {
    if(DEMO_MOUSE_DOWN_BIS){
        DEMO_MOUSE_DOWN_BIS = false;
        demo_bis_x -= (event.pageX-demoLeft_bis)-DEMO_MOUSE_DOWN_BIS_X;
        calculate_demo_bis();
        redrawDemoBis();
    }
});
addListenerMulti(demo_canvas_bis, "pointerup mouseup", function (event) {
    if(DEMO_MOUSE_DOWN_BIS){
        DEMO_MOUSE_DOWN_BIS = false;
        demo_bis_x -= (event.pageX-demoLeft_bis)-DEMO_MOUSE_DOWN_BIS_X;
        calculate_demo_bis();
        redrawDemoBis();
    }
});


addListenerMulti(wheel_canvas, "pointerdown mousedown", function (event) {
    var x = event.pageX-wheelLeft;
    var y = event.pageY-wheelTop;
    if(WHEEL_EDITING){
        editing_point_index = -1
        for(i=0; i<wheel_cartesian.length; i++){
            var pt = wheel_cartesian[i];
            var dist = Math.sqrt( (x-pt[0])**2 + (y-pt[1])**2 );
            if(dist<2*SELECT_DISTANCE && editing_point_index==-1){
                editing_point_index = -2;
            }
            if(dist<SELECT_DISTANCE){
                editing_point_index = i;
            }
        }
        if(WHEEL_EDITING_MOVE && editing_point_index>=0){
            WHEEL_EDITING_ON = true;
            editing_start_x = x;
            editing_start_y = y;
            drawCircle(wheel_ctx,
                wheel_cartesian[editing_point_index][0],
                wheel_cartesian[editing_point_index][1], 5, "#FFF0", "#F00");
        }
        if(!WHEEL_EDITING_MOVE && editing_point_index==-1){
            wheel_cartesian = wheel_cartesian.concat([[x,y]]);
            calculate_polars();
            calculate_cartesian();
            calculate_all();
        }
    }
    
});
addListenerMulti(wheel_canvas, "pointermove mousemove", function (event) {
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
addListenerMulti(wheel_canvas, "pointerup mouseup", function (event) {
    if(WHEEL_EDITING_ON){
        WHEEL_EDITING_ON = false;
        calculate_all();
    };
    
});
wheel_canvas.oncontextmenu = function(e){
    e.preventDefault();
    e.stopPropagation();
}

new_wheel_btn.addEventListener('click', function(event){
    wheel_cartesian = [];
    wheel_polar = [];
    WHEEL_EDITING=true;
    edit_wheel_btn.innerHTML = "<img src=\"svg/gesture_black_24dp.svg\" class=\"icon\"> Edit ON";
    calculate_all();
});
edit_wheel_btn.addEventListener('click', function(event){
    if (WHEEL_EDITING){
        WHEEL_EDITING=false;
        edit_wheel_btn.innerHTML = "<img src=\"svg/no_gesture_black_24dp.svg\" class=\"icon\"> Edit OFF";
    } else{
        WHEEL_EDITING=true;
        edit_wheel_btn.innerHTML = "<img src=\"svg/gesture_black_24dp.svg\" class=\"icon\"> Edit ON";
    };
    calculate_all();
});
draw_polygon_btn.addEventListener('click', function(event){
    var n = number_sides_polygon_input.value;
    n = check(n, false, true, 3, true, 200);
    number_sides_polygon_input.value = n;
    wheel_polar = []
    for(var i=0; i<n; i++){
        wheel_polar = wheel_polar.concat([[2*Math.PI*i/n-Math.PI, 120]]);
    }
    calculate_cartesian();
    calculate_all();
});
draw_star_btn.addEventListener('click', function(event){
    var n = number_spikes_star_input.value;
    n = check(n, false, true, 2, true, 15);
    number_spikes_star_input.value = n;
    wheel_polar = []
    for(var i=0; i<2*n; i++){
        wheel_polar = wheel_polar.concat([[2*Math.PI*i/(2*n)-Math.PI, 100+(30*((-1)**i))]]);
    }
    calculate_cartesian();
    calculate_all();
});
draw_heart_btn.addEventListener('click', function(event){
    var n = 14;
    wheel_polar = []
    for(var i=0; i<n; i++){
        t = 2*Math.PI*i/n-Math.PI;
        //heart curve credits: https://mathworld.wolfram.com/HeartCurve.html
        r = Math.sin(t)*Math.sqrt(Math.abs(Math.cos(t))) / (Math.sin(t) + 1.4) - 2*Math.sin(t) + 2;
        wheel_polar = wheel_polar.concat([[t,55*r]]);
    }
    wheel_polar = wheel_polar.concat([[-Math.PI/2,175]]);
    wheel_polar = wheel_polar.sort(function (a,b){return a[0]-b[0]});
    calculate_cartesian();
    for(var i=0; i<wheel_cartesian.length; i++){
        wheel_cartesian[i][1] -= 60;
    }
    calculate_all();
    // wheel_polar = [ [-Math.PI/2, 110],
    //                 [Math.PI/10, 115],
    //                 [Math.PI/3, 115],
    //                 [Math.PI/2, 55],
    //                 [2*Math.PI/3, 115],
    //                 [9*Math.PI/10, 115] ];
    // calculate_cartesian();
    // calculate_all();
});
edit_move_btn.addEventListener('click', function(event){
    if (WHEEL_EDITING_MOVE){
        WHEEL_EDITING_MOVE = false;
        edit_move_btn.innerHTML = '<img src="svg/add_24dp.svg" class="icon">Add points';
    } else{
        WHEEL_EDITING_MOVE = true;
        edit_move_btn.innerHTML = '<img src="svg/move_24dp.svg" class="icon">Move points';
    }
});


function calculate_all(){
    calculate_polars();
    calculate_cartesian();
    redrawWheel();
    if(wheel_cartesian.length>2){
        var i = 1;
        var angles = [wheel_polar[0][0]-wheel_polar[wheel_polar.length-1][0]+2*Math.PI]
        while(i<wheel_polar.length){
            angles = angles.concat([wheel_polar[i][0]-wheel_polar[i-1][0]]);
            i++;
        }
        if(Math.max(...angles)<Math.PI){
            calculate_road_pattern();
            calculate_demo_road();
            calculate_demo_wheel();
            redrawDemo();
            calculate_demo_bis();
            redrawDemoBis();
            local_collision();
            global_collision();
            collision();
        } else{
            alert("Wheel not including the center.")
        }
    }
}
