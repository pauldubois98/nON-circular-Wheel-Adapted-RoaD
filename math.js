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
    wheel_polar = wheel_polar.sort(function (a,b){return a[0]-b[0]});
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

    r_alpha = (rA*sin_angle_rB)/(Math.sin( (Math.PI-angle_rB-( (alpha-angleA+(2*Math.PI))%(2*Math.PI) ) ) ));
    r_alpha_bis = (rB*sin_angle_rA)/(Math.sin( (Math.PI-angle_rA-( (angleB-alpha+(2*Math.PI))%(2*Math.PI) ) ) ));
    
    if(r_alpha_bis >= r_alpha){
        angle_alpha = Math.PI/2 - (Math.PI - angle_rA - (angleB-alpha));
        return angle_alpha;
    } else{
        angle_alpha_bis = - ( (Math.PI - angle_rB - (alpha-angleA)) - Math.PI/2 );
        return angle_alpha_bis;
    }
}
function height(pos_x){
    x = 0;
    i = 0;
    while(x<=pos_x){
        x += road_pattern[i][0];
        i++;
    }
    i--;
    x -= road_pattern[i][0];
    return road_pattern[i][1] + (pos_x-x)*(road_pattern[(i+1)%road_pattern.length][1]-road_pattern[i][1])/road_pattern[i][0];
}


function local_collision(UPDATE_ICON=true){
    local_collision_points_indexes = [];
    for(i=0; i<wheel_cartesian.length; i++){
        j = (i+1)%wheel_cartesian.length;
        k = (i+2)%wheel_cartesian.length;
        var A = Math.sqrt( ((wheel_cartesian[i][0]-wheel_cartesian[j][0])**2) 
                         + ((wheel_cartesian[i][1]-wheel_cartesian[j][1])**2) );
        var B = Math.sqrt( ((wheel_cartesian[k][0]-wheel_cartesian[j][0])**2) 
                         + ((wheel_cartesian[k][1]-wheel_cartesian[j][1])**2) );
        var C = Math.sqrt( ((wheel_cartesian[i][0]-wheel_cartesian[k][0])**2) 
                         + ((wheel_cartesian[i][1]-wheel_cartesian[k][1])**2) );
        // C**2 = A**2 + B**2 - 2*A*C*cos(angle_C)
        var angle_C = Math.acos( ( (A**2) + (B**2) - (C**2) ) / (2*A*B) );
        if(angle_C<Math.PI/2){
            local_collision_points_indexes = local_collision_points_indexes.concat([j]);
        }
    }
    local_collision_points_indexes = local_collision_points_indexes.sort();
    if(UPDATE_ICON){
        if(local_collision_points_indexes.length != 0){
            local_collision_icon.src="svg/local_red_24dp.svg"
        } else{
            local_collision_icon.src="svg/local_green_24dp.svg"
        }
    }
    return local_collision_points_indexes.length != 0;
}
function global_collision(TOL_ANGLE=Math.PI/6, UPDATE_ICON=true){
    global_collision_points_indexes = []
    if(road_pattern!=undefined){
        var x = 0;
        for(var i=0; i<road_pattern.length; i++){
            x+= road_pattern[i][0];
            for(var j=0; j<wheel_polar.length; j++){
                var an = (wheel_polar[j][0]-road_pattern[i][2]+(3.5*Math.PI))%(2*Math.PI);
                if( an < 1.5*Math.PI - TOL_ANGLE || an > 1.5*Math.PI + TOL_ANGLE){
                    var r = wheel_polar[j][1];
                    var wheel_y = demo_canvas.height-radius_max-ROAD_FLOOR-Math.sin(an)*r;
                    var road_x = (x+Math.cos(an)*r + road_pattern_length)%road_pattern_length;
                    var road_y = height(road_x);
                    if( wheel_y > road_y){
                        global_collision_points_indexes = global_collision_points_indexes.concat([[i,j,an]]);
                        // // For debug:
                        // demo_ctx.beginPath();
                        // demo_ctx.moveTo(x,demo_canvas.height-radius_max-ROAD_FLOOR);
                        // // demo_ctx.lineTo(road_x,road_y);
                        // demo_ctx.lineTo(road_x,wheel_y);
                        // demo_ctx.strokeStyle = "#000";
                        // demo_ctx.stroke();
                    }
                }
                
            }
        }
    }
    if(UPDATE_ICON){
        if(global_collision_points_indexes.length != 0){
            global_collision_icon.src="svg/global_red_24dp.svg"
        } else{
            global_collision_icon.src="svg/global_green_24dp.svg"
        }
    }
    return global_collision_points_indexes.length != 0;
}


