import React, {useState} from 'react';
import './App.css';

const readImageFileToBase64 = async (file: File): Promise<string> => {
  if (!file.type.match('image.*')) {
    throw new Error(`"${file.type}" is not an image`);
  }

  const reader = new FileReader();
  reader.readAsDataURL(file);

  return new Promise((resolve, reject) => {
    reader.onload = (event: ProgressEvent<FileReader>) => {
      resolve(event.target!.result as string);
    }

    reader.onerror = reject;
    reader.onabort = reject;
  });
}

const loadImage = async (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  })
}

const base64ImageToPixels = async (base64Image: string): Promise<ImageData> => {
  const image = await loadImage(base64Image);

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context!.drawImage(image, 0, 0);

  return context!.getImageData(0, 0, image.width, image.height);
}

const pixelsToBase64Image = (imageData: ImageData): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error("Couldn't get canvas context");

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL()
}

function App() {
  const [original, setOriginal] = useState<string>();
  const [defrag, setDefrag] = useState<string>();

  const onImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const imageFile = event.target.files[0];

    const originalImage = await readImageFileToBase64(imageFile);
    setOriginal(originalImage);

    const pixels = await base64ImageToPixels(originalImage);
    console.log(pixels.data.slice(100, 130));
    const defragged = pixelsToBase64Image(pixels);
    setDefrag(defragged);
  }

  return (
    <div className="App">
      <input type="file" onChange={onImageSelected} />
      <img alt="original" src={original} style={{ width: "100%" }} />
      <img alt="defragmented" src={defrag} style={{ width: "100%" }} />
    </div>
  );
}

export default App;
