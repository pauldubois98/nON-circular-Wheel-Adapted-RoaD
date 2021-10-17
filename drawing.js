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
        "#BFB8", "#4D48");
    drawPath(wheel_canvas, wheel_ctx, wheel_cartesian, "#88F", "#229", finish);
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
        "#4D48", "#0908");
    centeredCircle(wheel_canvas, wheel_ctx, 1, "#000", "#000");
}


function redrawLand(){
    land_ctx.clearRect(0, 0, land_canvas.width, land_canvas.height);
    drawPath(land_canvas, land_ctx, land, "#999", "#222", true, false);
    drawPath(land_canvas, land_ctx, land_wheel_cartesian, "#88F", "#229", true, false);

    land_ctx.beginPath();
    land_ctx.arc(land_wheel_x, land_wheel_y, 2, 0, 2 * Math.PI);
    land_ctx.fillStyle = "#000";
    land_ctx.fill();
}