import React, { useRef, useState, useCallback } from "react";
import Webcam from "react-webcam";

const CustomWebcam = () => {
  const [mirrored, setMirrored] = useState(false);
  const webcamRef = useRef(null);
  const [capturedImages, setCapturedImages] = useState([]); // State to hold captured images

  const capture = useCallback(() => {
    const imageSrc = webcamRef.current.getScreenshot();
    setCapturedImages((prevImages) => [...prevImages, imageSrc]); // Add the new image to the array
  }, [webcamRef]);

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
        <button onClick={capture}>Capture photo</button>
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
