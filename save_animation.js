const dl_link = document.createElement("a");

function download_animation(
  step = 10,
  start = undefined,
  end = undefined,
  name = "animation",
  reverse = true
) {
  if (typeof start === "undefined") {
    start = 0;
  }
  if (typeof end === "undefined") {
    end = demo_canvas.width;
  }
  var i = 0;
  for (i = start; i < end; i += step) {
    demo_wheel_x = i;
    calculate_demo_wheel();
    redrawDemo();
    dl_link.download = name + String(i).padStart(4, "0") + ".png";
    dl_link.href = demo_canvas.toDataURL();
    dl_link.click();
  }
  if (reverse) {
    while (i >= start) {
      i -= step;
      demo_wheel_x = i;
      calculate_demo_wheel();
      redrawDemo();
      dl_link.download = name + String(1999 - i).padStart(4, "0") + ".png";
      dl_link.href = demo_canvas.toDataURL();
      dl_link.click();
    }
  }
}

function download_animation_bis(
  step = 10,
  start = undefined,
  end = undefined,
  name = "animation",
  reverse = true
) {
  if (typeof start === "undefined") {
    start = 0;
  }
  if (typeof end === "undefined") {
    end = demo_canvas_bis.width;
  }
  var i = 0;
  for (i = start; i < end; i += step) {
    demo_bis_x = i;
    calculate_demo_bis();
    redrawDemoBis();
    dl_link.download = name + String(i).padStart(4, "0") + ".png";
    dl_link.href = demo_canvas_bis.toDataURL();
    dl_link.click();
  }
  if (reverse) {
    while (i >= start) {
      i -= step;
      demo_bis_x = i;
      calculate_demo_bis();
      redrawDemoBis();
      dl_link.download = name + String(1999 - i).padStart(4, "0") + ".png";
      dl_link.href = demo_canvas_bis.toDataURL();
      dl_link.click();
    }
  }
}
