var wheel_canvas = document.getElementById("wheel_canvas");
var wheel_ctx = wheel_canvas.getContext('2d');

// wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft + wheel_canvas.width/2;
// wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop + wheel_canvas.height/2;
var wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft;
var wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop;
var wheelCenter_x = wheel_canvas.width/2;
var wheelCenter_y = wheel_canvas.height/2;

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

var path_cartesian = [[138,73], [265,77], [269,237], [147,186]];
var path_polar = [];

function cartesian(angle, radius, c_x=wheelCenter_x, c_y=wheelCenter_y){
    return [c_x+Math.cos(angle)*radius, c_y-Math.sin(angle)*radius];
}
function polar(x,y, c_x=wheelCenter_x, c_y=wheelCenter_y){
    p_x = x-c_x;
    p_y = -(y-c_y);
    return [Math.atan2(p_y,p_x),Math.sqrt(p_x**2 + p_y**2)];
}
function calculate_polars(){
    path_polar = [];
    for(i=0; i<path_cartesian.length; i++){
        path_polar = path_polar.concat( [polar(path_cartesian[i][0], path_cartesian[i][1])] );
    }
    path_polar = path_polar.sort(function (a,b){return a[0]-b[0]})
}
function calculate_cartesian(){
    path_cartesian = [];
    for(i=0; i<path_polar.length; i++){
        path_cartesian = path_cartesian.concat( [cartesian(path_polar[i][0], path_polar[i][1])] );
    }
}



wheel_canvas.addEventListener('click', function(event) {
    // console.log('[' + (event.pageX-wheelLeft) + ',' + (event.pageY-wheelTop) +']');
    // console.log('[' + (event.pageX-wheelLeft-wheelCenter_x) + ',' + -(event.pageY-wheelTop-wheelCenter_y) +']');
    // console.log('[' + polar(event.pageX-wheelLeft,event.pageY-wheelTop) +']');
    if(WHEEL_DRAWING){
        path_cartesian = path_cartesian.concat( [[event.pageX-wheelLeft, event.pageY-wheelTop]] );
        calculate_polars();
        calculate_cartesian();
        redrawWheel(false);
    };
    
});
wheel_canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX-wheelLeft;
    var y = event.pageY-wheelTop;
    if(WHEEL_EDITING){
        editing_point_index = -1
        for(i=0; i<path_cartesian.length; i++){
            var pt = path_cartesian[i];
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
        path_cartesian[editing_point_index][0] += event.pageX-wheelLeft-editing_start_x;
        path_cartesian[editing_point_index][1] += event.pageY-wheelTop-editing_start_y;
        calculate_polars();
        editing_start_x = event.pageX-wheelLeft;
        editing_start_y = event.pageY-wheelTop;
        redrawWheel();
    };
    
});
wheel_canvas.addEventListener('mouseup', function(event) {
    if(WHEEL_EDITING_ON){
        WHEEL_EDITING_ON = false;
        calculate_cartesian();
        redrawWheel();
    };
    
});

new_wheel_btn.addEventListener('click', function(event){
    path_cartesian = [];
    path_polar = [];
    WHEEL_DRAWING=true;
    WHEEL_EDITING=false;
});

finish_wheel_btn.addEventListener('click', function(event){
    WHEEL_DRAWING=false;
    WHEEL_EDITING=false;
    redrawWheel();
});

edit_wheel_btn.addEventListener('click', function(event){
    WHEEL_DRAWING=false;
    if (WHEEL_EDITING){
        WHEEL_EDITING=false;
    } else{
        WHEEL_EDITING=true;
    };
    redrawWheel();
});




function radius(alpha){
    j=0;
    while(alpha>path_polar[j % path_polar.length][0] && j<path_polar.length){
        j++;
    }
    j = j % path_polar.length;
    angleB = path_polar[j][0];
    rB = path_polar[j][1];
    j = (path_polar.length + j-1)% (path_polar.length);
    angleA = path_polar[j][0];
    rA = path_polar[j][1];

    angleAB = ((angleB-angleA)+(2*Math.PI))%(2*Math.PI) 
    dist_AB = Math.sqrt( (rA**2) + (rB**2) - (2*rA*rB*Math.cos(angleAB)) );

    sin_angle_rA = rA*Math.sin(angleAB)/dist_AB;
    sin_angle_rB = rB*Math.sin(angleAB)/dist_AB;
    angle_rA = Math.asin(sin_angle_rA);
    angle_rB = Math.asin(sin_angle_rB);

    r_alpha = (rA*sin_angle_rB)/(Math.sin( (Math.PI-angle_rB-( (alpha-angleA+(2*Math.PI))%(2*Math.PI) ) ) ));
    r_alpha_bis = (rB*sin_angle_rA)/(Math.sin( (Math.PI-angle_rA-( (angleB-alpha+(2*Math.PI))%(2*Math.PI) ) ) ));
    return Math.max(r_alpha,r_alpha_bis)
}





calculate_polars();
redrawWheel()