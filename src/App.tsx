import { Button, Image as NextuiImage, Link, Switch, Input } from '@nextui-org/react';
import { useState, useRef, ChangeEvent, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import SyncLink from './Icons/SyncLink';
import UnLink from './Icons/UnLink';

const App = () => {
  /* Aspect Ratio */
  const [SyncAspectRatio, setSyncAspectRatio] = useState(true);
  const [InitialAspectRatio, setInitialiAspectRatio] = useState(1)
  const [InitialiWidth, setInitialWidth] = useState(0)
  const [InitialiHeight, setInitialHeight] = useState(0)

  /* Data URLs */
  const [PNGDataURL, setPNGDataURL] = useState<string>('');
  const [SVGData, setSVGData] = useState<string>('');

  /* Output Height Width */
  const [Width, setWidth] = useState(0);
  const [Height, setHeight] = useState(0);

  /* Output Image Size */
  const [size, setSize] = useState('');

  /* Element Ref */
  const CanvasRef = useRef<HTMLCanvasElement>(null);
  const FileInputRef = useRef<HTMLInputElement>(null);

  /* Get Current SVG Resolution on Load */
  const getCurrentResolution = (svgData: string) => {
    const parser = new DOMParser();
    const svgDoc = parser.parseFromString(svgData, 'image/svg+xml');
    const svgElement = svgDoc.documentElement;

    const WidthAttr = svgElement.getAttribute('width');
    const HeightAttr = svgElement.getAttribute('height');

    if (WidthAttr) {
      setWidth(parseFloat(WidthAttr))
      setInitialWidth(parseFloat(WidthAttr))
    }

    if (HeightAttr) {
      setHeight(parseFloat(HeightAttr))
      setInitialHeight(parseFloat(HeightAttr))
    }

    if (!Width || !Height) {
      // Handle cases where Width and Height might be specified in viewBox instead
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const viewBoxValues = viewBox.split(' ').map(v => parseFloat(v));
        if (viewBoxValues.length === 4) {
          setWidth(viewBoxValues[2])
          setInitialWidth(viewBoxValues[2])
          setHeight(viewBoxValues[3])
          setInitialHeight(viewBoxValues[3])
        }
      }
    }
  }

  /* onFileChange Event */
  const onFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'image/svg+xml') {
        return toast.error('Unsupported File Selected!')
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const svgData = e.target?.result as string;
        /* SVGData */
        setSVGData(svgData)
        /* Get selected SVG resolution */
        getCurrentResolution(svgData)
        /* Convert */
        ConvertSVG2PNG();
      };
      reader.readAsText(file);
    }
  };

  /* Image Resizing */
  const ResizeResolution = (value: number, type: 'Height' | 'Width') => {
    if (SyncAspectRatio) {
      setWidth(value)
      setHeight(value / InitialAspectRatio)
    } else {
      type === 'Height' ? setHeight(value) : setWidth(value)
    }
  }

  /* Convert SVG to PNG */
  const ConvertSVG2PNG = useCallback(() => {
    const canvas = CanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const img = new Image();

    img.onload = () => {
      canvas.width = Width;
      canvas.height = Height;
      ctx.clearRect(0, 0, Width, Height);
      ctx.drawImage(img, 0, 0, Width, Height);

      const PNGData = canvas.toDataURL('image/png');

      // Calculate the size of the PNG data in bytes
      const base64String = PNGData.split(',')[1];
      const decodedLength = (base64String.length * 3) / 4 - (base64String.endsWith('==') ? 2 : base64String.endsWith('=') ? 1 : 0);

      // Convert the size to KB or MB
      if (decodedLength >= 1048576) { // More than 1 MB
        setSize(`${(decodedLength / 1048576).toFixed(2)} MB`);
      } else {
        setSize(`${(decodedLength / 1024).toFixed(2)} KB`);
      }
      setPNGDataURL(PNGData);
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(SVGData);
  }, [Width, Height, SVGData]);

  useEffect(() => {
    ConvertSVG2PNG();
  }, [Height, Width, ConvertSVG2PNG]);

  useEffect(() => {
    setInitialiAspectRatio(InitialiWidth / InitialiHeight)
  }, [InitialiHeight, InitialiWidth])

  return (
    <div className='flex items-center flex-col'>
      <span className='text-2xl text-primary my-4'>SVG to PNG Converter</span>
      <div className='flex flex-col items-center gap-y-4'>
        <Button
          className='text-base'
          color='primary'
          onPress={() => FileInputRef.current?.click()}
        >
          Select SVG
        </Button>
        <div className="flex justify-center items-center w-72 gap-x-4">
          <Input
            type="text"
            size='md'
            color='primary'
            variant='bordered'
            value={Width.toString()}
            onChange={(e) => ResizeResolution(Number(e.target.value) || Width, 'Width')} label="Width"
          />
          {SyncAspectRatio ? <SyncLink size={60} /> : <UnLink size={60} />}
          <Input
            isDisabled={SyncAspectRatio}
            type="text"
            size='md'
            color='primary'
            variant='bordered'
            value={Height.toString()}
            onChange={(e) => ResizeResolution(Number(e.target.value) || Height, 'Height')} label="Height"
          />
        </div>
        <Switch size='sm' isSelected={SyncAspectRatio} onValueChange={() => {
          setSyncAspectRatio((prev) => {
            if (!prev) {
              /* Imediately Resize the image according to Aspect-Ratio */
              setHeight(Width / InitialAspectRatio)
            }
            return !prev
          });
        }}>
          Sync Aspect-Ratio
        </Switch>
      </div>
      {PNGDataURL && (
        <div className='flex flex-col gap-y-4 items-center my-4'>
          <Button
            onPress={() => toast.success('Success')}
            className='text-base text-white my-2'
            href={PNGDataURL}
            as={Link}
            color="success"
            download={"converted.png"}
            variant="shadow"
          >
            Download PNG ({size})
          </Button>
          <NextuiImage
            className='border-default border-dashed border-2 p-5'
            width={Width}
            src={PNGDataURL} alt="Converted PNG"
          />
        </div>
      )}
      <input
        type="file"
        ref={FileInputRef}
        accept=".svg"
        onChange={onFileChange}
        style={{ display: 'none' }}
      />
      <canvas ref={CanvasRef} style={{ display: 'none' }}></canvas>
    </div>
  );
};

export default App;
