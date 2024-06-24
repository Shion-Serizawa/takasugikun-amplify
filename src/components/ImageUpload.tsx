import React, { useState } from 'react';
import { uploadData } from 'aws-amplify/storage';

const ImageUpload: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // ファイル選択時に呼ばれる関数
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  // 画像をリサイズする関数 (縦横比を維持し、縦または横のいずれかが最大値に収まる)
  const resizeImage = (file: File, maxWidth: number, maxHeight: number) => {
    return new Promise<File>((resolve) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);

      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        let width = img.width;
        let height = img.height;

        // 縦横比を維持しながら、最大幅または最大高さに収める
        if (width > height) {
          if (width > maxWidth) {
            height = Math.floor((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.floor((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: file.type }));
          }
        }, file.type);
      };
    });
  };

  // 画像をアップロードする関数
  const handleUpload = async () => {
    if (selectedFile) {
      const resizedImage = await resizeImage(selectedFile, 800, 800);
      const fileName = `picture-submissions/${Date.now()}_${resizedImage.name}`;
      await uploadData({
        path: fileName,
        data: resizedImage,
      });
      console.log('Image uploaded:', fileName);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleFileChange} />
      <button onClick={handleUpload}>Upload</button>
    </div>
  );
};

export default ImageUpload;
