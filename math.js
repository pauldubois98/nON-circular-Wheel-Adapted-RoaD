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



function calculate_land(NB_PTS=250){
    radius_max = 0;
    for(i=0; i<wheel_polar.length; i++){
        if(wheel_polar[i][1]>radius_max){
            radius_max = wheel_polar[i][1]
        }
    }
    land = [[0,land_canvas.height,0]];
    var i = 0;
    var x = 0;
    var y_prev = radius(-Math.PI);
    var y = y_prev;
    var dr = 0;
    var alpha = -Math.PI;
    while(x<=land_canvas.width){
        land = land.concat([[x,y+(land_canvas.height-radius_max),alpha]]);
        i++;
        alpha = ((2*Math.PI*i/NB_PTS)%(2*Math.PI))-Math.PI;
        y_prev = y;
        y = radius(alpha);
        dr = Math.sqrt(y_prev**2 + y**2 - 2*y*y_prev*Math.cos(2*Math.PI/NB_PTS));
        dx = dr*Math.cos(angle(alpha))
        x = x+dx;
    }
    land = land.concat([[x,y+(land_canvas.height-radius_max),alpha]]);
    land = land.concat([[land_canvas.width,land_canvas.height,0]]);
}
function calculate_land_wheel(){
    var i=1;
    while(land[i][0]<land_wheel_x && i<land.length-3){
        i++;
    }
    land_wheel_y = land_canvas.height-radius_max
    // land_wheel_angle = land[i][2]
    if(Math.abs(land[i+1][2]-land[i][2])>Math.PI){
        land_wheel_angle = land[i][2]
    } else{
        land_wheel_angle = land[i][2]+((land_wheel_x-land[i][0])*(land[i+1][2]-land[i][2])/(land[i+1][0]-land[i][0]));
    }
    land_wheel_polar = [];
    land_wheel_cartesian = [];
    for(var j=0; j<wheel_polar.length; j++){
        var a = wheel_polar[j][0]-land_wheel_angle-Math.PI/2;
        var r = wheel_polar[j][1];
        land_wheel_polar = land_wheel_polar.concat([[ a,r ]]);
        land_wheel_cartesian = land_wheel_cartesian.concat([ cartesian(a, r, c_x=land_wheel_x, c_y=land_wheel_y) ])
    }
}
