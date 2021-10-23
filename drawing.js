function drawCircle(ctx, c_x,c_y, radius, colorFill, colorStroke){
    ctx.beginPath();
    ctx.arc(c_x, c_y, radius, 0, 2 * Math.PI);
    ctx.fillStyle = colorFill;
    ctx.fill();
    ctx.strokeStyle = colorStroke;
    ctx.stroke();
}
function centeredCircle(canvas, ctx, radius, colorFill, colorStroke){
    drawCircle(ctx, canvas.width/2, canvas.height/2, radius, colorFill, colorStroke)
}
function drawPath(canvas, ctx, points, colorFill, colorStroke, closePath=true, dottedPath=true){
    if(dottedPath){
        for(i=0; i<points.length; i++){
            var point = points[i];
            ctx.beginPath();
            ctx.arc(point[0],point[1], 3, 0, 2 * Math.PI);
            ctx.fillStyle = "#005";
            ctx.fill(); 
        }
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
        "#a4e8ff77", "#a4e8ff00");
    drawPath(wheel_canvas, wheel_ctx, wheel_cartesian, "#61D8FF", "#309488", finish);
    //// for debugging the radius functions:
    // wheel_cartesian2 = []
    // n=100
    // for(var i=0; i<n; i++){
    //     a = -Math.PI + (2*Math.PI*i/n)
    //     wheel_cartesian2 = wheel_cartesian2.concat( [cartesian(a,radius(a))] );
    // }
    // drawPath(wheel_canvas, wheel_ctx, wheel_cartesian2, "#F88", "#922", finish)
    centeredCircle(wheel_canvas, wheel_ctx,
        Math.min(wheel_canvas.width, wheel_canvas.height)*1/8,
        "#a4e8ff55", "#a4e8ff00");
    centeredCircle(wheel_canvas, wheel_ctx, 1, "#000", "#000");
}

function redrawRoad(){
    road_ctx.clearRect(0, 0, road_canvas.width, road_canvas.height);
    drawPath(road_canvas, road_ctx, road, "#96FFAA", "#438855", true, false);
    drawPath(road_canvas, road_ctx, road_wheel_cartesian, "#61D8FF", "#309488", true, false);
    drawCircle(road_ctx, road_wheel_x,road_wheel_y, 1, "#000", "#000")
}

function redrawRoadBis(){
    road_ctx_bis.clearRect(0, 0, road_canvas_bis.width, road_canvas_bis.height);
    drawPath(road_canvas_bis, road_ctx_bis, road_bis, "#96FFAA", "#438855", true, false);
    drawPath(road_canvas_bis, road_ctx_bis, road_wheel_bis_cartesian, "#61D8FF", "#309488", true, false);
    drawCircle(road_ctx_bis, road_wheel_bis_x,road_wheel_bis_y, 1, "#000", "#000")
}