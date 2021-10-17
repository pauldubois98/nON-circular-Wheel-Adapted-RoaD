var wheel_canvas = document.getElementById("wheel_canvas");
var wheel_ctx = wheel_canvas.getContext('2d');

// wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft + wheel_canvas.width/2;
// wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop + wheel_canvas.height/2;
var wheelLeft = wheel_canvas.offsetLeft + wheel_canvas.clientLeft;
var wheelTop = wheel_canvas.offsetTop + wheel_canvas.clientTop;
var wheelCenter_x = wheel_canvas.width/2;
var wheelCenter_y = wheel_canvas.height/2;

var land_canvas = document.getElementById("land_canvas");
var land_ctx = land_canvas.getContext('2d');

var landLeft = land_canvas.offsetLeft + land_canvas.clientLeft;
var landTop = land_canvas.offsetTop + land_canvas.clientTop;

var new_wheel_btn = document.getElementById("new_wheel_btn");
var finish_wheel_btn = document.getElementById("finish_wheel_btn");
var edit_wheel_btn = document.getElementById("edit_wheel_btn");
var WHEEL_DRAWING=false;
var WHEEL_EDITING=false;
var WHEEL_EDITING_ON=false;
var editing_point_index;
var editing_start_x;
var editing_start_y;

var wheel_cartesian = [[138,73], [265,77], [269,237], [147,186]];
var wheel_polar = [];
var land = [];


function cartesian(angle, radius, c_x=wheelCenter_x, c_y=wheelCenter_y){
    return [c_x+Math.cos(angle)*radius, c_y-Math.sin(angle)*radius];
}
function polar(x,y, c_x=wheelCenter_x, c_y=wheelCenter_y){
    p_x = x-c_x;
    p_y = -(y-c_y);
    return [Math.atan2(p_y,p_x),Math.sqrt(p_x**2 + p_y**2)];
}
function calculate_polars(){
    wheel_polar = [];
    for(i=0; i<wheel_cartesian.length; i++){
        wheel_polar = wheel_polar.concat( [polar(wheel_cartesian[i][0], wheel_cartesian[i][1])] );
    }
    wheel_polar = wheel_polar.sort(function (a,b){return a[0]-b[0]})
}
function calculate_cartesian(){
    wheel_cartesian = [];
    for(i=0; i<wheel_polar.length; i++){
        wheel_cartesian = wheel_cartesian.concat( [cartesian(wheel_polar[i][0], wheel_polar[i][1])] );
    }
}



