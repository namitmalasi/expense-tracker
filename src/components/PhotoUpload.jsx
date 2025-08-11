import React, { useState, useRef } from "react";
import { Camera, Upload, X, AlertCircle, Key } from "lucide-react";
import { extractReceiptWithAI, isAIConfigured } from "../utils/aiService.js";

const PhotoUpload = ({ onExtractionComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState(null);
  const [processingStep, setProcessingStep] = useState("");
  const fileInputRef = useRef(null);

  const handleFileSelect = async (file) => {
    if (!file.type.startsWith("image/")) {
      setError("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10MB");
      return;
    }

    if (!isAIConfigured()) {
      setError(
        "AI services not configured. Please add your OpenAI API key to environment variables."
      );
      return;
    }

    setError(null);
    setIsProcessing(true);
    setUploadProgress(0);
    setProcessingStep("Uploading image...");

    try {
      // Simulate upload progress
      const progressSteps = [
        { progress: 20, step: "Analyzing receipt..." },
        { progress: 50, step: "Extracting text with AI..." },
        { progress: 80, step: "Categorizing expense..." },
        { progress: 95, step: "Finalizing results..." },
      ];

      let currentStep = 0;
      const progressInterval = setInterval(() => {
        if (currentStep < progressSteps.length) {
          setUploadProgress(progressSteps[currentStep].progress);
          setProcessingStep(progressSteps[currentStep].step);
          currentStep++;
        } else {
          clearInterval(progressInterval);
        }
      }, 800);

      // Call the actual AI service
      const result = await extractReceiptWithAI(file);

      clearInterval(progressInterval);
      setUploadProgress(100);
      setProcessingStep("Complete!");

      setTimeout(() => {
        onExtractionComplete(result, file);
        setIsProcessing(false);
        setUploadProgress(0);
        setProcessingStep("");
      }, 500);
    } catch (err) {
      console.error("Receipt processing error:", err);
      setError(
        "Failed to process receipt. Please try again or check your API configuration."
      );
      setIsProcessing(false);
      setUploadProgress(0);
      setProcessingStep("");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleFileInputChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  if (!isAIConfigured()) {
    return (
      <div className="w-full">
        <div className="border-2 border-dashed border-red-300 rounded-xl p-8 text-center bg-red-50">
          <div className="w-16 h-16 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Key className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-red-900 mb-2">
            AI Services Not Configured
          </h3>
          <p className="text-red-700 mb-4">
            To use AI-powered receipt processing, you need to add your OpenAI
            API key.
          </p>
          <div className="bg-red-100 rounded-lg p-4 text-left">
            <p className="text-sm text-red-800 mb-2">
              <strong>Setup Instructions:</strong>
            </p>
            <ol className="text-sm text-red-700 space-y-1 list-decimal list-inside">
              <li>
                Get an API key from{" "}
                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="underline"
                >
                  OpenAI Platform
                </a>
              </li>
              <li>
                Create a <code className="bg-red-200 px-1 rounded">.env</code>{" "}
                file in your project root
              </li>
              <li>
                Add:{" "}
                <code className="bg-red-200 px-1 rounded">
                  VITE_OPENAI_API_KEY=your_api_key_here
                </code>
              </li>
              <li>Restart the development server</li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div
        className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 ${
          isDragOver
            ? "border-green-500 bg-green-50"
            : isProcessing
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400 bg-gray-50"
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-blue-100 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-600 animate-pulse" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Processing Receipt with AI
              </p>
              <p className="text-sm text-gray-600 mb-4">{processingStep}</p>
              <div className="w-full max-w-xs mx-auto bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {Math.round(uploadProgress)}% complete
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <Camera className="w-8 h-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Upload Receipt Photo
              </p>
              <p className="text-sm text-gray-600 mb-4">
                AI will automatically extract merchant, amount, and categorize
                your expense
              </p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors duration-200"
              >
                <Upload className="w-4 h-4 mr-2" />
                Choose File
              </button>
            </div>
            <p className="text-xs text-gray-500">
              Supports JPG, PNG, HEIC • Max 10MB • Powered by OpenAI
            </p>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
          <span className="text-sm text-red-700 flex-1">{error}</span>
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;