function calculate_road_pattern(NB_PTS=250){
    radius_max = 0;
    for(i=0; i<wheel_polar.length; i++){
        if(wheel_polar[i][1]>radius_max){
            radius_max = wheel_polar[i][1];
        }
    }
    road_pattern = [];
    var i = 0;
    var x = 0;
    var y_prev = radius(-Math.PI);
    var y = y_prev;
    var dr = 0;
    var alpha = -Math.PI;
    while(i<NB_PTS){
        i++;
        alpha = ((2*Math.PI*i/NB_PTS)%(2*Math.PI))-Math.PI;
        y_prev = y;
        y = radius(alpha);
        dr = Math.sqrt(y_prev**2 + y**2 - 2*y*y_prev*Math.cos(2*Math.PI/NB_PTS));
        dx = dr*Math.cos(angle(alpha));
        x = x+dx;
        road_pattern = road_pattern.concat([[dx,y+(demo_canvas.height-radius_max)-ROAD_FLOOR,alpha]]);
    }
    road_pattern_length = x;
}
function calculate_demo_road(){
    var i = 0;
    var x = 0;
    road = [[0,demo_canvas_bis.height,0]];
    while(x<=demo_canvas_bis.width){
        road = road.concat([[x,road_pattern[i][1],road_pattern[i][2]]]);
        x += road_pattern[i][0];
        i++;
        if(i==road_pattern.length){
            i=0;
        }
    }
    road = road.concat([[x,road_pattern[i][1],road_pattern[i][2]]]);
    road = road.concat([[demo_canvas.width,demo_canvas.height,0]]);
}
function calculate_demo_wheel(){
    var i=1;
    while(road[i][0]<demo_wheel_x && i<road.length-3){
        i++;
    }
    demo_wheel_y = demo_canvas.height-radius_max-ROAD_FLOOR;
    if(Math.abs(road[i+1][2]-road[i][2])>Math.PI){
        demo_wheel_angle = road[i][2]+((demo_wheel_x-road[i][0])*(road[i+1][2]-road[i][2]+2*Math.PI)/(road[i+1][0]-road[i][0]));
    } else{
        demo_wheel_angle = road[i][2]+((demo_wheel_x-road[i][0])*(road[i+1][2]-road[i][2])/(road[i+1][0]-road[i][0]));
    }
    //demo_wheel_angle = road[i][2];
    demo_wheel_polar = [];
    demo_wheel_cartesian = [];
    for(var j=0; j<wheel_polar.length; j++){
        var a = wheel_polar[j][0]-demo_wheel_angle-Math.PI/2;
        var r = wheel_polar[j][1];
        demo_wheel_polar = demo_wheel_polar.concat([[ a,r ]]);
        demo_wheel_cartesian = demo_wheel_cartesian.concat([ cartesian(a, r, c_x=demo_wheel_x, c_y=demo_wheel_y) ]);
    }
}
function calculate_demo_bis(){
    // finding start
    while(demo_bis_x<0){
        demo_bis_x += road_pattern_length;
    }
    while(demo_bis_x>=road_pattern_length){
        demo_bis_x -= road_pattern_length;
    }
    x = 0;
    i = 0;
    while(x<demo_bis_x){
        x += road_pattern[i][0];
        i++;
    }
    if(i>0){
        i--;
    }
    x -= road_pattern[i][0];
    x -= demo_bis_x;
    // road
    road_bis = [[0,demo_canvas_bis.height,0]];
    while(x<=demo_canvas_bis.width){
        road_bis = road_bis.concat([[x,road_pattern[i][1],road_pattern[i][2]]]);
        x += road_pattern[i][0];
        i++;
        if(i==road_pattern.length){
            i=0;
        }
    }
    road_bis = road_bis.concat([[x,road_pattern[i][1],road_pattern[i][2]]]);
    road_bis = road_bis.concat([[demo_canvas_bis.width,demo_canvas_bis.height,0]]);
    // wheel
    var i=1;
    while(road_bis[i][0]<demo_wheel_bis_x && i<road_bis.length-3){
        i++;
    }
    demo_wheel_bis_y = demo_canvas_bis.height-radius_max-ROAD_FLOOR;
    if(Math.abs(road_bis[i+1][2]-road_bis[i][2])>Math.PI){
        demo_wheel_bis_angle = road_bis[i][2]+((demo_wheel_bis_x-road_bis[i][0])*(road_bis[i+1][2]-road_bis[i][2]+2*Math.PI)/(road_bis[i+1][0]-road_bis[i][0]));
    } else{
        demo_wheel_bis_angle = road_bis[i][2]+((demo_wheel_bis_x-road_bis[i][0])*(road_bis[i+1][2]-road_bis[i][2])/(road_bis[i+1][0]-road_bis[i][0]));
    }
    //demo_wheel_bis_angle = road_bis[i][2];
    demo_wheel_bis_cartesian = [];
    for(var j=0; j<wheel_polar.length; j++){
        var a = wheel_polar[j][0]-demo_wheel_bis_angle-Math.PI/2;
        var r = wheel_polar[j][1];
        demo_wheel_bis_cartesian = demo_wheel_bis_cartesian.concat([ cartesian(a, r, c_x=demo_wheel_bis_x, c_y=demo_wheel_bis_y) ]);
    }
}



function check(n, integer=true, mini=true, mini_val=3, maxi=true, maxi_val=20){
    if(mini && n<mini_val){
        return mini_val;
    }
    if(maxi && n>maxi_val){
        return maxi_val;
    }
    if(integer && n!=Math.round(n)){
        return Math.round(n);
    }
    return n;
}