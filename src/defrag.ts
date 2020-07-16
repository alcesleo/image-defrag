export const readImageFileToBase64 = async (file: File): Promise<string> => {
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

export const defragmentBase64 = async (base64Image: string): Promise<string> => {
    const imageData = await base64ToImageData(base64Image);
    const defrag = defragmentImageData(imageData);
    return imageDataToBase64(defrag);
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
    return canvas.toDataURL();
}

const defragmentImageData = (image: ImageData): ImageData => {
    const rgba = image.data;
    let pixels = [];

    console.log("Extracting pixel data...");
    for (let index = 0; index <= rgba.length - 4; index += 4) {
        pixels.push([
            rgba[index],
            rgba[index + 1],
            rgba[index + 2],
            rgba[index + 3]
        ]);
    }

    console.log("Defragmenting pixels");
    pixels.sort((pixel1, pixel2) => {
        const [r1, g1, b1, a1] = pixel1;
        const [r2, g2, b2, a2] = pixel2;

        if (r1 !== r2) return r1 - r2;
        if (g1 !== g2) return g1 - g2;
        if (b1 !== b2) return b1 - b2;
        if (a1 !== a2) return a1 - a2;

        return 0;
    });

    console.log("Done!");
    const defragRgba = new Uint8ClampedArray(pixels.flat());
    return new ImageData(defragRgba, image.width, image.height);
}
