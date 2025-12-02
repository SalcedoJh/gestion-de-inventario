import './ImageZoomModal.css';

const ImageZoomModal = ({ imageUrl, productName, onClose }) => {
    if (!imageUrl) return null;

    return (
        <div className="image-zoom-overlay" onClick={onClose}>
            <div className="image-zoom-modal" onClick={(e) => e.stopPropagation()}>
                <button className="close-btn" onClick={onClose}>×</button>
                <img src={imageUrl} alt={productName} />
                <p className="image-caption">{productName}</p>
            </div>
        </div>
    );
};

export default ImageZoomModal;
