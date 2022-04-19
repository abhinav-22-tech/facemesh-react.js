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
      // if (p.mouseIsPressed) {
      //   p.fill(0);
      // } else {
      //   p.fill(255);
      // }
      // p.ellipse(p.mouseX, p.mouseY, 80, 80);
      p.fill("black");
      // p.riangle(100, 250, 250, 170, 330, 300);;
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
      // p.beginShape(p.POINTS);
      // console.log(detections.multiFaceLandmarks[0][263]);

      // Left Eye
      let leyex = detections.multiFaceLandmarks[0][263].x * p.width;
      let leyey = detections.multiFaceLandmarks[0][263].y * p.height;
      p.ellipse(leyex, leyey, 30);
      // Right Eye
      let reyex = detections.multiFaceLandmarks[0][33].x * p.width;
      let reyey = detections.multiFaceLandmarks[0][33].y * p.height;
      p.ellipse(reyex, reyey, 10);
      
      // Left Iris
      let sumX = 0;
      let sumY = 0;
      for (let i = 0; i < leftIris.length; i++) {
        // console.log(leftIris[i][0]);
        for (let j = 0; j <= 1; j++) {
          let lIrisX =
            detections.multiFaceLandmarks[0][leftIris[i][j]].x * p.width;
            sumX += lIrisX;
          let lIrisY =
            detections.multiFaceLandmarks[0][leftIris[i][j]].y * p.width;
            sumY += lIrisY;
        }
        p.fill("white");
        p.ellipse(sumX, sumY, 10);
      }
      p.endShape();

      // for (let j = 0; j < detections.multiFaceLandmarks[0].length; j++) {
      //   let x = detections.multiFaceLandmarks[0][j].x * p.width;
      //   let y = detections.multiFaceLandmarks[0][j].y * p.height;
      // console.log(detections.multiFaceLandmarks[0]);
      // p.vertex(x, y);
      // }
      // p.endShape();
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
