import { useRef, useEffect, useState } from 'react';
import SignatureCanvas from 'react-signature-canvas';
import { getButtonStyle } from '../../utils/theme';

const SignaturePad = ({ onSignatureChange, initialSignature = null, title = "Assinatura" }) => {
  const sigRef = useRef();
  const [isEmpty, setIsEmpty] = useState(true);

  useEffect(() => {
    if (initialSignature && sigRef.current) {
      sigRef.current.fromDataURL(initialSignature);
      setIsEmpty(false);
    }
  }, [initialSignature]);

  const handleClear = () => {
    if (sigRef.current) {
      sigRef.current.clear();
      setIsEmpty(true);
      onSignatureChange(null);
    }
  };

  const handleEnd = () => {
    if (sigRef.current) {
      const signature = sigRef.current.getTrimmedCanvas().toDataURL();
      const currentIsEmpty = sigRef.current.isEmpty();
      setIsEmpty(currentIsEmpty);
      onSignatureChange(currentIsEmpty ? null : signature);
    }
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <label style={{
        display: 'block',
        marginBottom: '8px',
        color: '#FFD700',
        fontWeight: '600'
      }}>
        {title}
      </label>
      
      <div style={{
        border: '2px solid rgba(255, 215, 0, 0.3)',
        borderRadius: '8px',
        background: 'white',
        padding: '10px'
      }}>
        <SignatureCanvas
          ref={sigRef}
          canvasProps={{
            width: 400,
            height: 150,
            className: 'signature-canvas',
            style: {
              width: '100%',
              height: '150px',
              border: '1px dashed #ccc',
              borderRadius: '4px'
            }
          }}
          backgroundColor="white"
          penColor="black"
          onEnd={handleEnd}
        />
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginTop: '10px'
        }}>
          <p style={{ 
            color: '#666', 
            fontSize: '0.8rem', 
            margin: 0,
            flex: 1
          }}>
            {isEmpty ? 'Desenhe sua assinatura acima' : 'Assinatura capturada'}
          </p>
          
          <button
            type="button"
            onClick={handleClear}
            style={{
              ...getButtonStyle('secondary'),
              padding: '5px 15px',
              fontSize: '0.8rem'
            }}
          >
            Limpar
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignaturePad;