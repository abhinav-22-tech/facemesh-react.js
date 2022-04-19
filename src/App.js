import { FaceMesh } from "@mediapipe/face_mesh";
import React, { useRef, useEffect, useState } from "react";
import * as Facemesh from "@mediapipe/face_mesh";
import * as cam from "@mediapipe/camera_utils";
import Webcam from "react-webcam";
import { ReactP5Wrapper } from "react-p5-wrapper";
import sketch from "./sketch";

function App() {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const connect = window.drawConnectors;
  var camera = null;
  let detections = {};
  let leftIris = [
    [474, 475],
    [475, 476],
    [476, 477],
    [477, 474],
  ];
  let rightIris = [
    [469, 470],
    [470, 471],
    [471, 472],
    [472, 469],
  ];
  let rightEye = [
    [145, 153],
    [159, 158],
  ];

  function onResults(results) {
    detections = results;
    // console.log(detections);
  }

  useEffect(() => {
    const faceMesh = new FaceMesh({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
      },
    });

    faceMesh.setOptions({
      maxNumFaces: 2,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
      refineLandmarks: true,
    });

    faceMesh.onResults(onResults);

    if (
      typeof webcamRef.current !== "undefined" &&
      webcamRef.current !== null
    ) {
      camera = new cam.Camera(webcamRef.current.video, {
        onFrame: async () => {
          await faceMesh.send({ image: webcamRef.current.video });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    }
  }, []);

  function sketch(p) {
    p.setup = () => {
      p.createCanvas(500, 500);
      p.colorMode(p.HSB);
    };

    p.draw = () => {
      p.clear();
      p.fill("black");
      p.strokeWeight(3);
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
      // Right Eye
      let reyex = detections.multiFaceLandmarks[0][33].x * p.width;
      let reyey = detections.multiFaceLandmarks[0][33].y * p.height;
      p.ellipse(reyex, reyey, 10);

      // Left Eye
      let leyex = detections.multiFaceLandmarks[0][263].x * p.width;
      let leyey = detections.multiFaceLandmarks[0][263].y * p.height;
      p.ellipse(leyex, leyey, 30);

      // Left Iris
      let centerCoordinatesLeftIris = [0, 0];
      centerCoordinatesLeftIris = p.leftIris();
      let lIrisX = centerCoordinatesLeftIris[0];
      let lIrisY = centerCoordinatesLeftIris[1];
      let lIrisR = centerCoordinatesLeftIris[2];
      p.fill("white");
      p.ellipse(lIrisX, lIrisY, lIrisR * 2);

      // Right Iris
      let centerCoordinatesRightIris = [0, 0];
      centerCoordinatesRightIris = p.rightIris();
      let rIrisX = centerCoordinatesRightIris[0];
      let rIrisY = centerCoordinatesRightIris[1];
      let rIrisR = centerCoordinatesRightIris[2];
      p.fill("white");
      p.ellipse(rIrisX, rIrisY, rIrisR * 2);

      p.endShape();
    };

    p.leftIris = () => {
      let circlePoints = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ];
      for (let i = 0; i < leftIris.length; i++) {
        // console.log(leftIris[i][0]);
        for (let j = 0; j <= 1; j++) {
          let lIrisX =
            detections.multiFaceLandmarks[0][leftIris[i][j]].x * p.width;
          let lIrisY =
            detections.multiFaceLandmarks[0][leftIris[i][j]].y * p.width;
          circlePoints[i][0] = lIrisX;
          circlePoints[i][1] = lIrisY;
        }
      }
      let centerCoordinates = findCircle(circlePoints);
      return centerCoordinates;
    };

    p.rightIris = () => {
      let circlePoints = [
        [0, 0],
        [0, 0],
        [0, 0],
        [0, 0],
      ];
      for (let i = 0; i < rightIris.length; i++) {
        // console.log(leftIris[i][0]);
        for (let j = 0; j <= 1; j++) {
          let rIrisX =
            detections.multiFaceLandmarks[0][rightIris[i][j]].x * p.width;
          let rIrisY =
            detections.multiFaceLandmarks[0][rightIris[i][j]].y * p.width;
          circlePoints[i][0] = rIrisX;
          circlePoints[i][1] = rIrisY;
        }
      }
      let centerCoordinates = findCircle(circlePoints);
      return centerCoordinates;
    };

    let findCircle = (circlePoints) => {
      let x1, y1, x2, y2, x3, y3;
      x1 = circlePoints[0][0];
      y1 = circlePoints[0][1];
      x2 = circlePoints[1][0];
      y2 = circlePoints[1][1];
      x3 = circlePoints[2][0];
      y3 = circlePoints[2][1];

      let x12 = x1 - x2;
      let x13 = x1 - x3;

      let y12 = y1 - y2;
      let y13 = y1 - y3;

      let y31 = y3 - y1;
      let y21 = y2 - y1;

      let x31 = x3 - x1;
      let x21 = x2 - x1;

      //x1^2 - x3^2
      let sx13 = Math.pow(x1, 2) - Math.pow(x3, 2);

      // y1^2 - y3^2
      let sy13 = Math.pow(y1, 2) - Math.pow(y3, 2);

      let sx21 = Math.pow(x2, 2) - Math.pow(x1, 2);
      let sy21 = Math.pow(y2, 2) - Math.pow(y1, 2);

      let f =
        (sx13 * x12 + sy13 * x12 + sx21 * x13 + sy21 * x13) /
        (2 * (y31 * x12 - y21 * x13));
      let g =
        (sx13 * y12 + sy13 * y12 + sx21 * y13 + sy21 * y13) /
        (2 * (x31 * y12 - x21 * y13));

      let c = -Math.pow(x1, 2) - Math.pow(y1, 2) - 2 * g * x1 - 2 * f * y1;

      // eqn of circle be
      // x^2 + y^2 + 2*g*x + 2*f*y + c = 0
      // where centre is (h = -g, k = -f) and radius r
      // as r^2 = h^2 + k^2 - c
      let h = -g;
      let k = -f;
      let sqr_of_r = h * h + k * k - c;

      let r = Math.sqrt(sqr_of_r);
      let centerCoordinates = [h, k, r];
      return centerCoordinates;
    };
  }

  return (
    // <center>
    <div className="App">
      <Webcam
        ref={webcamRef}
        style={{
          position: "absolute",
          marginLeft: "auto",
          marginRight: "auto",
          left: 660,
          right: 0,
          textAlign: "center",
          zindex: 9,
          width: 640,
          height: 480,
        }}
      />
      <ReactP5Wrapper sketch={sketch} />
      {/* <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            marginLeft: "0",
            marginRight: "0",
            left: 0,
            right: 0,
            textAlign: "center",
            zindex: 9,
            width: 640,
            height: 480,
          }}
        ></canvas> */}
    </div>
    // </center>
  );
}

export default App;
