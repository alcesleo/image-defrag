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

const base64ToImageData = async (base64Image: string): Promise<ImageData> => {
  const image = await loadImage(base64Image);

  const canvas = document.createElement('canvas');
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext('2d');
  context!.drawImage(image, 0, 0);

  return context!.getImageData(0, 0, image.width, image.height);
}

const imageDataToBase64 = (imageData: ImageData): string => {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) throw new Error("Couldn't get canvas context");

  canvas.width = imageData.width;
  canvas.height = imageData.height;
  context.putImageData(imageData, 0, 0);
  return canvas.toDataURL()
}

const defragmentImageData = (image: ImageData): ImageData => {
  const rgba = image.data;
  let pixels = [];

  console.log("Extracting pixel data...");
  for (let index = 0; index < rgba.length - 3; index += 4) {
    pixels.push([rgba[index], rgba[index+1], rgba[index+2], rgba[index+3]]);
  }

  console.log("Defragmenting pixels");
  pixels.sort((a, b) => {
    const [ar, ag, ab, aa] = a;
    const [br, bg, bb, ba] = b;

    if (ar !== br) return ar - br;
    if (ag !== bg) return ag - bg;
    if (ab !== bb) return ab - bb;
    if (aa !== ba) return aa - ba;

    return 0;
  });

  console.log("Done!");
  const defragRgba = new Uint8ClampedArray(pixels.flat());
  return new ImageData(defragRgba, image.width, image.height);
}

const defragmentBase64 = async (base64Image: string): Promise<string> => {
  const imageData = await base64ToImageData(base64Image);
  const defrag = defragmentImageData(imageData);
  return imageDataToBase64(defrag);

}

function App() {
  const [originalImage, setOriginal] = useState<string>();
  const [defragImage, setDefrag] = useState<string>();

  const onImageSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files) return;
    const imageFile = event.target.files[0];

    const original = await readImageFileToBase64(imageFile);
    setOriginal(original);
    setDefrag(undefined);

    const defrag = await defragmentBase64(original);
    setDefrag(defrag);
  }

  return (
    <div className="App">
      <input type="file" onChange={onImageSelected} />

      {originalImage &&
        <section>
          <h2>Original</h2>
          <img alt="original" src={originalImage} style={{ width: "100%" }} />
        </section>
      }
      {originalImage && !defragImage && <h2>Defragmenting...</h2>}
      {defragImage &&
        <section>
          <h2>Defragmented</h2>
          <img alt="defragmented" src={defragImage} style={{ width: "100%" }} />
        </section>
      }
    </div>
  );
}

export default App;
