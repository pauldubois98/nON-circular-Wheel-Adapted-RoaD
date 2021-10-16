var wheel_canvas = document.getElementById("wheel_canvas");
var wheel_ctx = wheel_canvas.getContext('2d');

// wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft + wheel_canvas.width/2;
// wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop + wheel_canvas.height/2;
var wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft;
var wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop;

var path_canvas = document.getElementById("path_canvas");
var path_ctx = path_canvas.getContext('2d');

var new_wheel_btn = document.getElementById("new_wheel_btn");
var finish_wheel_btn = document.getElementById("finish_wheel_btn");
var edit_wheel_btn = document.getElementById("edit_wheel_btn");
var WHEEL_DRAWING=false;
var WHEEL_EDITING=false;
var WHEEL_EDITING_ON=false;
var editing_point_index;
var editing_start_x;
var editing_start_y;

var LightenColor = function(color, percent) {
    var num = parseInt(color,16),
    amt = Math.round(2.55 * percent),
    R = (num >> 16) + amt,
    B = (num >> 8 & 0x00FF) + amt,
    G = (num & 0x0000FF) + amt;
    return (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (B<255?B<1?0:B:255)*0x100 + (G<255?G<1?0:G:255)).toString(16).slice(1);
};

function centeredCircle(canvas, ctx, radius, colorFill, colorStroke){
    ctx.beginPath();
    ctx.arc(canvas.width/2, canvas.height/2, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.strokeStyle = colorStroke;
    ctx.stroke();
}
function drawPath(canvas, ctx, points, colorFill, colorStroke, closePath=true){
    for(i=0; i<points.length; i++){
        var point = points[i];
        ctx.beginPath();
        ctx.arc(point[0],point[1], 3, 0, 2 * Math.PI);
        ctx.fillStyle = "#005";
        ctx.fill(); 
    }
    //start
    ctx.beginPath();
    ctx.moveTo(points[0][0],points[0][1]);
    //iterate
    for(i=1; i<points.length; i++){
        var point = points[i];
        ctx.lineTo(point[0],point[1]);
    }
    if(closePath){
        //close path
        ctx.lineTo(points[0][0],points[0][1]);
    }
    //fill & stroke
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.strokeStyle = colorStroke;
    ctx.stroke();
}

function redrawWheel(finish=true){
    wheel_ctx.clearRect(0, 0, wheel_canvas.width, wheel_canvas.height);
    centeredCircle(wheel_canvas, wheel_ctx, 
        Math.min(wheel_canvas.width, wheel_canvas.height)*1/2.2,
        "#BFB8", "#4D48");
    drawPath(wheel_canvas, wheel_ctx, path_points, "#88F", "#229", finish)
    centeredCircle(wheel_canvas, wheel_ctx, 
        Math.min(wheel_canvas.width, wheel_canvas.height)*1/8,
        "#4D48", "#0908");
    centeredCircle(wheel_canvas, wheel_ctx, 1, "#000", "#000");
}



var path_points = [[138,73], [265,77], [269,237], [147,186]]
redrawWheel()


wheel_canvas.addEventListener('click', function(event) {
    // console.log('[' + (event.pageX-wheelLeft) + ',' + (event.pageY-wheelTop) +']');
    if(WHEEL_DRAWING){
        path_points = path_points.concat( [[event.pageX-wheelLeft, event.pageY-wheelTop]] );
        redrawWheel(false);
    };
    
});
wheel_canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX-wheelLeft;
    var y = event.pageY-wheelTop;
    if(WHEEL_EDITING){
        editing_point_index = -1
        for(i=0; i<path_points.length; i++){
            var pt = path_points[i];
            var dist = Math.sqrt( (x-pt[0])**2 + (y-pt[1])**2 )
            if(dist<5){
                editing_point_index = i;
            }
        }
        if(editing_point_index!=-1){
            WHEEL_EDITING_ON = true;
            editing_start_x = x
            editing_start_y = y
        }
    };
    
});
wheel_canvas.addEventListener('mousemove', function(event) {
    if(WHEEL_EDITING_ON){
        path_points[editing_point_index][0] += event.pageX-wheelLeft-editing_start_x;
        path_points[editing_point_index][1] += event.pageY-wheelTop-editing_start_y;
        editing_start_x = event.pageX-wheelLeft;
        editing_start_y = event.pageY-wheelTop;
        redrawWheel();
    };
    
});
wheel_canvas.addEventListener('mouseup', function(event) {
    if(WHEEL_EDITING_ON){
        WHEEL_EDITING_ON = false;
        redrawWheel();
    };
    
});

new_wheel_btn.addEventListener('click', function(event){
    // console.log('new path');
    path_points = []
    WHEEL_DRAWING=true;
    WHEEL_EDITING=false;
});

finish_wheel_btn.addEventListener('click', function(event){
    // console.log('finish path');
    // console.log(path_points);
    WHEEL_DRAWING=false;
    WHEEL_EDITING=false;
    redrawWheel();
});

edit_wheel_btn.addEventListener('click', function(event){
    // console.log('finish path');
    // console.log(path_points);
    WHEEL_DRAWING=false;
    if (WHEEL_EDITING){
        WHEEL_EDITING=false;
    } else{
        WHEEL_EDITING=true;
    };
    redrawWheel();
});
