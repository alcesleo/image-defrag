import React, {useState} from 'react';
import { readImageFileToBase64, defragmentBase64 } from './defrag';
import './App.css';

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
      <header>
        <h1>Image Defrag</h1>
        <input type="file" onChange={onImageSelected} />
      </header>

      {originalImage &&
        <main>
          <section>
            <h2>Original</h2>
            <img alt="original" src={originalImage} />
          </section>

          <section>
            {defragImage ? <h2>Defragmented</h2> : <h2>Defragmenting...</h2>}
            {defragImage && <img alt="defragmented" src={defragImage} />}
          </section>
        </main>
      }
    </div>
  );
}

export default App;