land_canvas.addEventListener('click', function(event) {
    console.log('[' + (event.pageX-landLeft) + ',' + (event.pageY-landTop) +']');
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
    };
    
});
wheel_canvas.addEventListener('mousedown', function(event) {
    var x = event.pageX-wheelLeft;
    var y = event.pageY-wheelTop;
    if(WHEEL_EDITING){
        editing_point_index = -1
        for(i=0; i<wheel_cartesian.length; i++){
            var pt = wheel_cartesian[i];
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
        wheel_cartesian[editing_point_index][0] += event.pageX-wheelLeft-editing_start_x;
        wheel_cartesian[editing_point_index][1] += event.pageY-wheelTop-editing_start_y;
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
        calculate_land();
        redrawLand();
    };
    
});

new_wheel_btn.addEventListener('click', function(event){
    wheel_cartesian = [];
    wheel_polar = [];
    WHEEL_DRAWING=true;
    WHEEL_EDITING=false;
});

finish_wheel_btn.addEventListener('click', function(event){
    WHEEL_DRAWING=false;
    WHEEL_EDITING=false;
    redrawWheel();
    calculate_land();
    redrawLand();
});

edit_wheel_btn.addEventListener('click', function(event){
    WHEEL_DRAWING=false;
    if (WHEEL_EDITING){
        WHEEL_EDITING=false;
    } else{
        WHEEL_EDITING=true;
    };
    redrawWheel();
    calculate_land();
    redrawLand();
});




function radius(alpha){
    // radius of the wheel at rotation alpha
    j=0;
    while(alpha>wheel_polar[j % wheel_polar.length][0] && j<wheel_polar.length){
        j++;
    }
    j = j % wheel_polar.length;
    angleB = wheel_polar[j][0];
    rB = wheel_polar[j][1];
    j = (wheel_polar.length + j-1)% (wheel_polar.length);
    angleA = wheel_polar[j][0];
    rA = wheel_polar[j][1];

    angleAB = ((angleB-angleA)+(2*Math.PI))%(2*Math.PI);
    dist_AB = Math.sqrt( (rA**2) + (rB**2) - (2*rA*rB*Math.cos(angleAB)) );

    sin_angle_rA = rA*Math.sin(angleAB)/dist_AB;
    sin_angle_rB = rB*Math.sin(angleAB)/dist_AB;
    angle_rA = Math.asin(sin_angle_rA);
    angle_rB = Math.asin(sin_angle_rB);

    r_alpha = (rA*sin_angle_rB)/(Math.sin( (Math.PI-angle_rB-( (alpha-angleA+(2*Math.PI))%(2*Math.PI) ) ) ));
    r_alpha_bis = (rB*sin_angle_rA)/(Math.sin( (Math.PI-angle_rA-( (angleB-alpha+(2*Math.PI))%(2*Math.PI) ) ) ));
    return Math.max(r_alpha,r_alpha_bis);
}
function angle(alpha){
    // attack angle of the wheel at rotation alpha
    j=0;
    while(alpha>wheel_polar[j % wheel_polar.length][0] && j<wheel_polar.length){
        j++;
    }
    j = j % wheel_polar.length;
    angleB = wheel_polar[j][0];
    rB = wheel_polar[j][1];
    j = (wheel_polar.length + j-1)% (wheel_polar.length);
    angleA = wheel_polar[j][0];
    rA = wheel_polar[j][1];

    angleAB = ((angleB-angleA)+(2*Math.PI))%(2*Math.PI);
    dist_AB = Math.sqrt( (rA**2) + (rB**2) - (2*rA*rB*Math.cos(angleAB)) );

    sin_angle_rA = rA*Math.sin(angleAB)/dist_AB;
    sin_angle_rB = rB*Math.sin(angleAB)/dist_AB;
    angle_rA = Math.asin(sin_angle_rA);
    angle_rB = Math.asin(sin_angle_rB);

    if(angle_rA<Math.PI/2){
        angle_alpha = Math.PI/2 - (Math.PI - angle_rA - (angleB-alpha));
        return angle_alpha;
    } else{ // then angle_rB<Math.PI/2
        angle_alpha_bis = (Math.PI - angle_rB - (alpha-angleA)) - Math.PI/2;
        return angle_alpha_bis;
    }
}

function calculate_land(NB_PTS=100){
    var radius_max = 0
    for(i=0; i<wheel_polar.length; i++){
        if(wheel_polar[i][1]>radius_max){
            radius_max = wheel_polar[i][1]
        }
    }
    
    land = [[0,land_canvas.height,0]];
    var i=0;
    var x = 0;
    var y_prev = radius(-Math.PI);
    var y = y_prev;
    var dr=0
    while(x<land_canvas.width){
        land = land.concat([[x,y+(land_canvas.height-radius_max)]]);
        i++;
        alpha = ((2*Math.PI*i/NB_PTS)%(2*Math.PI))-Math.PI;
        y_prev = y;
        y = radius(alpha);
        dr = Math.sqrt(y_prev**2 + y**2 - 2*y*y_prev*Math.cos(2*Math.PI/NB_PTS));
        dx = dr*Math.cos(angle(alpha))
        x = x+dx;
    }
    land = land.concat([[land_canvas.width,land_canvas.height,0]]);
}




calculate_polars();
redrawWheel();
calculate_land();
redrawLand();