import React, { useRef, useState, useEffect, useCallback } from "react";
import Webcam from "react-webcam";
import * as faceapi from "face-api.js";

const CustomWebcam = () => {
  const [mirrored, setMirrored] = useState(false);
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]);
  const [detecting, setDetecting] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [countingDown, setCountingDown] = useState(false);

  const capture = useCallback(() => {
    let count = 5;
    setCountdown(count);
    setCountingDown(true);
    const countdownInterval = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(countdownInterval);
        setCountingDown(false);
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImages((prevImages) => [...prevImages, imageSrc]);
      }
    }, 1000);
  }, [webcamRef]);

  const loadModels = async () => {
    const MODEL_URL = "/models";
    await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
    await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
    await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);
  };

  const detectFaces = async () => {
    if (webcamRef.current && webcamRef.current.video.readyState === 4) {
      const video = webcamRef.current.video;
      const detections = await faceapi.detectAllFaces(
        video,
        new faceapi.TinyFaceDetectorOptions()
      );

      const canvas = document.getElementById("overlay");
      const displaySize = { width: video.width, height: video.height };
      const resizedDetections = faceapi.resizeResults(
        detections,
        displaySize
      );

      // Adjust coordinates for mirrored video
      if (mirrored) {
        resizedDetections.forEach((detection) => {
          detection._box._x =
            displaySize.width - (detection._box._x + detection._box._width);
        });
      }

      faceapi.matchDimensions(canvas, displaySize);
      faceapi.draw.drawDetections(canvas, resizedDetections);
    }
  };

  useEffect(() => {
    loadModels();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!detecting) {
        setDetecting(true);
        detectFaces().then(() => setDetecting(false));
      }
    }, 100);
    return () => clearInterval(interval);
  }, [detecting]);

  return (
    <div className="container">
      <Webcam
        height={600}
        width={600}
        ref={webcamRef}
        mirrored={mirrored}
        screenshotFormat="image/jpeg"
        screenshotQuality={0.8}
      />
      <canvas id="overlay" style={{ position: "absolute" }} />
      <div className="controls">
        <div>
          <input
            type="checkbox"
            checked={mirrored}
            onChange={(e) => setMirrored(e.target.checked)}
          />
          <label>Mirror</label>
        </div>
      </div>
      <div className="btn-container">
        <button onClick={capture} disabled={countingDown}>
          {countingDown ? countdown : "Capture photo"}
        </button>
      </div>
      <div className="photos-container">
        {capturedImages.map((src, index) => (
          <img key={index} src={src} alt={`capture-${index}`} />
        ))}
      </div>
    </div>
  );
};

export default CustomWebcam;
