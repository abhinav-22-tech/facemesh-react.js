function sketch(p) {
  let detections = p.detections;
  p.setup = () => {
    p.createCanvas(500, 500);
    p.colorMode(p.HSB);
    p.stroke(0);
    p.strokeWeight(3);
  };

  p.updateWithProps = (newProps) => {
    console.log(newProps.detections.multiFaceLandmarks);
    detections = newProps.detections;
  };

  p.draw = () => {
    // p.clear();
    // if (p.mouseIsPressed) {
    //   p.fill(0);
    // } else {
    //   p.fill(255);
    // }
    // p.ellipse(p.mouseX, p.mouseY, 80, 80);
    if (detections !== undefined) {
      if (
        detections.multiFaceLandmarks !== undefined &&
        detections.multiFaceLandmarks.length >= 1
      ) {
        p.faceMesh();
      }
    }
  };

  p.faceMesh = () => {
    p.beginShape(p.POINTS);
    for (let j = 0; j < detections.multiFaceLandmarks[0].length; j++) {
      let x = detections.multiFaceLandmarks[0][j].x * p.width;
      let y = detections.multiFaceLandmarks[0][j].y * p.height;
      p.vertex(x, y);
    }
    p.endShape();
  };
}

export default sketch;
